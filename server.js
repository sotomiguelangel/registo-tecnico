// ============================================
// Moon and Sun - Static Application Server
// ============================================

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number.parseInt(
  process.env.PORT || '3000',
  10
);

const HOST = process.env.HOST || '0.0.0.0';

const IS_PRODUCTION =
  process.env.NODE_ENV === 'production';

// ============================================
// Application version
// ============================================

const APP_VERSION_DATA = Object.freeze({
  name: 'Registo Técnico · Moon and Sun',
  version: '3.3.0',
  semver: '3.3.0',

  MAJOR: 3,
  MINOR: 3,
  PATCH: 0,

  build: '2026.01.15',
  buildDate: '2026-01-15',
  channel: 'Produção',

  forceUpdate: false,
  minVersion: '3.2.0',

  full: 'v3.3.0 (2026.01.15)',
  label: 'v3.3.0',

  releaseNotes:
    'Correções de rendimento, segurança e melhorias no sistema de versões.'
});

// ============================================
// Express configuration
// ============================================

app.disable('x-powered-by');

if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// La aplicación utiliza peticiones pequeñas.
// Este servidor todavía no procesa la API principal,
// pero dejamos límites seguros por si se añaden rutas locales.
app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: '1mb'
  })
);

// ============================================
// Request logging
// ============================================

app.use((req, res, next) => {
  if (!IS_PRODUCTION) {
    const startedAt = Date.now();

    res.on('finish', () => {
      const elapsed = Date.now() - startedAt;

      console.log(
        `${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${elapsed}ms`
      );
    });
  }

  next();
});

// ============================================
// Security headers
// ============================================

app.use((req, res, next) => {
  /*
   * IMPORTANTE:
   *
   * 'unsafe-inline' se mantiene temporalmente porque index.html
   * todavía contiene CSS y JavaScript inline.
   *
   * Cuando termine la migración modular podremos eliminarlo
   * y utilizar una CSP más estricta con nonce o hashes.
   */
  const contentSecurityPolicy = [
    "default-src 'self'",

    [
      "script-src 'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
      'https://d3js.org',
      'https://www.google.com'
    ].join(' '),

    [
      "style-src 'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ].join(' '),

    [
      "font-src 'self'",
      'https://fonts.gstatic.com',
      'data:'
    ].join(' '),

    [
      "img-src 'self'",
      'data:',
      'blob:',
      'https:'
    ].join(' '),

    [
      "connect-src 'self'",
      'https://script.google.com',
      'https://*.google.com',
      'https://*.googleusercontent.com',
      'https://raw.githubusercontent.com',
      'wss:'
    ].join(' '),

    [
      "frame-src 'self'",
      'https://*.google.com',
      'https://*.googleusercontent.com'
    ].join(' '),

    [
      "frame-ancestors 'self'",
      'https://*.google.com',
      'https://*.googleusercontent.com',
      'https://*.run.app'
    ].join(' '),

    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:"
  ].join('; ');

  res.setHeader(
    'Content-Security-Policy',
    contentSecurityPolicy
  );

  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  res.setHeader(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()'
    ].join(', ')
  );

  res.setHeader(
    'Cross-Origin-Opener-Policy',
    'same-origin-allow-popups'
  );

  /*
   * No usamos X-Frame-Options porque frame-ancestors
   * ya controla los orígenes permitidos y la aplicación
   * puede necesitar ejecutarse dentro de Google/Cloud Run.
   */

  next();
});

// ============================================
// Cache strategy
// ============================================

app.use((req, res, next) => {
  const requestPath = req.path.toLowerCase();

  const noCache =
    requestPath === '/' ||
    requestPath.endsWith('.html') ||
    requestPath.endsWith('/sw.js') ||
    requestPath.endsWith('/version.json') ||
    requestPath.startsWith('/api/');

  if (noCache) {
    res.set({
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store'
    });
  } else {
    res.set({
      'Cache-Control':
        'public, max-age=3600, must-revalidate'
    });
  }

  next();
});

// ============================================
// Block sensitive project files
// ============================================

const BLOCKED_FILE_PATTERNS = [
  /^\/\.env(?:\..*)?$/i,
  /^\/package(?:-lock)?\.json$/i,
  /^\/bun\.lockb?$/i,
  /^\/metadata\.json$/i,
  /^\/server\.js$/i,
  /^\/.*\.gs$/i,
  /^\/tests(?:\/|$)/i,
  /^\/\.git(?:\/|$)/i,
  /^\/node_modules(?:\/|$)/i
];

app.use((req, res, next) => {
  const normalizedPath = decodeURIComponent(
    req.path
  );

  const isBlocked = BLOCKED_FILE_PATTERNS.some(
    pattern => pattern.test(normalizedPath)
  );

  /*
   * D3 tiene una ruta pública específica configurada
   * más adelante. El resto de node_modules se bloquea.
   */
  const isAllowedD3 =
    normalizedPath.startsWith('/node_modules/d3/');

  if (isBlocked && !isAllowedD3) {
    return res.status(404).json({
      ok: false,
      code: 'NOT_FOUND',
      error: 'Recurso não encontrado.'
    });
  }

  next();
});

// ============================================
// Public D3 dependency
// ============================================

const d3Directory = path.join(
  __dirname,
  'node_modules',
  'd3'
);

