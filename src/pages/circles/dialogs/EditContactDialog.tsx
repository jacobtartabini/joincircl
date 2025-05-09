
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ContactForm from "@/components/contact/ContactForm";
import { Contact } from "@/types/contact";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditContactDialog({
  isOpen,
  onOpenChange,
  contact,
  onSuccess,
  onCancel,
}: EditContactDialogProps) {
  const isMobile = useIsMobile();
  
  if (!contact) return null;

  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  // For mobile devices, use Sheet (full-screen)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Edit Contact</SheetTitle>
            <SheetDescription>
              Edit information for {contact.name}
            </SheetDescription>
          </SheetHeader>
          <ContactForm
            contact={contact}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop devices, use Dialog (modal)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Edit information for {contact.name}
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          contact={contact}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
