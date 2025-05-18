
import { useState, useMemo } from "react";
import { useCirclesState } from "./hooks/useCirclesState";
import { ThreePanelLayout } from "@/components/layout/ThreePanelLayout";
import { NavigationPanel } from "@/components/layout/NavigationPanel";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import { Contact } from "@/types/contact";

export default function RedesignedCircles() {
  const {
    contacts,
    isLoading,
    selectedContact: initialSelectedContact,
    setSelectedContact: setInitialSelectedContact,
    fetchContacts,
    handleAddInteraction,
    handleViewInsights,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isInteractionDialogOpen,
    setIsInteractionDialogOpen,
    isInsightsDialogOpen,
    setIsInsightsDialogOpen,
    searchQuery,
    setSearchQuery,
  } = useCirclesState();

  // Local state for the selected contact (used in detail panel)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Find the selected contact from the contacts array
  const selectedContact = useMemo(() => {
    if (!selectedContactId || !contacts) return null;
    return contacts.find(contact => contact.id === selectedContactId) || null;
  }, [selectedContactId, contacts]);

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

  const handleSelectActivity = (activity: any) => {
    const contactId = activity.contactId;
    setSelectedContactId(contactId);
  };

  return (
    <div className="h-[calc(100vh-2rem)] animate-fade-in">
      <ThreePanelLayout
        leftPanel={<NavigationPanel />}
        middlePanel={
          <ActivityFeed 
            onSelectActivity={handleSelectActivity}
          />
        }
        rightPanel={
          selectedContact ? (
            <EnhancedContactDetail 
              contact={selectedContact}
              interactions={selectedContactInteractions}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a contact to view details
            </div>
          )
        }
      />
    </div>
  );
}
