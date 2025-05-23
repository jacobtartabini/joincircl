
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCirclesState } from "./hooks/useCirclesState";
import { ThreePanelLayout } from "@/components/layout/ThreePanelLayout";
import { Navbar } from "@/components/navigation/Navbar";
import { CirclesList } from "@/components/circles/CirclesList";
import { CirclesFilter } from "@/components/circles/CirclesFilter";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { InsightsDialog } from "./dialogs/InsightsDialog";

export default function RedesignedCircles() {
  const navigate = useNavigate();
  const {
    contacts,
    isLoading,
    searchQuery,
    setSearchQuery,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isInteractionDialogOpen,
    setIsInteractionDialogOpen,
    isInsightsDialogOpen,
    setIsInsightsDialogOpen,
    selectedContact: initialSelectedContact,
    setSelectedContact: setInitialSelectedContact,
    fetchContacts,
    handleAddInteraction,
    handleViewInsights,
  } = useCirclesState();

  // Local state for the selected contact (used in detail panel)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterBy, setFilterBy] = useState<string | null>(null);
  
  // Find the selected contact from the contacts array
  const selectedContact = useMemo(() => {
    if (!selectedContactId || !contacts) return null;
    return contacts.find(contact => contact.id === selectedContactId) || null;
  }, [selectedContactId, contacts]);

  // Handle selecting a contact
  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setInitialSelectedContact(contact);
  };

  // Filter and sort contacts based on search query, filter, and sort options
  const filteredSortedContacts = useMemo(() => {
    if (!contacts) return [];

    // Start with filtering by search query
    let result = contacts.filter(contact => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        contact.name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.position?.toLowerCase().includes(query)
      );
    });
    
    // Apply circle filter if set
    if (filterBy) {
      result = result.filter(contact => contact.circle === filterBy);
    }
    
    // Apply sorting
    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        const dateA = a.last_interaction ? new Date(a.last_interaction).getTime() : 0;
        const dateB = b.last_interaction ? new Date(b.last_interaction).getTime() : 0;
        return dateB - dateA; // Sort by most recent first
      }
      return 0;
    });
  }, [contacts, searchQuery, filterBy, sortBy]);

  // Interactions for the selected contact would normally come from a separate API call
  // Mock data for demonstration purposes
  const selectedContactInteractions = useMemo(() => {
    if (!selectedContact) return [];
    return [
      {
        id: "int1",
        user_id: "user1",
        contact_id: selectedContact.id,
        type: "Meeting",
        notes: "Discussed project timeline and deliverables",
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "int2",
        user_id: "user1",
        contact_id: selectedContact.id,
        type: "Email",
        notes: "Sent follow-up email with meeting notes",
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "int3",
        user_id: "user1",
        contact_id: selectedContact.id,
        type: "Phone",
        notes: "Quick call to discuss budget changes",
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        created_at: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
  }, [selectedContact]);

  return (
    <div className="h-[calc(100vh-2rem)] animate-fade-in">
      <ThreePanelLayout
        leftPanel={<Navbar />}
        middlePanel={
          <div className="px-1">
            <CirclesFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddContact={() => setIsAddDialogOpen(true)}
              onSort={setSortBy}
              onFilter={setFilterBy}
            />
            <CirclesList
              contacts={filteredSortedContacts}
              isLoading={isLoading}
              onSelectContact={handleSelectContact}
              selectedContactId={selectedContactId}
            />
          </div>
        }
        rightPanel={
          selectedContact ? (
            <EnhancedContactDetail 
              contact={selectedContact}
              interactions={selectedContactInteractions}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No contact selected</h3>
                <p className="text-sm max-w-md">
                  Select someone from the list to view their details, or add a new person to your circles.
                </p>
              </div>
            </div>
          )
        }
      />
      
      {/* Dialogs */}
      <AddContactDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchContacts}
      />
      
      <EditContactDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        contact={initialSelectedContact}
        onSuccess={fetchContacts}
      />
      
      <InteractionDialog
        isOpen={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        contact={initialSelectedContact}
        onSuccess={fetchContacts}
      />
      
      <InsightsDialog
        isOpen={isInsightsDialogOpen}
        onOpenChange={setIsInsightsDialogOpen}
        contact={initialSelectedContact}
      />
    </div>
  );
}
