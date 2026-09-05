// ============================================
// Configuration - Centralized App Settings
// ============================================

const CONFIG = {
    // API Configuration
    API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
    
    // App Version
    VERSION: '3.3.0',
    BUILD_ID: '2026.01.15',
    BUILD_DATE: '2026-01-15',
    
    // Cache Settings
    CACHE_TTL_MS: 60000,         // 1 minute for records
    CACHE_STALE_MS: 25000,       // 25 seconds for stale-while-revalidate
    CACHE_MAX_AGE: 5 * 60 * 1000, // 5 minutes max age
    
    // Timeouts (milliseconds)
    API_TIMEOUT: 12000,          // 12 seconds for API calls
    SYNC_TIMEOUT: 16000,         // 16 seconds for saves
    
    // Pagination
    PAGE_SIZE: 50,
    VIRTUAL_LIST_HEIGHT: 175,
    
    // Validation Limits
    LIMITS: {
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
        chlorineCalMax: 3.0,
        cloroTotalCalMax: 5.0,
        
        // Quartos - Água Fria
        phFriaMin: 7.0,
        phFriaMax: 7.8,
        cloroFriaMin: 0.5,
        cloroFriaMax: 3.0,
        cloroTotalFriaMax: 5.0
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_D3_CHARTS: true,
        ENABLE_VIRTUALIZATION: true,
        ENABLE_OFFLINE_MODE: true,
        ENABLE_VERSION_CHECK: true,
        ENABLE_AUTO_SYNC: true
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
