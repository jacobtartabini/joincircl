
import { SecurityHeaders } from './securityHeaders';

export class EnhancedSecurityHeaders extends SecurityHeaders {
  static getEnhancedHeaders(): Record<string, string> {
    const baseHeaders = super.getSecurityHeaders();
    
    return {
      ...baseHeaders,
      // Enhanced Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'", // Required for Tailwind
        "img-src 'self' https: data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://ubxepyzyzctzwsxxzjot.supabase.co wss://ubxepyzyzctzwsxxzjot.supabase.co",
        "media-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '),
      
      // HTTP Strict Transport Security
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      
      // CSRF protection
      'X-CSRF-Token': 'required',
      
      // Cache control for sensitive pages
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  static applyCORSPolicy(): Record<string, string> {
    const allowedOrigins = [
      'https://app.joincircl.com',
      'https://ubxepyzyzctzwsxxzjot.supabase.co'
    ];

    return {
      'Access-Control-Allow-Origin': allowedOrigins.join(' '),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };
  }
}
