
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SecureHeaders } from "@/components/security/SecureHeaders";
import AccountTab from "@/components/settings/AccountTab";
import IntegrationsTab from "@/components/settings/IntegrationsTab";
import ProfileTab from "@/components/settings/ProfileTab";
import ResourcesTab from "@/components/settings/ResourcesTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import SecurityTab from "@/components/settings/SecurityTab";

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Parse the tab from the URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["profile", "account", "security", "integrations", "subscription", "resources"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("profile");
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/settings?tab=${value}`, { replace: true });
  };

  return (
    <>
      <SecureHeaders />
      
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <AccountTab />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <SecurityTab />
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab />
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionTab />
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-6">
            <ResourcesTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
