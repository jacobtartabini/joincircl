import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST || []);

// Create a background sync plugin
const bgSyncPlugin = new BackgroundSyncPlugin('circl-sync-queue', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours (specified in minutes)
});

// Register routes that should use background sync for failed requests
registerRoute(
  /\/api\/contacts.*/,
  new NetworkFirst({
    cacheName: 'contacts-api',
    plugins: [
      bgSyncPlugin,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 // Cache for 1 hour
      })
    ]
  }),
  'POST'
);

// Enhanced caching for contacts API
registerRoute(
  /\/api\/contacts$/,
  new NetworkFirst({
    cacheName: 'contacts-list-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

// Cache individual contact details
registerRoute(
  /\/api\/contacts\/[a-zA-Z0-9-]+$/,
  new StaleWhileRevalidate({
    cacheName: 'contact-details-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

// Cache profile data with improved offline support
registerRoute(
  /\/rest\/v1\/profiles/,
  new StaleWhileRevalidate({
    cacheName: 'user-profile-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5, // We don't need many entries here
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

// Cache Supabase auth session with longer expiration for better offline support
registerRoute(
  /\/auth\/v1\/token/,
  new StaleWhileRevalidate({
    cacheName: 'auth-token-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60 // Extended to 24 hours to help with offline access
      })
    ]
  })
);

// Serve offline page when network requests fail for uncached routes
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      // Try to get the response from the network
      return await fetch(event.request);
    } catch (error) {
      // If network fails, serve the offline page
      return caches.match('/offline.html');
    }
  }
);

// Listen for the sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  } else if (event.tag === 'sync-contacts') {
    event.waitUntil(syncContacts());
  } else if (event.tag === 'sync-profile') {
    event.waitUntil(syncProfile());
  }
});

// Function to sync all data
async function syncData() {
  console.log('Background sync started');
  // Perform general data sync
  try {
    // First sync profile data
    await syncProfile();
    // Then sync contacts
    await syncContacts();
    
    // Post a message to the client
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          message: 'All data synchronized successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error during sync:', error);
  }
  console.log('Background sync completed');
}

// Function to specifically sync contacts
async function syncContacts() {
  console.log('Syncing contacts data...');
  
  try {
    // Inform clients about contact sync
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CONTACTS_SYNC_STARTED'
        });
      });
    });
    
    // The actual sync will be handled by the client-side code
    // using the IndexedDB operations we defined
    
  } catch (error) {
    console.error('Error syncing contacts:', error);
  }
}

// Function to specifically sync profile data
async function syncProfile() {
  console.log('Syncing profile data...');
  
  try {
    // Inform clients about profile sync
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PROFILE_SYNC_STARTED'
        });
      });
    });
    
    // The actual sync will be handled by the client-side code
    
  } catch (error) {
    console.error('Error syncing profile:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Notification', {
      body: data.body || 'You have a new update in Circl',
      icon: '/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png',
      badge: '/favicon.png',
      data
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Try to get the notification data
  const notificationData = event.notification.data;
  
  // Default URL to open
  let urlToOpen = '/notifications';
  
  // If we have custom notification data with a URL, use it
  if (notificationData && notificationData.url) {
    urlToOpen = notificationData.url;
  }
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then((clientList) => {
        // If a window client is already open, focus it and navigate
        for (const client of clientList) {
          if ('navigate' in client && 'focus' in client) {
            client.focus();
            return client.navigate(urlToOpen);
          }
        }
        // Otherwise open a new window
        return clients.openWindow(urlToOpen);
      })
  );
});

// Handle periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContent());
  } else if (event.tag === 'notifications-sync') {
    event.waitUntil(syncNotifications());
  }
});

async function updateContent() {
  console.log('Performing periodic content sync');
  // Perform general content update
  try {
    // Sync all data
    await syncData();
  } catch (error) {
    console.error('Error during periodic sync:', error);
  }
}

async function syncNotifications() {
  console.log('Syncing notifications');
  // Implement notification sync logic
  // This could fetch new notifications from the server
}

// Cache resources needed for widgets and offline use
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('circl-widget-resources').then((cache) => {
      return cache.addAll([
        '/offline.html',
        '/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png',
        '/favicon.png',
        '/manifest.webmanifest',
        '/index.html'
      ]);
    })
  );
});

// Add a skip waiting handler to ensure the service worker activates quickly
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Add specific handler for offline mode detection
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Network request failed, return the offline page
        return caches.match('/offline.html');
      })
    );
  }
});

// Add profile specific sync handling
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-profiles') {
    event.waitUntil(syncProfiles());
  }
});

async function syncProfiles() {
  console.log('Syncing profile data...');
  
  try {
    // Inform clients about profile sync
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PROFILE_SYNC_STARTED'
        });
      });
    });
  } catch (error) {
    console.error('Error syncing profiles:', error);
  }
}
