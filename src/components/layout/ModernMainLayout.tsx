
import { ReactNode } from "react";
import MobileNav from "./MobileNav";
import { TopStatusBar } from "./TopStatusBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SecureHeaders } from "@/components/security/SecureHeaders";
import { useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncManager } from "@/utils/syncManager";
import { Navbar } from "@/components/navigation/Navbar";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface ModernMainLayoutProps {
  children: ReactNode;
}

const ModernMainLayout = ({ children }: ModernMainLayoutProps) => {
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();
  const { handleOnlineStatusChange } = useSyncManager();
  const location = useLocation();
  
  // Pages that should use full-width layout without left panel
  const fullWidthPages = ['/contacts'];
  const shouldUseFullWidth = fullWidthPages.some(page => 
    location.pathname.startsWith(page) && location.pathname !== '/contacts'
  );

  useEffect(() => {
    handleOnlineStatusChange(isOnline);
  }, [isOnline]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/30 overflow-hidden">
      {/* Apply security headers */}
      <SecureHeaders />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile navigation */}
        {isMobile && <TopStatusBar />}
        
        {/* Desktop sidebar */}
        {!isMobile && !shouldUseFullWidth && (
          <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden">
            <Navbar />
          </div>
        )}
        
        <main className={cn(
          "flex-1 overflow-hidden",
          isMobile ? 'pb-20 pt-14' : '',
          shouldUseFullWidth ? 'bg-white' : ''
        )}>
          <div className="h-full w-full overflow-auto">
            {children}
          </div>
        </main>
        
        {isMobile && <MobileNav />}
      </div>
    </div>
  );
};

export default ModernMainLayout;
