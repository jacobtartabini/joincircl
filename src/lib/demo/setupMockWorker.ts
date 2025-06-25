
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

  console.log('[Demo] Initializing demo mode for path:', currentPath);
  
  initializationPromise = (async () => {
    try {
      // Start the mock service worker
      await mockWorker.start({
        onUnhandledRequest: 'bypass',
        quiet: false, // Enable logging for debugging
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      });
      
      // Initialize the demo data store
      demoMockStore.initialize();
      mswInitialized = true;
      
      console.log('[Demo] Demo mode initialized successfully with MSW');
      console.log('[Demo] Mock handlers registered:', mockHandlers.length);
      console.log('[Demo] Available contacts:', demoMockStore.getContacts('demo-user-1').length);
    } catch (error) {
      console.error('[Demo] Failed to initialize demo mode:', error);
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

// Wait for MSW to be ready
export const waitForMSW = (): Promise<void> => {
  if (!isDemoMode()) {
    return Promise.resolve();
  }
  
  return initializeDemoMode();
};
