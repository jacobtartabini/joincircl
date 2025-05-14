
import { Contact } from "@/types/contact";
import { offlineStorage } from "../offlineStorage";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles syncing offline changes when app comes back online
 */
export const offlineSync = {
  /**
   * Sync offline changes when app comes back online
   */
  async syncOfflineChanges(): Promise<void> {
    // Only attempt sync if online
    if (!navigator.onLine) return;
    
    try {
      // Get all pending sync operations
      const pendingOps = await offlineStorage.sync.getPending();
      
      for (const op of pendingOps) {
        try {
          const { id, operation, storeName, data } = op;
          
          if (storeName === 'contacts') {
            switch (operation) {
              case 'create':
                // Handle temp IDs
                const tempId = data.id;
                if (tempId.startsWith('temp_')) {
                  delete data.id; // Let Supabase generate a real ID
                }
                
                const { data: newData, error: createError } = await supabase
                  .from("contacts")
                  .insert([data])
                  .select()
                  .single();
                
                if (createError) throw createError;
                
                // Replace temp contact with real one with proper typing
                if (tempId.startsWith('temp_')) {
                  await offlineStorage.contacts.delete(tempId);
                  
                  const typedContact = {
                    ...newData,
                    circle: newData.circle as "inner" | "middle" | "outer"
                  } as Contact;
                  
                  await offlineStorage.contacts.save(typedContact);
                }
                break;
                
              case 'update':
                // Only send fields that should be updated
                const { id: updateId, ...updateFields } = data;
                
                const { error: updateError } = await supabase
                  .from("contacts")
                  .update(updateFields)
                  .eq("id", updateId);
                  
                if (updateError) throw updateError;
                break;
                
              case 'delete':
                const { error: deleteError } = await supabase
                  .from("contacts")
                  .delete()
                  .eq("id", data.id);
                  
                if (deleteError) throw deleteError;
                break;
            }
          }
          
          // Clear the sync operation once completed
          await offlineStorage.sync.clearOp(id);
          
        } catch (opError) {
          console.error(`Error syncing operation:`, op, opError);
          // Continue with next operation even if this one failed
        }
      }
      
    } catch (error) {
      console.error("Error during sync operation:", error);
      throw error;
    }
  }
};
