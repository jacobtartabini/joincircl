
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNav from "./MobileNav";
import FloatingNav from "./FloatingNav";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen w-full">
      <main className="min-h-screen">
        {children}
      </main>
      
      {/* Navigation */}
      {isMobile ? <MobileNav /> : <FloatingNav />}
    </div>
  );
}
