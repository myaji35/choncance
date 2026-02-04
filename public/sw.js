const CACHE_NAME = 'vintee-v1';
const urlsToCache = [
  '/',
  '/explore',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip requests to different origins
  if (new URL(event.request.url).origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Don't cache API calls or admin routes
              if (!event.request.url.includes('/api/') &&
                  !event.request.url.includes('/admin/')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page when offline
        return caches.match('/offline.html');
      })
  );
});

// Background sync for offline bookings
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  try {
    // Get pending bookings from IndexedDB
    const pendingBookings = await getPendingBookings();

    for (const booking of pendingBookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(booking)
        });

        if (response.ok) {
          await removePendingBooking(booking.id);
        }
      } catch (error) {
        console.error('Failed to sync booking:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingBookings() {
  // Implementation would go here
  return [];
}

async function removePendingBooking(id) {
  // Implementation would go here
}