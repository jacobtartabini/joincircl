
import { Home, Circle, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";

const DesktopNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { unreadCount } = useNotifications();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 border-r border-gray-200 z-10 bg-white">
      <div className="flex flex-col items-center justify-between h-full py-6">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-8">
            <div className="w-10 h-10">
              <img 
                src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
                alt="Circl" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <div className="flex flex-col items-center space-y-8">
            {navItems.map((item) => {
              const isActive = 
                item.path === "/" 
                  ? currentPath === "/" 
                  : currentPath.startsWith(item.path);
              
              return (
                <Link
                  to={item.path}
                  key={item.path}
                  className={`flex flex-col items-center justify-center ${
                    isActive ? "text-primary" : "text-gray-500"
                  }`}
                >
                  <div className="relative">
                    <item.icon size={24} />
                    {/* Add badge for notifications count on home page */}
                    {item.path === "/" && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-primary rounded-full text-white text-xs min-w-3.5 h-3.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopNav;
