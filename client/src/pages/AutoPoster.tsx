import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Calendar, Clock, Trash2, Edit } from "lucide-react";
import type { Schedule, InsertSchedule, DiscordBot, WhatsappBot } from "@shared/schema";

export default function AutoPoster() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertSchedule>({
    name: '',
    platform: 'discord',
    botId: 0,
    targetId: '',
    message: '',
    cronExpression: '0 9 * * *', // Daily at 9 AM
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
  });

  const { data: discordBots = [] } = useQuery<DiscordBot[]>({
    queryKey: ['/api/discord-bots'],
  });

  const { data: whatsappBots = [] } = useQuery<WhatsappBot[]>({
    queryKey: ['/api/whatsapp-bots'],
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: InsertSchedule) => {
      return apiRequest('POST', '/api/schedules', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/schedules/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    },
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PUT', `/api/schedules/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'discord',
      botId: 0,
      targetId: '',
      message: '',
      cronExpression: '0 9 * * *',
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.botId || !formData.targetId || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createScheduleMutation.mutate(formData);
  };

  const getBotName = (platform: string, botId: number) => {
    if (platform === 'discord') {
      const bot = discordBots.find(b => b.id === botId);
      return bot?.name || 'Unknown Bot';
    } else {
      const bot = whatsappBots.find(b => b.id === botId);
      return bot?.name || 'Unknown Bot';
    }
  };

  const formatCronExpression = (cron: string) => {
    // Simple cron expression formatter
    const parts = cron.split(' ');
    if (parts.length >= 5) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      if (minute === '0' && hour !== '*') {
        return `Daily at ${hour}:00`;
      }
      if (minute !== '*' && hour !== '*') {
        return `Daily at ${hour}:${minute.padStart(2, '0')}`;
      }
      return cron;
    }
    return cron;
  };

  const availableBots = formData.platform === 'discord' ? discordBots : whatsappBots;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Auto Poster</h2>
          <p className="text-sm text-gray-500 mt-1">Schedule automated messages for your bots</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Auto Post Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Daily Announcement"
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value: 'discord' | 'whatsapp') => 
                    setFormData(prev => ({ ...prev, platform: value, botId: 0, targetId: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="botId">Select Bot</Label>
                <Select 
                  value={formData.botId.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, botId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id.toString()}>
                        {bot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetId">
                  {formData.platform === 'discord' ? 'Channel ID' : 'Phone Number'}
                </Label>
                <Input
                  id="targetId"
                  value={formData.targetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetId: e.target.value }))}
                  placeholder={formData.platform === 'discord' ? '123456789012345678' : '+1234567890'}
                />
              </div>

              <div>
                <Label htmlFor="cronExpression">Schedule (Cron Expression)</Label>
                <Select 
                  value={formData.cronExpression} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cronExpression: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 9 * * *">Daily at 9:00 AM</SelectItem>
                    <SelectItem value="0 12 * * *">Daily at 12:00 PM</SelectItem>
                    <SelectItem value="0 18 * * *">Daily at 6:00 PM</SelectItem>
                    <SelectItem value="0 9 * * 1">Every Monday at 9:00 AM</SelectItem>
                    <SelectItem value="0 0 1 * *">First day of month at midnight</SelectItem>
                    <SelectItem value="*/30 * * * *">Every 30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your automated message here..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createScheduleMutation.isPending}>
                {createScheduleMutation.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedules.filter(s => s.isActive).length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Running</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paused</p>
                <p className="text-2xl font-bold text-gray-600">
                  {schedules.filter(s => !s.isActive).length}
                </p>
              </div>
              <Badge variant="secondary">Inactive</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No schedules created yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{schedule.name}</h3>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Paused"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {schedule.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Bot:</span> {getBotName(schedule.platform, schedule.botId)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Target:</span> {schedule.targetId}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Schedule:</span> {formatCronExpression(schedule.cronExpression)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Message:</span> {schedule.message.substring(0, 100)}
                        {schedule.message.length > 100 && '...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => 
                          toggleScheduleMutation.mutate({ 
                            id: schedule.id, 
                            isActive: !schedule.isActive 
                          })
                        }
                      >
                        {schedule.isActive ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
