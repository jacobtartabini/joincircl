
import DOMPurify from 'dompurify';

export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone number validation
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Sanitize HTML content
  static sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize text input
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  // Validate contact data
  static validateContactData(data: any): { isValid: boolean; errors: string[]; sanitizedData: any } {
    const errors: string[] = [];
    const sanitizedData = { ...data };

    if (!data.name || data.name.length < 1) {
      errors.push('Name is required');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    if (data.personal_email && !this.isValidEmail(data.personal_email)) {
      errors.push('Invalid email format');
    }

    if (data.mobile_phone && !this.isValidPhoneNumber(data.mobile_phone)) {
      errors.push('Invalid phone number format');
    }

    if (data.website && !this.isValidUrl(data.website)) {
      errors.push('Invalid website URL');
    }

    if (data.linkedin && !this.isValidUrl(data.linkedin)) {
      errors.push('Invalid LinkedIn URL');
    }

    // Validate circle
    const validCircles = ['inner', 'middle', 'outer'];
    if (data.circle && !validCircles.includes(data.circle)) {
      errors.push('Invalid circle value');
    }

    // Sanitize text fields
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = this.sanitizeText(sanitizedData[key]);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  // Validate keystone data
  static validateKeystoneData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.length < 1) {
      errors.push('Title is required');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!data.date) {
      errors.push('Date is required');
    }

    if (data.date && isNaN(new Date(data.date).getTime())) {
      errors.push('Invalid date format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting check
  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    if (typeof window === 'undefined') return true;

    const now = Date.now();
    const windowStart = now - windowMs;
    
    let requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
    
    // Remove old requests outside the window
    requests = requests.filter((timestamp: number) => timestamp > windowStart);
    
    if (requests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    requests.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(requests));
    
    return true;
  }
}
