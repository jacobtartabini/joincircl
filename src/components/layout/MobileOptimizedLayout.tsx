import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContacts } from "@/hooks/use-contacts";
import { useGlobalAI } from "@/hooks/use-global-ai";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import TopStatusBar from "./TopStatusBar";
import GlobalAIAssistant from "@/components/ai/GlobalAIAssistant";
interface MobileOptimizedLayoutProps {
  children: ReactNode;
}
export function MobileOptimizedLayout({
  children
}: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const {
    contacts
  } = useContacts();
  const {
    isOpen,
    isMinimized,
    toggleOpen,
    minimize
  } = useGlobalAI();

  // Add fallback for mobile detection timing - render mobile by default if undefined
  const shouldRenderMobile = isMobile === undefined ? true : isMobile;
  if (shouldRenderMobile) {
    return <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <TopStatusBar />
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="min-h-full">
            {children}
          </div>
        </main>
        <MobileNav />
        
        {/* AI Assistant for mobile */}
        <GlobalAIAssistant contacts={contacts} isOpen={isOpen} onToggle={toggleOpen} isMinimized={isMinimized} onMinimize={minimize} />
      </div>;
  }

  // Desktop layout
  return <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <DesktopNav />
      <div className="flex-1 flex flex-col min-w-0 ml-16 overflow-hidden">
        <TopStatusBar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full max-w-full bg-inherit">
            <div className="container mx-auto px-6 py-6 max-w-7xl min-h-full bg-inherit">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <GlobalAIAssistant contacts={contacts} isOpen={isOpen} onToggle={toggleOpen} isMinimized={isMinimized} onMinimize={minimize} />
    </div>;
}