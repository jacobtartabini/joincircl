
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
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { useSearchParams } from "react-router-dom";
import { useGoogleIntegrations } from "@/hooks/useGoogleIntegrations";

const IntegrationsTab = () => {
  // Email integration state
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [isOutlookDialogOpen, setIsOutlookDialogOpen] = useState(false);
  
  // Calendar integration state
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  
  // Twitter auth dialog state
  const [isTwitterDialogOpen, setIsTwitterDialogOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("social");
  const [searchParams] = useSearchParams();
  
  // Access the social integrations hook with refreshStatus function
  const { refreshStatus } = useSocialIntegrations();
  
  // Access Google integrations
  const { refreshIntegrationStatus } = useGoogleIntegrations();

  // Check URL params for tab selection, integration refresh, and provider
  useEffect(() => {
    // Get URL parameters
    const tab = searchParams.get("tab");
    const provider = searchParams.get("provider");
    
    // If we're coming from an OAuth callback or tab=integrations is specified
    if (tab === "integrations") {
      console.log("Integration tab opened via URL param");
      
      // Check if provider is specified to determine which tab to show
      if (provider) {
        if (provider === "gmail" || provider === "outlook") {
          setActiveTab("email");
          refreshIntegrationStatus();
        } else if (provider === "calendar") {
          setActiveTab("calendar");
          refreshIntegrationStatus();
        } else if (provider === "twitter" || provider === "facebook" || provider === "linkedin" || provider === "instagram") {
          setActiveTab("social");
          refreshStatus();
        } else {
          // Default to social tab
          setActiveTab("social");
        }
      } else {
        // If no provider is specified, just refresh all statuses
        refreshStatus();
        refreshIntegrationStatus();
      }
    }
    
    // Check if we have a platform param to open the relevant dialog
    if (provider === "twitter") {
      setIsTwitterDialogOpen(true);
    }
  }, [searchParams, refreshStatus, refreshIntegrationStatus]);
  
  // Handle connect platform directly from this component
  const handleConnectTwitter = () => {
    setIsTwitterDialogOpen(true);
  };

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
          <SocialIntegrationsSection onConnectTwitter={handleConnectTwitter} />
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
        onSuccess={() => refreshIntegrationStatus()}
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
