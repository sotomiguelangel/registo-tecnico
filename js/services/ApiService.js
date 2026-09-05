// ============================================
// API Service - Communication with Google Sheets backend
// ============================================

class ApiService {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || (typeof CONFIG !== 'undefined' ? CONFIG.API_URL : '');
        this.timeout = config.timeout || (typeof CONFIG !== 'undefined' ? CONFIG.API_TIMEOUT : 12000);
        this.token = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    
    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        const key = typeof CONSTANTS !== 'undefined' ? CONSTANTS.STORAGE_KEYS.TOKEN : 'bitacora_token';
        if (token) {
            localStorage.setItem(key, token);
        } else {
            localStorage.removeItem(key);
        }
    }
    
    /**
     * Get stored token
     */
    getToken() {
        if (!this.token) {
            const key = typeof CONSTANTS !== 'undefined' ? CONSTANTS.STORAGE_KEYS.TOKEN : 'bitacora_token';
            this.token = localStorage.getItem(key);
        }
        return this.token;
    }
    
    /**
     * Make API request with retry logic
     */
    async request(action, data = {}, options = {}) {
        const url = this.buildUrl(action);
        const body = this.buildBody({ action, ...data });
        
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(body)
        };
        
        let lastError;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.executeFetch(url, fetchOptions, options.timeout || this.timeout);
                const result = await this.parseResponse(response);
                
                if (result.ok) {
                    this.retryCount = 0;
                    return result;
                }
                
                // Handle auth errors
                if (result.code === 'AUTH') {
                    this.handleAuthError(result);
                    throw new ApiError('AUTH', 'Sessão expirada');
                }
                
                throw new ApiError(result.error || 'Erro do servidor', result.code);
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on auth errors or abort
                if (error.name === 'AbortError' || error.type === 'AUTH') {
                    throw error;
                }
                
                // Wait before retrying
                if (attempt < this.maxRetries) {
                    const delay = this.calculateBackoff(attempt);
                    console.log(`Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Execute fetch with timeout
     */
    async executeFetch(url, options, timeout) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        
        try {
            // Use native fetch or polyfill
            const fetchFn = typeof window !== 'undefined' ? window.fetch : fetch;
            return await fetchFn(url, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }
    }
    
    /**
     * Parse JSON response
     */
    async parseResponse(response) {
        const text = await response.text();
        
        try {
            const json = JSON.parse(text);
            return json;
        } catch (e) {
            throw new ApiError(
                `Resposta inválida do servidor (${response.status})`,
                'PARSE_ERROR'
            );
        }
    }
    
    /**
     * Build URL with query params
     */
    buildUrl(action) {
        const url = new URL(this.apiUrl || window.location.href);
        url.searchParams.set('action', action);
        
        const token = this.getToken();
        if (token) {
            url.searchParams.set('token', token);
        }
        
        return url.toString();
    }
    
    /**
     * Build request body
     */
    buildBody(data) {
        return {
            ...data,
            appVersion: typeof CONFIG !== 'undefined' ? CONFIG.VERSION : '3.3.0',
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Calculate exponential backoff
     */
    calculateBackoff(attempt) {
        const base = 1000;
        const max = 10000;
        const delay = Math.min(base * Math.pow(2, attempt), max);
        return delay + Math.random() * 500;
    }
    
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Handle authentication errors
     */
    handleAuthError(result) {
        this.setToken(null);
        
        // Trigger logout flow
        if (typeof appState !== 'undefined') {
            appState.setState({
                user: null,
                isAuthenticated: false
            });
        }
        
        // Show login screen
        if (typeof document !== 'undefined') {
            const loginScreen = document.getElementById('loginScreen');
            if (loginScreen) {
                loginScreen.classList.add('show');
                loginScreen.style.display = 'flex';
            }
        }
    }
    
    // =======================
    // API Methods
    // =======================
    
    /**
     * Login user
     */
    async login(usuario, pin) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.LOGIN : 'login';
        return this.request(action, { usuario, pin });
    }
    
    /**
     * Get records by type
     */
    async listRecords(type) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.LIST : 'list';
        return this.request(action, { type });
    }
    
    /**
     * Save a record
     */
    async saveRecord(type, data) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.SAVE : 'save';
        return this.request(action, { type, data });
    }
    
    /**
     * Update a record
     */
    async updateRecord(type, id, data) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.UPDATE : 'update';
        return this.request(action, { type, id, data });
    }
    
    /**
     * Delete a record
     */
    async deleteRecord(type, id) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.DELETE : 'delete';
        return this.request(action, { type, id });
    }
    
    /**
     * Batch save records
     */
    async saveBatch(type, rows) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.SAVE_BATCH : 'saveBatch';
        return this.request(action, { type, rows });
    }
    
    /**
     * Get configuration
     */
    async getConfig(key) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.GET_CONFIG : 'getConfig';
        return this.request(action, { key });
    }
    
    /**
     * Set configuration
     */
    async setConfig(key, value) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.SET_CONFIG : 'setConfig';
        return this.request(action, { key, value });
    }
    
    /**
     * Get all equipment
     */
    async listEquipamentos() {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.LIST_EQUIPAMENTOS : 'listEquipamentos';
        return this.request(action);
    }
    
    /**
     * Save equipment
     */
    async saveEquipamento(data) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.SAVE_EQUIPAMENTO : 'saveEquipamento';
        return this.request(action, { data });
    }
    
    /**
     * Delete equipment
     */
    async deleteEquipamento(id) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.DELETE_EQUIPAMENTO : 'deleteEquipamento';
        return this.request(action, { id });
    }
    
    /**
     * List users
     */
    async listUsers() {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.LIST_USERS : 'listUsers';
        return this.request(action);
    }
    
    /**
     * Create user
     */
    async createUser(userData) {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.CREATE_USER : 'createUser';
        return this.request(action, userData);
    }
    
    /**
     * Check API health
     */
    async healthCheck() {
        try {
            const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.HEALTH : 'health';
            return await this.request(action, {}, { timeout: 5000 });
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }
    
    /**
     * Bootstrap with existing token
     */
    async bootstrap() {
        const action = typeof CONSTANTS !== 'undefined' ? CONSTANTS.API_ACTIONS.BOOTSTRAP : 'bootstrap';
        return this.request(action, {});
    }
}

// Custom API Error class
class ApiError extends Error {
    constructor(message, code = 'UNKNOWN') {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.type = code === 'AUTH' ? 'AUTH' : 'API_ERROR';
    }
}

// Export singleton instance
const api = new ApiService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    module.exports.ApiError = ApiError;
}
