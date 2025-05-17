
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";

const NotificationsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <NotificationPreferences />
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
