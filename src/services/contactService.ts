
import { supabase } from "@/integrations/supabase/client";
import { Contact, Interaction } from "@/types/contact";
import { offlineStorage } from "./offlineStorage";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const contactService = {
  async getContacts(): Promise<Contact[]> {
    try {
      // Try to fetch from API first
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .order("name");
  
        if (error) {
          throw new Error(error.message);
        }
  
        // Cache the data for offline use
        if (data && data.length > 0) {
          // Ensure proper typing for circle property
          const typedContacts = data.map(contact => ({
            ...contact,
            circle: contact.circle as "inner" | "middle" | "outer"
          })) as Contact[];
          
          await offlineStorage.contacts.saveAll(typedContacts);
        }
        
        // Return typed contacts
        return (data || []).map(contact => ({
          ...contact,
          circle: contact.circle as "inner" | "middle" | "outer"
        })) as Contact[];
      } else {
        // Offline mode - get from local storage
        console.log("Offline: Loading contacts from local storage");
        const contacts = await offlineStorage.contacts.getAll();
        return contacts;
      }
    } catch (error) {
      console.error("Error in getContacts:", error);
      
      // If API call fails, try to load from local storage as fallback
      try {
        console.log("Falling back to local contacts data");
        const contacts = await offlineStorage.contacts.getAll();
        return contacts;
      } catch (offlineError) {
        console.error("Could not load contacts from offline storage:", offlineError);
        return [];
      }
    }
  },

  async getContact(id: string): Promise<Contact> {
    try {
      // Try API first if online
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", id)
          .single();
  
        if (error) {
          throw new Error(error.message);
        }
  
        // Cache this contact with proper typing
        if (data) {
          const typedContact = {
            ...data,
            circle: data.circle as "inner" | "middle" | "outer"
          } as Contact;
          
          await offlineStorage.contacts.save(typedContact);
        }
        
        // Return typed contact
        return {
          ...data,
          circle: data.circle as "inner" | "middle" | "outer"
        } as Contact;
      } else {
        // Try to get from local storage
        const contact = await offlineStorage.contacts.get(id);
        if (!contact) {
          throw new Error("Contact not found in offline storage");
        }
        return contact;
      }
    } catch (error) {
      console.error("Error in getContact:", error);
      
      // Fallback to local storage
      const contact = await offlineStorage.contacts.get(id);
      if (!contact) {
        throw new Error("Contact not found");
      }
      return contact;
    }
  },

  async getInteractionsByContactId(contactId: string): Promise<Interaction[]> {
    // For now, interactions aren't cached offline
    // Could be added in a future enhancement
    const { data, error } = await supabase
      .from("interactions")
      .select("*")
      .eq("contact_id", contactId)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as Interaction[];
  },

  async createContact(contact: Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">): Promise<Contact> {
    const { data: userSession } = await supabase.auth.getSession();
    
    if (!userSession.session?.user.id) {
      throw new Error("User not authenticated");
    }
    
    // Format the birthday to a date string if it exists
    const formattedContact = { ...contact };
    
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("contacts")
        .insert([{ ...formattedContact, user_id: userSession.session.user.id }])
        .select()
        .single();
  
      if (error) {
        throw new Error(error.message);
      }

      // Cache the new contact with proper typing
      if (data) {
        const typedContact = {
          ...data,
          circle: data.circle as "inner" | "middle" | "outer"
        } as Contact;
        
        await offlineStorage.contacts.save(typedContact);
      }
      
      // Return typed contact
      return {
        ...data,
        circle: data.circle as "inner" | "middle" | "outer"
      } as Contact;
    } else {
      // Offline operation - queue for later sync
      const tempContact = {
        ...formattedContact,
        id: `temp_${Date.now()}`,
        user_id: userSession.session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Contact;
      
      // Save to local storage
      await offlineStorage.contacts.save(tempContact);
      
      // Queue for sync when back online
      await offlineStorage.sync.queue('create', 'contacts', tempContact);
      
      return tempContact;
    }
  },

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    // Convert Date objects to ISO strings if they exist
    const contactToUpdate = { ...contact };
    if (contact.last_contact && typeof contact.last_contact === 'object') {
      contactToUpdate.last_contact = new Date(contact.last_contact).toISOString();
    }

    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("contacts")
        .update(contactToUpdate)
        .eq("id", id)
        .select()
        .single();
  
      if (error) {
        throw new Error(error.message);
      }
      
      // Update in local cache with proper typing
      if (data) {
        const typedContact = {
          ...data,
          circle: data.circle as "inner" | "middle" | "outer"
        } as Contact;
        
        await offlineStorage.contacts.save(typedContact);
      }
      
      // Return typed contact
      return {
        ...data,
        circle: data.circle as "inner" | "middle" | "outer"
      } as Contact;
    } else {
      // Offline update - get existing contact from storage
      const existingContact = await offlineStorage.contacts.get(id);
      if (!existingContact) {
        throw new Error("Cannot update: Contact not found in offline storage");
      }
      
      // Merge changes
      const updatedContact = {
        ...existingContact,
        ...contactToUpdate,
        updated_at: new Date().toISOString()
      };
      
      // Save locally
      await offlineStorage.contacts.save(updatedContact);
      
      // Queue for sync
      await offlineStorage.sync.queue('update', 'contacts', updatedContact);
      
      return updatedContact;
    }
  },

  async deleteContact(id: string): Promise<void> {
    if (navigator.onLine) {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);
  
      if (error) {
        throw new Error(error.message);
      }
      
      // Remove from local storage as well
      await offlineStorage.contacts.delete(id);
    } else {
      // Queue delete operation for when back online
      await offlineStorage.sync.queue('delete', 'contacts', { id });
      
      // Remove from local storage immediately
      await offlineStorage.contacts.delete(id);
    }
  },

  async addInteraction(interaction: Omit<Interaction, "id" | "user_id" | "created_at">): Promise<Interaction> {
    const { data: userSession } = await supabase.auth.getSession();
    
    if (!userSession.session?.user.id) {
      throw new Error("User not authenticated");
    }
    
    // Interactions require online connectivity for now
    // Could be enhanced to support offline in the future
    const { data, error } = await supabase
      .from("interactions")
      .insert([{ ...interaction, user_id: userSession.session.user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Interaction;
  },

  async deleteInteraction(id: string): Promise<void> {
    // Interactions require online connectivity for now
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },
  
  // Sync offline changes when app comes back online
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
      
      // After sync is complete, refresh the contacts list
      await this.getContacts();
      
    } catch (error) {
      console.error("Error during sync operation:", error);
      throw error;
    }
  }
};
