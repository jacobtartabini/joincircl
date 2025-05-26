
import { supabase } from "@/integrations/supabase/client";
import { Contact, Interaction } from "@/types/contact";
import { differenceInDays, differenceInWeeks, differenceInMonths, format } from "date-fns";

export interface AdvancedRelationshipInsight {
  contact: Contact;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reason: string;
  context: string;
  suggestedMessages: MessageDraft[];
  actionType: 'reconnect' | 'follow_up' | 'celebrate' | 'check_in' | 'nurture' | 'professional_touch';
  urgency: number; // 1-10 scale
  confidence: number; // 0-1 confidence in recommendation
  personalizedFactors: string[];
  nextBestAction: string;
}

export interface MessageDraft {
  platform: 'text' | 'email' | 'linkedin' | 'call';
  tone: 'casual' | 'friendly' | 'professional' | 'warm' | 'formal';
  length: 'short' | 'medium' | 'long';
  subject?: string;
  content: string;
  reasoning: string;
  contextUsed: string[];
}

export interface UserPersonality {
  communicationStyle: 'casual' | 'professional' | 'mixed' | 'warm' | 'direct';
  preferredPlatforms: ('text' | 'email' | 'linkedin' | 'call')[];
  messageLength: 'short' | 'medium' | 'long' | 'adaptive';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'smart';
  focusAreas: ('personal' | 'professional' | 'mentorship' | 'networking' | 'family' | 'social')[];
  proactivityLevel: 'low' | 'medium' | 'high';
  relationshipGoals: string[];
  voiceTone: string;
}

export interface ConversationContext {
  query: string;
  intent: 'general_advice' | 'specific_contact' | 'weekly_review' | 'message_help' | 'relationship_analysis';
  mentionedContacts: string[];
  timeframe?: string;
  platform?: string;
  urgency?: string;
}

class AdvancedAiAssistant {
  private async callAI(
    prompt: string, 
    systemPrompt: string, 
    model: 'gpt-4o' | 'anthropic/claude-3-sonnet' | 'mistralai/mistral-7b-instruct' = 'anthropic/claude-3-sonnet',
    temperature = 0.7,
    maxTokens = 1200
  ): Promise<string> {
    const { data, error } = await supabase.functions.invoke('openrouter-ai', {
      body: { 
        prompt, 
        systemPrompt, 
        model,
        maxTokens,
        temperature
      }
    });

    if (error) {
      throw new Error(`AI service error: ${error.message}`);
    }

    return data.response;
  }

  async processNaturalLanguageQuery(
    query: string,
    contacts: Contact[],
    interactions: Record<string, Interaction[]>,
    userPersonality: UserPersonality
  ): Promise<{
    response: string;
    insights?: AdvancedRelationshipInsight[];
    messageDrafts?: MessageDraft[];
    actionItems?: string[];
  }> {
    const context = this.parseQueryIntent(query);
    
    const systemPrompt = `You are an advanced AI relationship assistant for Circl, designed to be emotionally intelligent, proactive, and deeply personalized. You help users maintain meaningful connections through thoughtful analysis and warm, human-like communication.

User Personality Profile:
- Communication Style: ${userPersonality.communicationStyle}
- Preferred Platforms: ${userPersonality.preferredPlatforms.join(', ')}
- Message Length: ${userPersonality.messageLength}
- Focus Areas: ${userPersonality.focusAreas.join(', ')}
- Voice Tone: ${userPersonality.voiceTone}
- Relationship Goals: ${userPersonality.relationshipGoals.join(', ')}

Context Understanding:
- Query Intent: ${context.intent}
- Mentioned Contacts: ${context.mentionedContacts.join(', ') || 'None'}
- Timeframe: ${context.timeframe || 'Not specified'}

Your responses should be:
1. Warm, encouraging, and motivational
2. Specific and actionable
3. Contextually aware of relationships and history
4. Aligned with user's personality and goals
5. Proactive but not overwhelming

Response format: JSON with 'response', 'insights', 'messageDrafts', and 'actionItems' fields.`;

    const networkSummary = this.buildAdvancedNetworkSummary(contacts, interactions);
    const recentActivity = this.getRecentActivitySummary(interactions);
    
    const prompt = `User Query: "${query}"

Network Summary:
${networkSummary}

Recent Activity:
${recentActivity}

Based on this query and the user's network, provide a helpful, personalized response that addresses their specific needs. Include relevant insights, message drafts, and actionable recommendations.`;

    try {
      const response = await this.callAI(prompt, systemPrompt, 'anthropic/claude-3-sonnet');
      return JSON.parse(response);
    } catch (error) {
      console.error('Error processing natural language query:', error);
      return {
        response: "I'm here to help you strengthen your relationships! Could you tell me more about what you'd like assistance with?"
      };
    }
  }

