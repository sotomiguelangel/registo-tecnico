// ============================================
// Configuration - Centralized App Settings
// ============================================

const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbwFJmArbS54ZdgVN_oW7p-kaoUn6URWg86MBwnKppU1Xhaf7ZbTqdp8mG1ulW4dquszFw/exec';

function validateApiUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('API_URL não configurado.');
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('API_URL inválido: URL malformado.');
  }

  const isAppsScript =
    url.protocol === 'https:' &&
    url.hostname === 'script.google.com' &&
    /^\/macros\/s\/[^/]+\/exec$/.test(url.pathname);
  const isLocal = ['http:', 'https:'].includes(url.protocol) &&
    ['localhost', '127.0.0.1'].includes(url.hostname);

  if (!isAppsScript && !isLocal) {
    throw new Error('API_URL inválido: use a URL /macros/s/<deployment-id>/exec.');
  }
  return url.toString();
}

function getActiveApiUrl() {
  if (typeof localStorage !== 'undefined') {
    try {
      const custom = localStorage.getItem('registo_tecnico_api_url') || localStorage.getItem('bitacora_api_url');
      if (custom) return validateApiUrl(custom);
    } catch {}
  }
  return validateApiUrl(DEFAULT_API_URL);
}

const CONFIG = Object.freeze({
  // API Configuration
  get API_URL() {
    return getActiveApiUrl();
  },
  DEFAULT_API_URL,

  // App Version
  VERSION: '3.3.0',
  BUILD_ID: '2026.01.15',
  BUILD_DATE: '2026-01-15',
  CHANNEL: 'Produção',

  // Cache Settings
  CACHE_TTL_MS: 60_000,
  CACHE_STALE_MS: 25_000,
  CACHE_MAX_AGE: 5 * 60_000,

  // Timeouts
  API_TIMEOUT: 35_000,
  SYNC_TIMEOUT: 35_000,

  // Pagination and virtualization
  PAGE_SIZE: 50,
  VIRTUAL_LIST_HEIGHT: 175,

  // Validation Limits
  LIMITS: Object.freeze({
    // Geral / Piscina
    phMin: 7.0,
    phMax: 7.8,
    cloroMin: 0.5,
    cloroMax: 3.0,
    cloroTotalMax: 5.0,

    // AQS
    aqsMin: 45,
    aqsQuartosMin: 45,

    // Quartos - Água Quente
    phCalMin: 7.0,
    phCalMax: 7.8,
    cloroCalMin: 0.5,
    cloroCalMax: 3.0,
    cloroTotalCalMax: 5.0,

    // Quartos - Água Fria
    phFriaMin: 7.0,
    phFriaMax: 7.8,
    cloroFriaMin: 0.5,
    cloroFriaMax: 3.0,
    cloroTotalFriaMax: 5.0
  }),

  FEATURES: Object.freeze({
    ENABLE_D3_CHARTS: true,
    ENABLE_VIRTUALIZATION: true,

    /*
     * El modo offline permite consultar datos guardados,
     * pero no debe permitir autenticarse solo con el nombre.
     */
    ENABLE_OFFLINE_MODE: true,

    ENABLE_VERSION_CHECK: true,
    ENABLE_AUTO_SYNC: true
  })
});

// Compatibilidad temporal con archivos antiguos.
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

export { CONFIG };
export { DEFAULT_API_URL, validateApiUrl };
export default CONFIG;
