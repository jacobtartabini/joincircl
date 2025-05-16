
import { supabase } from "@/integrations/supabase/client";
import { Keystone } from "@/types/keystone";
import { offlineStorage } from "./offlineStorage";
import { v4 as uuidv4 } from "uuid";

export const keystoneService = {
  async getKeystones(): Promise<Keystone[]> {
    try {
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("keystones")
          .select("*")
          .order("date");

        if (error) {
          throw new Error(error.message);
        }

        // Cache keystones for offline use
        if (data && data.length > 0) {
          await offlineStorage.keystones.saveAll(data);
        }

        return data as Keystone[];
      } else {
        // Offline mode - get from local storage
        console.log("Offline: Loading keystones from local storage");
        return await offlineStorage.keystones.getAll();
      }
    } catch (error) {
      console.error("Error in getKeystones:", error);
      
      // If API call fails, try to load from local storage as fallback
      try {
        console.log("Falling back to local keystones data");
        return await offlineStorage.keystones.getAll();
      } catch (offlineError) {
        console.error("Could not load keystones from offline storage:", offlineError);
        return [];
      }
    }
  },

  async getKeystonesByContactId(contactId: string): Promise<Keystone[]> {
    try {
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("keystones")
          .select("*")
          .eq("contact_id", contactId)
          .order("date");

        if (error) {
          throw new Error(error.message);
        }

        // Cache keystones for this contact
        if (data && data.length > 0) {
          for (const keystone of data) {
            await offlineStorage.keystones.save(keystone);
          }
        }

        return data as Keystone[];
      } else {
        // Offline mode - get from local storage
        console.log("Offline: Loading keystones for contact from local storage");
        return await offlineStorage.keystones.getByContactId(contactId);
      }
    } catch (error) {
      console.error("Error in getKeystonesByContactId:", error);
      
      // If API call fails, try to load from local storage as fallback
      try {
        console.log("Falling back to local keystones data for contact");
        return await offlineStorage.keystones.getByContactId(contactId);
      } catch (offlineError) {
        console.error("Could not load keystones from offline storage:", offlineError);
        return [];
      }
    }
  },

  async createKeystone(keystone: Omit<Keystone, "id" | "user_id" | "created_at" | "updated_at">): Promise<Keystone> {
    const { data: userSession } = await supabase.auth.getSession();
    
    if (!userSession.session?.user.id) {
      throw new Error("User not authenticated");
    }

    // Ensure we're only sending fields that exist in the database
    const keystoneToInsert = {
      title: keystone.title,
      date: keystone.date,
      due_date: keystone.due_date,
      category: keystone.category,
      contact_id: keystone.contact_id,
      is_recurring: keystone.is_recurring,
      recurrence_frequency: keystone.recurrence_frequency,
      notes: keystone.notes,
      user_id: userSession.session.user.id
    };
    
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("keystones")
        .insert([keystoneToInsert])
        .select()
        .single();

      if (error) {
        console.error("Error creating keystone:", error);
        throw new Error(error.message);
      }

      // Cache for offline use
      if (data) {
        await offlineStorage.keystones.save(data as Keystone);
      }
      
      return data as Keystone;
    } else {
      // Offline operation - create temporary keystone
      const tempKeystone = {
        ...keystoneToInsert,
        id: `temp_${uuidv4()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Keystone;
      
      // Save locally
      await offlineStorage.keystones.save(tempKeystone);
      
      // Queue for sync
      await offlineStorage.sync.queue('create', 'keystones', tempKeystone);
      
      return tempKeystone;
    }
  },

  async updateKeystone(id: string, keystone: Partial<Keystone>): Promise<Keystone> {
    // Remove any fields that don't exist in the database
    // to prevent schema mismatch errors
    const safeKeystoneToUpdate = {
      title: keystone.title,
      date: keystone.date,
      due_date: keystone.due_date,
      category: keystone.category,
      contact_id: keystone.contact_id,
      is_recurring: keystone.is_recurring,
      recurrence_frequency: keystone.recurrence_frequency,
      notes: keystone.notes,
    };

    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("keystones")
        .update(safeKeystoneToUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating keystone:", error);
        throw new Error(error.message);
      }

      // Update in local cache
      if (data) {
        await offlineStorage.keystones.save(data as Keystone);
      }
      
      return data as Keystone;
    } else {
      // Offline update - get existing keystone
      const existingKeystone = await offlineStorage.keystones.get(id);
      if (!existingKeystone) {
        throw new Error("Cannot update: Keystone not found in offline storage");
      }
      
      // Merge changes
      const updatedKeystone = {
        ...existingKeystone,
        ...safeKeystoneToUpdate,
        updated_at: new Date().toISOString()
      };
      
      // Save locally
      await offlineStorage.keystones.save(updatedKeystone);
      
      // Queue for sync
      await offlineStorage.sync.queue('update', 'keystones', updatedKeystone);
      
      return updatedKeystone;
    }
  },

  async deleteKeystone(id: string): Promise<void> {
    if (navigator.onLine) {
      const { error } = await supabase
        .from("keystones")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
      
      // Remove from local storage as well
      await offlineStorage.keystones.delete(id);
    } else {
      // Queue delete operation for when back online
      await offlineStorage.sync.queue('delete', 'keystones', { id });
      
      // Remove from local storage immediately
      await offlineStorage.keystones.delete(id);
    }
  },
  
  // Sync offline changes when app comes back online
  async syncOfflineKeystones(): Promise<void> {
    if (!navigator.onLine) return;
    
    try {
      // Get all pending sync operations for keystones
      const pendingOps = await offlineStorage.sync.getPending();
      const keystoneOps = pendingOps.filter(op => op.storeName === 'keystones');
      
      for (const op of keystoneOps) {
        try {
          const { id, operation, data } = op;
          
          switch (operation) {
            case 'create':
              // Handle temp IDs
              const tempId = data.id;
              if (tempId.startsWith('temp_')) {
                delete data.id; // Let Supabase generate a real ID
              }
              
              const { data: newData, error: createError } = await supabase
                .from("keystones")
                .insert([data])
                .select()
                .single();
              
              if (createError) throw createError;
              
              // Replace temp keystone with real one
              if (tempId.startsWith('temp_')) {
                await offlineStorage.keystones.delete(tempId);
                await offlineStorage.keystones.save(newData);
              }
              break;
              
            case 'update':
              // Only send fields that should be updated
              const { id: updateId, ...updateFields } = data;
              
              const { error: updateError } = await supabase
                .from("keystones")
                .update(updateFields)
                .eq("id", updateId);
                
              if (updateError) throw updateError;
              break;
              
            case 'delete':
              const { error: deleteError } = await supabase
                .from("keystones")
                .delete()
                .eq("id", data.id);
                
              if (deleteError) throw deleteError;
              break;
          }
          
          // Clear the sync operation once completed
          await offlineStorage.sync.clearOp(id);
          
        } catch (opError) {
          console.error(`Error syncing keystone operation:`, op, opError);
        }
      }
    } catch (error) {
      console.error("Error during keystone sync operation:", error);
      throw error;
    }
  }
};
