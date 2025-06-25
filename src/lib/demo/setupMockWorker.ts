
import { setupWorker } from 'msw/browser';
import { mockHandlers } from './mockHandlers';
import { demoMockStore } from './mockStore';

export const mockWorker = setupWorker(...mockHandlers);

export const initializeDemoMode = async () => {
  // Only setup MSW in demo routes
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
    await mockWorker.start({
      onUnhandledRequest: 'bypass',
      quiet: true
    });
    
    demoMockStore.initialize();
    console.log('Demo mode initialized with MSW');
  }
};
