import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BotCard } from "@/components/BotCard";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, QrCode } from "lucide-react";
import type { WhatsappBot, InsertWhatsappBot } from "@shared/schema";

export default function WhatsAppBots() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<{ id: number; name: string } | null>(null);
  const [formData, setFormData] = useState<InsertWhatsappBot>({
    name: '',
    phoneNumber: '',
    sessionData: null,
    status: 'disconnected',
    qrCode: null,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bots = [], isLoading } = useQuery<WhatsappBot[]>({
    queryKey: ['/api/whatsapp-bots'],
  });

  const createBotMutation = useMutation({
    mutationFn: async (data: InsertWhatsappBot) => {
      return apiRequest('POST', '/api/whatsapp-bots', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "WhatsApp bot created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-bots'] });
      setIsDialogOpen(false);
      
      // Show QR code modal for new bot
      const newBot = response.data || response;
      setSelectedBot({ id: newBot.id, name: newBot.name });
      setQrModalOpen(true);
      
      setFormData({
        name: '',
        phoneNumber: '',
        sessionData: null,
        status: 'disconnected',
        qrCode: null,
        isActive: true,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create WhatsApp bot",
        variant: "destructive",
      });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/whatsapp-bots/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WhatsApp bot deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-bots'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete WhatsApp bot",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createBotMutation.mutate(formData);
  };

  const handleShowQR = (bot: WhatsappBot) => {
    setSelectedBot({ id: bot.id, name: bot.name });
    setQrModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">WhatsApp Bots</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your WhatsApp automation bots</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add WhatsApp Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add WhatsApp Bot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Bot Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer Support Bot"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
              <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">Next Steps:</p>
                <p>After creating the bot, you'll need to scan a QR code with your WhatsApp mobile app to connect it.</p>
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
                <p className="text-sm font-medium text-gray-500">Connected</p>
                <p className="text-2xl font-bold text-green-600">
                  {bots.filter(bot => bot.status === 'connected').length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Awaiting QR</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bots.filter(bot => bot.status === 'awaiting_qr_scan').length}
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <Card>
        <CardHeader>
          <CardTitle>Your WhatsApp Bots</CardTitle>
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
              <p className="text-gray-500 mb-4">No WhatsApp bots configured yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Bot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bots.map((bot) => (
                <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <BotCard
                    bot={bot}
                    platform="whatsapp"
                    onDelete={(bot) => deleteBotMutation.mutate(bot.id)}
                  />
                  {(bot.status === 'awaiting_qr_scan' || bot.status === 'disconnected') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQR(bot)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Show QR Code
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Connect New WhatsApp Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new bot to generate a QR code for WhatsApp connection
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-3">Connect New WhatsApp Account</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Bot
            </Button>
          </div>
        </CardContent>
      </Card>

      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        botId={selectedBot?.id || null}
        botName={selectedBot?.name || ''}
      />
    </div>
  );
}
