
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Calendar, Bell } from "lucide-react";
import { TwitterAuthDialog } from "@/components/integrations/TwitterAuthDialog";
import { CalendarConnectionDialog } from "@/components/calendar/CalendarConnectionDialog";
import { EmailConnectionDialog } from "@/components/integrations/EmailConnectionDialog";
import SocialIntegrationsSection from "@/components/integrations/SocialIntegrationsSection";
import EmailIntegrationsTab from "@/components/integrations/EmailIntegrationsTab";
import CalendarTab from "@/components/integrations/CalendarTab";
import NotificationsTab from "@/components/integrations/NotificationsTab";

const IntegrationsTab = () => {
  // Email integration state
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [isOutlookDialogOpen, setIsOutlookDialogOpen] = useState(false);
  
  // Calendar integration state
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  
  // Twitter auth dialog state
  const [isTwitterDialogOpen, setIsTwitterDialogOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("social");

  // Check URL params for tab selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "integrations") {
      // If we're coming back from an OAuth callback, refresh integration status
      // No need to call refreshStatus here as it's handled in the useSocialIntegrations hook
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your accounts and services to enhance your Circl experience
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="social" className="flex items-center gap-2">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail size={16} />
            Email
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar size={16} />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <SocialIntegrationsSection />
        </TabsContent>

        {/* Email Integrations Tab */}
        <TabsContent value="email" className="space-y-4">
          <EmailIntegrationsTab 
            onOpenGmailDialog={() => setIsGmailDialogOpen(true)}
            onOpenOutlookDialog={() => setIsOutlookDialogOpen(true)}
          />
        </TabsContent>

        {/* Calendar Integration Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <CalendarTab 
            onOpenCalendarDialog={() => setIsCalendarDialogOpen(true)} 
          />
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CalendarConnectionDialog 
        isOpen={isCalendarDialogOpen}
        onOpenChange={setIsCalendarDialogOpen}
      />
      
      <EmailConnectionDialog
        isOpen={isGmailDialogOpen}
        onOpenChange={setIsGmailDialogOpen}
        provider="gmail"
        onSuccess={() => {}}
      />
      
      <EmailConnectionDialog
        isOpen={isOutlookDialogOpen}
        onOpenChange={setIsOutlookDialogOpen}
        provider="outlook"
        onSuccess={() => {}}
      />
      
      <TwitterAuthDialog 
        isOpen={isTwitterDialogOpen}
        onOpenChange={setIsTwitterDialogOpen}
      />
    </div>
  );
};

export default IntegrationsTab;
