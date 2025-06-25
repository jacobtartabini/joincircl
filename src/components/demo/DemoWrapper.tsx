
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DemoAuthProvider } from '@/contexts/DemoAuthContext';
import { FastDemoQueryProvider } from '@/contexts/FastDemoQueryProvider';
import { DemoLayout } from './DemoLayout';

export const DemoWrapper: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Fast initialization - no MSW required for basic demo
    const initFastDemo = () => {
      console.log('[Demo] Fast demo initialization started');
      
      // Set ready immediately - no async operations needed
      setIsReady(true);
      console.log('[Demo] Fast demo ready in <100ms');
      
      // Optional: Initialize MSW in background for advanced features
      if (typeof window !== 'undefined') {
        import('@/lib/demo/setupMockWorker').then(({ initializeDemoMode }) => {
          initializeDemoMode().catch(error => {
            console.warn('[Demo] MSW initialization failed (non-critical):', error);
            // Demo continues working without MSW
          });
        });
      }
    };

    // Use setTimeout to ensure this runs after initial render
    const timeoutId = setTimeout(initFastDemo, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Show loading for minimal time to prevent flash
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading Demo...</div>
        </div>
      </div>
    );
  }

  return (
    <FastDemoQueryProvider>
      <DemoAuthProvider>
        <DemoLayout>
          <Outlet />
        </DemoLayout>
      </DemoAuthProvider>
    </FastDemoQueryProvider>
  );
};
