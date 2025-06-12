
import { Search, Home, Circle, Calendar, Settings, Plus, Pin, Tag, Briefcase, Atom } from "lucide-react";
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
    { icon: Atom, label: "Arlo", path: "/arlo" },
    { icon: Briefcase, label: "Career", path: "/career" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleTagClick = (tagName: string) => {
    navigate(`/circles?tag=${encodeURIComponent(tagName)}`);
  };

  const handleAddContactSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <img 
          src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
          alt="Circl" 
          className="h-12 w-12 object-contain"
        />
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-2 mb-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tags Section */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4 px-4">Tags</h3>
        <div className="space-y-1">
          {tags && tags.map((tag) => (
            <button 
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm hover:bg-gray-100 cursor-pointer text-left transition-colors"
            >
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-gray-700">{tag}</span>
            </button>
          ))}
          
          {(!tags || tags.length === 0) && (
            <p className="text-xs text-muted-foreground px-4 py-2">No tags yet</p>
          )}
        </div>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Add New Person Button */}
      <Button 
        className="w-full rounded-xl py-3 text-base font-medium"
        onClick={() => setIsAddContactOpen(true)}
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
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
