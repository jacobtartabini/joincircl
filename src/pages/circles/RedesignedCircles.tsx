
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCirclesState } from "./hooks/useCirclesState";
import { CirclesList } from "@/components/circles/CirclesList";
import { AdvancedCirclesFilter } from "@/components/circles/AdvancedCirclesFilter";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import { SyncContactsButton } from "@/components/circles/SyncContactsButton";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { InsightsDialog } from "./dialogs/InsightsDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Filter } from "@/components/ui/filters";
import { useAdvancedContactFilters } from "@/hooks/use-advanced-contact-filters";

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
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);

  // Apply advanced filtering
  const filteredSortedContacts = useAdvancedContactFilters(contacts || [], filters, searchQuery);

  // Set initial filter from URL params
  useEffect(() => {
    if (tagFilter) {
      // Convert URL tag filter to new filter format if needed
      // This maintains backward compatibility
    }
  }, [tagFilter]);

  // Find the selected contact from the contacts array
  const selectedContact = useMemo(() => {
    if (!selectedContactId || !contacts) return null;
    return contacts.find(contact => contact.id === selectedContactId) || null;
  }, [selectedContactId, contacts]);

  // Handle selecting a contact - updated for mobile
  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setInitialSelectedContact(contact);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  // Handle closing mobile detail
  const handleCloseMobileDetail = () => {
    setShowMobileDetail(false);
    setSelectedContactId(null);
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
              
              <AdvancedCirclesFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddContact={() => setIsAddDialogOpen(true)}
                contacts={contacts || []}
                filters={filters}
                onFiltersChange={setFilters}
                refetchContacts={fetchContacts}
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
        
        {/* Mobile Detail Panel */}
        {selectedContact && showMobileDetail && (
          <div className="fixed inset-0 z-50">
            <EnhancedContactDetail 
              contact={selectedContact} 
              interactions={selectedContactInteractions} 
              onEdit={handleEditContact} 
              onDelete={handleDeleteContact} 
              onViewAll={handleViewAllDetails} 
            />
          </div>
        )}
        
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
          <div className={cn(
            "flex flex-col bg-card dark:bg-card border-r border-border dark:border-border shadow-sm overflow-hidden min-w-0",
            selectedContact ? "flex-1 max-w-none" : "flex-1 max-w-full"
          )}>
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
                    {filters.length > 0 && ' (filtered)'}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <AdvancedCirclesFilter
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onAddContact={() => setIsAddDialogOpen(true)}
                      contacts={contacts || []}
                      filters={filters}
                      onFiltersChange={setFilters}
                      refetchContacts={fetchContacts}
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
            <div className="w-80 xl:w-96 flex-shrink-0 bg-card dark:bg-card shadow-sm border-l border-border dark:border-border overflow-hidden">
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
