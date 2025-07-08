
export class SecurityHeaders {
  // Enhanced Content Security Policy
  static getCSPHeader(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ubxepyzyzctzwsxxzjot.supabase.co https://api.mapbox.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: https://ubxepyzyzctzwsxxzjot.supabase.co https://api.mapbox.com",
      "connect-src 'self' https://ubxepyzyzctzwsxxzjot.supabase.co wss://ubxepyzyzctzwsxxzjot.supabase.co https://api.mapbox.com",
      "media-src 'self' https://ubxepyzyzctzwsxxzjot.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ];
    
    return directives.join('; ');
  }

  // Enhanced security headers for API responses
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'Content-Security-Policy': this.getCSPHeader(),
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  // Apply security headers to fetch requests
  static applyToFetch(headers: HeadersInit = {}): HeadersInit {
    return {
      ...headers,
      ...this.getSecurityHeaders()
    };
  }

  // Validate response headers for security
  static validateResponseHeaders(response: Response): { secure: boolean; issues: string[] } {
    const issues: string[] = [];
    const headers = response.headers;

    // Check for required security headers
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security'
    ];

    requiredHeaders.forEach(header => {
      if (!headers.get(header)) {
        issues.push(`Missing security header: ${header}`);
      }
    });

    // Check for insecure values
    const xFrameOptions = headers.get('x-frame-options');
    if (xFrameOptions && !['DENY', 'SAMEORIGIN'].includes(xFrameOptions.toUpperCase())) {
      issues.push('Insecure X-Frame-Options value');
    }

    return {
      secure: issues.length === 0,
      issues
    };
  }
}
