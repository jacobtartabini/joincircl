
import { setupWorker } from 'msw/browser';
import { mockHandlers } from './mockHandlers';
import { demoMockStore } from './mockStore';

export const mockWorker = setupWorker(...mockHandlers);

export const initializeDemoMode = async () => {
  // Only setup MSW in demo routes
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
    console.log('Initializing demo mode for path:', window.location.pathname);
    
    try {
      await mockWorker.start({
        onUnhandledRequest: 'bypass',
        quiet: true
      });
      
      demoMockStore.initialize();
      console.log('Demo mode initialized successfully with MSW');
    } catch (error) {
      console.error('Failed to initialize demo mode:', error);
    }
  }
};
