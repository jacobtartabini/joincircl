
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
    const systemPrompt = `You're Circl's relationship advisor. Analyze contacts and suggest specific actions to strengthen relationships.

    Be direct and actionable. Focus on:
    - When to reach out based on timing
    - How to strengthen the connection
    - Specific next steps to take

    Return JSON array: [{"type": "reach_out|follow_up|strengthen|reconnect", "priority": "high|medium|low", "suggestion": "brief specific action", "reasoning": "why now", "suggestedAction": "concrete step"}]`;

    const contextInfo = this.buildContactContext(contact, interactions);
    const prompt = `Analyze ${contact.name} and suggest 2-3 specific relationship actions:

${contextInfo}

Consider:
- Circle level (${contact.circle})
- Last contact timing
- Relationship strength
- Growth opportunities`;

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
    const systemPrompt = `You're Circl's communication coach. Create authentic, personal messages that feel natural.

    Guidelines:
    - Keep it concise and genuine
    - Reference shared context when possible
    - Match the relationship level
    - Sound human, not robotic

    Return JSON: {"type": "${messageType}", "subject": "if email", "content": "message text", "tone": "casual|professional|friendly|formal"}`;

    const contactInfo = this.buildContactContext(contact);
    const prompt = `Create a ${messageType} message for ${contact.name}:

${contactInfo}

Context: ${context}

Make it feel personal and appropriate for their ${contact.circle} circle relationship.`;

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
    const systemPrompt = `You're Circl's network strategist. Analyze relationship patterns and identify weekly priorities.

    Be specific and actionable. Focus on:
    - Who needs immediate attention
    - Relationship maintenance patterns
    - Concrete weekly actions

    Return JSON: {"priorityContacts": ["contact_id1", "contact_id2"], "insights": ["insight1", "insight2"], "actionItems": ["action1", "action2"]}`;

    const networkSummary = this.buildNetworkSummary(contacts, interactions);
    const prompt = `Analyze this network and provide weekly focus areas:

${networkSummary}

Identify:
- 3-4 contacts needing attention this week
- Key relationship patterns or gaps
- Specific actions for stronger connections`;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const parsed = JSON.parse(response.response);
      
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

    return `${contact.name} (${contact.circle} circle)
Last contact: ${lastContact}
Interactions: ${interactionCount}
Company: ${contact.company_name || 'Not specified'}
Role: ${contact.job_title || 'Not specified'}
Location: ${contact.location || 'Not specified'}
How met: ${contact.how_met || 'Not specified'}
Interests: ${contact.hobbies_interests || 'Not specified'}
Birthday: ${contact.birthday ? new Date(contact.birthday).toLocaleDateString() : 'Not specified'}
Notes: ${contact.notes || 'No notes'}

Recent interactions:
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
      
      if (c.circle === 'inner') threshold.setDate(threshold.getDate() - 14);
      else if (c.circle === 'middle') threshold.setDate(threshold.getDate() - 30);
      else threshold.setDate(threshold.getDate() - 90);
      
      return lastContact < threshold;
    });

    return `Network: ${totalContacts} contacts
- Inner: ${innerCircle}
- Middle: ${middleCircle}  
- Outer: ${outerCircle}

This week: ${recentInteractions} interactions
Needs attention: ${staleContacts.length} contacts

Stale relationships:
${staleContacts.slice(0, 5).map(c => 
  `- ${c.name} (${c.circle}, last: ${c.last_contact ? new Date(c.last_contact).toLocaleDateString() : 'never'})`
).join('\n')}`;
  }
}

export const aiService = new AIService();
