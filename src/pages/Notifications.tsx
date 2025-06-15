
import { useIsMobile } from '@/hooks/use-mobile';
import ModernNotificationsContent from '@/components/notifications/ModernNotificationsContent';

const Notifications = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen refined-web-theme">
      <div className="max-w-4xl mx-auto p-6">
        <ModernNotificationsContent />
      </div>
    </div>
  );
};

export default Notifications;
