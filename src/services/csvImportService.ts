
import { Contact } from "@/types/contact";
import { CONTACT_FIELD_DEFS, validateField, parseField } from "./csvFieldDefs";
import { parseMultipleEmails, getPrimaryEmail, emailsToJsonb } from "./emailParser";

// Map CSV columns to standardized keys (Name, Email, Phone, etc)
export function detectHeaders(fields: string[]): { [target: string]: string } {
  const mapping: { [target: string]: string } = {};
  for (const def of CONTACT_FIELD_DEFS) {
    const match = fields.find(f => def.keys.some(k => k.toLowerCase() === f.trim().toLowerCase()));
    if (match) mapping[def.label] = match;
  }
  return mapping;
}

// Client-side validation of imported data per field type - NO REQUIRED FIELDS FOR CSV IMPORT
export function validateCSVContacts(
  contacts: Partial<Contact>[],
  headers: { label: string; required?: boolean; key: string; type: string; }[]
) {
  const validContacts: Partial<Contact>[] = [];
  const errors: { row: number; reason: string }[] = [];
  const emailSet = new Set<string>();

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    
    // Skip required field validation for CSV imports - only validate data format
    for (const h of headers) {
      const value = c[h.key as keyof Contact] as any as string;
      
      // Only validate format if value exists, don't require any fields
      if (value && value.trim() !== "" && !validateField(value, h.type as any)) {
        errors.push({ row: i + 2, reason: `Invalid format for ${h.label}: ${value}` });
      }
    }
    
    // Enhanced email validation for both single and multiple emails
    const emailsData = c.emails as any;
    const singleEmail = c.personal_email;
    
    // Check single email format and duplicates
    if (singleEmail && singleEmail.trim() !== "") {
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(singleEmail)) {
        errors.push({ row: i + 2, reason: `Invalid email format: ${singleEmail}` });
      } else {
        const key = singleEmail.toLowerCase();
        if (emailSet.has(key)) {
          errors.push({ row: i + 2, reason: `Duplicate email: ${singleEmail}` });
        }
        emailSet.add(key);
      }
    }
    
    // Check multiple emails if present
    if (emailsData && Array.isArray(emailsData)) {
      for (const emailObj of emailsData) {
        if (emailObj.email && emailObj.email.trim() !== "") {
          if (!/^[^@]+@[^@]+\.[^@]+$/.test(emailObj.email)) {
            errors.push({ row: i + 2, reason: `Invalid email format in emails array: ${emailObj.email}` });
          } else {
            const key = emailObj.email.toLowerCase();
            if (emailSet.has(key)) {
              errors.push({ row: i + 2, reason: `Duplicate email in emails array: ${emailObj.email}` });
            }
            emailSet.add(key);
          }
        }
      }
    }
    
    validContacts.push(c);
  }
  return { validContacts, errors };
}

// Extract key for field by label (uses field defs)
export function getKeyByLabel(label: string): string {
  const def = CONTACT_FIELD_DEFS.find(f => f.label === label);
  return def ? def.key : label.toLowerCase().replace(/ /g, "_");
}

// Generate Contact object from a csv row + mapping
export function parseContactFromRow(row: any, headerMap: { [target: string]: string }) {
  const obj: any = {};
  
  for (const f of CONTACT_FIELD_DEFS) {
    if (headerMap[f.label] && row[headerMap[f.label]] !== undefined && row[headerMap[f.label]] !== "") {
      const rawValue = row[headerMap[f.label]];
      
      if (f.type === "emails") {
        // Parse multiple emails using the email parser
        const parsedEmails = parseMultipleEmails(rawValue);
        if (parsedEmails.length > 0) {
          obj[f.key] = emailsToJsonb(parsedEmails);
          
          // Also set the primary email as personal_email for backward compatibility
          const primaryEmail = getPrimaryEmail(parsedEmails);
          if (primaryEmail && !obj.personal_email) {
            obj.personal_email = primaryEmail;
          }
        }
      } else {
        obj[f.key] = parseField(rawValue, f.type);
      }
    }
  }
  
  return obj as Partial<Contact>;
}
