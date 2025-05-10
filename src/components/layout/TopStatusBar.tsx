
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const TopStatusBar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBar, setShowBar] = useState(true);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/") return "Home";
    if (path.startsWith("/circles")) return "Circles";
    if (path.startsWith("/keystones")) return "Keystones";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/contacts")) return "Contact Details";
    if (path.startsWith("/help")) return "Help";
    if (path.startsWith("/contact")) return "Contact Us";
    if (path.startsWith("/bugs")) return "Report Bugs";
    if (path.startsWith("/legal")) return "Legal";
    
    return "Circl";
  };
  
  // Hide status bar on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBar(currentScrollY <= 10 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobile]);
  
  if (!isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40"
      initial={{ y: 0 }}
      animate={{ y: showBar ? 0 : -60 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-14 bg-white shadow-sm flex items-center justify-center relative pt-safe">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>
    </motion.div>
  );
};

export default TopStatusBar;
