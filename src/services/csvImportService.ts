
import { Contact } from "@/types/contact";

// Map CSV columns to standardized keys (Name, Email, Phone, etc)
export function detectHeaders(fields: string[]): { [target: string]: string } {
  const mapping: { [target: string]: string } = {};
  const targets = [
    { label: "Name", keys: ["name", "full name"] },
    { label: "Email", keys: ["email", "e-mail"] },
    { label: "Phone", keys: ["phone", "mobile", "mobile_phone"] },
    { label: "Company", keys: ["company", "company_name"] },
    { label: "Job Title", keys: ["job_title", "title"] },
  ];
  for (const t of targets) {
    const match = fields.find(f =>
      t.keys.some(k => k.toLowerCase() === f.trim().toLowerCase())
    );
    if (match) mapping[t.label] = match;
  }
  return mapping;
}

// Basic client-side validation
export function validateCSVContacts(
  contacts: Partial<Contact>[],
  headers: { label: string; required: boolean }[]
) {
  const validContacts: Partial<Contact>[] = [];
  const errors: { row: number; reason: string }[] = [];
  const emailSet = new Set<string>();
  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    // Check required
    for (const h of headers) {
      if (h.required && !c[getKeyByLabel(h.label)]) {
        errors.push({ row: i + 2, reason: `${h.label} is required.` }); // +2 for CSV row # (header = row 1)
      }
    }
    // Email format
    if (c.personal_email && !/^[^@]+@[^@]+\.[^@]+$/.test(c.personal_email)) {
      errors.push({ row: i + 2, reason: `Invalid email format: ${c.personal_email}` });
    }
    // Duplicates in upload set
    if (c.personal_email) {
      const key = c.personal_email.toLowerCase();
      if (emailSet.has(key)) {
        errors.push({ row: i + 2, reason: `Duplicate email: ${c.personal_email}` });
      }
      emailSet.add(key);
    }
    validContacts.push(c);
  }
  return { validContacts, errors };
}

function getKeyByLabel(label: string) {
  switch (label) {
    case "Name": return "name";
    case "Email": return "personal_email";
    case "Phone": return "mobile_phone";
    case "Company": return "company_name";
    case "Job Title": return "job_title";
    default: return label.toLowerCase().replace(/ /g, "_");
  }
}
