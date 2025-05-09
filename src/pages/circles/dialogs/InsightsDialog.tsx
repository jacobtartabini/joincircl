
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Contact } from "@/types/contact";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { useIsMobile } from "@/hooks/use-mobile";

interface InsightsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}

export function InsightsDialog({
  isOpen,
  onOpenChange,
  contact,
}: InsightsDialogProps) {
  const isMobile = useIsMobile();

  if (!contact) return null;

  // For mobile devices, use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Connection Insights</SheetTitle>
            <SheetDescription>
              View your connection insights with {contact.name}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <ConnectionInsights strength={contact.connection_strength} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop devices, use Dialog (modal)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Connection Insights</DialogTitle>
          <DialogDescription>
            View your connection insights with {contact.name}
          </DialogDescription>
        </DialogHeader>
        <ConnectionInsights strength={contact.connection_strength} />
      </DialogContent>
    </Dialog>
  );
}
