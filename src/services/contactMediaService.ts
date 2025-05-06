
import { supabase } from "@/integrations/supabase/client";
import { ContactMedia } from "@/types/contact";

export const contactMediaService = {
  async getContactMedia(contactId: string): Promise<ContactMedia[]> {
    const { data, error } = await supabase
      .from("contact_media")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at");

    if (error) {
      throw new Error(error.message);
    }

    // Get URLs for each file
    const mediaWithUrls = await Promise.all(
      data.map(async (media) => {
        const { data: urlData } = await supabase
          .storage
          .from("contact_media")
          .createSignedUrl(media.storage_path, 60 * 60); // 1 hour expiry

        return {
          ...media,
          url: urlData?.signedUrl
        } as ContactMedia;
      })
    );

    return mediaWithUrls;
  },

  async uploadContactMedia(
    contactId: string,
    file: File,
    isImage: boolean
  ): Promise<ContactMedia> {
    const { data: userSession } = await supabase.auth.getSession();
    
    if (!userSession.session?.user.id) {
      throw new Error("User not authenticated");
    }

    const userId = userSession.session.user.id;
    const filePath = `${userId}/${contactId}/${Date.now()}_${file.name}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase
      .storage
      .from("contact_media")
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    // Create record in contact_media table
    const { data, error } = await supabase
      .from("contact_media")
      .insert([{
        contact_id: contactId,
        user_id: userId,
        file_name: file.name,
        file_type: file.type,
        storage_path: filePath,
        is_image: isImage
      }])
      .select()
      .single();

    if (error) {
      // Delete the uploaded file if record creation failed
      await supabase
        .storage
        .from("contact_media")
        .remove([filePath]);
      
      throw new Error(`Error creating media record: ${error.message}`);
    }

    // Get URL for the file
    const { data: urlData } = await supabase
      .storage
      .from("contact_media")
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    return {
      ...data,
      url: urlData?.signedUrl
    } as ContactMedia;
  },

  async deleteContactMedia(id: string): Promise<void> {
    const { data, error: fetchError } = await supabase
      .from("contact_media")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching media record: ${fetchError.message}`);
    }

    // Delete file from storage
    const { error: removeError } = await supabase
      .storage
      .from("contact_media")
      .remove([data.storage_path]);

    if (removeError) {
      console.error(`Error removing file from storage: ${removeError.message}`);
      // Continue with record deletion even if file removal fails
    }

    // Delete record from contact_media table
    const { error } = await supabase
      .from("contact_media")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting media record: ${error.message}`);
    }
  }
};
