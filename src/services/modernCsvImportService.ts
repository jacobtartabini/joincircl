
import { Contact } from "@/types/contact";
import { parseMultipleEmails, getPrimaryEmail, emailsToJsonb } from "./emailParser";

// Fixed CSV template structure - exact headers required
export const REQUIRED_CSV_HEADERS = [
  'name',
  'personal_email', 
  'mobile_phone',
  'circle',
  'company_name',
  'job_title',
  'location',
  'tags',
  'notes',
  'last_contact',
  'website',
  'linkedin',
  'birthday',
  'how_met'
] as const;

export const OPTIONAL_CSV_HEADERS = [
  'facebook',
  'twitter', 
  'instagram',
  'industry',
  'department',
  'work_address',
  'university',
  'major',
  'minor',
  'graduation_year',
  'hobbies_interests'
] as const;

export const ALL_CSV_HEADERS = [...REQUIRED_CSV_HEADERS, ...OPTIONAL_CSV_HEADERS] as const;

export interface CsvValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  errors: CsvValidationError[];
  contacts: Partial<Contact>[];
  totalRows: number;
  validRows: number;
}

// Column descriptions for tooltips
export const CSV_COLUMN_DESCRIPTIONS: Record<string, string> = {
  name: "Full name of the contact (required)",
  personal_email: "Email address(es). Use semicolon (;) to separate multiple emails",
  mobile_phone: "Phone number in any format",
  circle: "Relationship closeness: inner, middle, or outer",
  company_name: "Company or organization name",
  job_title: "Job title or position",
  location: "City, state, or general location",
  tags: "Comma-separated tags (e.g., friend, colleague, alumni)",
  notes: "Additional notes about the contact",
  last_contact: "Date of last contact (YYYY-MM-DD format)",
  website: "Personal or professional website URL",
  linkedin: "LinkedIn profile URL",
  birthday: "Birthday (YYYY-MM-DD format)",
  how_met: "How you met this person"
};

// Generate template CSV content
export function generateCsvTemplate(includeOptional: boolean = false): string {
  const headers = includeOptional ? ALL_CSV_HEADERS : REQUIRED_CSV_HEADERS;
  
  const exampleRows = [
    headers.join(','),
    [
      'John Doe',
      'john@personal.com;john.doe@company.com',
      '+1-555-0123',
      'middle',
      'Tech Corp',
      'Software Engineer',
      'San Francisco, CA',
      'colleague,tech,friend',
      'Met at tech conference',
      '2024-01-15',
      'https://johndoe.com',
      'https://linkedin.com/in/johndoe',
      '1990-05-15',
      'Tech conference 2023',
      ...(includeOptional ? [
        'https://facebook.com/johndoe',
        'https://twitter.com/johndoe',
        'https://instagram.com/johndoe',
        'Technology',
        'Engineering',
        '123 Tech St, San Francisco, CA',
        'Stanford University',
        'Computer Science',
        'Mathematics',
        '2012',
        'Coding, hiking, photography'
      ] : [])
    ].join(','),
    [
      'Jane Smith',
      'jane.smith@email.com',
      '555-987-6543',
      'inner',
      'Design Studio',
      'UX Designer',
      'New York, NY',
      'close friend,design',
      'College roommate',
      '2024-02-20',
      '',
      'https://linkedin.com/in/janesmith',
      '1988-12-03',
      'College',
      ...(includeOptional ? Array(11).fill('') : [])
    ].join(',')
  ];
  
  return exampleRows.join('\n');
}

