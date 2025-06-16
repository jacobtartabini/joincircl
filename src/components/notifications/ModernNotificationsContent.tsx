
import React from 'react';
import { useUnifiedNotifications } from '@/hooks/use-unified-notifications';
import { Bell, Check, CheckCheck, Trash2, Calendar, Users, Briefcase, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'follow_up':
      return 'border-l-blue-500 bg-blue-50/50';
    case 'birthday_reminder':
      return 'border-l-pink-500 bg-pink-50/50';
    case 'keystone_reminder':
      return 'border-l-green-500 bg-green-50/50';
    case 'job_followup':
      return 'border-l-purple-500 bg-purple-50/50';
    case 'network_insight':
      return 'border-l-orange-500 bg-orange-50/50';
    default:
      return 'border-l-gray-500 bg-gray-50/50';
  }
};

const ModernNotificationsContent = () => {
  const { 
    notifications, 
    toggleNotificationRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    hasUnread,
    unreadCount
  } = useUnifiedNotifications();
  const { toast } = useToast();

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
      description: `${unreadCount} notifications updated`,
    });
  };

  const handleClearAll = () => {
    clearAllNotifications();
    toast({
      title: "All notifications cleared",
      description: "Your notification list has been cleared",
    });
  };

  const handleClearNotification = (id: string) => {
    clearNotification(id);
    toast({
      title: "Notification removed",
      description: "The notification has been cleared",
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Stay updated with your network and opportunities</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600 max-w-md">
            You don't have any notifications right now. We'll notify you when there's something important to know about your network or career opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasUnread && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`
                relative border-l-4 rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer
                ${getNotificationColor(notification.type)}
                ${notification.read ? 'opacity-60' : ''}
              `}
              onClick={() => toggleNotificationRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(notification.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotificationRead(notification.id);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearNotification(notification.id);
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernNotificationsContent;
