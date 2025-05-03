
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

    return data || [];
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

    return data;
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

    return data || [];
  },

  async createContact(contact: Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">): Promise<Contact> {
    const { data, error } = await supabase
      .from("contacts")
      .insert([contact])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from("contacts")
      .update(contact)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
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
    const { data, error } = await supabase
      .from("interactions")
      .insert([interaction])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};
