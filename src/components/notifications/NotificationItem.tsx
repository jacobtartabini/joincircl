
import { DismissibleNotification } from "@/components/ui/dismissible-notification";
import type { Notification } from "@/types/notifications";

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onToggleRead: (id: string) => void;
}

export default function NotificationItem({ 
  notification, 
  onDismiss, 
  onToggleRead 
}: NotificationItemProps) {
  const getNotificationType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'success':
      case 'sync_complete':
        return 'success' as const;
      case 'error':
      case 'sync_error':
        return 'error' as const;
      case 'warning':
        return 'warning' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <div 
      className={`transition-opacity ${notification.read ? 'opacity-60' : ''}`}
      onClick={() => onToggleRead(notification.id)}
    >
      <DismissibleNotification
        title={notification.title}
        message={notification.message}
        type={getNotificationType(notification.type)}
        onDismiss={() => onDismiss(notification.id)}
        className="cursor-pointer hover:bg-opacity-80"
      />
    </div>
  );
}
