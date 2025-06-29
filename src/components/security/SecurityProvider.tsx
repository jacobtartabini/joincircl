
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { EnhancedSecurityHeaders } from '@/services/security/enhancedSecurityHeaders';

interface SecurityContextType {
  validateAndSanitizeInput: (data: any, type?: 'contact' | 'keystone') => any;
  checkRateLimit: (action: string, maxRequests?: number) => boolean;
  getSecureHeaders: () => Record<string, string>;
  logSecurityEvent: (event: any) => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const security = useEnhancedSecurity();

  useEffect(() => {
    // Apply security headers
    const headers = EnhancedSecurityHeaders.getEnhancedHeaders();
    
    // Set meta tags for security headers (client-side fallback)
    Object.entries(headers).forEach(([name, value]) => {
      if (name.startsWith('Content-Security-Policy') || 
          name.startsWith('X-') || 
          name === 'Referrer-Policy') {
        let meta = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.httpEquiv = name;
          document.head.appendChild(meta);
        }
        meta.content = value;
      }
    });

    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
