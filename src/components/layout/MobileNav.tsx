
import { Home, Circle, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-20 pb-safe pb-6">
        {navItems.map((item) => {
          const isActive = 
            item.path === "/" 
              ? currentPath === "/" 
              : currentPath.startsWith(item.path);
              
          return (
            <Link
              to={item.path}
              key={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full pt-2 transition-colors",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <div className="relative">
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.path === "/" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-500 rounded-full text-white text-xs min-w-3.5 h-3.5 font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
