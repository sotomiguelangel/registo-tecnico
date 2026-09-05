import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Disable caching for HTML and Service Worker so updates are immediate
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path.endsWith('sw.js')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// Serve static assets and node_modules
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(__dirname));

// Version info endpoint
const APP_VERSION_DATA = {
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
  full: 'v3.3.0 (2026.01.15)',
  label: 'v3.3.0',
  timestamp: Date.now()
};

app.get('/version.json', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  res.json({
    version: APP_VERSION_DATA.version,
    semver: APP_VERSION_DATA.semver,
    MAJOR: APP_VERSION_DATA.MAJOR,
    MINOR: APP_VERSION_DATA.MINOR,
    PATCH: APP_VERSION_DATA.PATCH,
    BUILD_ID: APP_VERSION_DATA.build,
    BUILD_DATE: APP_VERSION_DATA.buildDate,
    CHANNEL: APP_VERSION_DATA.channel,
    forceUpdate: APP_VERSION_DATA.forceUpdate,
    minVersion: '3.2.0',
    releaseNotes: 'Correções de rendimento e melhorias no sistema de versioning',
    url: '/index.html',
    timestamp: Date.now()
  });
});

app.get('/api/version', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  res.json({
    ...APP_VERSION_DATA,
    serverTime: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: APP_VERSION_DATA.semver });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
