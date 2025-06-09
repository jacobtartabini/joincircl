
import { Home, Users, Target, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
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
    { title: "Home", icon: Home, path: "/" },
    { title: "Circles", icon: Users, path: "/circles" },
    { title: "Keystones", icon: Target, path: "/keystones" },
    { type: "separator" as const },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  // Update selected tab based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => 
      'path' in tab && (currentPath === tab.path || (tab.path !== "/" && currentPath.startsWith(tab.path)))
    );
    setSelectedTab(tabIndex >= 0 ? tabIndex : null);
  }, [location.pathname]);

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      const tab = tabs[index];
      if ('path' in tab && tab.path) {
        // Navigation will be handled by the Link components
        setSelectedTab(index);
      }
    } else {
      setSelectedTab(null);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-2xl border bg-white/95 backdrop-blur-sm p-1 shadow-lg">
        {tabs.map((tab, index) => {
          if ('type' in tab && tab.type === "separator") {
            return (
              <div key={`separator-${index}`} className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
            );
          }

          // Type guard ensures tab is NavTab here
          const navTab = tab as NavTab;
          const Icon = navTab.icon;
          const isSelected = selectedTab === index;
          
          return (
            <Link
              key={navTab.title}
              to={navTab.path}
              className={`relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isSelected
                  ? "bg-muted text-circl-blue gap-2"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground gap-0"
              }`}
              onClick={() => handleTabChange(index)}
            >
              <Icon size={20} />
              {isSelected && (
                <span className="overflow-hidden whitespace-nowrap">
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