  async generateAdvancedInsights(
    contacts: Contact[],
    interactions: Record<string, Interaction[]>,
    userPersonality: UserPersonality
  ): Promise<AdvancedRelationshipInsight[]> {
    const insights: AdvancedRelationshipInsight[] = [];
    const today = new Date();

    for (const contact of contacts) {
      const contactInteractions = interactions[contact.id] || [];
      const analysis = this.analyzeContactRelationshipAdvanced(contact, contactInteractions, today);
      
      if (analysis.shouldRecommend) {
        const insight = await this.generatePersonalizedInsight(contact, analysis, userPersonality);
        if (insight) insights.push(insight);
      }
    }

    // Advanced sorting based on multiple factors
    return insights.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const confidenceDiff = b.confidence - a.confidence;
      if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff > 0 ? 1 : -1;
      
      return b.urgency - a.urgency;
    }).slice(0, 8);
  }

  private async generatePersonalizedInsight(
    contact: Contact,
    analysis: any,
    userPersonality: UserPersonality
  ): Promise<AdvancedRelationshipInsight | null> {
    const systemPrompt = `You are an expert relationship analyst creating personalized reconnection insights. Generate warm, specific, and actionable recommendations.

User Personality:
- Style: ${userPersonality.communicationStyle}
- Goals: ${userPersonality.relationshipGoals.join(', ')}
- Voice: ${userPersonality.voiceTone}
- Focus: ${userPersonality.focusAreas.join(', ')}

Create insights that feel personal, not generic. Reference specific context when possible.
Response format: JSON with fields for priority, reason, context, suggestedMessages (array of 2-3 drafts), actionType, urgency, confidence, personalizedFactors, nextBestAction.`;

    const contactContext = this.buildRichContactContext(contact, analysis);
    
    const prompt = `Analyze this relationship and create a personalized insight:

${contactContext}

Key factors:
- Days since last contact: ${analysis.daysSinceLastContact}
- Relationship strength: ${analysis.relationshipStrength}
- Interaction patterns: ${analysis.interactionPatterns}
- Special circumstances: ${analysis.specialCircumstances}
- Mutual connections: ${analysis.mutualConnections}

Generate a warm, specific recommendation with 2-3 message drafts for different platforms/tones.`;

    try {
      const response = await this.callAI(prompt, systemPrompt, 'gpt-4o');
      const parsed = JSON.parse(response);
      
      return {
        contact,
        priority: parsed.priority || this.calculateAdvancedPriority(analysis, contact),
        reason: parsed.reason,
        context: parsed.context,
        suggestedMessages: parsed.suggestedMessages || [],
        actionType: parsed.actionType || this.determineAdvancedActionType(analysis),
        urgency: parsed.urgency || Math.round(analysis.urgencyMultiplier * 3),
        confidence: parsed.confidence || 0.7,
        personalizedFactors: parsed.personalizedFactors || [],
        nextBestAction: parsed.nextBestAction || 'Reach out with a warm message'
      };
    } catch (error) {
      console.error('Error generating personalized insight:', error);
      return null;
    }
  }

  private parseQueryIntent(query: string): ConversationContext {
    const lowerQuery = query.toLowerCase();
    
    let intent: ConversationContext['intent'] = 'general_advice';
    
    if (lowerQuery.includes('who should i') || lowerQuery.includes('recommend')) {
      intent = 'general_advice';
    } else if (lowerQuery.includes('message') || lowerQuery.includes('write') || lowerQuery.includes('draft')) {
      intent = 'message_help';
    } else if (lowerQuery.includes('week') || lowerQuery.includes('this week')) {
      intent = 'weekly_review';
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('relationship')) {
      intent = 'relationship_analysis';
    }

    // Extract mentioned contacts (simplified - could be enhanced with NER)
    const mentionedContacts: string[] = [];
    
    return {
      query,
      intent,
      mentionedContacts,
      timeframe: this.extractTimeframe(query),
      platform: this.extractPlatform(query),
      urgency: this.extractUrgency(query)
    };
  }

  private analyzeContactRelationshipAdvanced(contact: Contact, interactions: Interaction[], today: Date) {
    const baseAnalysis = this.analyzeContactRelationship(contact, interactions, today);
    
    // Enhanced analysis
    const relationshipStrength = this.calculateRelationshipStrength(contact, interactions);
    const interactionPatterns = this.analyzeInteractionPatterns(interactions);
    const specialCircumstances = this.identifySpecialCircumstances(contact, today);
    const mutualConnections = this.findMutualConnections(contact);
    
    return {
      ...baseAnalysis,
      relationshipStrength,
      interactionPatterns,
      specialCircumstances,
      mutualConnections,
      shouldRecommend: baseAnalysis.shouldRecommend || 
        relationshipStrength > 0.6 || 
        specialCircumstances.length > 0 ||
        (contact.circle === 'inner' && baseAnalysis.daysSinceLastContact > 5)
    };
  }

  private analyzeContactRelationship(contact: Contact, interactions: Interaction[], today: Date) {
    const lastInteraction = interactions[0];
    const daysSinceLastContact = lastInteraction 
      ? differenceInDays(today, new Date(lastInteraction.date))
      : contact.last_contact 
        ? differenceInDays(today, new Date(contact.last_contact))
        : 365;

    const expectedFrequency = {
      inner: 7,
      middle: 21,
      outer: 60
    };

    const expected = expectedFrequency[contact.circle] || 60;
    const isOverdue = daysSinceLastContact > expected;
    const urgencyMultiplier = Math.min(daysSinceLastContact / expected, 3);

    return {
      daysSinceLastContact,
      interactionFrequency: interactions.length,
      isOverdue,
      urgencyMultiplier,
      shouldRecommend: isOverdue || this.isBirthdayThisMonth(contact.birthday, today)
    };
  }

  private calculateRelationshipStrength(contact: Contact, interactions: Interaction[]): number {
    let strength = 0.5; // Base strength
    
    // Circle weight
    const circleWeights = { inner: 0.4, middle: 0.2, outer: 0.1 };
    strength += circleWeights[contact.circle] || 0.1;
    
    // Interaction frequency
    strength += Math.min(interactions.length * 0.05, 0.3);
    
    // Recent interactions
    const recentInteractions = interactions.filter(i => 
      differenceInDays(new Date(), new Date(i.date)) < 30
    );
    strength += recentInteractions.length * 0.1;
    
    // Rich profile data
    if (contact.company_name) strength += 0.05;
    if (contact.hobbies_interests) strength += 0.05;
    if (contact.how_met) strength += 0.05;
    if (contact.notes) strength += 0.05;
    
    return Math.min(strength, 1.0);
  }

  private analyzeInteractionPatterns(interactions: Interaction[]): string {
    if (interactions.length === 0) return 'No interaction history';
    
    const types = [...new Set(interactions.map(i => i.type))];
    const frequency = interactions.length > 5 ? 'frequent' : interactions.length > 2 ? 'moderate' : 'sparse';
    
    return `${frequency} communication via ${types.join(', ')}`;
  }

  private identifySpecialCircumstances(contact: Contact, today: Date): string[] {
    const circumstances: string[] = [];
    
    if (contact.birthday && this.isBirthdayThisMonth(contact.birthday, today)) {
      circumstances.push('Birthday this month');
    }
    
    if (contact.company_name && contact.job_title) {
      circumstances.push('Professional connection');
    }
    
    if (contact.location) {
      circumstances.push('Known location');
    }
    
    return circumstances;
  }

  private findMutualConnections(contact: Contact): string[] {
    // Simplified - in a real implementation, this would query the database
    return [];
  }

  private calculateAdvancedPriority(analysis: any, contact: Contact): 'urgent' | 'high' | 'medium' | 'low' {
    if (contact.circle === 'inner' && analysis.daysSinceLastContact > 14) return 'urgent';
    if (analysis.specialCircumstances.includes('Birthday this month')) return 'urgent';
    if (contact.circle === 'inner' && analysis.daysSinceLastContact > 7) return 'high';
    if (contact.circle === 'middle' && analysis.daysSinceLastContact > 30) return 'high';
    if (analysis.relationshipStrength > 0.7) return 'medium';
    return 'low';
  }

  private determineAdvancedActionType(analysis: any): AdvancedRelationshipInsight['actionType'] {
    if (analysis.specialCircumstances.includes('Birthday this month')) return 'celebrate';
    if (analysis.daysSinceLastContact > 90) return 'reconnect';
    if (analysis.specialCircumstances.includes('Professional connection')) return 'professional_touch';
    if (analysis.daysSinceLastContact > 30) return 'check_in';
    if (analysis.daysSinceLastContact > 14) return 'follow_up';
    return 'nurture';
  }

  private buildRichContactContext(contact: Contact, analysis: any): string {
    const details = [
      `Name: ${contact.name}`,
      `Circle: ${contact.circle}`,
      `Last contact: ${analysis.daysSinceLastContact} days ago`,
      `Relationship strength: ${analysis.relationshipStrength.toFixed(2)}`,
      `Interaction patterns: ${analysis.interactionPatterns}`,
    ];

    if (contact.company_name) details.push(`Company: ${contact.company_name}`);
    if (contact.job_title) details.push(`Role: ${contact.job_title}`);
    if (contact.location) details.push(`Location: ${contact.location}`);
    if (contact.how_met) details.push(`How met: ${contact.how_met}`);
    if (contact.hobbies_interests) details.push(`Interests: ${contact.hobbies_interests}`);
    if (contact.notes) details.push(`Notes: ${contact.notes}`);
    if (analysis.specialCircumstances.length > 0) {
      details.push(`Special circumstances: ${analysis.specialCircumstances.join(', ')}`);
    }

    return details.join('\n');
  }

  private buildAdvancedNetworkSummary(contacts: Contact[], interactions: Record<string, Interaction[]>): string {
    const totalContacts = contacts.length;
    const innerCircle = contacts.filter(c => c.circle === 'inner').length;
    const middleCircle = contacts.filter(c => c.circle === 'middle').length;
    const outerCircle = contacts.filter(c => c.circle === 'outer').length;
    
    const totalInteractions = Object.values(interactions).flat().length;
    const recentInteractions = Object.values(interactions).flat().filter(i => 
      differenceInDays(new Date(), new Date(i.date)) < 7
    ).length;

    return `Network: ${totalContacts} contacts (${innerCircle} inner, ${middleCircle} middle, ${outerCircle} outer)
Recent activity: ${recentInteractions} interactions this week, ${totalInteractions} total`;
  }

  private getRecentActivitySummary(interactions: Record<string, Interaction[]>): string {
    const allInteractions = Object.values(interactions).flat();
    const thisWeek = allInteractions.filter(i => 
      differenceInDays(new Date(), new Date(i.date)) < 7
    );
    
    if (thisWeek.length === 0) return 'No recent activity';
    
    const types = [...new Set(thisWeek.map(i => i.type))];
    return `${thisWeek.length} interactions this week: ${types.join(', ')}`;
  }

  private extractTimeframe(query: string): string | undefined {
    if (query.includes('this week')) return 'this week';
    if (query.includes('next week')) return 'next week';
    if (query.includes('this month')) return 'this month';
    if (query.includes('today')) return 'today';
    return undefined;
  }

  private extractPlatform(query: string): string | undefined {
    if (query.includes('email')) return 'email';
    if (query.includes('text') || query.includes('sms')) return 'text';
    if (query.includes('linkedin')) return 'linkedin';
    if (query.includes('call')) return 'call';
    return undefined;
  }

  private extractUrgency(query: string): string | undefined {
    if (query.includes('urgent') || query.includes('asap')) return 'urgent';
    if (query.includes('soon')) return 'high';
    return undefined;
  }

  private isBirthdayThisMonth(birthday: string | null, today: Date): boolean {
    if (!birthday) return false;
    const birthdayDate = new Date(birthday);
    return birthdayDate.getMonth() === today.getMonth();
  }
}

export const advancedAiAssistant = new AdvancedAiAssistant();
