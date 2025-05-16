
import { contactService } from "@/services/contactService";
import { keystoneService } from "@/services/keystoneService";
import { useToast } from "@/hooks/use-toast";

// This utility handles synchronizing data when the app comes back online
export const syncOfflineChanges = async () => {
  if (!navigator.onLine) return false;
  
  try {
    console.log("Starting offline data synchronization...");
    
    // First sync contacts
    await contactService.syncOfflineChanges();
    
    // Then sync interactions
    await contactService.syncOfflineInteractions();
    
    // Then sync keystones
    await keystoneService.syncOfflineKeystones();
    
    console.log("Sync completed successfully");
    return true;
  } catch (error) {
    console.error("Error during sync:", error);
    return false;
  }
};

// Hook to use in components that need to handle online/offline state
export const useSyncManager = () => {
  const { toast } = useToast();
  
  const handleOnlineStatusChange = async (isOnline: boolean) => {
    if (isOnline) {
      toast({
        title: "You're back online",
        description: "Syncing your offline changes...",
      });
      
      const success = await syncOfflineChanges();
      
      if (success) {
        toast({
          title: "Sync complete",
          description: "All your changes have been synchronized",
        });
      } else {
        toast({
          title: "Sync issue",
          description: "Some changes couldn't be synchronized. Please check your data.",
          variant: "destructive"
        });
      }
    }
  };
  
  return { handleOnlineStatusChange };
};
