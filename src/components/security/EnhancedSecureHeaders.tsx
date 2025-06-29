
import { useEffect } from "react";
import { EnhancedSecurityHeaders } from "@/services/security/enhancedSecurityHeaders";

/**
 * Enhanced component that sets comprehensive security headers via meta tags
 * This is a client-side implementation - for production, these should be set on the server/CDN level
 */
export function EnhancedSecureHeaders() {
  useEffect(() => {
    const headers = EnhancedSecurityHeaders.getEnhancedHeaders();
    const corsHeaders = EnhancedSecurityHeaders.applyCORSPolicy();
    
    const allHeaders = { ...headers, ...corsHeaders };
    const metaTags: HTMLMetaElement[] = [];

    // Apply security headers as meta tags
    Object.entries(allHeaders).forEach(([name, value]) => {
      // Only apply headers that can be set via meta tags
      if (name.startsWith('Content-Security-Policy') || 
          name.startsWith('X-') || 
          name === 'Referrer-Policy' ||
          name === 'Permissions-Policy') {
        
        const meta = document.createElement('meta');
        meta.httpEquiv = name;
        meta.content = value;
        document.head.appendChild(meta);
        metaTags.push(meta);
      }
    });

    // Add viewport meta tag for security
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);
    metaTags.push(viewportMeta);

    // Add robots meta tag
    const robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.content = 'noindex, nofollow, noarchive, nosnippet, notranslate';
    document.head.appendChild(robotsMeta);
    metaTags.push(robotsMeta);

    // Clean up on component unmount
    return () => {
      metaTags.forEach(meta => {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
