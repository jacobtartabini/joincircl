
import { Contact, Interaction } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "../offlineStorage";

/**
 * Handles creating, updating and deleting contacts
 */
export const contactMutations = {
  /**
   * Create a new contact
   */
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

  /**
   * Update an existing contact
   */
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

  /**
   * Delete a contact
   */
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

  /**
   * Add a new interaction
   */
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

    return data;
  },

  /**
   * Delete an interaction
   */
  async deleteInteraction(id: string): Promise<void> {
    // Interactions require online connectivity for now
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
};
