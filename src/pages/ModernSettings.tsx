
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

const ModernSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["profile", "account", "security", "integrations", "subscription", "resources"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("profile");
    }
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/settings?tab=${value}`, { replace: true });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Personal information and preferences" },
    { id: "account", label: "Account", icon: SettingsIcon, description: "Account details and preferences" },
    { id: "security", label: "Security", icon: Shield, description: "Security settings and privacy" },
    { id: "integrations", label: "Integrations", icon: Puzzle, description: "Connected services and apps" },
    { id: "subscription", label: "Subscription", icon: CreditCard, description: "Billing and subscription" },
    { id: "resources", label: "Resources", icon: BookOpen, description: "Help and support" },
  ];

  return (
    <>
      <SecureHeaders />
      
      <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and application preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <tab.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{tab.description}</div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="border border-gray-200">
                <CardContent className="p-8">
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsContent value="profile" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
                        </div>
                        <ProfileTab />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="account" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                          <p className="text-gray-600 mt-1">Configure your account details and preferences</p>
                        </div>
                        <AccountTab />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="security" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Security & Privacy</h2>
                          <p className="text-gray-600 mt-1">Manage your security settings and privacy controls</p>
                        </div>
                        <SecurityTab />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="integrations" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
                          <p className="text-gray-600 mt-1">Connect external services and platforms</p>
                        </div>
                        <IntegrationsTab />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="subscription" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
                          <p className="text-gray-600 mt-1">Manage your billing and subscription details</p>
                        </div>
                        <SubscriptionTab />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="resources" className="mt-0">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
                          <p className="text-gray-600 mt-1">Access help, documentation, and support</p>
                        </div>
                        <ResourcesTab />
                      </div>
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
