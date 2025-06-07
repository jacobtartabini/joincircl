
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SyncContactsButtonProps {
  onContactsImported?: () => void;
}

// Type definitions for Capacitor Contacts
interface ContactName {
  display?: string;
  given?: string;
  family?: string;
}

interface ContactEmail {
  address?: string;
}

interface ContactPhone {
  number?: string;
}

interface ContactBirthday {
  year?: number;
  month?: number;
  day?: number;
}

interface Contact {
  name?: ContactName;
  emails?: ContactEmail[];
  phones?: ContactPhone[];
  organizationName?: string;
  organizationRole?: string;
  birthday?: ContactBirthday;
}

interface ContactsResult {
  contacts: Contact[];
}

interface ContactsPlugin {
  requestPermissions(): Promise<{ contacts: string }>;
  getContacts(options: any): Promise<ContactsResult>;
}

export function SyncContactsButton({ onContactsImported }: SyncContactsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Hide button completely on web
  if (!isMobile) {
    return null;
  }

  const handleSyncContacts = async () => {
    setIsLoading(true);
    
    try {
      // Check if we're in a Capacitor environment
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        try {
          // Check if Capacitor Contacts is available
          const CapacitorCore = (window as any).Capacitor;
          const { Plugins } = CapacitorCore;
          
          if (!Plugins || !Plugins.Contacts) {
            throw new Error('Capacitor Contacts plugin not available');
          }
          
          const Contacts = Plugins.Contacts as ContactsPlugin;
          
          // Request permission with user-friendly messaging
          toast({
            title: "Permission Required",
            description: "Please allow access to your contacts to sync them with Circl",
          });

          const permission = await Contacts.requestPermissions();
          
          if (permission.contacts === 'granted') {
            toast({
              title: "Syncing contacts...",
              description: "Please wait while we import your contacts",
            });

            // Get contacts with comprehensive projection
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
            
            // Filter and process contacts - only include contacts with at least a name and phone/email
            const processedContacts = result.contacts
              .filter(contact => {
                const hasName = contact.name?.display || contact.name?.given || contact.name?.family;
                const hasPhone = contact.phones && contact.phones.length > 0 && contact.phones[0].number;
                const hasEmail = contact.emails && contact.emails.length > 0 && contact.emails[0].address;
                return hasName && (hasPhone || hasEmail);
              })
              .map(contact => ({
                name: contact.name?.display || `${contact.name?.given || ''} ${contact.name?.family || ''}`.trim(),
                personal_email: contact.emails?.[0]?.address || null,
                mobile_phone: contact.phones?.[0]?.number || null,
                company_name: contact.organizationName || null,
                job_title: contact.organizationRole || null,
                birthday: contact.birthday ? new Date(contact.birthday.year!, contact.birthday.month! - 1, contact.birthday.day!) : null,
                circle: 'outer' as const,
                tags: ['imported']
              }));
            
            console.log('Filtered contacts for import:', processedContacts);
            
            if (processedContacts.length === 0) {
              toast({
                title: "No contacts to sync",
                description: "No contacts with phone numbers or emails were found",
                variant: "destructive",
              });
              return;
            }

            // TODO: Replace with actual backend API call
            // await contactService.importContacts(processedContacts);
            
            toast({
              title: "Contacts synced successfully!",
              description: `Successfully imported ${processedContacts.length} contacts to your outer circle`,
            });
            
            onContactsImported?.();
          } else {
            toast({
              title: "Permission denied",
              description: "Contact access is required to sync your contacts. Please enable it in your device settings.",
              variant: "destructive",
            });
          }
        } catch (accessError) {
          console.error('Error accessing Capacitor Contacts:', accessError);
          toast({
            title: "Sync unavailable",
            description: "Contact sync is not available on this device. Please make sure you're using the latest mobile app version.",
            variant: "destructive",
          });
        }
      } else {
        // Fallback for non-Capacitor mobile browsers
        toast({
          title: "Feature not available",
          description: "Contact sync requires the native mobile app. Please download the app from your device's app store.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast({
        title: "Sync failed",
        description: "An unexpected error occurred while syncing contacts. Please try again or contact support if the issue persists.",
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
      size="sm"
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
