
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DemoAuthProvider } from '@/contexts/DemoAuthContext';
import { DemoLayout } from './DemoLayout';
import { initializeDemoMode, waitForMSW } from '@/lib/demo/setupMockWorker';

export const DemoWrapper: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initDemo = async () => {
      try {
        console.log('[Demo] Starting demo initialization...');
        await initializeDemoMode();
        console.log('[Demo] Demo initialization complete');
        setIsInitializing(false);
      } catch (error) {
        console.error('[Demo] Demo initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsInitializing(false);
      }
    };

    initDemo();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg font-medium">Initializing Demo Mode...</div>
          <div className="text-sm text-muted-foreground">Setting up mock data and services</div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-lg font-medium">Demo Initialization Failed</div>
          <div className="text-sm text-muted-foreground">{initError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DemoAuthProvider>
      <DemoLayout>
        <Outlet />
      </DemoLayout>
    </DemoAuthProvider>
  );
};
