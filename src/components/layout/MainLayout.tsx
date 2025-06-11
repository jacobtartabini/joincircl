import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Users, Brain, Settings, LogOut, Menu, X, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import GlobalAIAssistant from "@/components/ai/GlobalAIAssistant";
import { useContacts } from "@/hooks/use-contacts";
import { useIsMobile } from "@/hooks/use-mobile";
import FloatingNav from "./FloatingNav";
interface MainLayoutProps {
  children: React.ReactNode;
}
export default function MainLayout({
  children
}: MainLayoutProps) {
  const location = useLocation();
  const {
    signOut
  } = useAuth();
  const {
    contacts
  } = useContacts();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGlobalAI, setShowGlobalAI] = useState(false);
  const [isAIMinimized, setIsAIMinimized] = useState(false);
  const isMobile = useIsMobile();
  const navigationItems = [{
    icon: Home,
    label: "Home",
    path: "/"
  }, {
    icon: Users,
    label: "Circles",
    path: "/circles"
  }, {
    icon: Target,
    label: "Keystones",
    path: "/keystones"
  }, {
    icon: Brain,
    label: "Arlo",
    path: "/arlo"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };
    if (showMobileMenu) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMobileMenu]);
  const toggleGlobalAI = () => {
    setShowGlobalAI(!showGlobalAI);
    if (!showGlobalAI) {
      setIsAIMinimized(false);
    }
  };
  const toggleAIMinimize = () => {
    setIsAIMinimized(!isAIMinimized);
  };
  if (isMobile) {
    return <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-circl-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">Circl</span>
            </Link>

            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="p-2" aria-label="Toggle menu">
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </header>

        {/* Mobile Overlay Menu */}
        {showMobileMenu && <>
            <div className="fixed inset-0 bg-black/20 z-40 mt-16" onClick={closeMobileMenu} />
            <div className="fixed top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg">
              <nav className="p-4">
                <div className="space-y-2">
                  {navigationItems.map(item => {
                const Icon = item.icon;
                return <Link key={item.path} to={item.path} onClick={closeMobileMenu} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", isActivePath(item.path) ? "bg-circl-blue text-white" : "text-gray-700 hover:bg-gray-100")}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>;
              })}
                  
                  <button onClick={() => {
                handleSignOut();
                closeMobileMenu();
              }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </>}

        {/* Mobile Main Content */}
        <main className="pt-16 pb-24 min-h-screen">
          {children}
        </main>

        {/* Floating Navigation for Mobile */}
        <FloatingNav />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Desktop Header - Simple top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#30a2ed]">
              <span className="text-white font-bold"></span>
            </div>
            <span className="font-semibold text-xl text-gray-900">Circl</span>
          </Link>

          {/* Sign Out Button */}
          
        </div>
      </header>

      {/* Desktop Main Content */}
      <main className="pt-16 pb-24 min-h-screen overflow-auto">
        {children}
      </main>

      {/* Floating Navigation for Desktop */}
      <FloatingNav />

      {/* Global AI Assistant */}
      <GlobalAIAssistant contacts={contacts} isOpen={showGlobalAI} onToggle={toggleGlobalAI} isMinimized={isAIMinimized} onMinimize={toggleAIMinimize} />

      {/* Floating AI Button */}
      {!showGlobalAI && <Button onClick={toggleGlobalAI} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-200 z-40" size="sm">
          <Brain className="h-6 w-6 text-white" />
        </Button>}
    </div>;
}