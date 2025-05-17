
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contact";
import { SocialPlatform, SocialProfile, SocialPost, SocialIntegrationStatus, SocialSyncResult } from "@/types/socialIntegration";

export const socialIntegrationService = {
  // Get all social profiles for a user
  async getUserSocialIntegrations(): Promise<SocialIntegrationStatus[]> {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session) {
        throw new Error("User not authenticated");
      }

      const { data: integrations, error } = await supabase
        .from('user_social_integrations')
        .select('*')
        .eq('user_id', userSession.session.user.id);

      if (error) throw error;

      // Transform to SocialIntegrationStatus format
      const platforms: SocialPlatform[] = ["facebook", "twitter", "linkedin", "instagram", "whatsapp"];
      
      return platforms.map(platform => {
        const integration = integrations?.find(i => i.platform === platform);
        return {
          platform,
          connected: !!integration,
          last_synced: integration?.last_synced || undefined,
          username: integration?.username || undefined,
          error: integration?.error || undefined
        };
      });
    } catch (error) {
      console.error("Error getting user social integrations:", error);
      return [
        { platform: "facebook", connected: false },
        { platform: "twitter", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false },
        { platform: "whatsapp", connected: false }
      ];
    }
  },

  // Demo function to simulate connecting to a social platform
  async connectSocialPlatform(platform: SocialPlatform): Promise<SocialIntegrationStatus> {
    try {
      // In production, this would redirect to OAuth flow
      // For this demo, we'll simulate a successful connection
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session) {
        throw new Error("User not authenticated");
      }

      // Simulate API connection - in production, this would use real OAuth
      console.log(`Connecting to ${platform}...`);
      
      // Different demo data based on platform
      const demoUsername = platform === "facebook" ? "demo.user" : 
                          platform === "twitter" ? "demo_twitter" : 
                          `demo_${platform}`;
      
      const now = new Date().toISOString();
      
      // Add/update integration record
      const { data, error } = await supabase
        .from('user_social_integrations')
        .upsert({
          user_id: userSession.session.user.id,
          platform,
          username: demoUsername,
          access_token: 'demo_token',
          refresh_token: 'demo_refresh',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          last_synced: now
        }, { 
          onConflict: 'user_id,platform' 
        })
        .select()
        .single();

      if (error) throw error;

      // Return status
      return {
        platform,
        connected: true,
        last_synced: now,
        username: demoUsername
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

  // Demo function to simulate disconnecting from a platform
  async disconnectSocialPlatform(platform: SocialPlatform): Promise<void> {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session) {
        throw new Error("User not authenticated");
      }

      // Remove integration record
      const { error } = await supabase
        .from('user_social_integrations')
        .delete()
        .eq('user_id', userSession.session.user.id)
        .eq('platform', platform);

      if (error) throw error;
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      throw error;
    }
  },

  // Demo function to simulate importing contacts from a platform
  async syncContactsFromPlatform(platform: SocialPlatform): Promise<SocialSyncResult> {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session) {
        throw new Error("User not authenticated");
      }

      // In a real implementation, this would call the platform's API
      // to fetch contacts and import/update them

      // For demo purposes, we'll generate some mock contacts
      const mockContacts = this.generateMockContacts(platform, 5);
      const result: SocialSyncResult = {
        contacts_imported: mockContacts.length,
        contacts_updated: 0,
        posts_fetched: 0,
        errors: []
      };

      // In a real implementation, would update the last_synced timestamp
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_social_integrations')
        .update({ last_synced: now })
        .eq('user_id', userSession.session.user.id)
        .eq('platform', platform);

      if (error) {
        result.errors.push(`Failed to update sync timestamp: ${error.message}`);
      }

      // Return results
      return result;
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

  // Demo function to fetch and summarize posts
  async fetchAndSummarizePosts(contactId: string): Promise<SocialPost[]> {
    try {
      // In a real implementation, this would:
      // 1. Get the contact's social profiles
      // 2. Call each platform's API to fetch recent posts
      // 3. Summarize the posts (could use an AI service)
      // 4. Store the posts and summaries

      // For demo purposes, return mock posts
      return this.generateMockPosts(contactId, 3);
    } catch (error) {
      console.error(`Error fetching posts for contact ${contactId}:`, error);
      return [];
    }
  },

  // Demo helper function to generate mock contacts
  private generateMockContacts(platform: SocialPlatform, count: number): Contact[] {
    const mockContacts: Contact[] = [];
    const { data: userSession } = supabase.auth.getSession();
    const userId = userSession?.session?.user?.id;
    
    if (!userId) return mockContacts;

    for (let i = 1; i <= count; i++) {
      let name = "";
      let company = "";
      let jobTitle = "";
      
      switch (platform) {
        case "facebook":
          name = `FB Friend ${i}`;
          company = "Facebook Inc";
          jobTitle = "Social Media Expert";
          break;
        case "twitter":
          name = `Twitter User ${i}`;
          company = "Media Company";
          jobTitle = "Content Creator";
          break;
        default:
          name = `${platform.charAt(0).toUpperCase() + platform.slice(1)} Contact ${i}`;
          company = "Tech Company";
          jobTitle = "Professional";
      }
      
      mockContacts.push({
        id: `mock-${platform}-${i}`,
        name,
        user_id: userId,
        circle: "outer",
        company_name: company,
        job_title: jobTitle,
        tags: [platform],
        notes: `Imported from ${platform} (demo)`
      });
    }
    
    return mockContacts;
  },

  // Demo helper function to generate mock posts
  private generateMockPosts(contactId: string, count: number): SocialPost[] {
    const mockPosts: SocialPost[] = [];
    const platforms: SocialPlatform[] = ["facebook", "twitter"];
    
    for (let i = 1; i <= count; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const date = new Date();
      date.setDate(date.getDate() - i); // Posts from recent days
      
      let content = "";
      let summary = "";
      
      switch (platform) {
        case "facebook":
          content = `This is a mock Facebook post #${i}. Imagine this is something interesting that your contact shared on their timeline!`;
          summary = `Shared an update about their day (${i} days ago)`;
          break;
        case "twitter":
          content = `Mock tweet #${i}: Something short and witty with #hashtags that demonstrates what your contact might post on Twitter/X.`;
          summary = `Posted a tweet about trending topics (${i} days ago)`;
          break;
        default:
          content = `Mock ${platform} post #${i}: Generic content for demonstration`;
          summary = `Shared content on ${platform} (${i} days ago)`;
      }
      
      mockPosts.push({
        id: `mock-post-${i}`,
        platform,
        content,
        summary,
        post_url: `https://${platform}.com/post/${i}`,
        posted_at: date.toISOString(),
        social_profile_id: `mock-profile-${platform}`,
        contact_id: contactId
      });
    }
    
    return mockPosts;
  }
};
