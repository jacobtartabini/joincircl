
import React from 'react';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Mail, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const NotificationPreferences = () => {
  const { 
    preferences, 
    togglePushNotification, 
    toggleEmailNotification, 
    sendTestNotification, 
    hasSubscription 
  } = useNotificationPreferences();
  
  const { toast } = useToast();

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      toast({
        title: "Test Notification Sent",
        description: "Check your notifications to see the test message.",
      });
    } else {
      toast({
        title: "Notification Failed",
        description: "Permission may be denied or notifications are not supported by your browser.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="h-5 w-5 text-primary" />
            <h3 className="text-base font-medium">Push Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-new-contacts" className="flex-1">
                New contacts added
              </Label>
              <Switch
                id="push-new-contacts"
                checked={preferences.push.newContacts}
                onCheckedChange={() => togglePushNotification('newContacts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-keystone-reminders" className="flex-1">
                Keystone reminders
              </Label>
              <Switch
                id="push-keystone-reminders"
                checked={preferences.push.keystoneReminders}
                onCheckedChange={() => togglePushNotification('keystoneReminders')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-system-updates" className="flex-1">
                System updates and announcements
              </Label>
              <Switch
                id="push-system-updates"
                checked={preferences.push.systemUpdates}
                onCheckedChange={() => togglePushNotification('systemUpdates')}
              />
            </div>
            
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={!hasSubscription}
              >
                {hasSubscription ? "Send Test Notification" : "Enable Notifications First"}
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-base font-medium">Email Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-weekly-summary" className="flex-1">
                Weekly activity summary
              </Label>
              <Switch
                id="email-weekly-summary"
                checked={preferences.email.weeklySummary}
                onCheckedChange={() => toggleEmailNotification('weeklySummary')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-important-keystones" className="flex-1">
                Important keystone reminders
              </Label>
              <Switch
                id="email-important-keystones"
                checked={preferences.email.importantKeystones}
                onCheckedChange={() => toggleEmailNotification('importantKeystones')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-product-updates" className="flex-1">
                Product updates and new features
              </Label>
              <Switch
                id="email-product-updates"
                checked={preferences.email.productUpdates}
                onCheckedChange={() => toggleEmailNotification('productUpdates')}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          Notification preferences are stored locally in your browser. Email notifications require a confirmed email address.
        </p>
      </div>
    </div>
  );
};

export default NotificationPreferences;
