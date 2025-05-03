
import { Home, Circle, Calendar, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MobileNavProps {
  onSignOut: () => Promise<void>;
}

const MobileNav = ({ onSignOut }: MobileNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = 
            item.path === "/" 
              ? currentPath === "/" 
              : currentPath.startsWith(item.path);
              
          return (
            <Link
              to={item.path}
              key={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? "text-circl-blue" : "text-gray-500"
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onSignOut}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500"
        >
          <LogOut size={20} />
          <span className="text-xs mt-1">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