/*
 * Solo se expone el paquete D3.
 * No se expone toda la carpeta node_modules.
 *
 * Esto mantiene funcionando la ruta actual:
 *
 * /node_modules/d3/dist/d3.min.js
 */
app.use(
  '/node_modules/d3',
  express.static(d3Directory, {
    fallthrough: false,
    dotfiles: 'deny',
    index: false,
    maxAge: IS_PRODUCTION ? '1d' : 0,
    immutable: false
  })
);

// Gestionar correctamente los errores de archivos D3 inexistentes.
app.use(
  '/node_modules/d3',
  (error, req, res, next) => {
    if (
      error?.status === 404 ||
      error?.code === 'ENOENT'
    ) {
      return res.status(404).json({
        ok: false,
        code: 'D3_NOT_FOUND',
        error:
          'A biblioteca D3 solicitada não foi encontrada.'
      });
    }

    next(error);
  }
);

// ============================================
// Version endpoints
// ============================================

app.get('/version.json', (req, res) => {
  res.json({
    name: APP_VERSION_DATA.name,

    version: APP_VERSION_DATA.version,
    semver: APP_VERSION_DATA.semver,

    MAJOR: APP_VERSION_DATA.MAJOR,
    MINOR: APP_VERSION_DATA.MINOR,
    PATCH: APP_VERSION_DATA.PATCH,

    BUILD_ID: APP_VERSION_DATA.build,
    BUILD_DATE: APP_VERSION_DATA.buildDate,
    CHANNEL: APP_VERSION_DATA.channel,

    forceUpdate: APP_VERSION_DATA.forceUpdate,
    minVersion: APP_VERSION_DATA.minVersion,

    releaseNotes: APP_VERSION_DATA.releaseNotes,

    url: '/index.html',
    timestamp: Date.now()
  });
});

app.get('/api/version', (req, res) => {
  res.json({
    ...APP_VERSION_DATA,
    serverTime: new Date().toISOString(),
    timestamp: Date.now()
  });
});

// ============================================
// Health endpoint
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'ok',
    application: APP_VERSION_DATA.name,
    version: APP_VERSION_DATA.semver,
    environment:
      process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    serverTime: new Date().toISOString()
  });
});

// ============================================
// Static application files
// ============================================

app.use(
  express.static(__dirname, {
    dotfiles: 'deny',
    index: 'index.html',
    fallthrough: true,
    etag: true,
    lastModified: true,
    maxAge: IS_PRODUCTION ? '1h' : 0,

    setHeaders: (res, filePath) => {
      const extension =
        path.extname(filePath).toLowerCase();

      if (
        extension === '.html' ||
        path.basename(filePath) === 'sw.js'
      ) {
        res.setHeader(
          'Cache-Control',
          'no-store, no-cache, must-revalidate'
        );
      }
    }
  })
);

// ============================================
// API fallback
// ============================================

app.use('/api', (req, res) => {
  res.status(404).json({
    ok: false,
    code: 'API_ROUTE_NOT_FOUND',
    error: 'Rota de API não encontrada.'
  });
});

// ============================================
// SPA fallback
// ============================================

app.get('*', (req, res, next) => {
  /*
   * Si la URL tiene extensión, significa que probablemente
   * se solicitó un JS, CSS, PNG, JSON, etc. inexistente.
   *
   * En ese caso no debemos devolver index.html porque el
   * navegador produciría errores de MIME difíciles de detectar.
   */
  if (path.extname(req.path)) {
    return res.status(404).json({
      ok: false,
      code: 'ASSET_NOT_FOUND',
      error: 'Ficheiro não encontrado.'
    });
  }

  res.sendFile(
    path.join(__dirname, 'index.html'),
    error => {
      if (error) {
        next(error);
      }
    }
  );
});

// ============================================
// Global error handler
// ============================================

app.use((error, req, res, next) => {
  console.error('Server error:', {
    method: req.method,
    path: req.originalUrl,
    message: error?.message,
    stack: IS_PRODUCTION
      ? undefined
      : error?.stack
  });

  if (res.headersSent) {
    return next(error);
  }

  res.status(error?.status || 500).json({
    ok: false,
    code: 'SERVER_ERROR',
    error: IS_PRODUCTION
      ? 'O servidor encontrou um erro inesperado.'
      : error?.message || 'Erro interno do servidor.'
  });
});

// ============================================
// Start and graceful shutdown
// ============================================

const server = app.listen(
  PORT,
  HOST,
  () => {
    console.log('');
    console.log(
      `Registo Técnico v${APP_VERSION_DATA.version}`
    );
    console.log(
      `Servidor: http://${HOST}:${PORT}`
    );
    console.log(
      `Ambiente: ${process.env.NODE_ENV || 'development'}`
    );
    console.log('');
  }
);

function shutdown(signal) {
  console.log(
    `\n${signal} recebido. A encerrar servidor...`
  );

  server.close(error => {
    if (error) {
      console.error(
        'Erro ao encerrar servidor:',
        error
      );

      process.exitCode = 1;
      return;
    }

    console.log('Servidor encerrado com sucesso.');
    process.exitCode = 0;
  });

  // Evita que el proceso quede bloqueado indefinidamente.
  setTimeout(() => {
    console.error(
      'Encerramento forçado por tempo limite.'
    );

    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export {
  app,
  server,
  APP_VERSION_DATA
};
