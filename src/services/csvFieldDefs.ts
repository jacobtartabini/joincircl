/**
 * All contact fields, label, type, and matching keys
 * Used for smarter header detection, mapping, and validation.
 */

export type ContactFieldDef = {
  label: string;
  key: string;
  required?: boolean; // Not enforced for CSV imports
  type: "string" | "email" | "phone" | "date" | "number" | "array" | "boolean" | "circle" | "url";
  keys: string[]; // Alternative/synonyms for auto-mapping
  example?: string;
  group: "Basic" | "Professional" | "Education" | "Social" | "Personal" | "Career" | "Other";
};

export const CONTACT_FIELD_DEFS: ContactFieldDef[] = [
  // --- Basic Info ---
  {
    label: "Name", key: "name", type: "string", group: "Basic",
    keys: ["name", "full name"]
  },
  {
    label: "Email", key: "personal_email", type: "email", group: "Basic",
    keys: ["email", "e-mail", "personal_email"]
  },
  {
    label: "Phone", key: "mobile_phone", type: "phone", group: "Basic",
    keys: ["phone", "mobile", "mobile_phone"]
  },
  {
    label: "Notes", key: "notes", type: "string", group: "Basic",
    keys: ["notes", "summary", "description"]
  },
  {
    label: "Avatar URL", key: "avatar_url", type: "url", group: "Basic",
    keys: ["avatar", "avatar_url", "photo", "image"]
  },
  {
    label: "Tags", key: "tags", type: "array", group: "Basic",
    keys: ["tags", "interests", "labels"]
  },
  {
    label: "Circle", key: "circle", type: "circle", group: "Basic",
    keys: ["circle", "circle_level"]
  },
  {
    label: "Last Contact", key: "last_contact", type: "date", group: "Basic",
    keys: ["last_contact", "last contacted"]
  },
  // --- Professional ---
  {
    label: "Company", key: "company_name", type: "string", group: "Professional",
    keys: ["company", "company_name", "workplace"]
  },
  {
    label: "Job Title", key: "job_title", type: "string", group: "Professional",
    keys: ["job_title", "title", "position"]
  },
  {
    label: "Industry", key: "industry", type: "string", group: "Professional",
    keys: ["industry"]
  },
  {
    label: "Department", key: "department", type: "string", group: "Professional",
    keys: ["department"]
  },
  {
    label: "Work Address", key: "work_address", type: "string", group: "Professional",
    keys: ["work_address", "company address", "office_address"]
  },
  {
    label: "Referral Potential", key: "referral_potential", type: "string", group: "Professional",
    keys: ["referral_potential", "can refer"]
  },
  // --- Education ---
  {
    label: "University", key: "university", type: "string", group: "Education",
    keys: ["university", "school"]
  },
  {
    label: "Major", key: "major", type: "string", group: "Education",
    keys: ["major", "field of study"]
  },
  {
    label: "Minor", key: "minor", type: "string", group: "Education",
    keys: ["minor"]
  },
  {
    label: "Graduation Year", key: "graduation_year", type: "number", group: "Education",
    keys: ["graduation_year", "grad_year"]
  },
  // --- Socials ---
  {
    label: "Website", key: "website", type: "url", group: "Social",
    keys: ["website", "webpage", "url"]
  },
  {
    label: "LinkedIn", key: "linkedin", type: "url", group: "Social",
    keys: ["linkedin", "linkedin url"]
  },
  {
    label: "Facebook", key: "facebook", type: "url", group: "Social",
    keys: ["facebook", "fb"]
  },
  {
    label: "Twitter", key: "twitter", type: "url", group: "Social",
    keys: ["twitter", "x", "twitter url"]
  },
  {
    label: "Instagram", key: "instagram", type: "url", group: "Social",
    keys: ["instagram", "ig"]
  },
  // --- Personal/Lifestyle ---
  {
    label: "Birthday", key: "birthday", type: "date", group: "Personal",
    keys: ["birthday", "dob", "birthdate"]
  },
  {
    label: "Location", key: "location", type: "string", group: "Personal",
    keys: ["location", "city"]
  },
  {
    label: "How Met", key: "how_met", type: "string", group: "Personal",
    keys: ["how_met", "met at"]
  },
  {
    label: "Hobbies / Interests", key: "hobbies_interests", type: "string", group: "Personal",
    keys: ["hobbies", "interests", "hobbies_interests"]
  },
  // --- Career (Advanced) ---
  {
    label: "Career Priority", key: "career_priority", type: "boolean", group: "Career",
    keys: ["career_priority", "career focus"]
  },
  {
    label: "Career Tags", key: "career_tags", type: "array", group: "Career",
    keys: ["career_tags", "career labels"]
  },
  {
    label: "Career Event Id", key: "career_event_id", type: "string", group: "Career",
    keys: ["career_event_id"]
  },
  // --- Other/Advanced ---
  {
    label: "User ID", key: "user_id", type: "string", group: "Other",
    keys: ["user_id"]
  }
];

// Field type helpers

// Validate value for a given field type (per column)
export function validateField(value: string, type: ContactFieldDef["type"]): boolean {
  if (!value || value.trim() === "") return true; // Empty values are always valid for CSV import
  
  switch (type) {
    case "email":
      return /^[^@]+@[^@]+\.[^@]+$/.test(value);
    case "url":
      // Allow empty, or http/https links
      return /^https?:\/\/.+/.test(value) || /^www\./.test(value);
    case "phone":
      // Accept any digit groups w/ optional +,-,space, (basic check)
      return /^[+()\d .-]{7,}$/.test(value);
    case "number":
      return !isNaN(Number(value));
    case "date":
      // Accept YYYY-MM-DD or similar
      return !isNaN(Date.parse(value));
    case "boolean":
      return /^(true|false|yes|no|1|0)?$/i.test(value);
    case "circle":
      return ["inner", "middle", "outer"].includes(value.toLowerCase());
    case "array":
      // Always OK, will parse as string[]
      return true;
    case "string":
    default:
      return true;
  }
}

// Parse a value (string) to correct data type for backend insert
export function parseField(value: string, type: ContactFieldDef["type"]) {
  if (!value || value.trim() === "") return null;
  
  switch (type) {
    case "email":
      return value.trim();
    case "url":
      // Normalize: add http if missing
      return value.startsWith("http") ? value.trim() : "https://" + value.trim();
    case "phone":
      return value.trim();
    case "number":
      return Number(value);
    case "date":
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
      return value;
    case "boolean":
      // Accept true/false/yes/no/1/0
      return /^(true|yes|1)$/i.test(value);
    case "circle":
      const v = value.toLowerCase();
      if (["inner", "middle", "outer"].includes(v)) return v;
      return "outer";
    case "array":
      // Split by comma, trim entries, filter empty
      return value.split(",").map(v => v.trim()).filter(Boolean);
    case "string":
    default:
      return value;
  }
}

// Human example value for UI hints
export function getExample(type: ContactFieldDef["type"]): string {
  switch (type) {
    case "email": return "janedoe@email.com";
    case "phone": return "+1-222-333-4444";
    case "url": return "https://linkedin.com/in/janedoe";
    case "date": return "2024-06-20";
    case "boolean": return "true / false";
    case "number": return "2022";
    case "array": return "alumni, tennis, friend";
    case "circle": return "inner / middle / outer";
    default: return "Jane Doe";
  }
}
