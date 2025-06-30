import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const discordBots = pgTable("discord_bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  token: text("token").notNull(),
  serverId: text("server_id").notNull(),
  serverName: text("server_name").notNull(),
  channels: jsonb("channels").notNull().$type<string[]>(),
  status: text("status").notNull().default("offline"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whatsappBots = pgTable("whatsapp_bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  sessionData: text("session_data"),
  status: text("status").notNull().default("disconnected"),
  qrCode: text("qr_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(), // discord or whatsapp
  botId: integer("bot_id").notNull(),
  targetId: text("target_id").notNull(), // channel_id for discord, phone_number for whatsapp
  message: text("message").notNull(),
  cronExpression: text("cron_expression").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const autoResponders = pgTable("auto_responders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  botId: integer("bot_id").notNull(),
  triggers: jsonb("triggers").notNull().$type<string[]>(),
  response: text("response").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  botId: integer("bot_id").notNull(),
  botName: text("bot_name").notNull(),
  action: text("action").notNull(),
  message: text("message").notNull(),
  targetId: text("target_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const configFiles = pgTable("config_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: jsonb("content").notNull(),
  lastModified: timestamp("last_modified").defaultNow().notNull(),
});

// Insert schemas
export const insertDiscordBotSchema = createInsertSchema(discordBots).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappBotSchema = createInsertSchema(whatsappBots).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export const insertAutoResponderSchema = createInsertSchema(autoResponders).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertConfigFileSchema = createInsertSchema(configFiles).omit({
  id: true,
  lastModified: true,
});

// Types
export type DiscordBot = typeof discordBots.$inferSelect;
export type InsertDiscordBot = z.infer<typeof insertDiscordBotSchema>;

export type WhatsappBot = typeof whatsappBots.$inferSelect;
export type InsertWhatsappBot = z.infer<typeof insertWhatsappBotSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type AutoResponder = typeof autoResponders.$inferSelect;
export type InsertAutoResponder = z.infer<typeof insertAutoResponderSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type ConfigFile = typeof configFiles.$inferSelect;
export type InsertConfigFile = z.infer<typeof insertConfigFileSchema>;
