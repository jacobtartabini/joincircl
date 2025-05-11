
import { useState } from "react";
import { ContactCard } from "@/components/ui/contact-card";
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import InteractionForm from "@/components/interaction/InteractionForm";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

  const interactionContent = (
    <>
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
    </>
  );
  
  const insightsContent = (
    <>
      {selectedContact && (
        <ConnectionInsights 
          strength={
            selectedContact.connection_strength || 
            calculateConnectionStrength(selectedContact)
          } 
        />
      )}
    </>
  );

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

      {/* Interaction Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto pt-6">
            <SheetHeader className="mb-4">
              <SheetTitle>
                {selectedContact ? `Log Interaction with ${selectedContact.name}` : 'Log Interaction'}
              </SheetTitle>
            </SheetHeader>
            {interactionContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedContact ? `Log Interaction with ${selectedContact.name}` : 'Log Interaction'}
              </DialogTitle>
            </DialogHeader>
            {interactionContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Insights Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto pt-6">
            <SheetHeader className="mb-4">
              <SheetTitle>Connection Insights</SheetTitle>
            </SheetHeader>
            {insightsContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connection Insights</DialogTitle>
            </DialogHeader>
            {insightsContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
