
import { Search, Home, Circle, Calendar, Settings, Plus, Pin, Tag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface NavigationGroup {
  id: string;
  name: string;
  color: string;
  pinned: boolean;
}

export function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("bg-blue-500");

  const [contactGroups, setContactGroups] = useState<NavigationGroup[]>([
    { id: "1", name: "Work", color: "bg-blue-500", pinned: true },
    { id: "2", name: "Friends", color: "bg-green-500", pinned: true },
    { id: "3", name: "Family", color: "bg-purple-500", pinned: true }
  ]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Circle, label: "Circles", path: "/circles" },
    { icon: Calendar, label: "Keystones", path: "/keystones" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  const handleAddNewTag = () => {
    if (newTagName.trim() === "") {
      toast.error("Please enter a tag name");
      return;
    }

    const newTag = {
      id: Date.now().toString(),
      name: newTagName,
      color: newTagColor,
      pinned: false
    };
    setContactGroups([...contactGroups, newTag]);
    setNewTagName("");
    setIsTagDialogOpen(false);
    toast.success(`Tag "${newTagName}" has been created`);
  };

  const colorOptions = [
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-red-500", label: "Red" },
    { value: "bg-amber-500", label: "Amber" },
    { value: "bg-pink-500", label: "Pink" },
    { value: "bg-teal-500", label: "Teal" },
    { value: "bg-indigo-500", label: "Indigo" }
  ];

  const togglePinned = (id: string) => {
    setContactGroups(contactGroups.map(group => 
      group.id === id ? { ...group, pinned: !group.pinned } : group
    ));
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-100">
        <img 
          src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
          alt="Circl" 
          className="h-8 w-8 object-contain"
        />
      </div>

      <div className="flex flex-col flex-1 px-4 py-6 space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tags */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</span>
          </div>
          
          <div className="space-y-1">
            {contactGroups.map((group) => (
              <div 
                key={group.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", group.color)} />
                  <span className="text-sm text-gray-700">{group.name}</span>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => togglePinned(group.id)}
                >
                  <Pin className={cn("h-3 w-3", group.pinned ? "opacity-100" : "opacity-30")} />
                </button>
              </div>
            ))}
            
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              onClick={() => setIsTagDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              <span>Add tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Contact Button */}
      <div className="p-4 border-t border-gray-100">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>
      
      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to organize your contacts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Tag Name
              </label>
              <Input 
                id="name" 
                placeholder="Enter tag name..." 
                value={newTagName} 
                onChange={(e) => setNewTagName(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tag Color</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      "h-8 rounded-md border-2 transition-all",
                      newTagColor === color.value ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setNewTagColor(color.value)}
                  >
                    <div className={cn("h-full w-full rounded-sm", color.value)} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewTag} className="bg-blue-600 hover:bg-blue-700">
              Create Tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
