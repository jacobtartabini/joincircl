
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
import { Outlet } from "react-router-dom";

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Apply security headers */}
      <SecureHeaders />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile navigation */}
        {isMobile && <TopStatusBar />}
        
        <main className={`flex-1 ${isMobile ? 'pb-20 pt-14' : ''} overflow-hidden`}>
          <div className="h-full max-w-7xl mx-auto py-4 px-4 md:px-6">
            {/* On desktop, use ThreePanelLayout with Navbar */}
            {!isMobile ? (
              <ThreePanelLayout
                leftPanel={<Navbar />}
                middlePanel={children}
                rightPanel={null}
              />
            ) : (
              // On mobile, just render the children directly
              children
            )}
          </div>
        </main>
        
        {isMobile && <MobileNav />}
      </div>
    </div>
  );
};

export default MainLayout;
