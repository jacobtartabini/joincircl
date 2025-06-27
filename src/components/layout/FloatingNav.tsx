
import { Home, Circle, Briefcase, Calendar, Atom } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlassFilter } from "@/components/ui/liquid-glass";

interface NavTab {
  title: string;
  icon: typeof Home;
  path: string;
}

interface NavSeparator {
  type: "separator";
}

type NavItem = NavTab | NavSeparator;

export default function FloatingNav() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);

  const tabs: NavItem[] = [
    {
      title: "Home",
      icon: Home,
      path: "/"
    },
    {
      title: "Circles",
      icon: Circle,
      path: "/circles"
    },
    {
      title: "Arlo",
      icon: Atom,
      path: "/arlo"
    },
    {
      title: "Career",
      icon: Briefcase,
      path: "/career"
    },
    {
      type: "separator" as const
    },
    {
      title: "Events",
      icon: Calendar,
      path: "/events"
    }
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => 'path' in tab && (currentPath === tab.path || (tab.path !== "/" && currentPath.startsWith(tab.path))));
    setSelectedTab(tabIndex >= 0 ? tabIndex : null);
  }, [location.pathname]);

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      const tab = tabs[index];
      if ('path' in tab && tab.path) {
        setSelectedTab(index);
      }
    } else {
      setSelectedTab(null);
    }
  };

  return (
    <>
      <GlassFilter />
      <div className={`fixed z-50 ${isMobile ? 'bottom-8 left-2 right-2' : 'bottom-4 left-1/2 transform -translate-x-1/2'}`}>
        <div 
          className={`glass-nav flex items-center gap-1 rounded-full ${isMobile ? 'justify-around px-1.5 py-1.5' : 'px-2 py-1.5'}`}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
          }}
        >
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="atom-gradient-nav" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a21caf" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="arlo-text-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0092ca" />
                <stop offset="50%" stopColor="#a21caf" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          {tabs.map((tab, index) => {
            if ('type' in tab && tab.type === "separator") {
              return (
                <div 
                  key={`separator-${index}`} 
                  className={`h-[18px] w-[1px] bg-white/30 dark:bg-white/20 ${isMobile ? 'hidden' : ''}`}
                  aria-hidden="true" 
                />
              );
            }

            const navTab = tab as NavTab;
            const Icon = navTab.icon;
            const isSelected = selectedTab === index;
            const isArloTab = navTab.title === "Arlo";

            return (
              <Link 
                key={navTab.title} 
                to={navTab.path} 
                className={`glass-nav-item relative flex items-center transition-all duration-500 ease-out ${
                  isSelected 
                    ? `bg-white/40 text-primary shadow-sm ${isMobile ? 'gap-1 rounded-xl' : 'gap-2 rounded-full'}`
                    : `text-muted-foreground hover:text-foreground hover:bg-white/20 gap-0 ${isMobile ? 'rounded-xl' : 'rounded-full'}`
                } ${isMobile ? 'flex-1 justify-center px-2 py-2 min-w-0' : 'px-3 py-1.5'}`} 
                onClick={() => handleTabChange(index)}
                style={{
                  backdropFilter: isSelected ? 'blur(15px)' : 'none',
                  boxShadow: isSelected 
                    ? '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)' 
                    : 'none',
                  transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
                  transform: isSelected && isMobile ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {isArloTab ? (
                  <Icon size={isMobile ? 15 : 18} stroke="url(#atom-gradient-nav)" strokeWidth="2.5" />
                ) : (
                  <Icon size={isMobile ? 15 : 18} strokeWidth={isSelected ? 2.5 : 2} />
                )}
                {isSelected && (
                  <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-out ${
                    isMobile ? 'text-xs font-medium max-w-16' : 'text-sm'
                  } ${
                    isArloTab && isSelected 
                      ? "bg-gradient-to-r from-[#0092ca] via-[#a21caf] to-[#ec4899] bg-clip-text text-transparent font-semibold"
                      : "font-medium"
                  }`}>
                    {isMobile && navTab.title.length > 6 ? navTab.title.slice(0, 6) : navTab.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
