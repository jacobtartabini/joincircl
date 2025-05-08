
import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CirclesTabsProps {
  children: ReactNode;
}

export const CirclesTabs = ({ children }: CirclesTabsProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="inner">Inner Circle</TabsTrigger>
        <TabsTrigger value="middle">Middle Circle</TabsTrigger>
        <TabsTrigger value="outer">Outer Circle</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};
