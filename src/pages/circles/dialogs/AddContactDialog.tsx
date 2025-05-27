
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ContactForm from "@/components/contact/ContactForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserPlus } from "lucide-react";

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
        <SheetContent side="bottom" className="h-[95vh] overflow-auto bg-white rounded-t-2xl">
          <div className="mx-auto -mt-1 mb-6 h-1.5 w-[60px] rounded-full bg-gray-300" />
          <SheetHeader className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <SheetTitle className="text-2xl font-bold text-gray-900">Add Contact</SheetTitle>
            <SheetDescription className="text-gray-600 text-base">
              Add a new contact to your circles
            </SheetDescription>
          </SheetHeader>
          <div className="px-2">
            <ContactForm
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop devices, use Dialog (modal)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto bg-white border-0 shadow-xl rounded-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Add Contact</DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
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
