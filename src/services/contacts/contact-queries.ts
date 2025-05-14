
import { Contact } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "../offlineStorage";

/**
 * Handles fetching contacts from the database or local storage
 */
export const contactQueries = {
  /**
   * Get all contacts for the current user
   */
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

  /**
   * Get a single contact by ID
   */
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

  /**
   * Get interactions for a specific contact
   */
  async getInteractionsByContactId(contactId: string) {
    // For now, interactions aren't cached offline
    const { data, error } = await supabase
      .from("interactions")
      .select("*")
      .eq("contact_id", contactId)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};
