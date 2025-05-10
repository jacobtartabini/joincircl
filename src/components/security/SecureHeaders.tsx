
import { useEffect } from "react";

/**
 * Component that sets secure HTTP headers via meta tags
 * This is a client-side implementation, which is not as effective as server headers
 * For production, these should be set on the server/CDN level
 */
export function SecureHeaders() {
  useEffect(() => {
    // Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "img-src 'self' https: data:",
      "style-src 'self' 'unsafe-inline'", // Required for styled-components
      "script-src 'self'",
      `connect-src 'self' https://ubxepyzyzctzwsxxzjot.supabase.co`, // Allow Supabase
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    document.head.appendChild(cspMeta);

    // X-Content-Type-Options prevents MIME type sniffing
    const xContentTypeMeta = document.createElement('meta');
    xContentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    xContentTypeMeta.content = 'nosniff';
    document.head.appendChild(xContentTypeMeta);

    // X-Frame-Options prevents clickjacking
    const xFrameOptionsMeta = document.createElement('meta');
    xFrameOptionsMeta.httpEquiv = 'X-Frame-Options';
    xFrameOptionsMeta.content = 'DENY';
    document.head.appendChild(xFrameOptionsMeta);

    // Referrer-Policy controls what information is sent in the Referer header
    const referrerPolicyMeta = document.createElement('meta');
    referrerPolicyMeta.name = 'referrer';
    referrerPolicyMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicyMeta);

    // Clean up on component unmount
    return () => {
      document.head.removeChild(cspMeta);
      document.head.removeChild(xContentTypeMeta);
      document.head.removeChild(xFrameOptionsMeta);
      document.head.removeChild(referrerPolicyMeta);
    };
  }, []);

  return null; // This component doesn't render anything
}