// Validate CSV structure and headers
export function validateCsvStructure(csvText: string): { isValid: boolean; error?: string; headers?: string[] } {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return { isValid: false, error: 'CSV must have at least a header row and one data row' };
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = REQUIRED_CSV_HEADERS.map(h => h.toLowerCase());
  
  // Check if all required headers are present
  const missingHeaders = requiredHeaders.filter(required => !headers.includes(required));
  if (missingHeaders.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required headers: ${missingHeaders.join(', ')}. Please use our exact template format.` 
    };
  }
  
  // Check for unexpected headers (optional - warn but don't fail)
  const allowedHeaders = ALL_CSV_HEADERS.map(h => h.toLowerCase());
  const unexpectedHeaders = headers.filter(h => !allowedHeaders.includes(h));
  
  if (unexpectedHeaders.length > 0) {
    return { 
      isValid: false, 
      error: `Unexpected headers found: ${unexpectedHeaders.join(', ')}. Please use only the headers from our template.` 
    };
  }
  
  return { isValid: true, headers };
}

// Parse and validate CSV data
export function parseAndValidateCsv(csvText: string, userId: string): CsvValidationResult {
  const structureCheck = validateCsvStructure(csvText);
  if (!structureCheck.isValid) {
    return {
      isValid: false,
      errors: [{ row: 0, field: 'structure', value: '', message: structureCheck.error || 'Invalid CSV structure' }],
      contacts: [],
      totalRows: 0,
      validRows: 0
    };
  }
  
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dataRows = lines.slice(1);
  
  const contacts: Partial<Contact>[] = [];
  const errors: CsvValidationError[] = [];
  const processedEmails = new Set<string>();
  
  dataRows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because we skip header (row 1) and array is 0-indexed
    const values = row.split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      errors.push({
        row: rowNumber,
        field: 'structure',
        value: row,
        message: `Row has ${values.length} columns but expected ${headers.length}`
      });
      return;
    }
    
    const contact: Partial<Contact> = { user_id: userId };
    
    headers.forEach((header, headerIndex) => {
      const value = values[headerIndex];
      
      switch (header) {
        case 'name':
          if (!value) {
            errors.push({ row: rowNumber, field: header, value, message: 'Name is required' });
          } else {
            contact.name = value;
          }
          break;
          
        case 'personal_email':
          if (value) {
            // Handle multiple emails
            const parsedEmails = parseMultipleEmails(value);
            if (parsedEmails.length === 0) {
              errors.push({ row: rowNumber, field: header, value, message: 'Invalid email format' });
            } else {
              // Check for duplicate emails
              const primaryEmail = getPrimaryEmail(parsedEmails);
              if (primaryEmail) {
                const emailKey = primaryEmail.toLowerCase();
                if (processedEmails.has(emailKey)) {
                  errors.push({ row: rowNumber, field: header, value: primaryEmail, message: 'Duplicate email address' });
                } else {
                  processedEmails.add(emailKey);
                  contact.personal_email = primaryEmail;
                  if (parsedEmails.length > 1) {
                    contact.emails = emailsToJsonb(parsedEmails);
                  }
                }
              }
            }
          }
          break;
          
        case 'circle':
          if (value && !['inner', 'middle', 'outer'].includes(value.toLowerCase())) {
            errors.push({ row: rowNumber, field: header, value, message: 'Circle must be: inner, middle, or outer' });
          } else {
            contact.circle = (value.toLowerCase() as 'inner' | 'middle' | 'outer') || 'outer';
          }
          break;
          
        case 'tags':
          if (value) {
            contact.tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
          }
          break;
          
        case 'last_contact':
        case 'birthday':
          if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              errors.push({ row: rowNumber, field: header, value, message: 'Invalid date format (use YYYY-MM-DD)' });
            } else {
              if (header === 'last_contact') {
                contact.last_contact = date.toISOString();
              } else {
                contact.birthday = value;
              }
            }
          }
          break;
          
        case 'graduation_year':
          if (value) {
            const year = parseInt(value);
            if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
              errors.push({ row: rowNumber, field: header, value, message: 'Invalid graduation year' });
            } else {
              contact.graduation_year = year;
            }
          }
          break;
          
        default:
          // Handle all other string fields
          if (value) {
            (contact as any)[header] = value;
          }
          break;
      }
    });
    
    // Only add contact if it has a name (minimum requirement)
    if (contact.name) {
      contacts.push(contact);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    contacts,
    totalRows: dataRows.length,
    validRows: contacts.length
  };
}
