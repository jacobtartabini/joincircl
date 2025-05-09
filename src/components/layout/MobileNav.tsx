
import { Home, Circle, Plus, BookText, Settings, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNav, setShowNav] = useState(true);

  // Hide navbar on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNav(currentScrollY <= 10 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobile]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Plus, label: "Add", path: "#", action: true },
    { icon: BookText, label: "Resources", path: "/help" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const handleAddButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddMenuOpen(true);
  };

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      initial={{ y: 0 }}
      animate={{ y: showNav ? 0 : 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = 
            item.path === "/" 
              ? currentPath === "/" 
              : currentPath.startsWith(item.path);

          if (item.action) {
            return (
              <Sheet key={item.label} open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <SheetTrigger asChild>
                  <Link
                    to="#"
                    className={`flex flex-col items-center justify-center w-full h-full ${
                      isActive ? "text-primary" : "text-gray-500"
                    }`}
                    onClick={handleAddButtonClick}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
                      <item.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs mt-1">{item.label}</span>
                  </Link>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[40vh] rounded-t-xl">
                  <div className="pt-6">
                    <h3 className="font-medium text-lg mb-4">Add New</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/circles" onClick={() => setIsAddMenuOpen(false)}>
                        <Button
                          variant="outline" 
                          className="w-full h-20 flex flex-col items-center justify-center gap-2"
                        >
                          <Circle size={24} />
                          <span>Contact</span>
                        </Button>
                      </Link>
                      <Link to="/keystones" onClick={() => setIsAddMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full h-20 flex flex-col items-center justify-center gap-2"
                        >
                          <Calendar size={24} />
                          <span>Keystone</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            );
          }
              
          return (
            <Link
              to={item.path}
              key={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
