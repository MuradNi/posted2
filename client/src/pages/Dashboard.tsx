import { StatusCard } from "@/components/StatusCard";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";
import { 
  MessageSquare, 
  Phone, 
  MessageCircle, 
  Calendar,
  Plus,
  RefreshCw
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, refetch } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { lastMessage } = useWebSocket('/ws');

  // Refetch stats when we receive WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      refetch();
    }
  }, [lastMessage, refetch]);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'connected':
      case 'message_sent':
      case 'scheduled_message':
        return '🟢';
      case 'auto_response':
        return '🤖';
      case 'error':
      case 'auth_failed':
        return '🔴';
      case 'disconnected':
        return '🟡';
      default:
        return '📝';
    }
  };

  if (!stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage your automation bots</p>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Discord Bots"
          value={stats.discordBots.total}
          icon={MessageSquare}
          status={{
            label: `${stats.discordBots.online} Online`,
            color: "text-green-600",
            count: stats.discordBots.offline > 0 ? stats.discordBots.offline : undefined,
          }}
        />
        
        <StatusCard
          title="WhatsApp Bots"
          value={stats.whatsappBots.total}
          icon={Phone}
          status={{
            label: `${stats.whatsappBots.connected} Connected`,
            color: "text-green-600",
          }}
        />
        
        <StatusCard
          title="Messages Today"
          value="1,247"
          icon={MessageCircle}
          trend="↗ +12% from yesterday"
        />
        
        <StatusCard
          title="Active Schedules"
          value={stats.activeSchedules}
          icon={Calendar}
          subtitle="Next in 2h 15m"
        />
      </div>

      {/* Configuration and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigurationPanel />
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Commonly used features and shortcuts</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/discord'}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Add Discord Bot</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/whatsapp'}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium">Add WhatsApp Bot</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/autoposter'}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Create Schedule</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/autoresponder'}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium">Add Auto Responder</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <p className="text-sm text-muted-foreground">Latest automated messages and responses</p>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/logs'}>
              View All Logs →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {stats.recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                  <div className="text-xl">{getActivityIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.botName}</span> {log.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(log.timestamp)}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {log.action.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
