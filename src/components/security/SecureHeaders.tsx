
import { useEffect } from "react";

/**
 * Component that sets secure HTTP headers via meta tags
 * This is a client-side implementation optimized for development environments
 * For production, these should be set on the server/CDN level for maximum security
 */
export function SecureHeaders() {
  useEffect(() => {
    // Detect if we're running in an iframe (like Lovable's development environment)
    const isInIframe = window !== window.top;
    const isLovableEnvironment = window.location.hostname.includes('lovable.dev') || 
                                 window.location.hostname.includes('gpteng.co') ||
                                 isInIframe;

    console.log('Security Headers - Environment check:', {
      isInIframe,
      isLovableEnvironment,
      hostname: window.location.hostname
    });

    // Enhanced Content Security Policy with better compatibility
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "img-src 'self' https: data: blob:",
      "media-src 'self' https: data: blob:", // For video/audio content
      "style-src 'self' 'unsafe-inline'", // Required for styled-components and Tailwind
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Development requirements
      `connect-src 'self' https://ubxepyzyzctzwsxxzjot.supabase.co wss://ubxepyzyzctzwsxxzjot.supabase.co https://api.stripe.com https://accounts.google.com`, // Allow necessary APIs
      "font-src 'self' data: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com", // Allow OAuth forms
      // Frame ancestors policy depends on environment
      isLovableEnvironment ? "frame-ancestors 'self' https://*.lovable.dev https://*.gpteng.co" : "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    document.head.appendChild(cspMeta);

    // X-Content-Type-Options prevents MIME type sniffing
    const xContentTypeMeta = document.createElement('meta');
    xContentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    xContentTypeMeta.content = 'nosniff';
    document.head.appendChild(xContentTypeMeta);

    // X-Frame-Options - conditional based on environment
    const xFrameOptionsMeta = document.createElement('meta');
    xFrameOptionsMeta.httpEquiv = 'X-Frame-Options';
    // Allow framing in Lovable development environment, deny elsewhere
    xFrameOptionsMeta.content = isLovableEnvironment ? 'SAMEORIGIN' : 'DENY';
    document.head.appendChild(xFrameOptionsMeta);

    // Referrer-Policy controls what information is sent in the Referer header
    const referrerPolicyMeta = document.createElement('meta');
    referrerPolicyMeta.name = 'referrer';
    referrerPolicyMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicyMeta);

    // Permissions-Policy (formerly Feature-Policy)
    const permissionsPolicyMeta = document.createElement('meta');
    permissionsPolicyMeta.httpEquiv = 'Permissions-Policy';
    permissionsPolicyMeta.content = [
      'camera=(self)',
      'microphone=(self)',
      'geolocation=()',
      'payment=(self)',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ');
    document.head.appendChild(permissionsPolicyMeta);

    console.log('Security headers applied:', {
      csp: cspMeta.content,
      xFrameOptions: xFrameOptionsMeta.content,
      environment: isLovableEnvironment ? 'development' : 'production'
    });

    // Clean up on component unmount
    return () => {
      document.head.removeChild(cspMeta);
      document.head.removeChild(xContentTypeMeta);
      document.head.removeChild(xFrameOptionsMeta);
      document.head.removeChild(referrerPolicyMeta);
      document.head.removeChild(permissionsPolicyMeta);
    };
  }, []);

  return null; // This component doesn't render anything
}
