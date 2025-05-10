
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';
import { Bell, Mail } from 'lucide-react';

const NotificationPreferences = () => {
  const { 
    preferences, 
    togglePushNotification, 
    toggleEmailNotification 
  } = useNotificationPreferences();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure when you want to receive push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New contacts</p>
              <p className="text-sm text-muted-foreground">Get notified when someone adds you as a contact</p>
            </div>
            <Switch 
              checked={preferences.push.newContacts} 
              onCheckedChange={() => togglePushNotification('newContacts')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Keystones reminders</p>
              <p className="text-sm text-muted-foreground">Get reminders about upcoming keystones</p>
            </div>
            <Switch 
              checked={preferences.push.keystoneReminders} 
              onCheckedChange={() => togglePushNotification('keystoneReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System updates</p>
              <p className="text-sm text-muted-foreground">Get notified about new features and updates</p>
            </div>
            <Switch 
              checked={preferences.push.systemUpdates} 
              onCheckedChange={() => togglePushNotification('systemUpdates')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure what types of emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly summaries</p>
              <p className="text-sm text-muted-foreground">Get weekly updates about your contacts</p>
            </div>
            <Switch 
              checked={preferences.email.weeklySummary} 
              onCheckedChange={() => toggleEmailNotification('weeklySummary')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Important keystones</p>
              <p className="text-sm text-muted-foreground">Get email reminders for important keystones</p>
            </div>
            <Switch 
              checked={preferences.email.importantKeystones} 
              onCheckedChange={() => toggleEmailNotification('importantKeystones')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Product updates</p>
              <p className="text-sm text-muted-foreground">Receive new feature announcements</p>
            </div>
            <Switch 
              checked={preferences.email.productUpdates} 
              onCheckedChange={() => toggleEmailNotification('productUpdates')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
