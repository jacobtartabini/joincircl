
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InteractionForm from "@/components/interaction/InteractionForm";
import { Contact } from "@/types/contact";

interface InteractionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InteractionDialog = ({
  isOpen,
  onOpenChange,
  contact,
  onSuccess,
  onCancel
}: InteractionDialogProps) => {
  if (!contact) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {`Log Interaction with ${contact.name}`}
          </DialogTitle>
        </DialogHeader>
        <InteractionForm
          contact={contact}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
