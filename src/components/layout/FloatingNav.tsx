
import { Home, Circle, Briefcase, Settings, Atom } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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
      title: "Settings",
      icon: Settings,
      path: "/settings"
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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-nav flex items-center gap-2 p-1 shadow-2xl rounded-full">
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
                className="mx-1 h-[24px] w-[1.2px] bg-white/30 dark:bg-white/20" 
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
              className={`relative flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isSelected 
                  ? "bg-white/30 dark:bg-white/20 text-primary gap-2 shadow-md"
                  : "text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10 hover:text-foreground gap-0"
              }`} 
              onClick={() => handleTabChange(index)}
            >
              {isArloTab ? (
                <Icon size={20} stroke="url(#atom-gradient-nav)" strokeWidth="2" />
              ) : (
                <Icon size={20} />
              )}
              {isSelected && (
                <span className={`overflow-hidden whitespace-nowrap ${
                  isArloTab && isSelected 
                    ? "bg-gradient-to-r from-[#0092ca] via-[#a21caf] to-[#ec4899] bg-clip-text text-transparent font-semibold"
                    : ""
                }`}>
                  {navTab.title}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
