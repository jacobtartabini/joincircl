
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealNotifications } from '@/hooks/use-real-notifications';
import ModernNotificationsHeader from './ModernNotificationsHeader';
import NotificationCategories from './NotificationCategories';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/types/notifications';

export default function ModernNotificationsContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    notifications,
    toggleNotificationRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    hasUnread,
    unreadCount
  } = useRealNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "Marked as read",
      description: "All notifications have been marked as read",
    });
  };

  const handleClearAll = () => {
    clearAllNotifications();
    toast({
      title: "Notifications cleared",
      description: "All notifications have been removed",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'follow_up':
      case 'contact_update':
      case 'birthday_reminder':
        navigate('/circles');
        break;
      case 'keystone_reminder':
        navigate('/events');
        break;
      case 'ai_insight':
        navigate('/ai-assistant');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <ModernNotificationsHeader
        unreadCount={unreadCount}
        hasUnread={hasUnread}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />

      <NotificationCategories
        notifications={notifications}
        onToggleRead={toggleNotificationRead}
        onClear={clearNotification}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
