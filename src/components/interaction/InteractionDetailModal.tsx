
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Interaction } from "@/types/contact";
import { format } from "date-fns";
import { CalendarPlus, Edit2, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
