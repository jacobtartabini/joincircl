
import { setupWorker } from 'msw/browser';
import { mockHandlers } from './mockHandlers';
import { demoMockStore } from './mockStore';

export const mockWorker = setupWorker(...mockHandlers);

export const initializeDemoMode = async () => {
  // Only setup MSW if we're in a browser environment and on demo routes
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    if (currentPath.startsWith('/demo')) {
      console.log('Initializing demo mode for path:', currentPath);
      
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
        console.log('Demo mode initialized successfully with MSW');
        console.log('Mock handlers registered:', mockHandlers.length);
      } catch (error) {
        console.error('Failed to initialize demo mode:', error);
        // Still initialize the store even if MSW fails
        demoMockStore.initialize();
      }
    }
  }
};

// Auto-initialize if already on a demo route when this module loads
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
  initializeDemoMode();
}
