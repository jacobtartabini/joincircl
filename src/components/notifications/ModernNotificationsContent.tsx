
import React from 'react';
import { useUnifiedNotifications } from '@/hooks/use-unified-notifications';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ModernNotificationItem from './ModernNotificationItem';

export default function ModernNotificationsContent() {
  const {
    notifications,
    toggleNotificationRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    hasUnread,
    unreadCount
  } = useUnifiedNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked if not already read
    if (!notification.read) {
      toggleNotificationRead(notification.id);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Bell className="h-8 w-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            No notifications yet. When you receive notifications, they'll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-sm"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="text-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => (
            <ModernNotificationItem
              key={notification.id}
              notification={notification}
              onToggleRead={toggleNotificationRead}
              onClear={clearNotification}
              onClick={handleNotificationClick}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      {notifications.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
