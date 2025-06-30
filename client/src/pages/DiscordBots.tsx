import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BotCard } from "@/components/BotCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import type { DiscordBot, InsertDiscordBot } from "@shared/schema";

export default function DiscordBots() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertDiscordBot>({
    name: '',
    token: '',
    serverId: '',
    serverName: '',
    channels: [],
    status: 'offline',
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bots = [], isLoading } = useQuery<DiscordBot[]>({
    queryKey: ['/api/discord-bots'],
  });

  const createBotMutation = useMutation({
    mutationFn: async (data: InsertDiscordBot) => {
      return apiRequest('POST', '/api/discord-bots', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Discord bot created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/discord-bots'] });
      setIsDialogOpen(false);
      setFormData({
        name: '',
        token: '',
        serverId: '',
        serverName: '',
        channels: [],
        status: 'offline',
        isActive: true,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create Discord bot",
        variant: "destructive",
      });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/discord-bots/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Discord bot deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/discord-bots'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete Discord bot",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.token || !formData.serverId || !formData.serverName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createBotMutation.mutate(formData);
  };

  const handleChannelsChange = (value: string) => {
    const channels = value.split(',').map(ch => ch.trim()).filter(ch => ch);
    setFormData(prev => ({ ...prev, channels }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Discord Bots</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your Discord automation bots</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Discord Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Discord Bot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Bot Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Discord Bot"
                />
              </div>
              <div>
                <Label htmlFor="token">Bot Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Bot token from Discord Developer Portal"
                />
              </div>
              <div>
                <Label htmlFor="serverId">Server ID</Label>
                <Input
                  id="serverId"
                  value={formData.serverId}
                  onChange={(e) => setFormData(prev => ({ ...prev, serverId: e.target.value }))}
                  placeholder="Discord server ID"
                />
              </div>
              <div>
                <Label htmlFor="serverName">Server Name</Label>
                <Input
                  id="serverName"
                  value={formData.serverName}
                  onChange={(e) => setFormData(prev => ({ ...prev, serverName: e.target.value }))}
                  placeholder="Discord server name"
                />
              </div>
              <div>
                <Label htmlFor="channels">Channels (comma-separated)</Label>
                <Textarea
                  id="channels"
                  value={formData.channels.join(', ')}
                  onChange={(e) => handleChannelsChange(e.target.value)}
                  placeholder="general, announcements, bot-commands"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createBotMutation.isPending}>
                {createBotMutation.isPending ? 'Creating...' : 'Create Bot'}
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
                <p className="text-sm font-medium text-gray-500">Total Bots</p>
                <p className="text-2xl font-bold">{bots.length}</p>
              </div>
              <Badge variant="outline">{bots.length} Active</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {bots.filter(bot => bot.status === 'online').length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Offline</p>
                <p className="text-2xl font-bold text-gray-600">
                  {bots.filter(bot => bot.status === 'offline').length}
                </p>
              </div>
              <Badge variant="secondary">Disconnected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Discord Bots</CardTitle>
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
          ) : bots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No Discord bots configured yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Bot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  platform="discord"
                  onDelete={(bot) => deleteBotMutation.mutate(bot.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
