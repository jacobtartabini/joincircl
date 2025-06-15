
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <h1 className="text-2xl font-bold text-gray-900">Career Hub</h1>
            <p className="text-sm text-muted-foreground">Your professional journey</p>
          </div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50/80 p-1.5 rounded-2xl">
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
    <div className="space-y-4 px-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900">Career Hub</h1>
        <p className="text-muted-foreground text-lg">Your professional journey starts here</p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-50/80 p-1.5 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
          <TabsTrigger value="applications" className="rounded-xl">Applications</TabsTrigger>
          <TabsTrigger value="tools" className="rounded-xl">Tools</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
