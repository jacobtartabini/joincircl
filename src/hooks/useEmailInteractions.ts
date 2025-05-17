
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmailProviderToken } from './useEmailProviders';
import { SocialPost } from '@/types/socialIntegration';
import { socialIntegrationService } from '@/services/socialIntegrationService';

// Define email interaction type
export interface EmailInteraction {
  id: string;
  date: string;
  type: 'email' | 'social_post';
  subject?: string;
  preview?: string;
  provider?: 'gmail' | 'outlook';
  platform?: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  content?: string;
  summary?: string;
  post_url?: string;
  contact_id: string;
  user_id: string;
}

export const useEmailInteractions = (contactId?: string) => {
  const [interactions, setInteractions] = useState<EmailInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!contactId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the database
        // Here we're simulating with demo data
        
        // Check if we have email integrations enabled
        const { data: userSession } = await supabase.auth.getSession();
        
        if (userSession?.session) {
          // Check for connected email accounts
          const { data: emailTokens } = await supabase
            .from('user_email_tokens')
            .select('*')
            .eq('user_id', userSession.session.user.id) as { data: EmailProviderToken[] | null };
            
          // Generate some demo email interactions based on connected providers
          const demoEmails: EmailInteraction[] = [];
          
          const gmailConnected = emailTokens?.some(token => token.provider === 'gmail');
          const outlookConnected = emailTokens?.some(token => token.provider === 'outlook');
          
          if (gmailConnected) {
            // Add some Gmail demo interactions
            const gmailEmails: EmailInteraction[] = [
              {
                id: `gmail-1-${contactId}`,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                type: 'email',
                subject: 'Project Update: Q2 Roadmap',
                preview: 'Hi there, I wanted to follow up on our discussion about the Q2 roadmap. Here are the key milestones we discussed...',
                provider: 'gmail',
                contact_id: contactId,
                user_id: userSession.session.user.id
              },
              {
                id: `gmail-2-${contactId}`,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                type: 'email',
                subject: 'Coffee next week?',
                preview: "Hey, I was wondering if you'd like to grab coffee next week? I'd love to catch up and hear about your new role.",
                provider: 'gmail',
                contact_id: contactId,
                user_id: userSession.session.user.id
              }
            ];
            
            demoEmails.push(...gmailEmails);
          }
          
          if (outlookConnected) {
            // Add some Outlook demo interactions
            const outlookEmails: EmailInteraction[] = [
              {
                id: `outlook-1-${contactId}`,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                type: 'email',
                subject: 'Introduction: Sarah from Marketing',
                preview: 'I wanted to introduce you to Sarah who just joined our marketing team. She has experience in the area we discussed...',
                provider: 'outlook',
                contact_id: contactId,
                user_id: userSession.session.user.id
              },
              {
                id: `outlook-2-${contactId}`,
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
                type: 'email',
                subject: 'Conference Speaking Opportunity',
                preview: 'I thought you might be interested in this speaking opportunity at the upcoming industry conference. The deadline is...',
                provider: 'outlook',
                contact_id: contactId,
                user_id: userSession.session.user.id
              }
            ];
            
            demoEmails.push(...outlookEmails);
          }
          
          // Fetch social media posts as well
          try {
            const socialPosts = await socialIntegrationService.fetchAndSummarizePosts(contactId);
            
            // Convert social posts to our interaction format
            const socialInteractions: EmailInteraction[] = socialPosts.map(post => ({
              id: post.id,
              date: post.posted_at,
              type: 'social_post',
              platform: post.platform,
              content: post.content,
              summary: post.summary,
              post_url: post.post_url,
              contact_id: contactId,
              user_id: userSession.session.user.id
            }));
            
            demoEmails.push(...socialInteractions);
          } catch (socialError) {
            console.warn('Error fetching social posts:', socialError);
            // Continue with email interactions only
          }
          
          // Sort all interactions by date (newest first)
          const sortedInteractions = demoEmails.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setInteractions(sortedInteractions);
        }
        
      } catch (err) {
        console.error('Error fetching interactions:', err);
        setError(err as Error);
        setInteractions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [contactId]);

  return { interactions, loading, error };
};
