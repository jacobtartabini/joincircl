
import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface CirclesTabsProps {
  children: ReactNode;
}

export function CirclesTabs({ children }: CirclesTabsProps) {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="all">
      <TabsList className={isMobile ? "w-full grid grid-cols-4 mb-2 sticky top-0 z-10 bg-background" : ""}>
        <TabsTrigger value="all" className={isMobile ? "py-3" : ""}>All</TabsTrigger>
        <TabsTrigger value="inner" className={isMobile ? "py-3" : ""}>Inner</TabsTrigger>
        <TabsTrigger value="middle" className={isMobile ? "py-3" : ""}>Middle</TabsTrigger>
        <TabsTrigger value="outer" className={isMobile ? "py-3" : ""}>Outer</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
