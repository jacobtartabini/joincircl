
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContacts } from "@/hooks/use-contacts";
import { useGlobalAI } from "@/hooks/use-global-ai";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import TopStatusBar from "./TopStatusBar";
import GlobalAIAssistant from "@/components/ai/GlobalAIAssistant";
import AIFloatingButton from "@/components/ai/AIFloatingButton";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
}

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const { contacts } = useContacts();
  const { isOpen, isMinimized, toggleOpen, minimize } = useGlobalAI();

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        <TopStatusBar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
        <MobileNav />
        
        {/* AI Assistant for mobile - only show floating button */}
        <AIFloatingButton 
          onClick={toggleOpen}
          isActive={isOpen}
        />
        <GlobalAIAssistant
          contacts={contacts}
          isOpen={isOpen}
          onToggle={toggleOpen}
          isMinimized={isMinimized}
          onMinimize={minimize}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DesktopNav />
      <div className="flex-1 flex flex-col min-w-0 ml-16 overflow-hidden">
        <TopStatusBar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full max-w-full">
            <div className="container mx-auto px-6 py-6 max-w-7xl min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Global AI Assistant for desktop */}
      <AIFloatingButton 
        onClick={toggleOpen}
        isActive={isOpen}
      />
      <GlobalAIAssistant
        contacts={contacts}
        isOpen={isOpen}
        onToggle={toggleOpen}
        isMinimized={isMinimized}
        onMinimize={minimize}
      />
    </div>
  );
}
