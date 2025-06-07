
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SyncContactsButtonProps {
  onContactsImported?: () => void;
}

export function SyncContactsButton({ onContactsImported }: SyncContactsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSyncContacts = async () => {
    setIsLoading(true);
    
    try {
      // Check if we're in a mobile app environment (Capacitor)
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        // Import Capacitor Contacts plugin dynamically
        const { Contacts } = await import('@capacitor/contacts');
        
        // Request permission
        const permission = await Contacts.requestPermissions();
        
        if (permission.contacts === 'granted') {
          // Get contacts
          const result = await Contacts.getContacts({
            projection: {
              name: true,
              phones: true,
              emails: true,
              photos: true,
              birthday: true,
              organizationName: true,
              organizationRole: true
            }
          });
          
          // Process contacts and send to backend
          const processedContacts = result.contacts.map(contact => ({
            name: contact.name?.display || `${contact.name?.given || ''} ${contact.name?.family || ''}`.trim(),
            personal_email: contact.emails?.[0]?.address || null,
            mobile_phone: contact.phones?.[0]?.number || null,
            company_name: contact.organizationName || null,
            job_title: contact.organizationRole || null,
            birthday: contact.birthday ? new Date(contact.birthday.year!, contact.birthday.month! - 1, contact.birthday.day!) : null,
            circle: 'outer' as const,
            tags: ['imported']
          }));
          
          // TODO: Send processedContacts to backend to create new contacts
          console.log('Contacts to import:', processedContacts);
          
          toast({
            title: "Contacts synced successfully",
            description: `Found ${processedContacts.length} contacts to import`,
          });
          
          onContactsImported?.();
        } else {
          toast({
            title: "Permission denied",
            description: "Contact access is required to sync your contacts",
            variant: "destructive",
          });
        }
      } else {
        // Web fallback - show info message
        toast({
          title: "Feature not available",
          description: "Contact sync is only available in the mobile app",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast({
        title: "Sync failed",
        description: "Unable to sync contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSyncContacts}
      disabled={isLoading}
      variant="outline"
      size={isMobile ? "sm" : "default"}
      className="unified-button flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Users className="h-4 w-4" />
      )}
      {isLoading ? "Syncing..." : "Sync Contacts"}
    </Button>
  );
}
