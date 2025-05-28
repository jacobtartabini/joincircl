
import { ReactNode, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { MobileHeader } from "./MobileHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationPanel } from "./NavigationPanel";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
}

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  if (!isMobile) {
    return (
      <div className="min-h-screen flex">
        <div className="w-64 flex-shrink-0">
          <NavigationPanel />
        </div>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header with Hamburger */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <MobileHeader />
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 pt-safe"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <img 
                  src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
                  alt="Circl" 
                  className="h-8 w-8 object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="h-full overflow-y-auto pb-20">
                <NavigationPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-20 overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
