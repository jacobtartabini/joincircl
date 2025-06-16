
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Users, TrendingUp, Lightbulb, Gift, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notifications';

interface ModernNotificationItemProps {
  notification: Notification;
  onToggleRead: (id: string) => void;
  onClear: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const notificationIcons = {
  follow_up: Users,
  keystone_reminder: Calendar,
  birthday_reminder: Gift,
  ai_insight: Lightbulb,
  contact_update: Users,
  system: TrendingUp,
  job_followup: Briefcase,
  network_insight: Users,
};

const notificationColors = {
  follow_up: 'text-blue-600 bg-blue-50',
  keystone_reminder: 'text-green-600 bg-green-50',
  birthday_reminder: 'text-pink-600 bg-pink-50',
  ai_insight: 'text-purple-600 bg-purple-50',
  contact_update: 'text-orange-600 bg-orange-50',
  system: 'text-gray-600 bg-gray-50',
  job_followup: 'text-purple-600 bg-purple-50',
  network_insight: 'text-orange-600 bg-orange-50',
};

export default function ModernNotificationItem({
  notification,
  onToggleRead,
  onClear,
  onClick
}: ModernNotificationItemProps) {
  const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons] || TrendingUp;
  const iconColorClass = notificationColors[notification.type as keyof typeof notificationColors] || 'text-gray-600 bg-gray-50';

  const handleClick = () => {
    if (!notification.read) {
      onToggleRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group relative p-4 glass-card-enhanced border-l-4 transition-all duration-200 hover:shadow-lg",
        notification.read 
          ? "border-l-gray-200 opacity-75 bg-gray-50/30" 
          : "border-l-[#0daeec] shadow-sm bg-white"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("flex-shrink-0 p-2 rounded-full", iconColorClass)}>
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-sm leading-tight mb-1",
                notification.read 
                  ? "font-normal text-muted-foreground" 
                  : "font-semibold text-foreground"
              )}>
                {notification.title}
              </h3>
              <p className={cn(
                "text-sm leading-relaxed mb-2",
                notification.read ? "text-muted-foreground/80" : "text-muted-foreground"
              )}>
                {notification.message}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleDateString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-[#0daeec]/10 text-[#0daeec] border-[#0daeec]/20">
                    New
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRead(notification.id);
                  }}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Mark read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear(notification.id);
                }}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
