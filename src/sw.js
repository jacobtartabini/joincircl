import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

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

// Listen for the sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to sync data
async function syncData() {
  console.log('Background sync started');
  // Implement your data synchronization logic here
  // This could be fetching updated data, or sending cached requests
  console.log('Background sync completed');
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
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then((clientList) => {
        // If a window client is already open, focus it
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        
        // Otherwise open a new window
        return clients.openWindow('/');
      })
  );
});

// Handle periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  console.log('Performing periodic sync');
  // Implement your periodic sync logic here
  // For example, fetch updated contacts or notifications
}
