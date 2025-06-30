import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2 } from "lucide-react";
import type { DiscordBot, WhatsappBot } from "@shared/schema";

interface BotCardProps {
  bot: DiscordBot | WhatsappBot;
  platform: 'discord' | 'whatsapp';
  onConfigure?: (bot: DiscordBot | WhatsappBot) => void;
  onDelete?: (bot: DiscordBot | WhatsappBot) => void;
}

export function BotCard({ bot, platform, onConfigure, onDelete }: BotCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'bg-green-500';
      case 'offline':
      case 'disconnected':
        return 'bg-gray-500';
      case 'error':
      case 'auth_failed':
        return 'bg-red-500';
      case 'awaiting_qr_scan':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'connected':
        return 'Connected';
      case 'offline':
        return 'Offline';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      case 'auth_failed':
        return 'Auth Failed';
      case 'awaiting_qr_scan':
        return 'Awaiting QR Scan';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-3 ${getStatusColor(bot.status)}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">{bot.name}</p>
              {platform === 'discord' && 'serverName' in bot && (
                <>
                  <p className="text-xs text-gray-500">Server: {bot.serverName}</p>
                  <p className="text-xs text-gray-500">{bot.channels.length} Channels Active</p>
                </>
              )}
              {platform === 'whatsapp' && 'phoneNumber' in bot && (
                <p className="text-xs text-gray-500">Phone: {bot.phoneNumber}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={bot.status === 'online' || bot.status === 'connected' ? 'default' : 'secondary'}>
              {getStatusText(bot.status)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConfigure?.(bot)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(bot)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
