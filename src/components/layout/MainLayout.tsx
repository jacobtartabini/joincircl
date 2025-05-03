
import { ReactNode } from "react";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopNav from "./DesktopNav";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isMobile && <DesktopNav onSignOut={signOut} />}
      <main className="flex-1 pb-16 md:pb-0 md:pl-16">
        <div className="container max-w-5xl mx-auto py-4 md:py-8">
          {children}
        </div>
      </main>
      {isMobile && <MobileNav onSignOut={signOut} />}
    </div>
  );
};

export default MainLayout;
