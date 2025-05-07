
import { Contact, ConnectionStrength, Interaction } from "@/types/contact";
import { differenceInDays, differenceInMonths } from "date-fns";

export function calculateConnectionStrength(contact: Contact, interactions: Interaction[] = []): ConnectionStrength {
  let score = 0;
  const suggestions: string[] = [];
  
  // Factor 1: Circle type - weighted more heavily than before
  if (contact.circle === "inner") score += 30;
  else if (contact.circle === "middle") score += 20;
  else if (contact.circle === "outer") score += 10;
  
  // Factor 2: Recency of last contact
  if (contact.last_contact) {
    const daysSinceLastContact = differenceInDays(new Date(), new Date(contact.last_contact));
    
    // More recent interactions score higher
    if (daysSinceLastContact < 7) score += 25;
    else if (daysSinceLastContact < 30) score += 15;
    else if (daysSinceLastContact < 90) score += 8;
  }
  
  // Factor 3: Number of interactions - revised to ensure more interactions always help
  const numInteractions = interactions.length;
  // Logarithmic scale to prevent diminishing returns after a reasonable point
  const interactionScore = Math.min(25, Math.round(15 * Math.log10(numInteractions + 1)));
  score += interactionScore;
  
  // Factor 4: Consistency of interactions
  if (interactions.length >= 2) {
    const sortedInteractions = [...interactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let totalGapDays = 0;
    for (let i = 1; i < sortedInteractions.length; i++) {
      const gap = differenceInDays(
        new Date(sortedInteractions[i].date),
        new Date(sortedInteractions[i-1].date)
      );
      totalGapDays += gap;
    }
    
    // Average time between interactions
    const avgGapDays = totalGapDays / (sortedInteractions.length - 1);
    
    // Reward consistency based on circle
    if (contact.circle === "inner") {
      if (avgGapDays <= 14) score += 15;
      else if (avgGapDays <= 30) score += 10;
    } else if (contact.circle === "middle") {
      if (avgGapDays <= 30) score += 15;
      else if (avgGapDays <= 60) score += 10;
    } else { // outer circle
      if (avgGapDays <= 60) score += 15;
      else if (avgGapDays <= 90) score += 10;
    }
  }

  // Factor 5: Detailed contact info
  let detailScore = 0;
  if (contact.mobile_phone) detailScore += 2;
  if (contact.personal_email) detailScore += 2;
  if (contact.birthday) detailScore += 3;
  if (contact.company_name || contact.job_title) detailScore += 2;
  if (contact.how_met) detailScore += 2;
  if (contact.hobbies_interests) detailScore += 3;
  if (contact.linkedin || contact.facebook || contact.twitter || contact.instagram) detailScore += 2;
  
  // Cap the detail score
  score += Math.min(10, detailScore);
  
  // Determine strength level
  let level: 'weak' | 'moderate' | 'strong';
  
  if (score >= 70) {
    level = 'strong';
  } else if (score >= 40) {
    level = 'moderate';
  } else {
    level = 'weak';
  }
  
  // Generate personalized suggestions
  const today = new Date();
  
  // Base suggestions on circle expectations
  if (contact.circle === "inner") {
    if (!contact.last_contact || differenceInDays(today, new Date(contact.last_contact)) > 14) {
      suggestions.push("Reach out soon - it's been a while since your last interaction");
    }
    
    if (numInteractions < 3) {
      suggestions.push("Log more interactions to build a stronger connection history");
    }
    
    if (!contact.mobile_phone && !contact.personal_email) {
      suggestions.push("Add contact details for easier communication");
    }
  } else if (contact.circle === "middle") {
    if (!contact.last_contact || differenceInDays(today, new Date(contact.last_contact)) > 30) {
      suggestions.push("Consider scheduling a catch-up soon");
    }
  } else { // outer circle
    if (numInteractions >= 3 && 
        contact.last_contact && 
        differenceInDays(today, new Date(contact.last_contact)) < 45) {
      suggestions.push("This contact shows potential - consider moving them to middle circle");
    }
  }

  // Suggestions based on missing information
  if (!contact.birthday) {
    suggestions.push("Add their birthday to remember this important date");
  }
  
  if (!contact.hobbies_interests) {
    suggestions.push("Note down their interests for more meaningful conversations");
  }

  // Suggestions based on interaction patterns
  if (numInteractions >= 2) {
    const interactionTypes = new Set(interactions.map(i => i.type));
    if (interactionTypes.size === 1) {
      suggestions.push("Try different types of interactions for a more balanced connection");
    }
  }

  // Career-related suggestions
  if (contact.job_title && contact.last_contact) {
    const monthsSinceLastContact = differenceInMonths(today, new Date(contact.last_contact));
    if (monthsSinceLastContact >= 6) {
      suggestions.push(`It's been ${monthsSinceLastContact} months - check if there are updates in their career`);
    }
  }

  // Special suggestions for inner circle
  if (contact.circle === "inner" && (!contact.notes || contact.notes.length < 50)) {
    suggestions.push("Add more detailed notes about this important relationship");
  }

  // Limit to most important 5 suggestions
  const limitedSuggestions = suggestions.slice(0, 5);

  return { score, level, suggestions: limitedSuggestions };
}
