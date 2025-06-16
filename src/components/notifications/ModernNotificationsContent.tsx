
import React from 'react';
import { Bell, Check, CheckCheck, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedNotifications } from '@/hooks/use-unified-notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ModernNotificationsContent = () => {
  const { 
    notifications, 
    unreadCount, 
    toggleNotificationRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications 
  } = useUnifiedNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return '👋';
      case 'keystone_reminder':
        return '⭐';
      case 'birthday_reminder':
        return '🎂';
      case 'ai_insight':
        return '🧠';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'border-l-gray-200';
    
    switch (type) {
      case 'follow_up':
        return 'border-l-blue-500';
      case 'keystone_reminder':
        return 'border-l-amber-500';
      case 'birthday_reminder':
        return 'border-l-pink-500';
      case 'ai_insight':
        return 'border-l-purple-500';
      default:
        return 'border-l-[#0daeec]';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0daeec]/10 rounded-xl flex items-center justify-center">
              <Bell className="h-6 w-6 text-[#0daeec]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Stay updated with your network</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Badge className="bg-[#0daeec] text-white px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
            
            <Button
              onClick={clearAllNotifications}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">You don't have any notifications right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 hover:bg-gray-50/50 transition-colors border-l-4 relative group",
                        getNotificationColor(notification.type, notification.read),
                        !notification.read && "bg-blue-50/30"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-lg shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className={cn(
                              "text-sm font-medium leading-tight",
                              notification.read ? "text-gray-600" : "text-gray-900"
                            )}>
                              {notification.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() => toggleNotificationRead(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => clearNotification(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className={cn(
                            "text-sm leading-relaxed",
                            notification.read ? "text-gray-500" : "text-gray-700"
                          )}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#0daeec] rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernNotificationsContent;
