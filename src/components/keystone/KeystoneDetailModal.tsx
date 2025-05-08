import { Keystone } from "@/types/keystone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash, Calendar, Repeat } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeystoneDetailModalProps {
  keystone: Keystone | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
}

export default function KeystoneDetailModal({
  keystone,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: KeystoneDetailModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!keystone) return null;
  
  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    await onDelete();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{keystone.title}</DialogTitle>
            <DialogDescription>
              {keystone.date && format(new Date(keystone.date), "PPP")}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="pr-4 max-h-[60vh]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {keystone.category && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar size={14} />
                    {keystone.category}
                  </Badge>
                )}
                
                {keystone.is_recurring && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Repeat size={14} />
                    Recurring {keystone.recurrence_frequency && `(${keystone.recurrence_frequency})`}
                  </Badge>
                )}
              </div>
              
              {keystone.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm whitespace-pre-wrap">{keystone.notes}</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2 pt-4 mt-auto">
            <Button variant="outline" onClick={onEdit} className="flex gap-1 items-center">
              <Edit size={16} /> Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onDelete()}
              className="flex gap-1 items-center"
            >
              <Trash size={16} /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this keystone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this keystone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
