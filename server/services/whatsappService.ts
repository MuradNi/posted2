import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { storage } from '../storage';
import type { WhatsappBot } from '@shared/schema';
import qrcode from 'qrcode';

export class WhatsAppService {
  private clients: Map<number, Client> = new Map();
  private qrCodes: Map<number, string> = new Map();

  async connectBot(bot: WhatsappBot): Promise<void> {
    try {
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: `whatsapp-bot-${bot.id}`,
          dataPath: `./whatsapp-sessions/bot-${bot.id}`
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      client.on('qr', async (qr) => {
        console.log(`QR code generated for bot ${bot.name}`);
        const qrCodeDataURL = await qrcode.toDataURL(qr);
        this.qrCodes.set(bot.id, qrCodeDataURL);
        await storage.updateWhatsappBot(bot.id, { 
          status: 'awaiting_qr_scan',
          qrCode: qrCodeDataURL 
        });
      });

      client.on('ready', async () => {
        console.log(`WhatsApp bot ${bot.name} is ready!`);
        this.qrCodes.delete(bot.id);
        await storage.updateWhatsappBot(bot.id, { 
          status: 'connected',
          qrCode: null 
        });
        await storage.createActivityLog({
          platform: 'whatsapp',
          botId: bot.id,
          botName: bot.name,
          action: 'connected',
          message: `Bot ${bot.name} connected successfully`,
        });
      });

      client.on('authenticated', async () => {
        console.log(`WhatsApp bot ${bot.name} authenticated`);
        await storage.updateWhatsappBot(bot.id, { status: 'authenticated' });
      });

      client.on('auth_failure', async (msg) => {
        console.error(`WhatsApp bot ${bot.name} auth failure:`, msg);
        await storage.updateWhatsappBot(bot.id, { status: 'auth_failed' });
        await storage.createActivityLog({
          platform: 'whatsapp',
          botId: bot.id,
          botName: bot.name,
          action: 'auth_failed',
          message: `Bot ${bot.name} authentication failed: ${msg}`,
        });
      });

      client.on('disconnected', async (reason) => {
        console.log(`WhatsApp bot ${bot.name} disconnected:`, reason);
        await storage.updateWhatsappBot(bot.id, { status: 'disconnected' });
        this.clients.delete(bot.id);
        await storage.createActivityLog({
          platform: 'whatsapp',
          botId: bot.id,
          botName: bot.name,
          action: 'disconnected',
          message: `Bot ${bot.name} disconnected: ${reason}`,
        });
      });

      client.on('message', async (message) => {
        if (message.fromMe) return;
        await this.handleAutoResponse(bot, message);
      });

      await client.initialize();
      this.clients.set(bot.id, client);
    } catch (error) {
      console.error(`Failed to connect WhatsApp bot ${bot.name}:`, error);
      await storage.updateWhatsappBot(bot.id, { status: 'error' });
      throw error;
    }
  }

  async disconnectBot(botId: number): Promise<void> {
    const client = this.clients.get(botId);
    if (client) {
      await client.destroy();
      this.clients.delete(botId);
      this.qrCodes.delete(botId);
      await storage.updateWhatsappBot(botId, { 
        status: 'disconnected',
        qrCode: null 
      });
    }
  }

  async sendMessage(botId: number, phoneNumber: string, message: string): Promise<void> {
    const client = this.clients.get(botId);
    if (!client) {
      throw new Error('Bot not connected');
    }

    try {
      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
      await client.sendMessage(chatId, message);
      
      const bot = await storage.getWhatsappBot(botId);
      if (bot) {
        await storage.createActivityLog({
          platform: 'whatsapp',
          botId: botId,
          botName: bot.name,
          action: 'message_sent',
          message: `Sent message to ${phoneNumber}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          targetId: phoneNumber,
        });
      }
    } catch (error) {
      console.error(`Failed to send WhatsApp message:`, error);
      throw error;
    }
  }

  private async handleAutoResponse(bot: WhatsappBot, message: any): Promise<void> {
    try {
      const autoResponders = await storage.getAutoResponders();
      const botResponders = autoResponders.filter(
        (responder) => responder.platform === 'whatsapp' && responder.botId === bot.id && responder.isActive
      );

      for (const responder of botResponders) {
        const messageContent = message.body.toLowerCase();
        const shouldRespond = responder.triggers.some((trigger) =>
          messageContent.includes(trigger.toLowerCase())
        );

        if (shouldRespond) {
          await message.reply(responder.response);
          await storage.createActivityLog({
            platform: 'whatsapp',
            botId: bot.id,
            botName: bot.name,
            action: 'auto_response',
            message: `Auto-responded with "${responder.name}" template`,
            targetId: message.from,
          });
          break; // Only respond with the first matching responder
        }
      }
    } catch (error) {
      console.error('Error handling auto response:', error);
    }
  }

  getQRCode(botId: number): string | undefined {
    return this.qrCodes.get(botId);
  }

  async initializeAllBots(): Promise<void> {
    const bots = await storage.getWhatsappBots();
    const activeBots = bots.filter((bot) => bot.isActive);

    for (const bot of activeBots) {
      try {
        await this.connectBot(bot);
      } catch (error) {
        console.error(`Failed to initialize WhatsApp bot ${bot.name}:`, error);
      }
    }
  }

  getConnectedBots(): number[] {
    return Array.from(this.clients.keys());
  }
}

export const whatsappService = new WhatsAppService();
