// ============================================
// API Client Service
// ============================================

import { ApiService, api as defaultApiInstance } from './ApiService.js';

// Singleton instance
const api = (typeof window !== 'undefined' && window.api) ? window.api : (defaultApiInstance || new ApiService());

export { ApiService, api };
export default api;

if (typeof window !== 'undefined') {
    window.api = api;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    module.exports.api = api;
    module.exports.ApiService = ApiService;
}
