
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ContactForm from "@/components/contact/ContactForm";
import { Contact } from "@/types/contact";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  if (!contact) return null;

  const handleContactUpdate = async (updatedContact?: Contact, prevBirthday?: string | null) => {
    if (updatedContact) {
      await onContactUpdate(updatedContact, prevBirthday);
    }
    onOpenChange(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-auto">
          <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Contact</SheetTitle>
          </SheetHeader>
          <ContactForm
            contact={contact}
            onSuccess={handleContactUpdate}
            onCancel={() => onOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

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
