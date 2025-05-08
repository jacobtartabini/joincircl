
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { Contact } from "@/types/contact";

interface EditContactDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContactUpdate: (updatedContact: Contact, previousBirthday?: string | null) => Promise<void>;
}

export default function EditContactDialog({
  contact,
  isOpen,
  onOpenChange,
  onContactUpdate
}: EditContactDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        {contact && (
          <ContactForm
            contact={contact}
            onSuccess={(updatedContact, prevBirthday) => {
              if (updatedContact) {
                void onContactUpdate(updatedContact, prevBirthday);
              }
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
