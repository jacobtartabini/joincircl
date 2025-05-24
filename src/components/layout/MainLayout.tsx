
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

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();
  const { handleOnlineStatusChange } = useSyncManager();

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
            {/* On desktop, use ThreePanelLayout with Navbar */}
            {!isMobile ? (
              <ThreePanelLayout
                leftPanel={<Navbar />}
                middlePanel={
                  <div className="responsive-container h-full overflow-hidden">
                    {children}
                  </div>
                }
                rightPanel={null}
              />
            ) : (
              // On mobile, render children directly with responsive container
              <div className="responsive-container h-full overflow-hidden p-4">
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
