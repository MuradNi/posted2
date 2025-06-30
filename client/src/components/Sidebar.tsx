import { Link, useLocation } from "wouter";
import { 
  Home, 
  MessageSquare, 
  Phone, 
  Calendar, 
  MessageCircle, 
  FileText,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Discord Bots", href: "/discord", icon: MessageSquare },
  { name: "WhatsApp Bots", href: "/whatsapp", icon: Phone },
  { name: "Auto Poster", href: "/autoposter", icon: Calendar },
  { name: "Auto Responder", href: "/autoresponder", icon: MessageCircle },
  { name: "Activity Logs", href: "/logs", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">AutoBot Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Discord & WhatsApp Automation</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "text-primary bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">System Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
