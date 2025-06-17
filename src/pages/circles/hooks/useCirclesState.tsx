
import { useState, useEffect, useCallback } from "react";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";

export function useCirclesState() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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

  const fetchContacts = useCallback(async (page: number = 1, search: string = searchQuery) => {
    try {
      setIsLoading(true);
      const result = await contactService.getContacts({
        page,
        itemsPerPage: 100,
        searchQuery: search
      });
      
      setContacts(result.contacts);
      setTotalContacts(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(page);
      
      // Extract unique tags from all contacts with safe null checks
      const allTags = new Set<string>();
      result.contacts.forEach(contact => {
        if (contact && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => {
            if (tag && typeof tag === 'string') allTags.add(tag);
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
      setContacts([]);
      setTotalContacts(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, toast]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        fetchContacts(1, searchQuery);
      } else {
        fetchContacts(1, "");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchContacts]);

  useEffect(() => {
    fetchContacts(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    fetchContacts(page);
  }, [fetchContacts]);

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

  const refreshContacts = useCallback(() => {
    fetchContacts(currentPage);
  }, [fetchContacts, currentPage]);

  return {
    contacts,
    totalContacts,
    totalPages,
    currentPage,
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
    fetchContacts: refreshContacts,
    handleEditContact,
    handleAddInteraction,
    handleViewInsights,
    handlePageChange
  };
}
