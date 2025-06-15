
import React from 'react';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { Bell, CheckCheck, Trash2, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModernNotificationsHeaderProps {
  unreadCount: number;
  hasUnread: boolean;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function ModernNotificationsHeader({
  unreadCount,
  hasUnread,
  onMarkAllAsRead,
  onClearAll
}: ModernNotificationsHeaderProps) {
  return (
    <div className="glass-card-enhanced p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0daeec]/20 to-[#0daeec]/10 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-[#0daeec]" />
            </div>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-[#0daeec] text-white min-w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up! No new notifications.'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-2 border-[#0daeec]/20 text-[#0daeec] hover:bg-[#0daeec]/5"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>
    </div>
  );
}
