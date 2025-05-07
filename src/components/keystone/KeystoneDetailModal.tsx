
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

interface KeystoneDetailModalProps {
  keystone: Keystone | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{keystone.title}</DialogTitle>
            <DialogDescription>
              {keystone.date && format(new Date(keystone.date), "PPP")}
            </DialogDescription>
          </DialogHeader>
          
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
            <AlertDialogTitle>Delete this keystone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this keystone.
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
