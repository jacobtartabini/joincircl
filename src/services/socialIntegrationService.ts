
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contact";
import { SocialPlatform, SocialProfile, SocialPost, SocialIntegrationStatus, SocialSyncResult } from "@/types/socialIntegration";

export const socialIntegrationService = {
  // Get all social profiles for a user
  async getUserSocialIntegrations(): Promise<SocialIntegrationStatus[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("User not authenticated");
      }

      // Get real social integrations from the database
      const { data: integrations, error } = await supabase
        .from('user_social_integrations')
        .select('platform, username, last_synced, sync_enabled')
        .eq('user_id', session.session.user.id);

      if (error) {
        console.error("Error getting user social integrations:", error);
        return [];
      }

      // Convert to expected format
      return (integrations || []).map(integration => ({
        platform: integration.platform as SocialPlatform,
        connected: true,
        username: integration.username,
        last_synced: integration.last_synced
      }));
    } catch (error) {
      console.error("Error getting user social integrations:", error);
      return [];
    }
  },

  // Connect to a social platform (handled by OAuth flows)
  async connectSocialPlatform(platform: SocialPlatform): Promise<SocialIntegrationStatus> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("User not authenticated");
      }

      // For Twitter, trigger OAuth flow
      if (platform === 'twitter') {
        // This should trigger the Twitter OAuth dialog
        // The actual connection happens in the TwitterAuthDialog component
        return {
          platform,
          connected: false,
          error: 'OAuth flow required'
        };
      }

      // Other platforms not implemented yet
      return {
        platform,
        connected: false,
        error: 'Platform not supported yet'
      };
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      return {
        platform,
        connected: false,
        error: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },

  // Disconnect from a platform
  async disconnectSocialPlatform(platform: SocialPlatform): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('user_social_integrations')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('platform', platform);

      if (error) {
        throw new Error(`Failed to disconnect from ${platform}: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      throw error;
    }
  },

  // Sync contacts from a platform
  async syncContactsFromPlatform(platform: SocialPlatform): Promise<SocialSyncResult> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("User not authenticated");
      }

      if (platform === 'twitter') {
        const { data, error } = await supabase.functions.invoke('twitter-sync', {
          body: {
            action: 'sync'
          }
        });

        if (error) {
          throw new Error(`Twitter sync failed: ${error.message}`);
        }

        return {
          contacts_imported: 0,
          contacts_updated: 0,
          posts_fetched: data?.results?.tweets || 0,
          errors: data?.results?.errors || []
        };
      }

      // Other platforms not implemented yet
      return {
        contacts_imported: 0,
        contacts_updated: 0,
        posts_fetched: 0,
        errors: ['Platform not supported yet']
      };
    } catch (error) {
      console.error(`Error syncing contacts from ${platform}:`, error);
      return {
        contacts_imported: 0,
        contacts_updated: 0,
        posts_fetched: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  },

  // Fetch and summarize posts for a contact
  async fetchAndSummarizePosts(contactId: string): Promise<SocialPost[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return [];
      }

      // Get posts from database
      const { data: posts, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('contact_id', contactId)
        .order('posted_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching social posts:', error);
        return [];
      }

      return (posts || []).map(post => ({
        id: post.id,
        platform: post.platform as SocialPlatform,
        content: post.content,
        summary: post.summary || post.content.substring(0, 100),
        post_url: post.post_url,
        posted_at: post.posted_at,
        social_profile_id: `${post.platform}-${post.contact_id}`,
        contact_id: post.contact_id
      }));
    } catch (error) {
      console.error(`Error fetching posts for contact ${contactId}:`, error);
      return [];
    }
  },

  // Get email interactions for a contact
  async getEmailInteractions(contactId: string): Promise<any[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return [];
      }

      const { data: emails, error } = await supabase
        .from('email_interactions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('contact_id', contactId)
        .order('received_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching email interactions:', error);
        return [];
      }

      return emails || [];
    } catch (error) {
      console.error(`Error fetching email interactions for contact ${contactId}:`, error);
      return [];
    }
  }
};
