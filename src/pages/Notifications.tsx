
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationsContent from '@/components/notifications/NotificationsContent';
import NotificationsHeader from '@/components/notifications/NotificationsHeader';

const Notifications = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {!isMobile && <NotificationsHeader />}
        <NotificationsContent />
      </div>
    </MainLayout>
  );
};

export default Notifications;
