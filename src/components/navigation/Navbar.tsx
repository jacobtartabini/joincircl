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

  // Default contact categories as requested
  const [contactGroups, setContactGroups] = useState<NavigationGroup[]>([{
    id: "1",
    name: "Work",
    color: "bg-blue-500",
    pinned: true
  }, {
    id: "2",
    name: "Friends",
    color: "bg-green-500",
    pinned: true
  }, {
    id: "3",
    name: "Family",
    color: "bg-purple-500",
    pinned: true
  }]);
  const navItems = [{
    icon: Home,
    label: "Home",
    path: "/"
  }, {
    icon: Circle,
    label: "Circles",
    path: "/circles"
  }, {
    icon: Calendar,
    label: "Keystones",
    path: "/keystones",
    iconSize: "h-5 w-5"
  },
  // Increased icon size
  {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  const handleAddNewTag = () => {
    if (newTagName.trim() === "") {
      toast.error("Please enter a tag name");
      return;
    }

    // Add the new tag
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
  const colorOptions = [{
    value: "bg-blue-500",
    label: "Blue"
  }, {
    value: "bg-green-500",
    label: "Green"
  }, {
    value: "bg-purple-500",
    label: "Purple"
  }, {
    value: "bg-red-500",
    label: "Red"
  }, {
    value: "bg-amber-500",
    label: "Amber"
  }, {
    value: "bg-pink-500",
    label: "Pink"
  }, {
    value: "bg-teal-500",
    label: "Teal"
  }, {
    value: "bg-indigo-500",
    label: "Indigo"
  }];
  const togglePinned = (id: string) => {
    setContactGroups(contactGroups.map(group => group.id === id ? {
      ...group,
      pinned: !group.pinned
    } : group));
  };
  return <div className="flex flex-col h-full p-4 bg-white">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <img src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" alt="Circl" className="h-10 w-10 object-contain" />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 rounded-md" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5 mb-8">
        {navItems.map(item => {
        const isActive = location.pathname === item.path || item.path !== "/" && location.pathname.startsWith(item.path);
        return <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-gray-700")}>
              <item.icon className={item.iconSize || "h-4 w-4"} />
              <span className="font-medium">{item.label}</span>
            </Link>;
      })}
      </nav>

      {/* Tags Section */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 px-3 flex items-center">
          <Tag className="h-3.5 w-3.5 mr-1.5" />
          Tags
        </h3>
        <div className="space-y-1.5">
          {contactGroups.map(group => <div key={group.id} className="flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", group.color)} />
                <span>{group.name}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => togglePinned(group.id)}>
                <Pin className={cn("h-3 w-3 transition-opacity", group.pinned ? "opacity-100" : "opacity-30")} />
              </button>
            </div>)}
          
          {/* Add new tag button */}
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={() => setIsTagDialogOpen(true)}>
            <Plus className="h-3 w-3" />
            <span>Add new tag</span>
          </button>
        </div>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Add New Person Button */}
      <Button className="rounded-xl">
        <Plus className="h-4 w-4 mr-2" />
        New Contact
      </Button>
      
      {/* New Tag Dialog */}
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
              <label htmlFor="name" className="text-sm font-medium">
                Tag Name
              </label>
              <Input id="name" placeholder="Enter tag name..." value={newTagName} onChange={e => setNewTagName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag Color</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => <button key={color.value} type="button" className={cn("h-8 rounded-md border-2 transition-all", newTagColor === color.value ? "border-primary" : "border-transparent hover:border-muted")} onClick={() => setNewTagColor(color.value)}>
                    <div className={cn("h-full w-full rounded-sm", color.value)} />
                  </button>)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewTag}>
              Create Tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}
