
import { ReactNode } from "react";
import MobileNav from "./MobileNav";
import { TopStatusBar } from "./TopStatusBar";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopNav from "./DesktopNav";
import { SecureHeaders } from "@/components/security/SecureHeaders";
import { useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncManager } from "@/utils/syncManager";
import { ThreePanelLayout } from "./ThreePanelLayout";
import { Navbar } from "@/components/navigation/Navbar";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Apply security headers */}
      <SecureHeaders />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile navigation */}
        {isMobile && <TopStatusBar />}
        
        <main className={cn(
          "flex-1 overflow-hidden",
          isMobile ? 'pb-20 pt-14' : ''
        )}>
          <div className="h-full w-full">
            {/* On desktop, conditionally use ThreePanelLayout or full-width layout */}
            {!isMobile ? (
              shouldUseFullWidth ? (
                // Full-width layout for specific pages like contact detail
                <div className="h-full w-full overflow-hidden bg-white">
                  <div className="max-w-7xl mx-auto h-full">
                    {children}
                  </div>
                </div>
              ) : (
                // Standard three-panel layout for other pages including notifications
                <ThreePanelLayout
                  leftPanel={<Navbar />}
                  middlePanel={
                    <div className="h-full overflow-hidden bg-white rounded-lg shadow-sm border">
                      <div className="responsive-container h-full overflow-hidden p-6">
                        {children}
                      </div>
                    </div>
                  }
                  rightPanel={null}
                />
              )
            ) : (
              // On mobile, render children directly with responsive container
              <div className="responsive-container h-full overflow-hidden p-4 bg-white">
                {children}
              </div>
            )}
          </div>
        </main>
        
        {isMobile && <MobileNav />}
      </div>
    </div>
  );
};

export default MainLayout;
