
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ContactForm from "@/components/contact/ContactForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddContactDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddContactDialogProps) {
  const isMobile = useIsMobile();
  
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  // For mobile devices, use Sheet (slide-in from bottom)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-auto">
          <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
          <SheetHeader className="mb-4">
            <SheetTitle>Add Contact</SheetTitle>
            <SheetDescription>
              Add a new contact to your circles
            </SheetDescription>
          </SheetHeader>
          <ContactForm
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
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
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your circles
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
