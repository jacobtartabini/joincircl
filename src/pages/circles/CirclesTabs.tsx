
import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface CirclesTabsProps {
  children: ReactNode;
}

export function CirclesTabs({ children }: CirclesTabsProps) {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="all">
      <TabsList className={isMobile ? "w-full grid grid-cols-4 mb-2" : ""}>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="inner">Inner</TabsTrigger>
        <TabsTrigger value="middle">Middle</TabsTrigger>
        <TabsTrigger value="outer">Outer</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
