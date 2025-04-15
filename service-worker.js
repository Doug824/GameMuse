// Service Worker for GameMuse PWA
const CACHE_NAME = 'gamemuse-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/assets/forest-bg.png'
];

// API response cache
const API_CACHE_NAME = 'gamemuse-api-v1';
const API_CACHE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of clients immediately
  );
});

// Helper function to check if a request is an API request
const isApiRequest = url => {
  return url.includes('api.rawg.io/api');
};

// Helper to determine if we should cache a successful response
const shouldCacheResponse = (request, response) => {
  // Only cache GET requests
  if (request.method !== 'GET') return false;
  
  // Don't cache response with status other than 200
  if (!response || response.status !== 200) return false;
  
  // Don't cache if response has no-store cache control directive
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl && cacheControl.includes('no-store')) return false;
  
  return true;
};

// Fetch event - network-first strategy for API, cache-first for static assets
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Handle API requests (network-first with cache fallback)
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          if (shouldCacheResponse(event.request, response)) {
            caches.open(API_CACHE_NAME).then(cache => {
              // Add timestamp to the response metadata
              const timestampedResponse = clonedResponse.clone();
              const responseInit = {
                headers: new Headers(clonedResponse.headers),
                status: clonedResponse.status,
                statusText: clonedResponse.statusText
              };
              
              // Add timestamp header
              responseInit.headers.set('x-cache-timestamp', Date.now().toString());
              
              clonedResponse.text().then(body => {
                cache.put(event.request, new Response(body, responseInit));
              });
            });
          }
          
          return response;
        })
        .catch(() => {
          // If network request fails, try to return from cache
          return caches.match(event.request);
        })
    );
  } 
  // For static assets, use cache-first strategy
  else {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request).then(response => {
            // Cache the new response for future
            if (shouldCacheResponse(event.request, response)) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
              });
            }
            
            return response;
          });
        })
    );
  }
});

// Handle background sync for favorites
self.addEventListener('sync', event => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  } else if (event.tag === 'sync-collections') {
    event.waitUntil(syncCollections());
  }
});

// Function to sync favorites data when online
function syncFavorites() {
  return new Promise((resolve, reject) => {
    // Get pending sync data from IndexedDB
    // In a real app, we'd implement the IndexedDB operations
    // to store and retrieve pending sync data
    const syncComplete = true; // Placeholder
    
    if (syncComplete) {
      resolve();
    } else {
      reject(new Error('Favorites sync failed'));
    }
  });
}

// Function to sync collections data when online
function syncCollections() {
  return new Promise((resolve, reject) => {
    // Similar to syncFavorites, but for collections
    const syncComplete = true; // Placeholder
    
    if (syncComplete) {
      resolve();
    } else {
      reject(new Error('Collections sync failed'));
    }
  });
}

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});