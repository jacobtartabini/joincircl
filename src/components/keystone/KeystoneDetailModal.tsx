
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Keystone } from "@/types/keystone";
import { format } from "date-fns";
import { CalendarPlus, Edit2, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface KeystoneDetailModalProps {
  keystone: Keystone | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCalendarExport?: () => void;
}

export default function KeystoneDetailModal({
  keystone,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  onCalendarExport
}: KeystoneDetailModalProps) {
  const isMobile = useIsMobile();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  if (!keystone) return null;
  
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
        <p>Are you sure you want to delete this keystone?</p>
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
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 text-blue-800 p-3 rounded-md">
          <CalendarDays size={24} />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-medium">{keystone.title}</h2>
          <p className="text-muted-foreground">
            {format(new Date(keystone.date), 'PPP')}
            {keystone.category && ` · ${keystone.category}`}
          </p>
          
          {keystone.is_recurring && (
            <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded inline-flex items-center">
              Recurring: {keystone.recurrence_frequency || 'Monthly'}
            </div>
          )}
          
          {keystone.contact_name && (
            <div className="mt-2 text-sm">
              Contact: {keystone.contact_name}
            </div>
          )}
        </div>
      </div>
      
      {keystone.notes && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Notes</h3>
          <p className="text-sm whitespace-pre-wrap">{keystone.notes}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        {onCalendarExport && (
          <Button variant="outline" size={isMobile ? "lg" : "sm"} onClick={onCalendarExport} className={isMobile ? "w-full" : ""}>
            <CalendarPlus size={16} className="mr-1" /> Add to Calendar
          </Button>
        )}
        <Button variant="outline" size={isMobile ? "lg" : "sm"} onClick={onEdit} className={isMobile ? "w-full" : ""}>
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
              <h3 className="text-xl font-semibold mb-4">Delete Keystone</h3>
              {deleteConfirmContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Keystone</AlertDialogTitle>
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

// Import the missing CalendarDays icon
import { Calendar as CalendarDays, CalendarPlus, Edit2, Trash2 } from "lucide-react";
