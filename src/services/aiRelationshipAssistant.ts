
import { supabase } from "@/integrations/supabase/client";
import { Contact, Interaction } from "@/types/contact";
import { differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

export interface RelationshipInsight {
  contact: Contact;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  context: string;
  suggestedMessage: string;
  actionType: 'reconnect' | 'follow_up' | 'celebrate' | 'check_in' | 'nurture';
  urgency: number; // 1-10 scale
}

export interface UserPreferences {
  communicationStyle: 'casual' | 'professional' | 'mixed';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  focusAreas: ('personal' | 'professional' | 'mentorship' | 'networking')[];
  messageLength: 'short' | 'medium' | 'long';
}

class AIRelationshipAssistant {
  private async callAI(prompt: string, systemPrompt: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('openrouter-ai', {
      body: { 
        prompt, 
        systemPrompt, 
        model: 'mistralai/mistral-7b-instruct',
        maxTokens: 800,
        temperature: 0.7
      }
    });

    if (error) {
      throw new Error(`AI service error: ${error.message}`);
    }

    return data.response;
  }

  async analyzeRelationships(
    contacts: Contact[], 
    interactions: Record<string, Interaction[]>,
    userPreferences: UserPreferences = {
      communicationStyle: 'mixed',
      frequency: 'weekly',
      focusAreas: ['personal', 'professional'],
      messageLength: 'medium'
    }
  ): Promise<RelationshipInsight[]> {
    const insights: RelationshipInsight[] = [];
    const today = new Date();

    for (const contact of contacts) {
      const contactInteractions = interactions[contact.id] || [];
      const analysis = this.analyzeContactRelationship(contact, contactInteractions, today);
      
      if (analysis.shouldRecommend) {
        const insight = await this.generateRelationshipInsight(contact, analysis, userPreferences);
        insights.push(insight);
      }
    }

    // Sort by priority and urgency
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.urgency - a.urgency;
    }).slice(0, 10); // Limit to top 10 recommendations
  }

  private analyzeContactRelationship(contact: Contact, interactions: Interaction[], today: Date) {
    const lastInteraction = interactions[0]; // Assuming sorted by date desc
    const daysSinceLastContact = lastInteraction 
      ? differenceInDays(today, new Date(lastInteraction.date))
      : contact.last_contact 
        ? differenceInDays(today, new Date(contact.last_contact))
        : 365; // Assume very old if no data

    const interactionFrequency = interactions.length;
    const avgDaysBetweenInteractions = interactions.length > 1 
      ? daysSinceLastContact / interactions.length 
      : daysSinceLastContact;

    // Determine expected contact frequency based on circle
    const expectedFrequency = {
      inner: 14,   // Every 2 weeks
      middle: 30,  // Every month
      outer: 90    // Every 3 months
    };

    const expected = expectedFrequency[contact.circle] || 90;
    const isOverdue = daysSinceLastContact > expected;
    const urgencyMultiplier = Math.min(daysSinceLastContact / expected, 3);

    // Check for special occasions
    const hasBirthdayThisMonth = contact.birthday 
      ? this.isBirthdayThisMonth(contact.birthday, today)
      : false;

    const hasRecentCareerUpdate = contact.job_title && contact.company_name;
    
    return {
      daysSinceLastContact,
      interactionFrequency,
      avgDaysBetweenInteractions,
      isOverdue,
      urgencyMultiplier,
      hasBirthdayThisMonth,
      hasRecentCareerUpdate,
      shouldRecommend: isOverdue || hasBirthdayThisMonth || (contact.circle === 'inner' && daysSinceLastContact > 7)
    };
  }

  private async generateRelationshipInsight(
    contact: Contact, 
    analysis: any, 
    preferences: UserPreferences
  ): Promise<RelationshipInsight> {
    const systemPrompt = `You are an AI relationship assistant for Circl, helping users maintain meaningful connections. 
    Generate warm, encouraging, and personalized recommendations for reconnecting with contacts.
    
    User preferences:
    - Communication style: ${preferences.communicationStyle}
    - Message length: ${preferences.messageLength}
    - Focus areas: ${preferences.focusAreas.join(', ')}
    
    Your response should be natural, specific, and motivating. Avoid generic phrases.
    Response format should be JSON with: reason, context, suggestedMessage, actionType, priority, urgency (1-10)`;

    const contactContext = this.buildContactContext(contact, analysis);
    
    const prompt = `Analyze this relationship and provide a personalized reconnection recommendation:

${contactContext}

Consider:
- Days since last contact: ${analysis.daysSinceLastContact}
- Relationship circle: ${contact.circle}
- Communication history: ${analysis.interactionFrequency} interactions
- Special occasions: ${analysis.hasBirthdayThisMonth ? 'Birthday this month' : 'None'}

Generate a warm recommendation that explains why they should reconnect and provide a suggested message.`;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const parsed = JSON.parse(response);
      
      return {
        contact,
        priority: parsed.priority || this.calculatePriority(analysis, contact),
        reason: parsed.reason,
        context: parsed.context,
        suggestedMessage: parsed.suggestedMessage,
        actionType: parsed.actionType || this.determineActionType(analysis),
        urgency: parsed.urgency || Math.round(analysis.urgencyMultiplier * 3)
      };
    } catch (error) {
      console.error('Error generating relationship insight:', error);
      
      // Fallback logic
      return {
        contact,
        priority: this.calculatePriority(analysis, contact),
        reason: this.generateFallbackReason(contact, analysis),
        context: `It's been ${analysis.daysSinceLastContact} days since you last connected`,
        suggestedMessage: this.generateFallbackMessage(contact, preferences),
        actionType: this.determineActionType(analysis),
        urgency: Math.round(analysis.urgencyMultiplier * 3)
      };
    }
  }

  private buildContactContext(contact: Contact, analysis: any): string {
    const details = [
      `Name: ${contact.name}`,
      `Circle: ${contact.circle}`,
      `Last contact: ${analysis.daysSinceLastContact} days ago`,
    ];

    if (contact.company_name) details.push(`Company: ${contact.company_name}`);
    if (contact.job_title) details.push(`Role: ${contact.job_title}`);
    if (contact.location) details.push(`Location: ${contact.location}`);
    if (contact.how_met) details.push(`How met: ${contact.how_met}`);
    if (contact.hobbies_interests) details.push(`Interests: ${contact.hobbies_interests}`);
    if (contact.notes) details.push(`Notes: ${contact.notes}`);

    return details.join('\n');
  }

  private calculatePriority(analysis: any, contact: Contact): 'high' | 'medium' | 'low' {
    if (contact.circle === 'inner' && analysis.daysSinceLastContact > 14) return 'high';
    if (analysis.hasBirthdayThisMonth) return 'high';
    if (contact.circle === 'middle' && analysis.daysSinceLastContact > 45) return 'medium';
    if (analysis.daysSinceLastContact > 90) return 'medium';
    return 'low';
  }

  private determineActionType(analysis: any): 'reconnect' | 'follow_up' | 'celebrate' | 'check_in' | 'nurture' {
    if (analysis.hasBirthdayThisMonth) return 'celebrate';
    if (analysis.daysSinceLastContact > 60) return 'reconnect';
    if (analysis.daysSinceLastContact > 30) return 'check_in';
    if (analysis.hasRecentCareerUpdate) return 'follow_up';
    return 'nurture';
  }

  private generateFallbackReason(contact: Contact, analysis: any): string {
    if (analysis.hasBirthdayThisMonth) {
      return `${contact.name}'s birthday is coming up this month - a perfect time to reach out!`;
    }
    
    if (contact.circle === 'inner') {
      return `${contact.name} is in your inner circle but you haven't connected in ${analysis.daysSinceLastContact} days`;
    }
    
    return `It's been ${analysis.daysSinceLastContact} days since you last spoke with ${contact.name}`;
  }

  private generateFallbackMessage(contact: Contact, preferences: UserPreferences): string {
    const isPersonal = preferences.focusAreas.includes('personal');
    const isProfessional = preferences.focusAreas.includes('professional');
    
    if (isProfessional && contact.company_name) {
      return `Hi ${contact.name}! Hope you're doing well at ${contact.company_name}. Would love to catch up soon!`;
    }
    
    if (isPersonal) {
      return `Hey ${contact.name}! It's been a while - hope you're doing great. Would love to catch up!`;
    }
    
    return `Hi ${contact.name}! Hope you're doing well. Would love to reconnect soon!`;
  }

  private isBirthdayThisMonth(birthday: string, today: Date): boolean {
    const birthdayDate = new Date(birthday);
    return birthdayDate.getMonth() === today.getMonth();
  }

  async generateProactiveRecommendations(
    contacts: Contact[],
    interactions: Record<string, Interaction[]>,
    preferences: UserPreferences
  ): Promise<RelationshipInsight[]> {
    // Focus on high-priority relationships for proactive suggestions
    const priorityContacts = contacts.filter(contact => 
      contact.circle === 'inner' || 
      (contact.circle === 'middle' && Math.random() < 0.3) // 30% chance for middle circle
    );

    return this.analyzeRelationships(priorityContacts, interactions, preferences);
  }
}

export const aiRelationshipAssistant = new AIRelationshipAssistant();
