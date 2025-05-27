
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DismissibleNotificationProps {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onDismiss?: () => void;
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
};

export function DismissibleNotification({
  title,
  message,
  type = 'info',
  onDismiss,
  className
}: DismissibleNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const Icon = iconMap[type];

  return (
    <Card className={cn(
      "p-4 border-l-4 relative",
      colorMap[type],
      className
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/10"
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="flex items-start gap-3 pr-8">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </Card>
  );
}
