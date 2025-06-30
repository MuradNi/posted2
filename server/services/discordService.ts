import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { storage } from '../storage';
import type { DiscordBot } from '@shared/schema';

export class DiscordService {
  private clients: Map<number, Client> = new Map();

  async connectBot(bot: DiscordBot): Promise<void> {
    try {
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      client.on('ready', async () => {
        console.log(`Discord bot ${bot.name} is ready!`);
        await storage.updateDiscordBot(bot.id, { status: 'online' });
        await storage.createActivityLog({
          platform: 'discord',
          botId: bot.id,
          botName: bot.name,
          action: 'connected',
          message: `Bot ${bot.name} connected successfully`,
        });
      });

      client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        await this.handleAutoResponse(bot, message);
      });

      client.on('error', async (error) => {
        console.error(`Discord bot ${bot.name} error:`, error);
        await storage.updateDiscordBot(bot.id, { status: 'error' });
        await storage.createActivityLog({
          platform: 'discord',
          botId: bot.id,
          botName: bot.name,
          action: 'error',
          message: `Bot ${bot.name} encountered an error: ${error.message}`,
        });
      });

      await client.login(bot.token);
      this.clients.set(bot.id, client);
    } catch (error) {
      console.error(`Failed to connect Discord bot ${bot.name}:`, error);
      await storage.updateDiscordBot(bot.id, { status: 'offline' });
      throw error;
    }
  }

  async disconnectBot(botId: number): Promise<void> {
    const client = this.clients.get(botId);
    if (client) {
      await client.destroy();
      this.clients.delete(botId);
      await storage.updateDiscordBot(botId, { status: 'offline' });
    }
  }

  async sendMessage(botId: number, channelId: string, message: string): Promise<void> {
    const client = this.clients.get(botId);
    if (!client) {
      throw new Error('Bot not connected');
    }

    try {
      const channel = await client.channels.fetch(channelId) as TextChannel;
      if (!channel) {
        throw new Error('Channel not found');
      }

      await channel.send(message);
      
      const bot = await storage.getDiscordBot(botId);
      if (bot) {
        await storage.createActivityLog({
          platform: 'discord',
          botId: botId,
          botName: bot.name,
          action: 'message_sent',
          message: `Sent message to #${channel.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          targetId: channelId,
        });
      }
    } catch (error) {
      console.error(`Failed to send message:`, error);
      throw error;
    }
  }

  private async handleAutoResponse(bot: DiscordBot, message: any): Promise<void> {
    try {
      const autoResponders = await storage.getAutoResponders();
      const botResponders = autoResponders.filter(
        (responder) => responder.platform === 'discord' && responder.botId === bot.id && responder.isActive
      );

      for (const responder of botResponders) {
        const messageContent = message.content.toLowerCase();
        const shouldRespond = responder.triggers.some((trigger) =>
          messageContent.includes(trigger.toLowerCase())
        );

        if (shouldRespond) {
          await message.reply(responder.response);
          await storage.createActivityLog({
            platform: 'discord',
            botId: bot.id,
            botName: bot.name,
            action: 'auto_response',
            message: `Auto-responded with "${responder.name}" template`,
            targetId: message.channel.id,
          });
          break; // Only respond with the first matching responder
        }
      }
    } catch (error) {
      console.error('Error handling auto response:', error);
    }
  }

  async initializeAllBots(): Promise<void> {
    const bots = await storage.getDiscordBots();
    const activeBots = bots.filter((bot) => bot.isActive);

    for (const bot of activeBots) {
      try {
        await this.connectBot(bot);
      } catch (error) {
        console.error(`Failed to initialize Discord bot ${bot.name}:`, error);
      }
    }
  }

  getConnectedBots(): number[] {
    return Array.from(this.clients.keys());
  }
}

export const discordService = new DiscordService();
