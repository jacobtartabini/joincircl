
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import FloatingNav from "./FloatingNav";
import TopStatusBar from "./TopStatusBar";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
}

export function MobileOptimizedLayout({
  children
}: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();

  // Add fallback for mobile detection timing - render mobile by default if undefined
  const shouldRenderMobile = isMobile === undefined ? true : isMobile;
  
  if (shouldRenderMobile) {
    return (
      <div className="flex flex-col h-screen bg-background dark:bg-background overflow-hidden">
        <TopStatusBar />
        <main className="flex-1 overflow-y-auto pb-24 mobile-scroll">
          <div className="min-h-full px-4 py-4">
            {children}
          </div>
        </main>
        {/* Use the same FloatingNav for mobile */}
        <FloatingNav />
      </div>
    );
  }

  // Desktop layout with refined theme
  return (
    <div className="flex flex-col h-screen bg-background dark:bg-background overflow-hidden refined-web-theme">
      <TopStatusBar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full max-w-full bg-inherit">
          <div className="container mx-auto px-6 py-6 max-w-7xl min-h-full bg-inherit">
            {children}
          </div>
        </div>
      </main>
      
      {/* Floating Navigation for desktop */}
      <FloatingNav />
    </div>
  );
}
