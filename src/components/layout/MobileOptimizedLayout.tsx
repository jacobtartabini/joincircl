
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import TopStatusBar from "./TopStatusBar";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
}

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <TopStatusBar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DesktopNav />
      <div className="flex-1 flex flex-col min-w-0 ml-16">
        <TopStatusBar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-full">
            <div className="container mx-auto h-full px-6 py-6 max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
