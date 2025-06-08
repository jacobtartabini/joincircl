
import { InputValidator } from './inputValidator';

export class EnhancedInputValidator extends InputValidator {
  // Enhanced SQL injection prevention
  static sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove or escape SQL injection patterns
    return input
      .replace(/['";\\]/g, '') // Remove dangerous SQL characters
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '') // Remove SQL keywords
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments start
      .replace(/\*\//g, '') // Remove block comments end
      .trim()
      .slice(0, 1000); // Limit length
  }

  // Enhanced XSS prevention
  static sanitizeHtmlInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^<]*>/gi, '') // Remove embed tags
      .replace(/data:(?!image\/(?:png|jpe?g|gif|svg\+xml))[^;]*;/gi, '') // Remove non-image data URLs
      .trim();
  }

  // File upload validation
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    // Check file name for malicious patterns
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs', '.jar'];
    
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return { isValid: false, error: 'File extension not allowed' };
    }

    return { isValid: true };
  }

  // Enhanced contact data validation with security focus
  static validateSecureContactData(data: any): { isValid: boolean; errors: string[]; sanitizedData: any } {
    const baseValidation = this.validateContactData(data);
    const errors = [...baseValidation.errors];
    const sanitizedData = { ...baseValidation.sanitizedData };

    // Additional security validations
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        // Apply SQL injection protection
        sanitizedData[key] = this.sanitizeSqlInput(sanitizedData[key]);
        // Apply XSS protection
        sanitizedData[key] = this.sanitizeHtmlInput(sanitizedData[key]);
      }
    });

    // Validate against common injection patterns
    const suspiciousPatterns = [
      /\b(eval|setTimeout|setInterval|Function|exec)\s*\(/i,
      /\$\{.*\}/,
      /<%.*%>/,
      /\{\{.*\}\}/
    ];

    Object.values(sanitizedData).forEach((value, index) => {
      if (typeof value === 'string') {
        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(value)) {
            errors.push(`Suspicious content detected in field ${Object.keys(sanitizedData)[index]}`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  // API rate limiting validation
  static validateApiRequest(endpoint: string, userAgent?: string): { isValid: boolean; error?: string } {
    // Check for suspicious user agents
    if (userAgent) {
      const suspiciousAgents = ['sqlmap', 'nikto', 'burp', 'zap', 'nmap'];
      if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
        return { isValid: false, error: 'Suspicious user agent detected' };
      }
    }

    // Validate endpoint format
    if (!endpoint || typeof endpoint !== 'string') {
      return { isValid: false, error: 'Invalid endpoint' };
    }

    // Check for path traversal attempts
    if (endpoint.includes('..') || endpoint.includes('//')) {
      return { isValid: false, error: 'Path traversal attempt detected' };
    }

    return { isValid: true };
  }
}
