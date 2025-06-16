
import { Home, Circle, Calendar, Settings, Briefcase, Atom } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/"
    },
    {
      icon: Circle,
      label: "Circles",
      path: "/circles"
    },
    {
      icon: Atom,
      label: "Arlo",
      path: "/arlo"
    },
    {
      icon: Briefcase,
      label: "Career",
      path: "/career"
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings"
    }
  ];

  return (
    <motion.nav 
      className="mobile-nav fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-lg z-40 dark:bg-gray-900/90 dark:border-gray-700/50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = item.path === "/" ? currentPath === "/" : currentPath.startsWith(item.path);
          
          return (
            <Link 
              to={item.path} 
              key={item.path}
              className="flex flex-col items-center justify-center flex-1 min-h-12 relative"
            >
              <motion.div 
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-h-12 min-w-12",
                  isActive 
                    ? "bg-[#0daeec]/10 text-[#0daeec]" 
                    : "hover:bg-gray-100/50 text-gray-600 dark:hover:bg-gray-800/50 dark:text-gray-400"
                )}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive 
                      ? "text-[#0daeec]" 
                      : "text-gray-600 dark:text-gray-400"
                  )} 
                />
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors",
                  isActive 
                    ? "text-[#0daeec]" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
