
import { supabase } from "@/integrations/supabase/client";
import { Keystone } from "@/types/keystone";

export const keystoneService = {
  async getKeystones(): Promise<Keystone[]> {
    const { data, error } = await supabase
      .from("keystones")
      .select("*")
      .order("date");

    if (error) {
      throw new Error(error.message);
    }

    return data as Keystone[];
  },

  async getKeystonesByContactId(contactId: string): Promise<Keystone[]> {
    const { data, error } = await supabase
      .from("keystones")
      .select("*")
      .eq("contact_id", contactId)
      .order("date");

    if (error) {
      throw new Error(error.message);
    }

    return data as Keystone[];
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
      category: keystone.category,
      contact_id: keystone.contact_id,
      is_recurring: keystone.is_recurring,
      recurrence_frequency: keystone.recurrence_frequency,
      notes: keystone.notes, // Keep this field but it will be ignored if the column doesn't exist
      user_id: userSession.session.user.id
    };
    
    const { data, error } = await supabase
      .from("keystones")
      .insert([keystoneToInsert])
      .select()
      .single();

    if (error) {
      console.error("Error creating keystone:", error);
      throw new Error(error.message);
    }

    return data as Keystone;
  },

  async updateKeystone(id: string, keystone: Partial<Keystone>): Promise<Keystone> {
    // Convert Date objects to ISO strings if they exist
    const keystoneToUpdate = { ...keystone };
    if (keystone.date && typeof keystone.date === 'object') {
      keystoneToUpdate.date = new Date(keystone.date).toISOString();
    }

    // Remove any fields that don't exist in the database
    // to prevent schema mismatch errors
    const safeKeystoneToUpdate = {
      title: keystoneToUpdate.title,
      date: keystoneToUpdate.date,
      category: keystoneToUpdate.category,
      contact_id: keystoneToUpdate.contact_id,
      is_recurring: keystoneToUpdate.is_recurring,
      recurrence_frequency: keystoneToUpdate.recurrence_frequency,
      notes: keystoneToUpdate.notes, // Keep this field but it will be ignored if the column doesn't exist
    };

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

    return data as Keystone;
  },

  async deleteKeystone(id: string): Promise<void> {
    const { error } = await supabase
      .from("keystones")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
};
