import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { discordService } from "./services/discordService";
import { whatsappService } from "./services/whatsappService";
import { schedulerService } from "./services/schedulerService";
import { configService } from "./services/configService";
import { insertDiscordBotSchema, insertWhatsappBotSchema, insertScheduleSchema, insertAutoResponderSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const discordBots = await storage.getDiscordBots();
      const whatsappBots = await storage.getWhatsappBots();
      const schedules = await storage.getSchedules();
      const logs = await storage.getActivityLogs(10);

      const stats = {
        discordBots: {
          total: discordBots.length,
          online: discordBots.filter(bot => bot.status === 'online').length,
          offline: discordBots.filter(bot => bot.status === 'offline').length,
        },
        whatsappBots: {
          total: whatsappBots.length,
          connected: whatsappBots.filter(bot => bot.status === 'connected').length,
          disconnected: whatsappBots.filter(bot => bot.status === 'disconnected').length,
        },
        activeSchedules: schedules.filter(schedule => schedule.isActive).length,
        recentLogs: logs,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Discord bot routes
  app.get('/api/discord-bots', async (req, res) => {
    try {
      const bots = await storage.getDiscordBots();
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Discord bots' });
    }
  });

  app.post('/api/discord-bots', async (req, res) => {
    try {
      const validatedData = insertDiscordBotSchema.parse(req.body);
      const bot = await storage.createDiscordBot(validatedData);
      
      // Attempt to connect the bot
      try {
        await discordService.connectBot(bot);
      } catch (connectError) {
        console.error('Failed to connect bot immediately:', connectError);
      }
      
      broadcast({ type: 'bot_created', platform: 'discord', bot });
      res.json(bot);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create Discord bot' });
    }
  });

  app.put('/api/discord-bots/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const bot = await storage.updateDiscordBot(id, updates);
      
      if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      
      broadcast({ type: 'bot_updated', platform: 'discord', bot });
      res.json(bot);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update Discord bot' });
    }
  });

  app.delete('/api/discord-bots/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await discordService.disconnectBot(id);
      const success = await storage.deleteDiscordBot(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      
      broadcast({ type: 'bot_deleted', platform: 'discord', botId: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete Discord bot' });
    }
  });

  // WhatsApp bot routes
  app.get('/api/whatsapp-bots', async (req, res) => {
    try {
      const bots = await storage.getWhatsappBots();
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch WhatsApp bots' });
    }
  });

  app.post('/api/whatsapp-bots', async (req, res) => {
    try {
      const validatedData = insertWhatsappBotSchema.parse(req.body);
      const bot = await storage.createWhatsappBot(validatedData);
      
      // Attempt to connect the bot
      try {
        await whatsappService.connectBot(bot);
      } catch (connectError) {
        console.error('Failed to connect WhatsApp bot immediately:', connectError);
      }
      
      broadcast({ type: 'bot_created', platform: 'whatsapp', bot });
      res.json(bot);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create WhatsApp bot' });
    }
  });

  app.get('/api/whatsapp-bots/:id/qr', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const qrCode = whatsappService.getQRCode(id);
      
      if (!qrCode) {
        return res.status(404).json({ error: 'QR code not available' });
      }
      
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get QR code' });
    }
  });

  app.delete('/api/whatsapp-bots/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await whatsappService.disconnectBot(id);
      const success = await storage.deleteWhatsappBot(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      
      broadcast({ type: 'bot_deleted', platform: 'whatsapp', botId: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete WhatsApp bot' });
    }
  });

  // Schedule routes
  app.get('/api/schedules', async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  });

  app.post('/api/schedules', async (req, res) => {
    try {
      const validatedData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(validatedData);
      
      // Create scheduler job
      await schedulerService.createScheduleJob(schedule);
      
      broadcast({ type: 'schedule_created', schedule });
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create schedule' });
    }
  });

  app.put('/api/schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const schedule = await storage.updateSchedule(id, updates);
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      // Update scheduler job
      await schedulerService.updateScheduleJob(schedule);
      
      broadcast({ type: 'schedule_updated', schedule });
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update schedule' });
    }
  });

  app.delete('/api/schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await schedulerService.removeScheduleJob(id);
      const success = await storage.deleteSchedule(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      broadcast({ type: 'schedule_deleted', scheduleId: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  });

  // Auto responder routes
  app.get('/api/auto-responders', async (req, res) => {
    try {
      const responders = await storage.getAutoResponders();
      res.json(responders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch auto responders' });
    }
  });

  app.post('/api/auto-responders', async (req, res) => {
    try {
      const validatedData = insertAutoResponderSchema.parse(req.body);
      const responder = await storage.createAutoResponder(validatedData);
      
      broadcast({ type: 'responder_created', responder });
      res.json(responder);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create auto responder' });
    }
  });

  app.delete('/api/auto-responders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAutoResponder(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Auto responder not found' });
      }
      
      broadcast({ type: 'responder_deleted', responderId: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete auto responder' });
    }
  });

  // Activity logs
  app.get('/api/activity-logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  });

  // Config file management
  app.get('/api/config-files', async (req, res) => {
    try {
      const files = await storage.getConfigFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch config files' });
    }
  });

  app.post('/api/config-files/upload', upload.single('config'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const content = JSON.parse(req.file.buffer.toString());
      const result = await configService.processConfigFile(req.file.originalname, content);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message, details: result.errors });
      }
      
      broadcast({ type: 'config_uploaded', filename: req.file.originalname });
      res.json({ message: result.message });
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON file' });
    }
  });

  app.delete('/api/config-files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getConfigFile(id);
      
      if (!file) {
        return res.status(404).json({ error: 'Config file not found' });
      }
      
      await configService.deleteConfigFile(file.name);
      await storage.deleteConfigFile(id);
      
      broadcast({ type: 'config_deleted', fileId: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete config file' });
    }
  });

  // Initialize services
  await discordService.initializeAllBots();
  await whatsappService.initializeAllBots();
  await schedulerService.initializeSchedules();

  return httpServer;
}
