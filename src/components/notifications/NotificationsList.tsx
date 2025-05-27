
import { useNotifications } from '@/hooks/use-notifications';
import NotificationItem from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCheck } from 'lucide-react';

export default function NotificationsList() {
  const { 
    notifications, 
    clearNotification, 
    toggleNotificationRead,
    markAllAsRead,
    clearAllNotifications 
  } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          className="flex items-center gap-2"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllNotifications}
          className="flex items-center gap-2 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Clear all
        </Button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={clearNotification}
            onToggleRead={toggleNotificationRead}
          />
        ))}
      </div>
    </div>
  );
}
