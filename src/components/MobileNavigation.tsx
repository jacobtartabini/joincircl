import { useState } from "react";
import { Home, Users, Settings, Brain, Briefcase } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileNavigation() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Users, label: "Contacts", path: "/contacts" },
    { icon: Briefcase, label: "Career", path: "/career" },
    { icon: Brain, label: "Arlo", path: "/arlo" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="absolute top-4 left-4 md:hidden"
        >
          <Home className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <nav className="grid h-full flex-col items-start space-y-1 bg-white px-2 py-4">
          {navItems.map((item) => (
            <Link to={item.path} key={item.label} onClick={closeMenu}>
              <Button variant="ghost" className="flex w-full justify-start gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
