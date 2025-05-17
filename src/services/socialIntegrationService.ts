
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contact";
import { SocialPlatform, SocialProfile, SocialPost, SocialIntegrationStatus, SocialSyncResult } from "@/types/socialIntegration";

export const socialIntegrationService = {
  // Get all social profiles for a user
  async getUserSocialIntegrations(): Promise<SocialIntegrationStatus[]> {
    try {
      const userSessionResponse = await supabase.auth.getSession();
      const userSession = userSessionResponse.data.session;
      
      if (!userSession) {
        throw new Error("User not authenticated");
      }

      // Since we don't have the social_integrations table yet,
      // we'll return mock data instead of querying the database
      return [
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: true, username: "demo.user", last_synced: new Date().toISOString() },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false }
      ];
    } catch (error) {
      console.error("Error getting user social integrations:", error);
      return [
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false }
      ];
    }
  },

  // Connect to a social platform
  async connectSocialPlatform(platform: SocialPlatform): Promise<SocialIntegrationStatus> {
    try {
      const userSessionResponse = await supabase.auth.getSession();
      const userSession = userSessionResponse.data.session;
      
      if (!userSession) {
        throw new Error("User not authenticated");
      }

      // Simulate API connection - in production, this would use real OAuth
      console.log(`Connecting to ${platform}...`);
      
      // Different demo username based on platform
      const demoUsername = platform === "facebook" ? "demo.user" : 
                          platform === "twitter" ? "circl_user" : 
                          `demo_${platform}`;
      
      const now = new Date().toISOString();
      
      // In a real implementation, we would update or insert a record in the social_integrations table
      // For this demo, we'll just return a successful status
      
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

  // Disconnect from a platform
  async disconnectSocialPlatform(platform: SocialPlatform): Promise<void> {
    try {
      const userSessionResponse = await supabase.auth.getSession();
      const userSession = userSessionResponse.data.session;
      
      if (!userSession) {
        throw new Error("User not authenticated");
      }

      // In a real implementation, we would remove the integration record
      console.log(`Disconnecting from ${platform}...`);
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      throw error;
    }
  },

  // Sync contacts from a platform
  async syncContactsFromPlatform(platform: SocialPlatform): Promise<SocialSyncResult> {
    try {
      const userSessionResponse = await supabase.auth.getSession();
      const userSession = userSessionResponse.data.session;
      
      if (!userSession) {
        throw new Error("User not authenticated");
      }

      // In a real implementation, this would call the platform's API
      // to fetch contacts and import/update them

      // For demo purposes, we'll generate some mock contacts
      const mockContacts = this.generateMockContacts(platform, 5);
      const result: SocialSyncResult = {
        contacts_imported: mockContacts.length,
        contacts_updated: 0,
        posts_fetched: platform === "twitter" ? 10 : 0, // Simulate fetching tweets for Twitter
        errors: []
      };

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

  // Fetch and summarize posts
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

  // Helper function to generate mock contacts
  generateMockContacts(platform: SocialPlatform, count: number): Contact[] {
    const mockContacts: Contact[] = [];
    
    try {
      // For demo, use a placeholder user ID
      const userId = "mock-user-id";

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
    } catch (error) {
      console.error("Error generating mock contacts:", error);
    }
    
    return mockContacts;
  },

  // Helper function to generate mock posts
  generateMockPosts(contactId: string, count: number): SocialPost[] {
    const mockPosts: SocialPost[] = [];
    const platforms: SocialPlatform[] = ["twitter", "facebook"];
    
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
