
import { Search, Home, Circle, Calendar, Settings, Plus, Pin, Tag } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AddContactDialog } from "@/pages/circles/dialogs/AddContactDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavigationGroup {
  id: string;
  name: string;
  color: string;
  pinned: boolean;
}

export function NavigationPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  
  // Fetch all unique tags from contacts
  const { data: tags } = useQuery({
    queryKey: ['contact-tags'],
    queryFn: async () => {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('tags');
      
      if (!contacts) return [];
      
      const allTags = new Set<string>();
      contacts.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      return Array.from(allTags).sort();
    }
  });

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleTagClick = (tagName: string) => {
    navigate(`/circles?tag=${encodeURIComponent(tagName)}`);
  };

  const handleAddContactSuccess = () => {
    // Refresh the page or trigger a re-fetch
    window.location.reload();
  };

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
          {tags && tags.map((tag) => (
            <button 
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span>{tag}</span>
              </div>
            </button>
          ))}
          
          {(!tags || tags.length === 0) && (
            <p className="text-xs text-muted-foreground px-3">No tags yet</p>
          )}
        </div>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Add New Person Button */}
      <Button 
        className="w-full rounded-full"
        onClick={() => setIsAddContactOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Person
      </Button>

      {/* Add Contact Dialog */}
      <AddContactDialog
        isOpen={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
        onSuccess={handleAddContactSuccess}
      />
    </div>
  );
}
