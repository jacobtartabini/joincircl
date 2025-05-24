
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCirclesState } from "./hooks/useCirclesState";
import { CirclesList } from "@/components/circles/CirclesList";
import { CirclesFilter } from "@/components/circles/CirclesFilter";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { InsightsDialog } from "./dialogs/InsightsDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export default function RedesignedCircles() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // Handle edit action from contact detail panel
  const handleEditContact = () => {
    if (selectedContact) {
      setInitialSelectedContact(selectedContact);
      setIsEditDialogOpen(true);
    }
  };

  // Handle delete action from contact detail panel
  const handleDeleteContact = () => {
    if (selectedContact) {
      console.log("Delete contact:", selectedContact.id);
      navigate(`/contacts/${selectedContact.id}`);
    }
  };

  // Handle view all action from contact detail panel
  const handleViewAllDetails = () => {
    if (selectedContact) {
      navigate(`/contacts/${selectedContact.id}`);
    }
  };

  // Filter and sort contacts
  const filteredSortedContacts = useMemo(() => {
    if (!contacts) return [];

    let result = contacts.filter(contact => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        contact.name?.toLowerCase().includes(query) ||
        contact.personal_email?.toLowerCase().includes(query) ||
        contact.company_name?.toLowerCase().includes(query) ||
        contact.job_title?.toLowerCase().includes(query)
      );
    });
    
    if (filterBy) {
      result = result.filter(contact => contact.circle === filterBy);
    }
    
    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        const dateA = a.last_contact ? new Date(a.last_contact).getTime() : 0;
        const dateB = b.last_contact ? new Date(b.last_contact).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [contacts, searchQuery, filterBy, sortBy]);

  // Mock interactions for selected contact
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
        date: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "int3",
        user_id: "user1",
        contact_id: selectedContact.id,
        type: "Phone",
        notes: "Quick call to discuss budget changes",
        date: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
  }, [selectedContact]);

  if (isMobile) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="panel-header">
          <CirclesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddContact={() => setIsAddDialogOpen(true)}
            onSort={setSortBy}
            onFilter={setFilterBy}
          />
        </div>
        <div className="panel-content">
          <CirclesList
            contacts={filteredSortedContacts}
            isLoading={isLoading}
            onSelectContact={handleSelectContact}
            selectedContactId={selectedContactId}
          />
        </div>
        
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
          onCancel={() => setIsEditDialogOpen(false)}
        />
        
        <InteractionDialog
          isOpen={isInteractionDialogOpen}
          onOpenChange={setIsInteractionDialogOpen}
          contact={initialSelectedContact}
          onSuccess={fetchContacts}
          onCancel={() => setIsInteractionDialogOpen(false)}
        />
        
        <InsightsDialog
          isOpen={isInsightsDialogOpen}
          onOpenChange={setIsInsightsDialogOpen}
          contact={initialSelectedContact}
        />
      </div>
    );
  }

  return (
    <div className="h-full animate-fade-in flex overflow-hidden">
      {/* Middle Panel - Contact List */}
      <div className="flex-1 flex flex-col border-r overflow-hidden min-w-0">
        <div className="panel-header">
          <CirclesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddContact={() => setIsAddDialogOpen(true)}
            onSort={setSortBy}
            onFilter={setFilterBy}
          />
        </div>
        <div className="panel-content">
          <CirclesList
            contacts={filteredSortedContacts}
            isLoading={isLoading}
            onSelectContact={handleSelectContact}
            selectedContactId={selectedContactId}
          />
        </div>
      </div>
      
      {/* Right Panel - Contact Details */}
      <div className="w-80 flex-shrink-0 overflow-hidden">
        {selectedContact ? (
          <EnhancedContactDetail 
            contact={selectedContact}
            interactions={selectedContactInteractions}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onViewAll={handleViewAllDetails}
          />
        ) : (
          <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
            <div className="text-center max-w-sm">
              <h3 className="text-lg font-medium mb-2">No contact selected</h3>
              <p className="text-sm leading-relaxed">
                Select someone from the list to view their details, or add a new person to your circles.
              </p>
            </div>
          </div>
        )}
      </div>
      
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
        onCancel={() => setIsEditDialogOpen(false)}
      />
      
      <InteractionDialog
        isOpen={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        contact={initialSelectedContact}
        onSuccess={fetchContacts}
        onCancel={() => setIsInteractionDialogOpen(false)}
      />
      
      <InsightsDialog
        isOpen={isInsightsDialogOpen}
        onOpenChange={setIsInsightsDialogOpen}
        contact={initialSelectedContact}
      />
    </div>
  );
}
