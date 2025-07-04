import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Settings, User, Shield, CreditCard, Bell, Zap, HelpCircle, Palette } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import tab components
import ProfileTab from "@/components/settings/ProfileTab";
import SecurityTab from "@/components/settings/SecurityTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import ResourcesTab from "@/components/settings/ResourcesTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import IntegrationsTab from "@/components/settings/IntegrationsTab";
import AccountTab from "@/components/settings/AccountTab";
const ModernSettings = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/settings?tab=${value}`, {
      replace: true
    });
  };
  const tabs = [{
    id: 'profile',
    label: 'Profile',
    icon: User,
    component: ProfileTab
  }, {
    id: 'security',
    label: 'Security',
    icon: Shield,
    component: SecurityTab
  }, {
    id: 'subscription',
    label: 'Subscription',
    icon: CreditCard,
    component: SubscriptionTab
  }, {
    id: 'integrations',
    label: 'Integrations',
    icon: Zap,
    component: IntegrationsTab
  }, {
    id: 'preferences',
    label: 'Preferences',
    icon: Palette,
    component: PreferencesTab
  }, {
    id: 'resources',
    label: 'Resources',
    icon: HelpCircle,
    component: ResourcesTab
  }, {
    id: 'account',
    label: 'Account',
    icon: Settings,
    component: AccountTab
  }];
  if (isMobile) {
    return <div className="flex flex-col h-full bg-background">
        {/* Mobile Header */}
        <div className="flex-shrink-0 p-4 pb-2 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account</p>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0">
          {/* Tab Navigation - Horizontal Scroll */}
          <div className="flex-shrink-0 bg-card border-b border-border">
            <TabsList className="w-full h-auto bg-transparent p-0 rounded-none">
              <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-1">
                {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 hover:bg-accent transition-all duration-200 border border-transparent text-muted-foreground">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>)}
              </div>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {tabs.map(tab => <TabsContent key={tab.id} value={tab.id} className="mt-0 p-4 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <div className="flex-1 min-h-0">
                  <tab.component />
                </div>
              </TabsContent>)}
          </div>
        </Tabs>
      </div>;
  }
  return <div className="h-full unified-web-theme">
      <div className="max-w-7xl mx-auto h-full flex flex-col rounded-2xl">
        {/* Header */}
        <div className="mb-8 flex-shrink-0 pt-6 px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex h-full gap-8">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <Card className="unified-card h-full">
                <CardContent className="p-0 h-full">
                  <TabsList className="flex flex-col h-auto w-full bg-transparent p-2 space-y-1">
                    {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id} className="w-full justify-start gap-3 px-4 py-3 text-left rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-accent transition-colors text-muted-foreground">
                        <tab.icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                      </TabsTrigger>)}
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <Card className="unified-card h-full">
                <CardContent className="p-8 h-full overflow-y-auto">
                  {tabs.map(tab => <TabsContent key={tab.id} value={tab.id} className="mt-0 h-full">
                      <div className="max-w-4xl min-h-full">
                        <tab.component />
                      </div>
                    </TabsContent>)}
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default ModernSettings;