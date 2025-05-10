
import React from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, Circle, User, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationsList = () => {
  const { notifications, toggleNotificationRead } = useNotifications();
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <User className="h-5 w-5" />;
      case 'keystone':
        return <Calendar className="h-5 w-5" />;
      case 'message':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className={cn(
            "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
            !notification.read && "border-l-4 border-l-primary"
          )}
          onClick={() => toggleNotificationRead(notification.id)}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-full",
              !notification.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className={cn(
                  "font-medium",
                  !notification.read && "text-primary"
                )}>
                  {notification.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs flex items-center gap-1">
                  {notification.read ? (
                    <span className="text-muted-foreground">Read</span>
                  ) : (
                    <span className="text-primary flex items-center">
                      <Circle className="h-2 w-2 fill-current mr-1" />
                      Unread
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsList;
