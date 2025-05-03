
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
    
    const { data, error } = await supabase
      .from("keystones")
      .insert([{ ...keystone, user_id: userSession.session.user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Keystone;
  },

  async updateKeystone(id: string, keystone: Partial<Keystone>): Promise<Keystone> {
    // Convert Date objects to ISO strings if they exist
    const keystoneToUpdate = { ...keystone };
    if (keystone.date && keystone.date instanceof Date) {
      keystoneToUpdate.date = keystone.date.toISOString();
    }

    const { data, error } = await supabase
      .from("keystones")
      .update(keystoneToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
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
