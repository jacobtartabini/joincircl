import { Contact } from "@/types/contact";
import { CONTACT_FIELD_DEFS, validateField, parseField } from "./csvFieldDefs";

// Map CSV columns to standardized keys (Name, Email, Phone, etc)
export function detectHeaders(fields: string[]): { [target: string]: string } {
  const mapping: { [target: string]: string } = {};
  for (const def of CONTACT_FIELD_DEFS) {
    const match = fields.find(f => def.keys.some(k => k.toLowerCase() === f.trim().toLowerCase()));
    if (match) mapping[def.label] = match;
  }
  return mapping;
}

// Client-side validation of imported data per field type
export function validateCSVContacts(
  contacts: Partial<Contact>[],
  headers: { label: string; required?: boolean; key: string; type: string; }[]
) {
  const validContacts: Partial<Contact>[] = [];
  const errors: { row: number; reason: string }[] = [];
  const emailSet = new Set<string>();

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    for (const h of headers) {
      const value = c[h.key as keyof Contact] as any as string;
      if (h.required && (!value || value === "")) {
        errors.push({ row: i + 2, reason: `${h.label} is required.` });
      }
      if (value && !validateField(value, h.type as any)) {
        errors.push({ row: i + 2, reason: `Invalid value for ${h.label}: ${value}` });
      }
    }
    // Email: format + duplicates
    if (c.personal_email && !/^[^@]+@[^@]+\.[^@]+$/.test(c.personal_email)) {
      errors.push({ row: i + 2, reason: `Invalid email format: ${c.personal_email}` });
    }
    if (c.personal_email) {
      const key = (c.personal_email as string).toLowerCase();
      if (emailSet.has(key)) {
        errors.push({ row: i + 2, reason: `Duplicate email: ${c.personal_email}` });
      }
      emailSet.add(key);
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
    if (headerMap[f.label] && row[headerMap[f.label]] !== undefined) {
      obj[f.key] = parseField(row[headerMap[f.label]], f.type);
    }
  }
  return obj as Partial<Contact>;
}
