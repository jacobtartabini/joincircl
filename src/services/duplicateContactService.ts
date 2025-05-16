import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contact";
import { contactService } from "./contactService";

// Scoring thresholds
const DUPLICATE_THRESHOLD = 0.7; // 70% confidence for suggesting as duplicates
const HIGH_CONFIDENCE_THRESHOLD = 0.9; // 90% confidence for high confidence match

export interface DuplicatePair {
  contact1: Contact;
  contact2: Contact;
  score: number;
  matchedOn: string[];
  isHighConfidence: boolean;
}

export const duplicateContactService = {
  /**
   * Find potential duplicate contacts for a given user
   */
  async findDuplicates(): Promise<DuplicatePair[]> {
    try {
      // Get all user contacts
      const contacts = await contactService.getContacts();
      const duplicates: DuplicatePair[] = [];
      
      // Compare each contact with every other contact (n²) - for large datasets, 
      // this would need optimization, but for typical personal contact lists it's fine
      for (let i = 0; i < contacts.length; i++) {
        for (let j = i + 1; j < contacts.length; j++) {
          const contact1 = contacts[i];
          const contact2 = contacts[j];
          
          // Calculate similarity score
          const { score, matchedOn } = this.calculateSimilarity(contact1, contact2);
          
          // If score is above threshold, add to duplicates
          if (score >= DUPLICATE_THRESHOLD) {
            duplicates.push({
              contact1,
              contact2,
              score,
              matchedOn,
              isHighConfidence: score >= HIGH_CONFIDENCE_THRESHOLD
            });
          }
        }
      }
      
      // Sort by score, highest first
      return duplicates.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Error finding duplicates:", error);
      return [];
    }
  },
  
  /**
   * Calculate similarity score between two contacts
   * Returns a score between 0 (completely different) and 1 (exact match)
   */
  calculateSimilarity(contact1: Contact, contact2: Contact): { score: number; matchedOn: string[] } {
    const matchedOn: string[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    
    // Name comparison (highest weight) - 0.3
    const nameWeight = 0.3;
    if (contact1.name && contact2.name) {
      const nameSimilarity = this.stringSimilarity(
        contact1.name.toLowerCase(), 
        contact2.name.toLowerCase()
      );
      if (nameSimilarity > 0.8) {
        matchedOn.push('name');
        totalScore += nameSimilarity * nameWeight;
      }
      totalWeight += nameWeight;
    }
    
    // Email comparison - 0.25
    const emailWeight = 0.25;
    if (contact1.personal_email && contact2.personal_email) {
      const emailSimilarity = this.stringSimilarity(
        contact1.personal_email.toLowerCase(), 
        contact2.personal_email.toLowerCase()
      );
      if (emailSimilarity > 0.9) {
        matchedOn.push('email');
        totalScore += emailSimilarity * emailWeight;
      }
      totalWeight += emailWeight;
    }
    
    // Phone comparison - 0.25
    const phoneWeight = 0.25;
    if (contact1.mobile_phone && contact2.mobile_phone) {
      // Normalize phone numbers for comparison (remove non-digits)
      const phone1 = contact1.mobile_phone.replace(/\D/g, '');
      const phone2 = contact2.mobile_phone.replace(/\D/g, '');
      
      const phoneSimilarity = this.stringSimilarity(phone1, phone2);
      if (phoneSimilarity > 0.8) {
        matchedOn.push('phone');
        totalScore += phoneSimilarity * phoneWeight;
      }
      totalWeight += phoneWeight;
    }
    
    // Company and job title - 0.1
    const workWeight = 0.1;
    if (contact1.company_name && contact2.company_name && 
        contact1.job_title && contact2.job_title) {
      const companySimilarity = this.stringSimilarity(
        contact1.company_name.toLowerCase(), 
        contact2.company_name.toLowerCase()
      );
      
      const titleSimilarity = this.stringSimilarity(
        contact1.job_title.toLowerCase(), 
        contact2.job_title.toLowerCase()
      );
      
      const workSimilarity = (companySimilarity + titleSimilarity) / 2;
      
      if (workSimilarity > 0.8) {
        matchedOn.push('work');
        totalScore += workSimilarity * workWeight;
      }
      totalWeight += workWeight;
    }
    
    // Social media handles comparison - 0.1
    const socialWeight = 0.1;
    let socialScore = 0;
    let socialMatches = 0;
    
    // Check all social handles
    const socialHandles = ['linkedin', 'facebook', 'twitter', 'instagram'];
    for (const handle of socialHandles) {
      if (contact1[handle] && contact2[handle]) {
        const similarity = this.stringSimilarity(
          contact1[handle].toLowerCase(), 
          contact2[handle].toLowerCase()
        );
        if (similarity > 0.8) {
          socialScore += similarity;
          socialMatches++;
        }
      }
    }
    
    if (socialMatches > 0) {
      const avgSocialScore = socialScore / socialMatches;
      matchedOn.push('social');
      totalScore += avgSocialScore * socialWeight;
      totalWeight += socialWeight;
    }
    
    // Normalize score by actual weights used
    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return { score: normalizedScore, matchedOn };
  },
  
  /**
   * Calculate string similarity using Levenshtein distance
   * Returns a value between 0 (completely different) and 1 (identical)
   */
  stringSimilarity(str1: string, str2: string): number {
    if (!str1 && !str2) return 1; // Both empty = identical
    if (!str1 || !str2) return 0; // One empty = completely different
    
    // Check for exact match first
    if (str1 === str2) return 1;
    
    // Simple Levenshtein distance implementation
    const m = str1.length;
    const n = str2.length;
    
    // Create matrix
    const d: number[][] = [];
    for (let i = 0; i <= m; i++) {
      d[i] = [];
      d[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
      d[0][j] = j;
    }
    
    // Fill matrix
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= m; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,      // deletion
          d[i][j - 1] + 1,      // insertion
          d[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate similarity as 1 - normalized distance
    const distance = d[m][n];
    const maxLength = Math.max(m, n);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  },
  
  /**
   * Merge two contacts into a single contact
   * Returns the merged contact
   */
  async mergeContacts(primaryId: string, secondaryId: string): Promise<Contact | null> {
    try {
      // Get both contacts
      const primary = await contactService.getContact(primaryId);
      const secondary = await contactService.getContact(secondaryId);
      
      if (!primary || !secondary) {
        throw new Error("One or both contacts not found");
      }
      
      // Get interactions for the secondary contact
      const secondaryInteractions = await contactService.getInteractionsByContactId(secondaryId);
      
      // Start a transaction using Supabase
      // Step 1: Update the merged contact with combined data
      const mergedContact = this.combineContactData(primary, secondary);
      await contactService.updateContact(primaryId, mergedContact);
      
      // Step 2: Update all interactions from secondary contact to point to primary
      for (const interaction of secondaryInteractions) {
        await supabase
          .from('interactions')
          .update({ contact_id: primaryId })
          .eq('id', interaction.id);
      }
      
      // Step 3: Delete the secondary contact
      await contactService.deleteContact(secondaryId);
      
      // Return the merged contact
      return await contactService.getContact(primaryId);
    } catch (error) {
      console.error("Error merging contacts:", error);
      return null;
    }
  },
  
  /**
   * Combine data from two contacts, preferring the primary where there are conflicts
   */
  combineContactData(primary: Contact, secondary: Contact): Partial<Contact> {
    const merged: Partial<Contact> = { ...primary };
    
    // Combine tags (unique values only)
    const primaryTags = primary.tags || [];
    const secondaryTags = secondary.tags || [];
    merged.tags = [...new Set([...primaryTags, ...secondaryTags])];
    
    // For text fields, prefer primary if it exists, otherwise use secondary
    const textFields: (keyof Contact)[] = [
      'personal_email', 'mobile_phone', 'location', 'website',
      'linkedin', 'facebook', 'twitter', 'instagram',
      'company_name', 'job_title', 'industry', 'department',
      'work_address', 'university', 'major', 'minor',
      'how_met', 'hobbies_interests', 'notes'
    ];
    
    textFields.forEach(field => {
      // Use type assertion to handle the assignment
      if (!primary[field] && secondary[field]) {
        (merged[field] as any) = secondary[field];
      }
    });
    
    // For numeric fields, prefer primary if it exists
    if (!primary.graduation_year && secondary.graduation_year) {
      merged.graduation_year = secondary.graduation_year;
    }
    
    // For date fields, prefer primary if it exists
    if (!primary.birthday && secondary.birthday) {
      merged.birthday = secondary.birthday;
    }
    
    // For last_contact, use the most recent date
    if (primary.last_contact && secondary.last_contact) {
      const primaryDate = new Date(primary.last_contact);
      const secondaryDate = new Date(secondary.last_contact);
      merged.last_contact = primaryDate > secondaryDate 
        ? primary.last_contact 
        : secondary.last_contact;
    } else {
      merged.last_contact = primary.last_contact || secondary.last_contact;
    }
    
    // For circle, prefer the inner-most circle (highest priority)
    const circleMap = { 'inner': 1, 'middle': 2, 'outer': 3 };
    if (primary.circle && secondary.circle && circleMap[primary.circle] > circleMap[secondary.circle]) {
      merged.circle = secondary.circle;
    }
    
    // Track origin in notes
    const originNote = `\n\nThis contact was merged with another contact (${secondary.name}) on ${new Date().toLocaleDateString()}.`;
    merged.notes = (merged.notes || '') + originNote;
    
    return merged;
  },
  
  /**
   * Undo a merge operation (for recently merged contacts)
   * This would require storing merge history, not implemented in this version
   */
  async undoMerge(/* params */): Promise<boolean> {
    // This would require additional database tables and logic to track merge history
    // Not implemented in this simplified version
    return false;
  }
};
