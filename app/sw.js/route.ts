import { NextResponse } from 'next/server';

const serviceWorkerScript = `
// Service Worker for Banda Chao PWA
const CACHE_NAME = 'banda-chao-v1';
const urlsToCache = [
  '/',
  '/ai/chat',
  '/ai/dashboard',
  '/products',
  '/videos/short',
  '/videos/long',
  '/auth/login',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Wrap in try/catch to avoid console errors if URLs don't exist
      return cache.addAll(urlsToCache).catch((error) => {
        console.warn('[SW] Failed to cache some resources:', error);
        // Continue anyway - individual cache failures shouldn't break the SW
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
`;

export async function GET() {
  return new NextResponse(serviceWorkerScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
    },
  });
}


