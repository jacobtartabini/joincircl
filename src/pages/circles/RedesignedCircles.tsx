
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCirclesState } from "./hooks/useCirclesState";
import { CirclesList } from "@/components/circles/CirclesList";
import { CirclesFilter } from "@/components/circles/CirclesFilter";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import { SyncContactsButton } from "@/components/circles/SyncContactsButton";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { InsightsDialog } from "./dialogs/InsightsDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle, Users } from "lucide-react";

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
      navigate(`/contact/${selectedContact.id}`);
    }
  };

  // Handle view all action from contact detail panel
  const handleViewAllDetails = () => {
    if (selectedContact) {
      navigate(`/contact/${selectedContact.id}`);
    }
  };

  // Handle filter changes - this fixes the filter functionality
  const handleFilterChange = (filter: string | null) => {
    setFilterBy(filter);
    if (filter && filter !== tagFilter) {
      // If it's a circle filter (inner, middle, outer), don't update URL
      // If it's a tag filter, update URL
      if (['inner', 'middle', 'outer'].includes(filter)) {
        // Clear any existing tag filter from URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tag');
        navigate(`/circles?${newSearchParams.toString()}`, { replace: true });
      }
    } else if (!filter) {
      // Clear all filters including URL params
      navigate('/circles', { replace: true });
    }
  };

  // Filter and sort contacts
  const filteredSortedContacts = useMemo(() => {
    if (!contacts) return [];
    let result = contacts.filter(contact => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = contact.name?.toLowerCase().includes(query) || 
                             contact.personal_email?.toLowerCase().includes(query) || 
                             contact.company_name?.toLowerCase().includes(query) || 
                             contact.job_title?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tag filter (either from filterBy state or URL param)
      const activeTagFilter = tagFilter || (filterBy && !['inner', 'middle', 'outer'].includes(filterBy) ? filterBy : null);
      if (activeTagFilter) {
        if (!contact.tags || !contact.tags.includes(activeTagFilter)) {
          return false;
        }
      }

      // Circle filter
      if (filterBy && ['inner', 'middle', 'outer'].includes(filterBy) && contact.circle !== filterBy) {
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
      <div className="min-h-screen bg-background dark:bg-background">
        <div className="h-screen flex flex-col">
          {/* Header with page title */}
          <div className="flex-shrink-0 bg-card dark:bg-card border-b border-border dark:border-border shadow-sm">
            <div className="p-4">
              {/* Page Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Circle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">Circles</h1>
                    <p className="text-sm text-muted-foreground">Manage your network</p>
                  </div>
                </div>
              </div>
              
              <CirclesFilter 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                onAddContact={() => setIsAddDialogOpen(true)} 
                onSort={setSortBy} 
                onFilter={handleFilterChange} 
                activeTagFilter={tagFilter} 
              />
              <div className="mt-3 flex justify-end">
                <SyncContactsButton onContactsImported={fetchContacts} />
              </div>
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
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="h-screen flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contact List Panel */}
          <div className="flex-1 flex flex-col bg-card dark:bg-card border-r border-border dark:border-border shadow-sm overflow-hidden min-w-0 max-w-none">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border dark:border-border bg-card dark:bg-card">
              <div className="p-6 pb-4">
                {/* Page Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Circle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-foreground">Circles</h1>
                      <p className="text-muted-foreground">Manage your network of contacts</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {filteredSortedContacts.length} contact{filteredSortedContacts.length !== 1 ? 's' : ''}
                    {tagFilter && ` tagged with "${tagFilter}"`}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <CirclesFilter 
                      searchQuery={searchQuery} 
                      onSearchChange={setSearchQuery} 
                      onAddContact={() => setIsAddDialogOpen(true)} 
                      onSort={setSortBy} 
                      onFilter={handleFilterChange} 
                      activeTagFilter={tagFilter} 
                    />
                  </div>
                  <SyncContactsButton onContactsImported={fetchContacts} />
                </div>
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
          
          {/* Contact Details Panel - Only show when contact is selected */}
          {selectedContact && (
            <div className="w-96 flex-shrink-0 bg-card dark:bg-card shadow-sm border-l border-border dark:border-border overflow-hidden">
              <EnhancedContactDetail 
                contact={selectedContact} 
                interactions={selectedContactInteractions} 
                onEdit={handleEditContact} 
                onDelete={handleDeleteContact} 
                onViewAll={handleViewAllDetails} 
              />
            </div>
          )}
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
