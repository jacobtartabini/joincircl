
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "@/components/settings/ProfileTab";
import AccountTab from "@/components/settings/AccountTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import ResourcesTab from "@/components/settings/ResourcesTab";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const Settings = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isTabSelectOpen, setIsTabSelectOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const tabOptions = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "preferences", label: "Preferences" },
    { id: "subscription", label: "Subscription" },
    { id: "resources", label: "Resources" }
  ];
  
  useEffect(() => {
    // Initialize component state based on user profile when it loads
    // This is just a placeholder for any future initialization needs
    if (user && profile) {
      console.log("User profile loaded in settings");
    }
  }, [user, profile]);

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    setIsTabSelectOpen(false);
  };

  const currentTabLabel = tabOptions.find(tab => tab.id === activeTab)?.label || "Profile";

  // Helper function to render active tab content
  const renderActiveTabContent = () => {
    switch(activeTab) {
      case "profile":
        return <ProfileTab />;
      case "account":
        return <AccountTab />;
      case "preferences":
        return <PreferencesTab />;
      case "subscription":
        return <SubscriptionTab />;
      case "resources":
        return <ResourcesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
        
        {isMobile && (
          <Button variant="outline" onClick={() => setIsTabSelectOpen(true)}>
            {currentTabLabel} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {isMobile ? (
        <>
          {/* Fixed: Properly wrap content in Tabs component for mobile */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab} className="space-y-4">
              {renderActiveTabContent()}
            </TabsContent>
          </Tabs>

          <Sheet open={isTabSelectOpen} onOpenChange={setIsTabSelectOpen}>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="grid gap-3 py-4">
                {tabOptions.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    className="w-full justify-start h-12 text-lg"
                    onClick={() => handleTabSelect(tab.id)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4 mt-4">
            <AccountTab />
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <PreferencesTab />
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-4 mt-4">
            <SubscriptionTab />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 mt-4">
            <ResourcesTab />
          </TabsContent>
        </Tabs>
      )}
      
      <footer className="border-t pt-6 pb-8 text-center text-sm text-muted-foreground">
        © 2025 Jacob Tartabini. All rights reserved. Unauthorized reproduction or distribution of any content is prohibited.
      </footer>
    </div>
  );
};

export default Settings;
