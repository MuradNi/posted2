import {
  discordBots, whatsappBots, schedules, autoResponders, activityLogs, configFiles,
  type DiscordBot, type InsertDiscordBot,
  type WhatsappBot, type InsertWhatsappBot,
  type Schedule, type InsertSchedule,
  type AutoResponder, type InsertAutoResponder,
  type ActivityLog, type InsertActivityLog,
  type ConfigFile, type InsertConfigFile
} from "@shared/schema";

export interface IStorage {
  // Discord Bots
  getDiscordBots(): Promise<DiscordBot[]>;
  getDiscordBot(id: number): Promise<DiscordBot | undefined>;
  createDiscordBot(bot: InsertDiscordBot): Promise<DiscordBot>;
  updateDiscordBot(id: number, updates: Partial<InsertDiscordBot>): Promise<DiscordBot | undefined>;
  deleteDiscordBot(id: number): Promise<boolean>;

  // WhatsApp Bots
  getWhatsappBots(): Promise<WhatsappBot[]>;
  getWhatsappBot(id: number): Promise<WhatsappBot | undefined>;
  createWhatsappBot(bot: InsertWhatsappBot): Promise<WhatsappBot>;
  updateWhatsappBot(id: number, updates: Partial<InsertWhatsappBot>): Promise<WhatsappBot | undefined>;
  deleteWhatsappBot(id: number): Promise<boolean>;

  // Schedules
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;

  // Auto Responders
  getAutoResponders(): Promise<AutoResponder[]>;
  getAutoResponder(id: number): Promise<AutoResponder | undefined>;
  createAutoResponder(responder: InsertAutoResponder): Promise<AutoResponder>;
  updateAutoResponder(id: number, updates: Partial<InsertAutoResponder>): Promise<AutoResponder | undefined>;
  deleteAutoResponder(id: number): Promise<boolean>;

  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Config Files
  getConfigFiles(): Promise<ConfigFile[]>;
  getConfigFile(id: number): Promise<ConfigFile | undefined>;
  createConfigFile(file: InsertConfigFile): Promise<ConfigFile>;
  updateConfigFile(id: number, updates: Partial<InsertConfigFile>): Promise<ConfigFile | undefined>;
  deleteConfigFile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private discordBots: Map<number, DiscordBot> = new Map();
  private whatsappBots: Map<number, WhatsappBot> = new Map();
  private schedules: Map<number, Schedule> = new Map();
  private autoResponders: Map<number, AutoResponder> = new Map();
  private activityLogs: Map<number, ActivityLog> = new Map();
  private configFiles: Map<number, ConfigFile> = new Map();
  private currentId = 1;

  // Discord Bots
  async getDiscordBots(): Promise<DiscordBot[]> {
    return Array.from(this.discordBots.values());
  }

  async getDiscordBot(id: number): Promise<DiscordBot | undefined> {
    return this.discordBots.get(id);
  }

  async createDiscordBot(bot: InsertDiscordBot): Promise<DiscordBot> {
    const id = this.currentId++;
    const newBot: DiscordBot = {
      ...bot,
      id,
      createdAt: new Date(),
    };
    this.discordBots.set(id, newBot);
    return newBot;
  }

  async updateDiscordBot(id: number, updates: Partial<InsertDiscordBot>): Promise<DiscordBot | undefined> {
    const bot = this.discordBots.get(id);
    if (!bot) return undefined;
    
    const updatedBot = { ...bot, ...updates };
    this.discordBots.set(id, updatedBot);
    return updatedBot;
  }

  async deleteDiscordBot(id: number): Promise<boolean> {
    return this.discordBots.delete(id);
  }

  // WhatsApp Bots
  async getWhatsappBots(): Promise<WhatsappBot[]> {
    return Array.from(this.whatsappBots.values());
  }

  async getWhatsappBot(id: number): Promise<WhatsappBot | undefined> {
    return this.whatsappBots.get(id);
  }

  async createWhatsappBot(bot: InsertWhatsappBot): Promise<WhatsappBot> {
    const id = this.currentId++;
    const newBot: WhatsappBot = {
      ...bot,
      id,
      createdAt: new Date(),
    };
    this.whatsappBots.set(id, newBot);
    return newBot;
  }

  async updateWhatsappBot(id: number, updates: Partial<InsertWhatsappBot>): Promise<WhatsappBot | undefined> {
    const bot = this.whatsappBots.get(id);
    if (!bot) return undefined;
    
    const updatedBot = { ...bot, ...updates };
    this.whatsappBots.set(id, updatedBot);
    return updatedBot;
  }

  async deleteWhatsappBot(id: number): Promise<boolean> {
    return this.whatsappBots.delete(id);
  }

  // Schedules
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentId++;
    const newSchedule: Schedule = {
      ...schedule,
      id,
      createdAt: new Date(),
    };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...updates };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }

  // Auto Responders
  async getAutoResponders(): Promise<AutoResponder[]> {
    return Array.from(this.autoResponders.values());
  }

  async getAutoResponder(id: number): Promise<AutoResponder | undefined> {
    return this.autoResponders.get(id);
  }

  async createAutoResponder(responder: InsertAutoResponder): Promise<AutoResponder> {
    const id = this.currentId++;
    const newResponder: AutoResponder = {
      ...responder,
      id,
      createdAt: new Date(),
    };
    this.autoResponders.set(id, newResponder);
    return newResponder;
  }

  async updateAutoResponder(id: number, updates: Partial<InsertAutoResponder>): Promise<AutoResponder | undefined> {
    const responder = this.autoResponders.get(id);
    if (!responder) return undefined;
    
    const updatedResponder = { ...responder, ...updates };
    this.autoResponders.set(id, updatedResponder);
    return updatedResponder;
  }

  async deleteAutoResponder(id: number): Promise<boolean> {
    return this.autoResponders.delete(id);
  }

  // Activity Logs
  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values());
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentId++;
    const newLog: ActivityLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.activityLogs.set(id, newLog);
    return newLog;
  }

  // Config Files
  async getConfigFiles(): Promise<ConfigFile[]> {
    return Array.from(this.configFiles.values());
  }

  async getConfigFile(id: number): Promise<ConfigFile | undefined> {
    return this.configFiles.get(id);
  }

  async createConfigFile(file: InsertConfigFile): Promise<ConfigFile> {
    const id = this.currentId++;
    const newFile: ConfigFile = {
      ...file,
      id,
      lastModified: new Date(),
    };
    this.configFiles.set(id, newFile);
    return newFile;
  }

  async updateConfigFile(id: number, updates: Partial<InsertConfigFile>): Promise<ConfigFile | undefined> {
    const file = this.configFiles.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates, lastModified: new Date() };
    this.configFiles.set(id, updatedFile);
    return updatedFile;
  }

  async deleteConfigFile(id: number): Promise<boolean> {
    return this.configFiles.delete(id);
  }
}

export const storage = new MemStorage();
