
import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Bell size={24} className="text-primary" />
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </div>
    </div>
  );
};

export default NotificationsHeader;
