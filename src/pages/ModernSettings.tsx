
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SecureHeaders } from "@/components/security/SecureHeaders";
import AccountTab from "@/components/settings/AccountTab";
import IntegrationsTab from "@/components/settings/IntegrationsTab";
import ProfileTab from "@/components/settings/ProfileTab";
import ResourcesTab from "@/components/settings/ResourcesTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { 
  User, 
  Shield, 
  Puzzle, 
  CreditCard, 
  BookOpen, 
  Settings as SettingsIcon 
} from "lucide-react";

const ModernSettings = () => {
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

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Puzzle },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "resources", label: "Resources", icon: BookOpen },
  ];

  return (
    <>
      <SecureHeaders />
      
      <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-light text-gray-900">Settings</h1>
            <p className="text-gray-600 text-lg font-light">
              Manage your account and preferences
            </p>
          </div>

          {/* Settings Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsContent value="profile" className="space-y-6 mt-0">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Profile Settings</h2>
                        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
                      </div>
                      <ProfileTab />
                    </TabsContent>
                    
                    <TabsContent value="account" className="space-y-6 mt-0">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Account Settings</h2>
                        <p className="text-gray-600 mt-1">Configure your account details and preferences</p>
                      </div>
                      <AccountTab />
                    </TabsContent>
                    
                    <TabsContent value="security" className="space-y-6 mt-0">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Security & Privacy</h2>
                        <p className="text-gray-600 mt-1">Manage your security settings and privacy controls</p>
                      </div>
                      <SecurityTab />
                    </TabsContent>
                    
                    <TabsContent value="integrations" className="space-y-6 mt-0">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Integrations</h2>
                        <p className="text-gray-600 mt-1">Connect external services and platforms</p>
                      </div>
                      <IntegrationsTab />
                    </TabsContent>
                    
                    <TabsContent value="subscription" className="space-y-6 mt-0">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Subscription</h2>
                        <p className="text-gray-600 mt-1">Manage your billing and subscription details</p>
                      </div>
                      <SubscriptionTab />
                    </TabsContent>
                    
                    <TabsContent value="resources" className="space-y-6 mt-0">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-medium text-gray-900">Resources</h2>
                        <p className="text-gray-600 mt-1">Access help, documentation, and support</p>
                      </div>
                      <ResourcesTab />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernSettings;
