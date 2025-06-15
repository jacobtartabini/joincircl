
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarNotificationBell } from '@/components/notifications/AvatarNotificationBell';

const MobileHeader = () => {
  const { user, profile } = useAuth();
  
  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Hello,</p>
          <p className="font-semibold">{firstName}!</p>
        </div>
      </div>
      
      <AvatarNotificationBell size="sm" />
    </div>
  );
};

export default MobileHeader;
