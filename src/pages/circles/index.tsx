
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { Plus } from "lucide-react";
import { CirclesTabContent } from "./CirclesTabContent";
import SearchFilterBar from "./SearchFilterBar";
import { CirclesTabs } from "./CirclesTabs";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { InsightsDialog } from "./dialogs/InsightsDialog";

const Circles = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getContacts();
      setContacts(data || []);
      
      // Extract unique tags from all contacts, safely handling undefined tags
      const allTags = new Set<string>();
      if (Array.isArray(data)) {
        data.forEach(contact => {
          if (contact.tags && Array.isArray(contact.tags)) {
            contact.tags.forEach(tag => {
              if (tag) allTags.add(tag);
            });
          }
        });
      }
      
      setAvailableTags(Array.from(allTags));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleAddInteraction = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInteractionDialogOpen(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInsightsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsInteractionDialogOpen(false);
    setSelectedContact(null);
    fetchContacts();
  };

  // Ensure we have an array of tag values
  const tagValues = availableTags || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Circles</h1>
          <p className="text-muted-foreground">
            Organize your network in concentric circles of connection
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Contact
        </Button>
      </div>

      <SearchFilterBar 
        allTags={tagValues}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        onAddContact={() => setIsAddDialogOpen(true)}
        onRefresh={fetchContacts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <CirclesTabs>
        <CirclesTabContent 
          value="all" 
          contacts={contacts}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="inner" 
          contacts={contacts}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="middle" 
          contacts={contacts}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="outer" 
          contacts={contacts}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
      </CirclesTabs>

      <AddContactDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <EditContactDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        contact={selectedContact}
        onSuccess={handleDialogSuccess}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setSelectedContact(null);
        }}
      />

      <InteractionDialog 
        isOpen={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        contact={selectedContact}
        onSuccess={handleDialogSuccess}
        onCancel={() => {
          setIsInteractionDialogOpen(false);
          setSelectedContact(null);
        }}
      />

      <InsightsDialog 
        isOpen={isInsightsDialogOpen}
        onOpenChange={setIsInsightsDialogOpen}
        contact={selectedContact}
      />
    </div>
  );
};

export default Circles;
