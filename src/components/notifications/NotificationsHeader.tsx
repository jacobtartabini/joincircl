
import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsHeader = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Bell size={24} className="text-primary" />
      <h1 className="text-2xl font-semibold">Notifications</h1>
    </div>
  );
};

export default NotificationsHeader;
