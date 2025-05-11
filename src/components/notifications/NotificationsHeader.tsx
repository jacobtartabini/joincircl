
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';

const NotificationsHeader = () => {
  const { markAllAsRead, clearAllNotifications, hasUnread } = useNotifications();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Bell size={24} className="text-primary" />
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {hasUnread && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearAllNotifications}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default NotificationsHeader;
