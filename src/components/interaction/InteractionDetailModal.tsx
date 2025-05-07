
import { Interaction } from "@/types/contact";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash } from "lucide-react";
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

interface InteractionDetailModalProps {
  interaction: Interaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void | Promise<void>; // Accept either void or Promise<void>
}

export default function InteractionDetailModal({
  interaction,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: InteractionDetailModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!interaction) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{interaction.type} Interaction</DialogTitle>
            <DialogDescription>
              {interaction.date && format(new Date(interaction.date), "PPP")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {interaction.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notes</h3>
                <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {interaction.notes}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onEdit} className="flex gap-1 items-center">
                <Edit size={16} /> Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex gap-1 items-center"
              >
                <Trash size={16} /> Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this interaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this interaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                onDelete();
              }}
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
