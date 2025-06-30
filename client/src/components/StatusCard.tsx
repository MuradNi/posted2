import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: {
    label: string;
    color: string;
    count?: number;
  };
  subtitle?: string;
  trend?: string;
}

export function StatusCard({ title, value, icon: Icon, status, subtitle, trend }: StatusCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        {(status || subtitle || trend) && (
          <div className="mt-4 flex items-center">
            {status && (
              <span className={`flex items-center text-sm ${status.color}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${status.color.replace('text-', 'bg-')} animate-pulse`}></div>
                {status.label}
                {status.count && ` (${status.count})`}
              </span>
            )}
            {subtitle && !status && (
              <span className="text-gray-500 text-sm">{subtitle}</span>
            )}
            {trend && (
              <span className="text-green-600 text-sm ml-4">{trend}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
