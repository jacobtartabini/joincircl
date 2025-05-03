
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

    return data || [];
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

    return data || [];
  },

  async createKeystone(keystone: Omit<Keystone, "id" | "user_id" | "created_at" | "updated_at">): Promise<Keystone> {
    const { data, error } = await supabase
      .from("keystones")
      .insert([keystone])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateKeystone(id: string, keystone: Partial<Keystone>): Promise<Keystone> {
    const { data, error } = await supabase
      .from("keystones")
      .update(keystone)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
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
