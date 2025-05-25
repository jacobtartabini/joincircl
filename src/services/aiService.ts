
import { supabase } from "@/integrations/supabase/client";
import { Contact, Interaction } from "@/types/contact";

export interface AIResponse {
  response: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ConnectionSuggestion {
  type: 'reach_out' | 'follow_up' | 'strengthen' | 'reconnect';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  reasoning: string;
  suggestedAction?: string;
}

export interface MessageTemplate {
  type: 'text' | 'email' | 'social';
  subject?: string;
  content: string;
  tone: 'casual' | 'professional' | 'friendly' | 'formal';
}

class AIService {
  private async callAI(prompt: string, systemPrompt?: string, model = 'mistralai/mistral-7b-instruct'): Promise<AIResponse> {
    const { data, error } = await supabase.functions.invoke('openrouter-ai', {
      body: { prompt, systemPrompt, model }
    });

    if (error) {
      throw new Error(`AI service error: ${error.message}`);
    }

    return data;
  }

  async generateConnectionSuggestions(contact: Contact, interactions: Interaction[] = []): Promise<ConnectionSuggestion[]> {
    const systemPrompt = `You are a relationship assistant helping users maintain meaningful connections. 
    Analyze the contact information and interaction history to provide specific, actionable suggestions for strengthening the relationship.
    Return your response as a JSON array of suggestions with this structure:
    [{"type": "reach_out|follow_up|strengthen|reconnect", "priority": "high|medium|low", "suggestion": "brief suggestion", "reasoning": "why this matters", "suggestedAction": "specific action to take"}]`;

    const contextInfo = this.buildContactContext(contact, interactions);
    const prompt = `Analyze this contact and suggest ways to strengthen the relationship:

${contextInfo}

Provide 2-3 specific, personalized suggestions based on the available information. Consider:
- Time since last contact
- Shared interests/background
- Professional context
- Personal milestones
- Circle level (inner/middle/outer)`;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const suggestions = JSON.parse(response.response);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error('Error generating connection suggestions:', error);
      return [];
    }
  }

  async generateMessageTemplate(contact: Contact, context: string, messageType: 'text' | 'email' | 'social' = 'text'): Promise<MessageTemplate> {
    const systemPrompt = `You are a relationship assistant helping users craft thoughtful, genuine messages to their contacts.
    Create personalized message templates that feel natural and authentic, not robotic.
    Return your response as JSON with this structure:
    {"type": "${messageType}", "subject": "email subject if applicable", "content": "message content", "tone": "casual|professional|friendly|formal"}`;

    const contactInfo = this.buildContactContext(contact);
    const prompt = `Create a ${messageType} message template for reaching out to this contact:

${contactInfo}

Context for this message: ${context}

The message should:
- Feel genuine and personal
- Reference relevant shared context when possible
- Be appropriate for the relationship level
- Match the communication style for ${messageType}
- Be concise but meaningful`;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error generating message template:', error);
      return {
        type: messageType,
        content: "Hi! Hope you're doing well. Would love to catch up soon!",
        tone: 'friendly'
      };
    }
  }

  async generateWeeklyInsights(contacts: Contact[], interactions: Interaction[]): Promise<{
    priorityContacts: Contact[];
    insights: string[];
    actionItems: string[];
  }> {
    const systemPrompt = `You are a relationship assistant providing weekly insights to help users maintain their network.
    Analyze the contacts and interactions to identify priorities and provide actionable insights.
    Return your response as JSON with this structure:
    {"priorityContacts": ["contact_id1", "contact_id2"], "insights": ["insight1", "insight2"], "actionItems": ["action1", "action2"]}`;

    const networkSummary = this.buildNetworkSummary(contacts, interactions);
    const prompt = `Analyze this user's network and provide weekly insights:

${networkSummary}

Identify:
- 3-5 contacts who should be prioritized for outreach
- Key insights about relationship patterns
- Specific action items for the week`;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const parsed = JSON.parse(response.response);
      
      // Map contact IDs back to contact objects
      const priorityContacts = contacts.filter(c => 
        parsed.priorityContacts?.includes(c.id) || parsed.priorityContacts?.includes(c.name)
      );

      return {
        priorityContacts,
        insights: parsed.insights || [],
        actionItems: parsed.actionItems || []
      };
    } catch (error) {
      console.error('Error generating weekly insights:', error);
      return {
        priorityContacts: [],
        insights: ["Check in with contacts you haven't spoken to recently"],
        actionItems: ["Review your inner circle connections"]
      };
    }
  }

  private buildContactContext(contact: Contact, interactions: Interaction[] = []): string {
    const lastContact = contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Unknown';
    const interactionCount = interactions.length;
    const recentInteractions = interactions.slice(0, 3).map(i => 
      `- ${i.type}: ${i.notes || 'No notes'} (${new Date(i.date).toLocaleDateString()})`
    ).join('\n');

    return `Contact: ${contact.name}
Circle: ${contact.circle}
Last Contact: ${lastContact}
Total Interactions: ${interactionCount}
Company: ${contact.company_name || 'Not specified'}
Role: ${contact.job_title || 'Not specified'}
Location: ${contact.location || 'Not specified'}
How Met: ${contact.how_met || 'Not specified'}
Interests: ${contact.hobbies_interests || 'Not specified'}
Birthday: ${contact.birthday ? new Date(contact.birthday).toLocaleDateString() : 'Not specified'}
Notes: ${contact.notes || 'No notes'}

Recent Interactions:
${recentInteractions || 'No recent interactions'}`;
  }

  private buildNetworkSummary(contacts: Contact[], interactions: Interaction[]): string {
    const totalContacts = contacts.length;
    const innerCircle = contacts.filter(c => c.circle === 'inner').length;
    const middleCircle = contacts.filter(c => c.circle === 'middle').length;
    const outerCircle = contacts.filter(c => c.circle === 'outer').length;
    
    const recentInteractions = interactions.filter(i => {
      const interactionDate = new Date(i.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return interactionDate >= weekAgo;
    }).length;

    const staleContacts = contacts.filter(c => {
      if (!c.last_contact) return true;
      const lastContact = new Date(c.last_contact);
      const threshold = new Date();
      
      // Different thresholds based on circle
      if (c.circle === 'inner') threshold.setDate(threshold.getDate() - 14);
      else if (c.circle === 'middle') threshold.setDate(threshold.getDate() - 30);
      else threshold.setDate(threshold.getDate() - 90);
      
      return lastContact < threshold;
    });

    return `Network Summary:
Total Contacts: ${totalContacts}
- Inner Circle: ${innerCircle}
- Middle Circle: ${middleCircle}  
- Outer Circle: ${outerCircle}

Recent Activity:
- Interactions this week: ${recentInteractions}
- Contacts needing attention: ${staleContacts.length}

Stale Relationships (sample):
${staleContacts.slice(0, 5).map(c => 
  `- ${c.name} (${c.circle} circle, last contact: ${c.last_contact ? new Date(c.last_contact).toLocaleDateString() : 'never'})`
).join('\n')}`;
  }
}

export const aiService = new AIService();
