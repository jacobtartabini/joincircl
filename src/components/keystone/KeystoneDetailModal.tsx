
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Keystone } from "@/types/keystone";
import { format } from "date-fns";
import { Calendar, CalendarPlus, Edit2, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  if (!keystone) return null;
  
  const content = (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 text-blue-800 p-3 rounded-md">
          <Calendar size={24} />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-medium">{keystone.title}</h2>
          <p className="text-muted-foreground">
            {format(new Date(keystone.date), 'PPP')}
            {keystone.category && ` · ${keystone.category}`}
          </p>
          
          {keystone.is_recurring && (
            <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded inline-flex items-center">
              Recurring: {keystone.recurrence_frequency}
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
      
      <div className="flex gap-2 justify-end pt-4">
        {onCalendarExport && (
          <Button variant="outline" size="sm" onClick={onCalendarExport}>
            <CalendarPlus size={16} className="mr-1" /> Add to Calendar
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 size={16} className="mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash2 size={16} className="mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[70vh]">
          {content}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {content}
      </DialogContent>
    </Dialog>
  );
}
