
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RedesignedCircles() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');

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
    handleViewInsights
  } = useCirclesState();

  // Local state for the selected contact (used in detail panel)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterBy, setFilterBy] = useState<string | null>(null);

  // Set initial filter from URL params
  useEffect(() => {
    if (tagFilter) {
      setFilterBy(tagFilter);
    }
  }, [tagFilter]);

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
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          contact.name?.toLowerCase().includes(query) || 
          contact.personal_email?.toLowerCase().includes(query) || 
          contact.company_name?.toLowerCase().includes(query) || 
          contact.job_title?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tag filter (either from filterBy state or URL param)
      const activeTagFilter = tagFilter || filterBy;
      if (activeTagFilter) {
        if (!contact.tags || !contact.tags.includes(activeTagFilter)) {
          return false;
        }
      }

      // Circle filter
      if (filterBy && !tagFilter && contact.circle !== filterBy) {
        return false;
      }
      return true;
    });

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
  }, [contacts, searchQuery, filterBy, tagFilter, sortBy]);

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
        created_at: new Date().toISOString()
      },
      {
        id: "int2",
        user_id: "user1",
        contact_id: selectedContact.id,
        type: "Email",
        notes: "Sent follow-up email with meeting notes",
        date: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "int3",
        user_id: "user1",
        contact_id: selectedContact.id,
        type: "Phone",
        notes: "Quick call to discuss budget changes",
        date: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }, [selectedContact]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
            <div className="p-4">
              <CirclesFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddContact={() => setIsAddDialogOpen(true)}
                onSort={setSortBy}
                onFilter={setFilterBy}
                activeTagFilter={tagFilter}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 pb-20">
                <CirclesList
                  contacts={filteredSortedContacts}
                  isLoading={isLoading}
                  onSelectContact={handleSelectContact}
                  selectedContactId={selectedContactId}
                />
              </div>
            </ScrollArea>
          </div>
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="h-screen flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contact List Panel */}
          <div className="flex-1 flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden min-w-0 max-w-none">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-100 bg-white">
              <div className="p-6 pb-4">
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Circles</h1>
                  <p className="text-sm text-gray-600">
                    {filteredSortedContacts.length} contact{filteredSortedContacts.length !== 1 ? 's' : ''}
                    {tagFilter && ` tagged with "${tagFilter}"`}
                  </p>
                </div>
                <CirclesFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onAddContact={() => setIsAddDialogOpen(true)}
                  onSort={setSortBy}
                  onFilter={setFilterBy}
                  activeTagFilter={tagFilter}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 pt-4">
                  <CirclesList
                    contacts={filteredSortedContacts}
                    isLoading={isLoading}
                    onSelectContact={handleSelectContact}
                    selectedContactId={selectedContactId}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Contact Details Panel */}
          <div className="w-96 flex-shrink-0 bg-white shadow-sm border-l border-gray-200 overflow-hidden">
            {selectedContact ? (
              <EnhancedContactDetail
                contact={selectedContact}
                interactions={selectedContactInteractions}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onViewAll={handleViewAllDetails}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No contact selected</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Select someone from your circles to view their details, or add a new person to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
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
