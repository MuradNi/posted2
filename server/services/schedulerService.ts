import * as cron from 'node-cron';
import { storage } from '../storage';
import { discordService } from './discordService';
import { whatsappService } from './whatsappService';

export class SchedulerService {
  private jobs: Map<number, cron.ScheduledTask> = new Map();

  async initializeSchedules(): Promise<void> {
    const schedules = await storage.getSchedules();
    const activeSchedules = schedules.filter((schedule) => schedule.isActive);

    for (const schedule of activeSchedules) {
      try {
        await this.createScheduleJob(schedule);
      } catch (error) {
        console.error(`Failed to initialize schedule ${schedule.name}:`, error);
      }
    }
  }

  async createScheduleJob(schedule: any): Promise<void> {
    if (!cron.validate(schedule.cronExpression)) {
      throw new Error(`Invalid cron expression: ${schedule.cronExpression}`);
    }

    const job = cron.schedule(
      schedule.cronExpression,
      async () => {
        try {
          await this.executeSchedule(schedule);
        } catch (error) {
          console.error(`Failed to execute schedule ${schedule.name}:`, error);
          await storage.createActivityLog({
            platform: schedule.platform,
            botId: schedule.botId,
            botName: `Schedule: ${schedule.name}`,
            action: 'schedule_error',
            message: `Failed to execute schedule: ${error}`,
            targetId: schedule.targetId,
          });
        }
      },
      {
        scheduled: true,
        timezone: 'UTC',
      }
    );

    this.jobs.set(schedule.id, job);
    console.log(`Schedule job created for: ${schedule.name}`);
  }

  async executeSchedule(schedule: any): Promise<void> {
    if (schedule.platform === 'discord') {
      await discordService.sendMessage(schedule.botId, schedule.targetId, schedule.message);
    } else if (schedule.platform === 'whatsapp') {
      await whatsappService.sendMessage(schedule.botId, schedule.targetId, schedule.message);
    }

    await storage.createActivityLog({
      platform: schedule.platform,
      botId: schedule.botId,
      botName: `Schedule: ${schedule.name}`,
      action: 'scheduled_message',
      message: `Executed scheduled message: ${schedule.message.substring(0, 50)}${schedule.message.length > 50 ? '...' : ''}`,
      targetId: schedule.targetId,
    });
  }

  async removeScheduleJob(scheduleId: number): Promise<void> {
    const job = this.jobs.get(scheduleId);
    if (job) {
      job.stop();
      this.jobs.delete(scheduleId);
      console.log(`Schedule job removed for ID: ${scheduleId}`);
    }
  }

  async updateScheduleJob(schedule: any): Promise<void> {
    await this.removeScheduleJob(schedule.id);
    if (schedule.isActive) {
      await this.createScheduleJob(schedule);
    }
  }

  getActiveJobs(): number[] {
    return Array.from(this.jobs.keys());
  }

  async refreshAllSchedules(): Promise<void> {
    // Stop all current jobs
    for (const [scheduleId, job] of this.jobs) {
      job.stop();
    }
    this.jobs.clear();

    // Reinitialize all active schedules
    await this.initializeSchedules();
  }
}

export const schedulerService = new SchedulerService();
