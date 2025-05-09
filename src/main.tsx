
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with enhanced features
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  onRegistered(registration) {
    // Setup background sync when registration is successful
    if (registration) {
      console.log('Service Worker registered successfully')
      
      // Register for background sync if supported
      if ('sync' in registration) {
        console.log('Background sync supported')
        // Register a sync event
        registration.sync.register('sync-data')
          .then(() => console.log('Sync registered'))
          .catch(err => console.error('Sync registration failed:', err))
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
      if (registration.periodicSync) {
        navigator.serviceWorker.ready
          .then((reg) => {
            // @ts-ignore - Periodic sync is not yet in all TypeScript definitions
            reg.periodicSync.register('content-sync', {
              minInterval: 24 * 60 * 60 * 1000, // Once per day
            }).catch((error) => console.error('Periodic Sync could not be registered!', error))
          })
      }
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

createRoot(document.getElementById("root")!).render(<App />);
