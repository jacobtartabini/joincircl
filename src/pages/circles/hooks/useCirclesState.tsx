
import { useState, useEffect } from "react";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";

export function useCirclesState() {
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
      const safeData = Array.isArray(data) ? data : [];
      setContacts(safeData);
      
      // Extract unique tags from all contacts
      const allTags = new Set<string>();
      safeData.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => {
            if (tag) allTags.add(tag);
          });
        }
      });
      
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

  return {
    contacts,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    availableTags,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isInteractionDialogOpen,
    setIsInteractionDialogOpen,
    isInsightsDialogOpen,
    setIsInsightsDialogOpen,
    selectedContact,
    setSelectedContact,
    fetchContacts,
    handleEditContact,
    handleAddInteraction,
    handleViewInsights
  };
}
