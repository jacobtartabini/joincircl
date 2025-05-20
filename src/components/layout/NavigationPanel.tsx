
import { Search, Home, Circle, Calendar, Settings, Plus, Pin, Tag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavigationGroup {
  id: string;
  name: string;
  color: string;
  pinned: boolean;
}

export function NavigationPanel() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Example custom groups - in a real app, these would come from an API or database
  const [customGroups, setCustomGroups] = useState<NavigationGroup[]>([
    { id: "1", name: "B.E.T.", color: "bg-blue-500", pinned: true },
    { id: "2", name: "Emmy Awards", color: "bg-green-500", pinned: true },
    { id: "3", name: "Lunch Party", color: "bg-purple-500", pinned: false },
    { id: "4", name: "LVMH", color: "bg-red-500", pinned: true },
  ]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex flex-col h-full p-4 bg-white">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <img 
          src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
          alt="Circl" 
          className="h-10 w-10 object-contain"
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5 mb-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-gray-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tags Section */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 px-3">Tags</h3>
        <div className="space-y-1.5">
          {customGroups.map((group) => (
            <div 
              key={group.id}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", group.color)} />
                <span>{group.name}</span>
              </div>
              {group.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
          
          {/* Add new group button */}
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">
            <Plus className="h-3 w-3" />
            <span>Add new tag</span>
          </button>
        </div>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Add New Person Button */}
      <Button className="w-full rounded-full">
        <Plus className="h-4 w-4 mr-2" />
        New Person
      </Button>
    </div>
  );
}
