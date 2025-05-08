
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { Contact } from "@/types/contact";
import { calculateConnectionStrength } from "@/utils/connectionStrength";

interface InsightsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}

export const InsightsDialog = ({
  isOpen,
  onOpenChange,
  contact
}: InsightsDialogProps) => {
  if (!contact) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Insights</DialogTitle>
        </DialogHeader>
        <ConnectionInsights 
          strength={
            contact.connection_strength || 
            calculateConnectionStrength(contact)
          } 
        />
      </DialogContent>
    </Dialog>
  );
};
