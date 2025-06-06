
import { Home, Circle, Calendar, Settings, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useContacts } from "@/hooks/use-contacts";

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { contacts } = useContacts();
  
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
      icon: Calendar,
      label: "Keystones",
      path: "/keystones"
    },
    {
      icon: Brain,
      label: "AI",
      path: "/ai-assistant"
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings"
    }
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-around h-16 px-2 py-[42px]">
        {navItems.map((item) => {
          const isActive = item.path === "/" ? currentPath === "/" : currentPath.startsWith(item.path);
          
          return (
            <Link 
              to={item.path} 
              key={item.path}
              className="flex flex-col items-center justify-center flex-1 min-h-12 relative py-0"
            >
              <motion.div 
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-h-12 min-w-12",
                  isActive ? "bg-blue-50" : "hover:bg-gray-50"
                )}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <item.icon 
                  size={24} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} 
                />
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500"
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
