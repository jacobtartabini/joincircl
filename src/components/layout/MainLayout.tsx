
import { ReactNode } from "react";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopNav from "./DesktopNav";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isMobile && <DesktopNav />}
      <main className="flex-1 pb-16 md:pb-0 md:pl-16">
        <div className="container max-w-5xl mx-auto py-4 md:py-8">
          {children}
        </div>
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
};

export default MainLayout;
