import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarConnectionDialog } from "@/components/calendar/CalendarConnectionDialog";
import { Calendar, Phone, Linkedin, Bell } from "lucide-react";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";
import EmailIntegrationSection from "@/components/integrations/EmailIntegrationSection";
import { EmailConnectionDialog } from "@/components/integrations/EmailConnectionDialog";
import { useEmailProviders } from "@/hooks/useEmailProviders";
const PreferencesTab = () => {
  const {
    toast
  } = useToast();
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [isOutlookDialogOpen, setIsOutlookDialogOpen] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isPhoneContactsSynced, setIsPhoneContactsSynced] = useState(false);

  // Use our new hook to determine if email providers are connected
  const {
    isGmailConnected,
    isOutlookConnected
  } = useEmailProviders();
  const handleConnectLinkedIn = () => {
    // In a real app, this would initiate an OAuth flow with LinkedIn
    toast({
      title: "LinkedIn Connection",
      description: "LinkedIn connection initiated. Please complete the authentication in the popup window."
    });

    // For demo purposes we'll simulate a successful connection after 2 seconds
    setTimeout(() => {
      setIsLinkedInConnected(true);
      toast({
        title: "Success",
        description: "Your LinkedIn account has been successfully connected."
      });
    }, 2000);
  };
  const handleSyncPhoneContacts = () => {
    // In a real app, this would request permission to access contacts
    toast({
      title: "Phone Contacts",
      description: "Requesting permission to access your phone contacts..."
    });

    // For demo purposes we'll simulate a successful sync after 2 seconds
    setTimeout(() => {
      setIsPhoneContactsSynced(true);
      toast({
        title: "Success",
        description: "Your phone contacts have been successfully synced."
      });
    }, 2000);
  };
  const handleConnectGmail = () => {
    setIsGmailDialogOpen(true);
  };
  const handleConnectOutlook = () => {
    setIsOutlookDialogOpen(true);
  };
  return <>
      {/* Email Integration Section */}
      <EmailIntegrationSection onConnectGmail={handleConnectGmail} onConnectOutlook={handleConnectOutlook} isGmailConnected={isGmailConnected} isOutlookConnected={isOutlookConnected} />
      
      {/* Calendar Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Calendar Integration</CardTitle>
            <CardDescription>
              Connect your calendar to sync events and interactions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Connect your calendar to keep track of your connections and important events.
          </p>
          <Button onClick={() => setIsCalendarDialogOpen(true)} className="rounded-full bg-[transp#30a2ed_arent] bg-[#30a2ed]">
            Connect Calendar
          </Button>
        </CardContent>
      </Card>
      
      {/* LinkedIn Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Linkedin className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>LinkedIn Integration</CardTitle>
            <CardDescription>
              Connect your LinkedIn account to enhance your professional network
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Connect your LinkedIn account to automatically import your professional connections and keep your network updated.
          </p>
          <Button onClick={handleConnectLinkedIn} disabled={isLinkedInConnected} className="rounded-full bg-[#30a2ed]">
            {isLinkedInConnected ? "LinkedIn Connected" : "Connect LinkedIn"}
          </Button>
          
          {isLinkedInConnected && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              Your LinkedIn account is connected. Your connections will be synced automatically.
            </div>}
        </CardContent>
      </Card>
      
      {/* Phone Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Phone Contacts</CardTitle>
            <CardDescription>
              Sync your phone contacts with your Circl account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Import contacts from your phone to easily add them to your circles.
          </p>
          <Button onClick={handleSyncPhoneContacts} disabled={isPhoneContactsSynced} className="rounded-full bg-[#30a2ed]">
            {isPhoneContactsSynced ? "Contacts Synced" : "Sync Phone Contacts"}
          </Button>
          
          {isPhoneContactsSynced && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              Your phone contacts have been synced successfully. You can find them in your contacts list.
            </div>}
        </CardContent>
      </Card>
      
      {/* Notification Preferences */}
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

      {/* Calendar Connection Dialog */}
      <CalendarConnectionDialog isOpen={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen} />
      
      {/* Email Connection Dialogs */}
      <EmailConnectionDialog isOpen={isGmailDialogOpen} onOpenChange={setIsGmailDialogOpen} provider="gmail" onSuccess={() => {}} />
      
      <EmailConnectionDialog isOpen={isOutlookDialogOpen} onOpenChange={setIsOutlookDialogOpen} provider="outlook" onSuccess={() => {}} />
    </>;
};
export default PreferencesTab;