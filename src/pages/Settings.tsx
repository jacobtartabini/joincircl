
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "@/components/settings/ProfileTab";
import AccountTab from "@/components/settings/AccountTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import ResourcesTab from "@/components/settings/ResourcesTab";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  useEffect(() => {
    // Initialize component state based on user profile when it loads
    // This is just a placeholder for any future initialization needs
    if (user && profile) {
      console.log("User profile loaded in settings");
    }
  }, [user, profile]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

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
      
      <footer className="border-t pt-6 pb-8 text-center text-sm text-muted-foreground">
        © 2025 Jacob Tartabini. All rights reserved. Unauthorized reproduction or distribution of any content is prohibited.
      </footer>
    </div>
  );
};

export default Settings;
