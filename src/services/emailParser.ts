
/**
 * Enhanced email parsing service for handling multiple emails with type inference
 */

export interface ParsedEmail {
  email: string;
  type: 'personal' | 'work' | 'other';
  isPrimary?: boolean;
}

// Common work domain patterns for type inference
const WORK_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 
  'aol.com', 'protonmail.com', 'tutanota.com'
];

const PERSONAL_INDICATORS = ['personal', 'private', 'home'];
const WORK_INDICATORS = ['work', 'office', 'business', 'corp', 'company'];

/**
 * Infer email type based on domain and context
 */
function inferEmailType(email: string, context?: string): 'personal' | 'work' | 'other' {
  const emailLower = email.toLowerCase();
  const contextLower = context?.toLowerCase() || '';
  
  // Check context indicators first
  if (PERSONAL_INDICATORS.some(indicator => contextLower.includes(indicator))) {
    return 'personal';
  }
  if (WORK_INDICATORS.some(indicator => contextLower.includes(indicator))) {
    return 'work';
  }
  
  // Check domain patterns
  const domain = emailLower.split('@')[1];
  if (domain) {
    // Common personal email providers
    if (WORK_DOMAINS.includes(domain)) {
      return 'personal';
    }
    // Corporate domains (not in common providers list)
    return 'work';
  }
  
  return 'other';
}

/**
 * Parse multiple emails from various formats and delimiters
 */
export function parseMultipleEmails(emailString: string, context?: string): ParsedEmail[] {
  if (!emailString || typeof emailString !== 'string') {
    return [];
  }

  // Common delimiters: comma, semicolon, pipe, space, newline
  const delimiters = /[,;|\s\n\r]+/;
  
  // Split and clean emails
  const emailCandidates = emailString
    .split(delimiters)
    .map(email => email.trim())
    .filter(email => email.length > 0);

  const parsedEmails: ParsedEmail[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailCandidates.forEach((candidate, index) => {
    // Handle labeled emails like "Work: john@company.com" or "john@company.com (work)"
    let email = candidate;
    let typeContext = context || '';
    
    // Extract labels in formats: "Label: email" or "email (label)"
    const labelColonMatch = candidate.match(/^([^:]+):\s*(.+)$/);
    const labelParenMatch = candidate.match(/^(.+)\s*\(([^)]+)\)$/);
    
    if (labelColonMatch) {
      typeContext = labelColonMatch[1].trim();
      email = labelColonMatch[2].trim();
    } else if (labelParenMatch) {
      email = labelParenMatch[1].trim();
      typeContext = labelParenMatch[2].trim();
    }
    
    // Validate email format
    if (emailRegex.test(email)) {
      const inferredType = inferEmailType(email, typeContext);
      
      parsedEmails.push({
        email: email.toLowerCase(),
        type: inferredType,
        isPrimary: index === 0 // First email is considered primary
      });
    }
  });

  // Remove duplicates while preserving order
  const uniqueEmails = parsedEmails.reduce((acc: ParsedEmail[], current) => {
    if (!acc.find(e => e.email === current.email)) {
      acc.push(current);
    }
    return acc;
  }, []);

  return uniqueEmails;
}

/**
 * Get the primary email from parsed emails array
 */
export function getPrimaryEmail(emails: ParsedEmail[]): string | null {
  if (!emails || emails.length === 0) return null;
  
  const primary = emails.find(e => e.isPrimary);
  return primary?.email || emails[0]?.email || null;
}

/**
 * Convert ParsedEmail array to JSONB format for database storage
 */
export function emailsToJsonb(emails: ParsedEmail[]): any[] {
  return emails.map(({ email, type, isPrimary }) => ({
    email,
    type,
    isPrimary: isPrimary || false
  }));
}

/**
 * Convert JSONB emails back to ParsedEmail array
 */
export function emailsFromJsonb(jsonbEmails: any): ParsedEmail[] {
  if (!Array.isArray(jsonbEmails)) return [];
  
  return jsonbEmails.map(item => ({
    email: item.email || '',
    type: item.type || 'other',
    isPrimary: item.isPrimary || false
  })).filter(item => item.email.length > 0);
}
