
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationsContent from '@/components/notifications/NotificationsContent';
import NotificationsHeader from '@/components/notifications/NotificationsHeader';

const Notifications = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <div className="h-full w-full">
        <div className="responsive-container h-full overflow-hidden">
          <div className="h-full flex flex-col animate-fade-in">
            {!isMobile && <NotificationsHeader />}
            <div className="flex-1 overflow-hidden">
              <NotificationsContent />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
