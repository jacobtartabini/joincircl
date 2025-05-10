
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CalendarPlus, Check } from "lucide-react";
import { calendarService, CalendarProvider } from "@/services/calendarService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

export function CalendarConnectionDialog({
  isOpen,
  onOpenChange,
  onConnected
}: CalendarConnectionDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<CalendarProvider[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const success = await calendarService.connectGoogleCalendar();
      
      if (success) {
        setConnectedProviders(prev => [...prev, 'google']);
        toast({
          title: 'Connected',
          description: 'Successfully connected to Google Calendar',
        });
        if (onConnected) onConnected();
      } else {
        toast({
          title: 'Connection failed',
          description: 'Failed to connect to Google Calendar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: 'Connection error',
        description: 'An error occurred while connecting to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDownloadCalendar = (provider: 'apple' | 'outlook') => {
    toast({
      title: 'Calendar Export',
      description: `You'll be able to export events to ${provider === 'apple' ? 'Apple' : 'Outlook'} Calendar individually.`,
    });
    onOpenChange(false);
  };
  
  const content = (
    <div className="space-y-6 py-4">
      <p className="text-sm text-muted-foreground">
        Connect your calendar to sync events and interactions. This allows you to easily 
        keep track of upcoming meetings and important dates.
      </p>
      
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start p-6 text-left"
          disabled={isConnecting || connectedProviders.includes('google')}
          onClick={handleConnectGoogle}
        >
          {connectedProviders.includes('google') ? (
            <Check className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <CalendarPlus className="mr-2 h-5 w-5" />
          )}
          <div>
            <div className="font-medium">Google Calendar</div>
            <div className="text-xs text-muted-foreground">
              {connectedProviders.includes('google') 
                ? 'Connected to Google Calendar' 
                : 'Connect to your Google Calendar account'}
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start p-6 text-left"
          onClick={() => handleDownloadCalendar('apple')}
        >
          <CalendarPlus className="mr-2 h-5 w-5" />
          <div>
            <div className="font-medium">Apple Calendar</div>
            <div className="text-xs text-muted-foreground">
              Export events to Apple Calendar
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start p-6 text-left"
          onClick={() => handleDownloadCalendar('outlook')}
        >
          <CalendarPlus className="mr-2 h-5 w-5" />
          <div>
            <div className="font-medium">Outlook Calendar</div>
            <div className="text-xs text-muted-foreground">
              Export events to Outlook Calendar
            </div>
          </div>
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground mt-6">
        <p>Calendar integration allows you to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Sync keystones as calendar events</li>
          <li>Get reminders for upcoming interactions</li>
          <li>Keep your calendar updated with your networking activities</li>
        </ul>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] pb-safe-area-bottom pt-6">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-xl">Connect Calendar</SheetTitle>
            <SheetDescription>
              Keep your calendar in sync with your connections
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
          <DialogTitle>Connect Calendar</DialogTitle>
          <DialogDescription>
            Keep your calendar in sync with your connections
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
