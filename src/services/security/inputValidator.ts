
export class InputValidator {
  // Email validation with enhanced security
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email too long' };
    }

    return { isValid: true };
  }

  // Phone number validation
  static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    if (!phone) return { isValid: true }; // Optional field

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number must be between 10-15 digits' };
    }

    return { isValid: true };
  }

  // URL validation
  static validateUrl(url: string): { isValid: boolean; error?: string } {
    if (!url) return { isValid: true }; // Optional field

    try {
      const urlObj = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  // Text sanitization to prevent XSS
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 10000); // Limit length
  }

  // Validate contact data
  static validateContactData(data: any): { isValid: boolean; errors: string[]; sanitizedData: any } {
    const errors: string[] = [];
    const sanitizedData = { ...data };

    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else {
      sanitizedData.name = this.sanitizeText(data.name);
    }

    // Validate email if provided
    if (data.personal_email) {
      const emailValidation = this.validateEmail(data.personal_email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.error!);
      }
    }

    // Validate phone if provided
    if (data.mobile_phone) {
      const phoneValidation = this.validatePhoneNumber(data.mobile_phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error!);
      }
    }

    // Validate URLs
    const urlFields = ['website', 'linkedin', 'facebook', 'instagram', 'twitter'];
    urlFields.forEach(field => {
      if (data[field]) {
        const urlValidation = this.validateUrl(data[field]);
        if (!urlValidation.isValid) {
          errors.push(`${field}: ${urlValidation.error}`);
        }
      }
    });

    // Sanitize text fields
    const textFields = ['notes', 'company_name', 'job_title', 'location', 'industry', 'department', 'university', 'major', 'minor', 'how_met', 'hobbies_interests'];
    textFields.forEach(field => {
      if (data[field]) {
        sanitizedData[field] = this.sanitizeText(data[field]);
      }
    });

    // Validate circle value
    const validCircles = ['inner', 'middle', 'outer'];
    if (data.circle && !validCircles.includes(data.circle)) {
      errors.push('Invalid circle value');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }
}
