
import { ReactNode } from "react";
import MobileNav from "./MobileNav";
import { TopStatusBar } from "./TopStatusBar";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopNav from "./DesktopNav";
import { SecureHeaders } from "@/components/security/SecureHeaders";
import { useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncManager } from "@/utils/syncManager";

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
        {!isMobile && <DesktopNav />}
        {isMobile && <TopStatusBar />}
        
        <main className={`flex-1 ${isMobile ? 'pb-20 pt-14' : 'pl-16'} overflow-hidden`}>
          <div className="h-full max-w-7xl mx-auto py-4 px-4 md:px-6">
            {children}
          </div>
        </main>
        
        {isMobile && <MobileNav />}
      </div>
    </div>
  );
};

export default MainLayout;
