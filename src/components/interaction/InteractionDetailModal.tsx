
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Interaction } from "@/types/contact";
import { format } from "date-fns";
import { CalendarPlus, Edit2, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

interface InteractionDetailModalProps {
  interaction: Interaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCalendarExport?: () => void;
}

export default function InteractionDetailModal({
  interaction,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  onCalendarExport
}: InteractionDetailModalProps) {
  const isMobile = useIsMobile();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  if (!interaction) return null;
  
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'meeting':
        return '🤝';
      case 'note':
        return '📝';
      default:
        return '📋';
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    onDelete();
  };
  
  const deleteConfirmContent = (
    <>
      <div className="space-y-2 py-2">
        <p>Are you sure you want to delete this interaction?</p>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
      </div>
      <div className={`flex ${isMobile ? "flex-col-reverse space-y-reverse space-y-2" : "justify-end space-x-2"} pt-4`}>
        <Button 
          variant="outline" 
          onClick={() => setIsDeleteConfirmOpen(false)}
          className={isMobile ? "w-full" : ""}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleConfirmDelete}
          className={isMobile ? "w-full" : ""}
        >
          Delete
        </Button>
      </div>
    </>
  );
  
  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getInteractionIcon(interaction.type)}</div>
          <div>
            <h2 className="text-xl font-medium capitalize">{interaction.type}</h2>
            <p className="text-muted-foreground">
              {format(new Date(interaction.date), 'PPP')}
            </p>
          </div>
        </div>
      </div>
      
      {interaction.notes && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Notes</h3>
          <p className="text-sm whitespace-pre-wrap">{interaction.notes}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        {onCalendarExport && (
          <Button 
            variant="outline" 
            size={isMobile ? "lg" : "sm"} 
            onClick={onCalendarExport}
            className={isMobile ? "w-full" : ""}
          >
            <CalendarPlus size={16} className="mr-1" /> Add to Calendar
          </Button>
        )}
        <Button 
          variant="outline" 
          size={isMobile ? "lg" : "sm"} 
          onClick={onEdit}
          className={isMobile ? "w-full" : ""}
        >
          <Edit2 size={16} className="mr-1" /> Edit
        </Button>
        <Button 
          variant="outline"
          size={isMobile ? "lg" : "sm"} 
          className={`${isMobile ? "w-full" : ""} text-red-600 hover:bg-red-50`} 
          onClick={handleDeleteClick}
        >
          <Trash2 size={16} className="mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
  
  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="sheet-mobile max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
            {content}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            {content}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <SheetContent side="bottom" className="sheet-mobile py-6">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
            <div className="px-2">
              <h3 className="text-xl font-semibold mb-4">Delete Interaction</h3>
              {deleteConfirmContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Interaction</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteConfirmContent}
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
