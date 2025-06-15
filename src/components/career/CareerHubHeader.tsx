
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";

interface CareerHubHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile: boolean;
}

export function CareerHubHeader({ activeTab, onTabChange, isMobile }: CareerHubHeaderProps) {
  if (isMobile) {
    return (
      <div className="flex-shrink-0 p-4 pb-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Career Hub</h1>
            <p className="text-sm text-muted-foreground">Your professional journey</p>
          </div>
        </div>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <div className="bg-card border-b border-border">
              <TabsList className="w-full h-auto bg-transparent p-0 rounded-none">
                <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-1">
                  <TabsTrigger value="overview" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 hover:bg-accent transition-all duration-200 border border-transparent text-muted-foreground">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 hover:bg-accent transition-all duration-200 border border-transparent text-muted-foreground">
                    Applications
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 hover:bg-accent transition-all duration-200 border border-transparent text-muted-foreground">
                    Tools
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop - Match Settings page header exactly
  return (
    <div className="mb-8 flex-shrink-0 pt-6 px-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Career Hub</h1>
          <p className="text-muted-foreground">Your professional journey starts here</p>
        </div>
      </div>

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-50/80 p-1.5 rounded-full">
            <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl">Applications</TabsTrigger>
            <TabsTrigger value="tools" className="rounded-xl">Tools</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
