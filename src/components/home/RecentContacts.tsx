
import { useState } from "react";
import { ContactCard } from "@/components/ui/contact-card";
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InteractionForm from "@/components/interaction/InteractionForm";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";

interface RecentContactsProps {
  contacts: Contact[];
  isLoading: boolean;
  onContactChange: () => void;
  onAddContact: () => void;
}

export const RecentContacts = ({
  contacts,
  isLoading,
  onContactChange,
  onAddContact
}: RecentContactsProps) => {
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleAddNote = (contact: Contact) => {
    setSelectedContact(contact);
    setIsAddNoteDialogOpen(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInsightsDialogOpen(true);
  };

  const handleInteractionAdded = async () => {
    setIsAddNoteDialogOpen(false);
    setSelectedContact(null);
    onContactChange();
  };

  return (
    <>
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAddNote={handleAddNote}
                onViewInsights={handleViewInsights}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md bg-muted/30">
            <p className="text-muted-foreground">No contacts added yet.</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={onAddContact}
            >
              Add your first contact
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? `Log Interaction with ${selectedContact.name}` : 'Log Interaction'}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <InteractionForm 
              contact={selectedContact}
              onSuccess={handleInteractionAdded}
              onCancel={() => {
                setIsAddNoteDialogOpen(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connection Insights</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ConnectionInsights 
              strength={
                selectedContact.connection_strength || 
                calculateConnectionStrength(selectedContact)
              } 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
