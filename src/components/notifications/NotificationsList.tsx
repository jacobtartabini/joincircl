
import React from 'react';
import { useUnifiedNotifications } from '@/hooks/use-unified-notifications';
import { Bell, Calendar, Users, Heart, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'follow_up':
      return <Users className="h-4 w-4 text-blue-500" />;
    case 'birthday_reminder':
      return <Heart className="h-4 w-4 text-pink-500" />;
    case 'keystone_reminder':
      return <Calendar className="h-4 w-4 text-green-500" />;
    case 'job_followup':
      return <Briefcase className="h-4 w-4 text-purple-500" />;
    case 'network_insight':
      return <Users className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationsList = () => {
  const { notifications, toggleNotificationRead, clearNotification } = useUnifiedNotifications();

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No notifications to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            notification.read 
              ? "opacity-60 bg-gray-50/50" 
              : "border-l-4 border-l-blue-500 shadow-sm"
          )}
          onClick={() => toggleNotificationRead(notification.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={cn(
                      "truncate",
                      notification.read 
                        ? "font-normal text-gray-600" 
                        : "font-medium text-gray-900"
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-sm mb-2",
                    notification.read ? "text-gray-500" : "text-gray-600"
                  )}>
                    {notification.message}
                  </p>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notification.id);
                }}
                className="ml-2 text-gray-400 hover:text-red-600"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsList;
