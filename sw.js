// sw.js - Versão melhorada PWA Moon and Sun
const CACHE_NAME = 'registo-tecnico-v3.3.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/components.css',
    '/css/views.css',
    '/js/app.js',
    '/js/config.js',
    '/icon-192.png',
    '/icon-512.png',
    '/icon.svg',
    '/manifest.webmanifest'
];

// Precargar recursos críticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Add static assets safely (ignore individual failures to avoid install abort)
                return Promise.allSettled(
                    STATIC_ASSETS.map(asset => cache.add(asset))
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Estratégia: Network First para API, Cache First para estáticos
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // API calls ou Google Sheets Apps Script - Network first
    if (url.pathname.includes('/exec') || url.pathname.includes('/api') || url.pathname.endsWith('version.json')) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // Ignorar requisições não GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Static assets - Cache first
    event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({ error: 'Offline', offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('Recurso não disponível offline', { status: 404 });
    }
}

// Limpar caches antigas na ativação
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});
