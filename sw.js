// sw.js - Versão 3.5.0 PWA Moon and Sun (No HTML Caching)
const CACHE_NAME = 'registo-tecnico-v3.5.0';

// Note: NEVER cache '/' or HTML files so changes and patches take effect immediately
const STATIC_ASSETS = [
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

// Precarregar recursos estáticos críticos (sem HTML)
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return Promise.allSettled(
                    STATIC_ASSETS.map(asset => cache.add(asset))
                );
            })
    );
});

// Limpar TODAS as caches antigas na ativação e assumir clientes imediatamente
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia de requisições:
// NUNCA interceptar ou guardar em cache ficheiros HTML, chamadas à API ou navegação
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignorar requisições não GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Bypass completo da cache para navegação, HTML, rotas de API e Google scripts
    if (
        event.request.mode === 'navigate' ||
        url.pathname === '/' ||
        url.pathname.endsWith('.html') ||
        url.pathname.includes('/api') ||
        url.pathname.includes('/exec') ||
        url.pathname.endsWith('version.json')
    ) {
        return; // Deixa o navegador ir direto à rede nativamente
    }

    // Para outros ficheiros estáticos (CSS, JS, imagens), Network First com fallback na cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    }).catch(() => {});
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
