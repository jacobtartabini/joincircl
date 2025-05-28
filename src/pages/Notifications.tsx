
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationsContent from '@/components/notifications/NotificationsContent';
import NotificationsHeader from '@/components/notifications/NotificationsHeader';

const Notifications = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {!isMobile && <NotificationsHeader />}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <NotificationsContent />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
