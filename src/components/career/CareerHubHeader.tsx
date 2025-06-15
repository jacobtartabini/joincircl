
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
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 p-6 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Career Hub</h1>
            </div>
            <p className="text-muted-foreground">Your professional journey</p>
          </div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50/80 p-1.5 rounded-full">
              <TabsTrigger value="overview" className="rounded-xl text-sm">Overview</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-xl text-sm">Applications</TabsTrigger>
              <TabsTrigger value="tools" className="rounded-xl text-sm">Tools</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pl-12">
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Career Hub</h1>
        </div>
        <p className="text-muted-foreground">Your professional journey starts here</p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-50/80 p-1.5 rounded-full">
          <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
          <TabsTrigger value="applications" className="rounded-xl">Applications</TabsTrigger>
          <TabsTrigger value="tools" className="rounded-xl">Tools</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
