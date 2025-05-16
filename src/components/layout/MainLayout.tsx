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
      
      {!isMobile && <DesktopNav />}
      {isMobile && <TopStatusBar />}
      <main className={`flex-1 ${isMobile ? 'pb-20 pt-14' : 'pl-16'}`}>
        <div className="container max-w-5xl mx-auto py-4 px-4 md:px-6 md:py-8">
          {children}
        </div>
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
};

export default MainLayout;
