// Service Worker nativo para PWA - Cruz Church Escala Louvor
const CACHE_NAME = 'cruz-church-v1'

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Falha no pré-cache PWA (esperado em modo dev):', err)
      })
    })
  )
  self.skipWaiting()
})

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Estratégia de Fetch: Network-first com fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não GET ou do Vite HMR
  if (event.request.method !== 'GET' || event.request.url.includes('vite') || event.request.url.includes('@vite')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return networkResponse
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/')
          }
        })
      })
  )
})
