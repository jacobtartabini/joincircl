
import { Contact, ConnectionStrength, Interaction } from "@/types/contact";
import { differenceInDays } from "date-fns";

export function calculateConnectionStrength(contact: Contact, interactions: Interaction[] = []): ConnectionStrength {
  let score = 0;
  
  // Factor 1: Circle type
  if (contact.circle === "inner") score += 40;
  else if (contact.circle === "middle") score += 20;
  
  // Factor 2: Recency of last contact
  if (contact.last_contact) {
    const daysSinceLastContact = differenceInDays(new Date(), new Date(contact.last_contact));
    
    // More recent interactions score higher
    if (daysSinceLastContact < 7) score += 30;
    else if (daysSinceLastContact < 30) score += 20;
    else if (daysSinceLastContact < 90) score += 10;
  }
  
  // Factor 3: Number of interactions
  const numInteractions = interactions.length;
  if (numInteractions > 10) score += 30;
  else if (numInteractions > 5) score += 20;
  else if (numInteractions > 0) score += 10;
  
  // Determine strength level and suggestions
  let level: 'weak' | 'moderate' | 'strong';
  let suggestions: string[] = [];
  
  if (score >= 60) {
    level = 'strong';
    suggestions = [
      "Keep up your regular contact pattern",
      "Consider setting up a recurring meeting",
      "Share something personal next time you meet"
    ];
  } else if (score >= 30) {
    level = 'moderate';
    suggestions = [
      "Try reaching out more frequently",
      "Note down their interests for future conversations",
      "Schedule a catch-up within the next two weeks"
    ];
  } else {
    level = 'weak';
    suggestions = [
      "Reach out this week to reconnect",
      "Try to schedule a brief call or coffee",
      "Send them an article related to their interests"
    ];
  }
  
  // Add more personalized suggestions
  if (contact.circle === "inner" && !contact.last_contact) {
    suggestions.push("This is a close contact, but you haven't recorded any interactions yet");
  }
  
  // Add tag-based suggestions
  if (contact.tags?.includes("Birthday")) {
    suggestions.push("Remember to wish them on their birthday");
  }
  
  return { score, level, suggestions };
}
