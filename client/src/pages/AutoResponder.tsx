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
import { Plus, MessageCircle, Trash2, Edit, Zap } from "lucide-react";
import type { AutoResponder, InsertAutoResponder, DiscordBot, WhatsappBot } from "@shared/schema";

export default function AutoResponder() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertAutoResponder>({
    name: '',
    platform: 'discord',
    botId: 0,
    triggers: [],
    response: '',
    isActive: true,
  });
  const [triggerInput, setTriggerInput] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: responders = [], isLoading } = useQuery<AutoResponder[]>({
    queryKey: ['/api/auto-responders'],
  });

  const { data: discordBots = [] } = useQuery<DiscordBot[]>({
    queryKey: ['/api/discord-bots'],
  });

  const { data: whatsappBots = [] } = useQuery<WhatsappBot[]>({
    queryKey: ['/api/whatsapp-bots'],
  });

  const createResponderMutation = useMutation({
    mutationFn: async (data: InsertAutoResponder) => {
      return apiRequest('POST', '/api/auto-responders', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Auto responder created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responders'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create auto responder",
        variant: "destructive",
      });
    },
  });

  const deleteResponderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/auto-responders/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Auto responder deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responders'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete auto responder",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'discord',
      botId: 0,
      triggers: [],
      response: '',
      isActive: true,
    });
    setTriggerInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.botId || formData.triggers.length === 0 || !formData.response) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one trigger",
        variant: "destructive",
      });
      return;
    }
    createResponderMutation.mutate(formData);
  };

  const addTrigger = () => {
    if (triggerInput.trim() && !formData.triggers.includes(triggerInput.trim())) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, triggerInput.trim()]
      }));
      setTriggerInput('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrigger();
    }
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

  const availableBots = formData.platform === 'discord' ? discordBots : whatsappBots;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Auto Responder</h2>
          <p className="text-sm text-gray-500 mt-1">Manage automated response templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Auto Responder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Auto Responder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Responder Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="FAQ: Business Hours"
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value: 'discord' | 'whatsapp') => 
                    setFormData(prev => ({ ...prev, platform: value, botId: 0 }))
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
                <Label htmlFor="triggers">Trigger Words/Phrases</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      id="triggers"
                      value={triggerInput}
                      onChange={(e) => setTriggerInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="hours, schedule, time"
                    />
                    <Button type="button" onClick={addTrigger}>Add</Button>
                  </div>
                  {formData.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.triggers.map((trigger) => (
                        <Badge
                          key={trigger}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTrigger(trigger)}
                        >
                          {trigger} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add words or phrases that will trigger this response. Click on a tag to remove it.
                </p>
              </div>

              <div>
                <Label htmlFor="response">Response Message</Label>
                <Textarea
                  id="response"
                  value={formData.response}
                  onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                  placeholder="Our business hours are Monday-Friday 9AM-5PM EST..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createResponderMutation.isPending}>
                {createResponderMutation.isPending ? 'Creating...' : 'Create Auto Responder'}
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
                <p className="text-sm font-medium text-gray-500">Total Responders</p>
                <p className="text-2xl font-bold">{responders.length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {responders.filter(r => r.isActive).length}
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
                <p className="text-sm font-medium text-gray-500">Discord</p>
                <p className="text-2xl font-bold text-blue-600">
                  {responders.filter(r => r.platform === 'discord').length}
                </p>
              </div>
              <Badge variant="outline">Platform</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responders List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Auto Responders</CardTitle>
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
          ) : responders.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No auto responders created yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Auto Responder
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {responders.map((responder) => (
                <div key={responder.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{responder.name}</h3>
                        <Badge variant={responder.isActive ? "default" : "secondary"}>
                          {responder.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {responder.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Bot:</span> {getBotName(responder.platform, responder.botId)}
                      </p>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600">Triggers:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {responder.triggers.map((trigger) => (
                            <Badge key={trigger} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Response:</span> {responder.response.substring(0, 150)}
                        {responder.response.length > 150 && '...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Edit functionality will be available soon",
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResponderMutation.mutate(responder.id)}
                        disabled={deleteResponderMutation.isPending}
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

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Response Templates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Common response templates you can use as starting points
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Business Hours</h4>
              <p className="text-sm text-gray-600 mb-2">
                Triggers: hours, time, schedule, open, closed
              </p>
              <p className="text-sm text-gray-500">
                "Our business hours are Monday-Friday 9AM-5PM EST. We'll respond to your message during business hours."
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Support Info</h4>
              <p className="text-sm text-gray-600 mb-2">
                Triggers: help, support, contact, issue
              </p>
              <p className="text-sm text-gray-500">
                "For technical support, please email support@company.com or visit our help center at help.company.com"
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Pricing Info</h4>
              <p className="text-sm text-gray-600 mb-2">
                Triggers: price, cost, pricing, plan, subscription
              </p>
              <p className="text-sm text-gray-500">
                "You can view our current pricing plans at company.com/pricing. For custom enterprise solutions, contact sales@company.com"
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Away Message</h4>
              <p className="text-sm text-gray-600 mb-2">
                Triggers: hello, hi, hey, greetings
              </p>
              <p className="text-sm text-gray-500">
                "Thanks for reaching out! I'm currently away but will get back to you as soon as possible."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
