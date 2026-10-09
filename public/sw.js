// Service Worker para Control Biométrico
// Versión: 2.9.4
// Cache Duration: 3 meses (90 días)

const CACHE_NAME = 'control-biometrico-v2.9.4';
const CACHE_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 días en milisegundos

// Recursos críticos para caché inicial
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache abierto:', CACHE_NAME);
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Recursos críticos cacheados');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  // Limpiar caches antiguos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activado correctamente');
      return self.clients.claim();
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo cachear solicitudes GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar solicitudes a dominios externos
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Verificar si el cache está expirado
          const cachedTime = cachedResponse.headers.get('sw-cached-time');
          const now = Date.now();
          
          if (cachedTime && (now - parseInt(cachedTime)) > CACHE_DURATION) {
            console.log('[Service Worker] Cache expirado, actualizando:', request.url);
            // Cache expirado, intentar actualizar
            return fetchAndCache(request);
          }
          
          console.log('[Service Worker] Sirviendo desde cache:', request.url);
          
          // Actualizar en background (stale-while-revalidate)
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  const headers = new Headers(responseToCache.headers);
                  headers.append('sw-cached-time', Date.now().toString());
                  cache.put(request, new Response(responseToCache.body, { headers }));
                });
              }
              return response;
            })
            .catch(() => {
              console.log('[Service Worker] No se pudo actualizar:', request.url);
            });
          
          return cachedResponse;
        }
        
        // No está en cache, intentar obtener de la red
        console.log('[Service Worker] No en cache, obteniendo de red:', request.url);
        return fetchAndCache(request);
      })
      .catch((error) => {
        console.error('[Service Worker] Error al obtener recurso:', error);
        
        // Si es una solicitud de página, devolver index.html
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        
        throw error;
      })
  );
});

// Función para obtener y cachear
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const responseToCache = response.clone();
      const cache = await caches.open(CACHE_NAME);
      
      // Agregar timestamp al cache
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cached-time', Date.now().toString());
      
      await cache.put(request, new Response(responseToCache.body, { headers }));
      console.log('[Service Worker] Recurso cacheado:', request.url);
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Error al obtener de red:', error);
    throw error;
  }
}

// Mensajes del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Cache limpiado');
    });
  }
});

// Sincronización en background (cuando vuelva la conexión)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en background:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí puedes agregar lógica para sincronizar datos cuando vuelva la conexión
      Promise.resolve().then(() => {
        console.log('[Service Worker] Datos sincronizados');
      })
    );
  }
});

// Notificaciones push (opcional, para futuras mejoras)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Control Biométrico', options)
  );
});

console.log('[Service Worker] Script cargado correctamente');
