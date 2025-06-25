
import { setupWorker } from 'msw/browser';
import { mockHandlers } from './mockHandlers';
import { demoMockStore } from './mockStore';

export const mockWorker = setupWorker(...mockHandlers);

let mswInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const initializeDemoMode = async (): Promise<void> => {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  // Return immediately if already initialized
  if (mswInitialized) {
    return Promise.resolve();
  }

  // Only setup MSW if we're in a browser environment and on demo routes
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const currentPath = window.location.pathname;
  console.log('[Demo] Current path:', currentPath);
  
  if (!currentPath.startsWith('/demo')) {
    return Promise.resolve();
  }

  console.log('[Demo] Initializing MSW in background for advanced features');
  
  initializationPromise = (async () => {
    try {
      // Add timeout to prevent hanging
      const initTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('MSW initialization timeout')), 3000);
      });

      await Promise.race([
        mockWorker.start({
          onUnhandledRequest: 'bypass',
          quiet: true, // Reduce console noise
          serviceWorker: {
            url: '/mockServiceWorker.js'
          }
        }),
        initTimeout
      ]);
      
      // Initialize the demo data store
      demoMockStore.initialize();
      mswInitialized = true;
      
      console.log('[Demo] MSW initialized successfully (background)');
    } catch (error) {
      console.warn('[Demo] MSW initialization failed (non-critical):', error);
      // Still initialize the store even if MSW fails
      demoMockStore.initialize();
      // Don't throw - let the app continue without MSW
    }
  })();

  return initializationPromise;
};

// Check if we're in demo mode
export const isDemoMode = (): boolean => {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/demo');
};

// Non-blocking MSW check
export const waitForMSW = (): Promise<void> => {
  if (!isDemoMode()) {
    return Promise.resolve();
  }
  
  // Don't wait for MSW - return immediately
  return Promise.resolve();
};
