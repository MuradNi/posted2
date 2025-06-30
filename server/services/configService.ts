import fs from 'fs/promises';
import path from 'path';
import { storage } from '../storage';

export class ConfigService {
  private configDir = './config';

  constructor() {
    this.ensureConfigDir();
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true });
    }
  }

  async saveConfigFile(filename: string, content: any): Promise<void> {
    const filePath = path.join(this.configDir, filename);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  }

  async loadConfigFile(filename: string): Promise<any> {
    const filePath = path.join(this.configDir, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load config file: ${filename}`);
    }
  }

  async deleteConfigFile(filename: string): Promise<void> {
    const filePath = path.join(this.configDir, filename);
    await fs.unlink(filePath);
  }

  validateConfigStructure(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Config must be a valid JSON object');
      return { isValid: false, errors };
    }

    // Validate Discord bot config
    if (config.discord) {
      if (!Array.isArray(config.discord)) {
        errors.push('Discord config must be an array');
      } else {
        config.discord.forEach((bot: any, index: number) => {
          if (!bot.name) errors.push(`Discord bot ${index}: name is required`);
          if (!bot.token) errors.push(`Discord bot ${index}: token is required`);
          if (!bot.serverId) errors.push(`Discord bot ${index}: serverId is required`);
          if (!bot.serverName) errors.push(`Discord bot ${index}: serverName is required`);
          if (!Array.isArray(bot.channels)) errors.push(`Discord bot ${index}: channels must be an array`);
        });
      }
    }

    // Validate WhatsApp bot config
    if (config.whatsapp) {
      if (!Array.isArray(config.whatsapp)) {
        errors.push('WhatsApp config must be an array');
      } else {
        config.whatsapp.forEach((bot: any, index: number) => {
          if (!bot.name) errors.push(`WhatsApp bot ${index}: name is required`);
          if (!bot.phoneNumber) errors.push(`WhatsApp bot ${index}: phoneNumber is required`);
        });
      }
    }

    // Validate schedules
    if (config.schedules) {
      if (!Array.isArray(config.schedules)) {
        errors.push('Schedules config must be an array');
      } else {
        config.schedules.forEach((schedule: any, index: number) => {
          if (!schedule.name) errors.push(`Schedule ${index}: name is required`);
          if (!schedule.platform) errors.push(`Schedule ${index}: platform is required`);
          if (!schedule.cronExpression) errors.push(`Schedule ${index}: cronExpression is required`);
          if (!schedule.message) errors.push(`Schedule ${index}: message is required`);
        });
      }
    }

    // Validate auto responders
    if (config.autoResponders) {
      if (!Array.isArray(config.autoResponders)) {
        errors.push('AutoResponders config must be an array');
      } else {
        config.autoResponders.forEach((responder: any, index: number) => {
          if (!responder.name) errors.push(`AutoResponder ${index}: name is required`);
          if (!responder.platform) errors.push(`AutoResponder ${index}: platform is required`);
          if (!Array.isArray(responder.triggers)) errors.push(`AutoResponder ${index}: triggers must be an array`);
          if (!responder.response) errors.push(`AutoResponder ${index}: response is required`);
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  async processConfigFile(filename: string, content: any): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      const validation = this.validateConfigStructure(content);
      if (!validation.isValid) {
        return { success: false, message: 'Config validation failed', errors: validation.errors };
      }

      // Save to file system
      await this.saveConfigFile(filename, content);

      // Save to database
      await storage.createConfigFile({ name: filename, content });

      return { success: true, message: 'Config file processed successfully' };
    } catch (error) {
      return { success: false, message: `Failed to process config file: ${error}` };
    }
  }
}

export const configService = new ConfigService();
