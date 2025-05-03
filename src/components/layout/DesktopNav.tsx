
import { Home, List, Calendar, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface DesktopNavProps {
  onSignOut: () => Promise<void>;
}

const DesktopNav = ({ onSignOut }: DesktopNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: List, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 border-r border-gray-200 z-10 bg-white">
      <div className="flex flex-col items-center justify-between h-full py-6">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-8">
            <div className="w-10 h-10 rounded-full bg-circl-blue flex items-center justify-center text-white font-serif text-xl">C</div>
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
                    isActive ? "text-circl-blue" : "text-gray-500"
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <button
          onClick={onSignOut}
          className="flex flex-col items-center text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={24} />
          <span className="text-xs mt-1">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DesktopNav;
