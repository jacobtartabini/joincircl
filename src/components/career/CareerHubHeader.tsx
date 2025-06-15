
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";

interface CareerHubHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile: boolean;
}

export function CareerHubHeader({ activeTab, onTabChange, isMobile }: CareerHubHeaderProps) {
  // Mobile
  if (isMobile) {
    return (
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 pt-10 pb-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Career Hub</h1>
            <p className="text-base text-muted-foreground">Your professional journey</p>
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

  // Desktop
  return (
    <div className="space-y-6 pl-12 pt-12 pb-6">
      <div className="flex flex-col items-start gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground">Career Hub</h1>
        <p className="text-lg text-muted-foreground">Your professional journey starts here</p>
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
