
import { supabase } from "@/integrations/supabase/client";
import { Contact, Interaction } from "@/types/contact";

export const contactService = {
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data as Contact[];
  },

  async getContact(id: string): Promise<Contact> {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Contact;
  },

  async getInteractionsByContactId(contactId: string): Promise<Interaction[]> {
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
    
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ ...formattedContact, user_id: userSession.session.user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Contact;
  },

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    // Convert Date objects to ISO strings if they exist
    const contactToUpdate = { ...contact };
    if (contact.last_contact && typeof contact.last_contact === 'object') {
      contactToUpdate.last_contact = new Date(contact.last_contact).toISOString();
    }

    const { data, error } = await supabase
      .from("contacts")
      .update(contactToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Contact;
  },

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async addInteraction(interaction: Omit<Interaction, "id" | "user_id" | "created_at">): Promise<Interaction> {
    const { data: userSession } = await supabase.auth.getSession();
    
    if (!userSession.session?.user.id) {
      throw new Error("User not authenticated");
    }
    
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
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
};
