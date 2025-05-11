
import React from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationsList from './NotificationsList';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationsContent = () => {
  const { 
    notifications, 
    clearAllNotifications, 
    hasUnread,
    markAllAsRead
  } = useNotifications();
  const { toast } = useToast();
  
  const handleClearAll = () => {
    clearAllNotifications();
    toast({
      title: "Notifications cleared",
      description: "All notifications have been removed",
    });
  };
  
  const handleMarkAllRead = () => {
    markAllAsRead();
    toast({
      title: "Marked as read",
      description: "All notifications marked as read",
    });
  };

  return (
    <div className="space-y-4">
      {notifications.length > 0 && (
        <div className="flex justify-end gap-2">
          {hasUnread && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear all
          </Button>
        </div>
      )}
      
      {notifications.length > 0 ? (
        <NotificationsList />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-muted-foreground mt-2">
            When you receive notifications, they will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsContent;
