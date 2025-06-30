import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import DiscordBots from "@/pages/DiscordBots";
import WhatsAppBots from "@/pages/WhatsAppBots";
import AutoPoster from "@/pages/AutoPoster";
import AutoResponder from "@/pages/AutoResponder";
import ActivityLogs from "@/pages/ActivityLogs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <Switch>
            <Route path="/">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Monitor and manage your automation bots</p>
              </div>
            </Route>
            <Route path="/discord">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Discord Bots</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your Discord automation bots</p>
              </div>
            </Route>
            <Route path="/whatsapp">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">WhatsApp Bots</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your WhatsApp automation bots</p>
              </div>
            </Route>
            <Route path="/autoposter">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Auto Poster</h2>
                <p className="text-sm text-gray-500 mt-1">Schedule automated messages for your bots</p>
              </div>
            </Route>
            <Route path="/autoresponder">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Auto Responder</h2>
                <p className="text-sm text-gray-500 mt-1">Manage automated response templates</p>
              </div>
            </Route>
            <Route path="/logs">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Activity Logs</h2>
                <p className="text-sm text-gray-500 mt-1">View system activities and bot interactions</p>
              </div>
            </Route>
          </Switch>
        </header>
        
        <div className="p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/discord" component={DiscordBots} />
            <Route path="/whatsapp" component={WhatsAppBots} />
            <Route path="/autoposter" component={AutoPoster} />
            <Route path="/autoresponder" component={AutoResponder} />
            <Route path="/logs" component={ActivityLogs} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
