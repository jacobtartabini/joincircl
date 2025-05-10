
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CalendarPlus } from "lucide-react";
import { calendarService, CalendarProvider } from "@/services/calendarService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Keystone } from "@/types/keystone";
import { Interaction, Contact } from "@/types/contact";

type EventType = 'keystone' | 'interaction';

interface CalendarExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: EventType;
  keystone?: Keystone;
  interaction?: Interaction;
  contact?: Contact;
  onSuccess?: () => void;
}

export function CalendarExportDialog({
  isOpen,
  onOpenChange,
  eventType,
  keystone,
  interaction,
  contact,
  onSuccess
}: CalendarExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Validate that we have the necessary data
  if ((eventType === 'keystone' && !keystone) || (eventType === 'interaction' && (!interaction || !contact))) {
    return null;
  }
  
  // Create event data based on event type
  const eventData = eventType === 'keystone' 
    ? calendarService.createEventFromKeystone(keystone!)
    : calendarService.createEventFromInteraction(interaction!, contact!.name);
  
  const handleExportToGoogle = async () => {
    setIsExporting(true);
    try {
      const success = await calendarService.addEventToGoogleCalendar(eventData);
      
      if (success) {
        toast({
          title: 'Event added',
          description: 'Successfully added to Google Calendar',
        });
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: 'Export failed',
          description: 'Failed to add event to Google Calendar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error exporting to Google Calendar:', error);
      toast({
        title: 'Export error',
        description: 'An error occurred while exporting to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportToApple = () => {
    const url = calendarService.generateAppleCalendarURL(eventData);
    window.open(url);
    toast({
      title: 'Apple Calendar',
      description: 'Calendar file downloaded for Apple Calendar',
    });
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };
  
  const handleExportToOutlook = () => {
    const url = calendarService.generateOutlookCalendarURL(eventData);
    window.open(url, '_blank');
    toast({
      title: 'Outlook Calendar',
      description: 'Redirecting to Outlook Calendar',
    });
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };
  
  const content = (
    <div className="space-y-6 py-4">
      <p className="text-sm text-muted-foreground">
        Export this {eventType === 'keystone' ? 'keystone' : 'interaction'} to your calendar:
      </p>
      
      <div className="p-4 border rounded-md bg-muted/30">
        <h3 className="font-medium">{eventData.title}</h3>
        <p className="text-sm text-muted-foreground">
          {new Date(eventData.start).toLocaleString()}
        </p>
        {eventData.description && (
          <p className="text-sm mt-2 line-clamp-2">{eventData.description}</p>
        )}
      </div>
      
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start p-4"
          disabled={isExporting}
          onClick={handleExportToGoogle}
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          <span>Add to Google Calendar</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start p-4"
          disabled={isExporting}
          onClick={handleExportToApple}
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          <span>Add to Apple Calendar</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start p-4" 
          disabled={isExporting}
          onClick={handleExportToOutlook}
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          <span>Add to Outlook Calendar</span>
        </Button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] pb-safe-area-bottom pt-6">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-xl">Export to Calendar</SheetTitle>
            <SheetDescription>
              Add this {eventType} to your calendar
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export to Calendar</DialogTitle>
          <DialogDescription>
            Add this {eventType} to your calendar
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
