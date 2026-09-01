import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static assets and node_modules
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(__dirname));

// Version info endpoint
const APP_VERSION_DATA = {
  name: 'Registo Técnico · Moon and Sun',
  semver: '3.2.1',
  build: '2026.09.01-R1',
  buildDate: '2026-09-01',
  channel: 'Produção (Oficial)',
  full: 'v3.2.1 (Build 2026.09.01-R1)',
  label: 'v3.2.1',
  timestamp: Date.now()
};

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
