
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
      icon: Brain,
      label: "AI",
      path: "/ai-assistant",
      isCenter: true
    },
    {
      icon: Calendar,
      label: "Keystones",
      path: "/keystones"
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings"
    }
  ];

  return (
    <motion.nav 
      className="mobile-nav fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-safe dark:bg-background dark:border-border"
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
                  item.isCenter 
                    ? isActive 
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 dark:from-blue-600 dark:to-purple-700" 
                      : "bg-gradient-to-br from-blue-500 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700"
                    : isActive 
                      ? "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground" 
                      : "hover:bg-accent/50 dark:hover:bg-accent/50"
                )}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <item.icon 
                  size={item.isCenter ? 28 : 24} 
                  className={cn(
                    "transition-colors",
                    item.isCenter 
                      ? "text-white" 
                      : isActive 
                        ? "text-primary dark:text-primary" 
                        : "text-muted-foreground dark:text-muted-foreground"
                  )} 
                />
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors",
                  item.isCenter 
                    ? "text-white" 
                    : isActive 
                      ? "text-primary dark:text-primary" 
                      : "text-muted-foreground dark:text-muted-foreground"
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
