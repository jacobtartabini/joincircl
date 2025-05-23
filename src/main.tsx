
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { OfflineIndicator } from './components/ui/offline-indicator.tsx'

// Register service worker with enhanced features
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    // Show a toast notification that the app is ready for offline use
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Circl App', {
        body: 'App is ready to work offline',
        icon: '/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png'
      });
    }
  },
  onRegistered(registration) {
    // Setup background sync when registration is successful
    if (registration) {
      console.log('Service Worker registered successfully')
      
      // Register for background sync if supported
      if ('sync' in registration) {
        console.log('Background sync supported')
        // Register sync events for different data types
        registration.sync.register('sync-data')
          .then(() => console.log('Sync registered'))
          .catch(err => console.error('Sync registration failed:', err))
        
        registration.sync.register('sync-contacts')
          .then(() => console.log('Contacts sync registered'))
          .catch(err => console.error('Contacts sync registration failed:', err))
          
        registration.sync.register('sync-profile')
          .then(() => console.log('Profile sync registered'))
          .catch(err => console.error('Profile sync registration failed:', err))
      }
      
      // Register for push notifications if supported
      if ('Notification' in window && 'PushManager' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Notification permission granted')
            // Here you would subscribe to push service
          }
        })
      }
      
      // Register for periodic sync if supported
      if ('periodicSync' in registration) {
        // Use a type assertion for the permission name since it's a newer API
        // that might not be included in the current TypeScript definitions
        navigator.permissions.query({ name: 'periodic-background-sync' as PermissionName })
          .then((status) => {
            if (status.state === 'granted') {
              // @ts-ignore - Periodic sync is not yet in all TypeScript definitions
              registration.periodicSync.register('content-sync', {
                minInterval: 24 * 60 * 60 * 1000, // Once per day
              }).catch((error) => console.error('Periodic Sync could not be registered!', error))
            }
          })
          .catch(err => console.warn('Periodic sync permission check failed:', err))
      }

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type) {
          console.log('Received message from service worker:', event.data);
          
          // Handle different message types
          switch (event.data.type) {
            case 'SYNC_COMPLETED':
              console.log('Data sync completed:', event.data.message);
              // Could dispatch an event or update state here
              break;
            case 'CONTACTS_SYNC_STARTED':
              console.log('Contacts sync started');
              break;
            case 'PROFILE_SYNC_STARTED':
              console.log('Profile sync started');
              break;
          }
        }
      });
    }
  },
  onRegisterError(error) {
    console.error('SW registration error', error)
  }
})

// Register for protocol handler
if ('registerProtocolHandler' in navigator) {
  try {
    navigator.registerProtocolHandler(
      'web+circl',
      window.location.origin + '/%s',
      'Circl App'
    )
  } catch (e) {
    console.warn('Protocol handler registration failed', e)
  }
}

// Initialize widget API if supported
// Note: Web Widgets API is still in development and may not be fully supported
// This is for future compatibility
if ('widgets' in window) {
  // @ts-ignore - Widgets API may not be in TypeScript definitions yet
  window.widgets?.register('recent-contacts', {
    // The widget configuration would go here
    onUpdate: async (data) => {
      // Logic to update widget with recent contacts data
      console.log('Widget update requested', data);
      return { success: true };
    }
  }).catch(e => console.warn('Widget registration failed:', e));
}

// Render the application with the offline indicator
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <OfflineIndicator />
  </>
);
