
import { Search, Home, Circle, Users, FileText, Plus, Pin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
    { id: "1", name: "Family", color: "bg-blue-500", pinned: true },
    { id: "2", name: "Work", color: "bg-green-500", pinned: true },
    { id: "3", name: "Friends", color: "bg-purple-500", pinned: false },
  ]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Users, label: "Contacts", path: "/contacts" },
    { icon: FileText, label: "Notes", path: "/notes" },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 mb-6">
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
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Custom Groups */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Custom Groups</h3>
        <div className="space-y-1">
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
        </div>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Add New Button */}
      <Button className="w-full mt-4">
        <Plus className="h-4 w-4 mr-2" />
        New Contact
      </Button>
    </div>
  );
}
