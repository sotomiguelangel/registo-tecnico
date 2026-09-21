// ============================================
// API Service - Communication with Google Sheets backend
// ============================================

import { CONFIG, validateApiUrl } from '../config.js';

class ApiService {
    constructor(config = {}) {
        this.apiUrl = validateApiUrl(config.apiUrl || CONFIG.API_URL);
        this.timeout = config.timeout || CONFIG.API_TIMEOUT;
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
        if (typeof localStorage !== 'undefined') {
            if (token) {
                localStorage.setItem(key, token);
            } else {
                localStorage.removeItem(key);
            }
        }
    }
    
    /**
     * Get stored token
     */
    getToken() {
        if (!this.token) {
            const key = typeof CONSTANTS !== 'undefined' ? CONSTANTS.STORAGE_KEYS.TOKEN : 'bitacora_token';
            this.token = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
        }
        return this.token;
    }
    
    /**
     * Make API request with retry logic
     */
    async request(action, data = {}, options = {}) {
        const normalizedAction = this.normalizeAction(action);
        this.validateRequestData(normalizedAction, data);
        const url = this.buildUrl(normalizedAction);
        const body = this.buildBody({ action: normalizedAction, ...data });
        
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
                    throw new ApiError(
                        'Sessão expirada. Inicie sessão novamente.',
                        'AUTH'
                    );
                }
                
                throw new ApiError(result.error || 'Erro do servidor', result.code);
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on auth errors or abort
                if (
                    error.name === 'AbortError' ||
                    error.type === 'AUTH' ||
                    error.code === 'TIMEOUT' ||
                    error.code === 'PARSE_ERROR' ||
                    error.code === 'INVALID_CONTENT_TYPE' ||
                    /^HTTP_4\d\d$/.test(error.code || '')
                ) {
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
     * Reject malformed requests before they reach the API.
     */
    normalizeAction(action) {
        if (typeof action !== 'string' || !action.trim()) {
            throw new ApiError('Ação ausente no pedido.', 'BAD_REQUEST');
        }
        return action.trim();
    }

    validateRequestData(action, data) {
        if (action === 'saveBatch' && (!data || !Array.isArray(data.rows) || !data.rows.length)) {
            throw new ApiError('Lote de importação vazio ou inválido.', 'BAD_REQUEST');
        }
        if (data && Object.prototype.hasOwnProperty.call(data, 'type') &&
            (typeof data.type !== 'string' || !data.type.trim())) {
            throw new ApiError('Categoria/tipo ausente no pedido.', 'BAD_REQUEST');
        }
    }
    
    /**
     * Execute fetch with timeout
     */
    async executeFetch(url, options, timeout) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        
        try {
            // Use safeFetch wrapper or native fetch
            const fetchFn = (typeof window !== 'undefined' && typeof window.safeFetch === 'function')
                ? window.safeFetch
                : (typeof window !== 'undefined' ? window.fetch : fetch);
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
        const contentType = (response.headers && response.headers.get('content-type')) || '';
        if (!response.ok) {
            throw new ApiError(
                `O servidor rejeitou o pedido (HTTP ${response.status}). ${this.describeNonJson(text)}`,
                `HTTP_${response.status}`
            );
        }
        if (contentType && !/application\/json|text\/json/i.test(contentType)) {
            throw new ApiError(
                `O servidor devolveu conteúdo não JSON (HTTP ${response.status}). ${this.describeNonJson(text)}`,
                'INVALID_CONTENT_TYPE'
            );
        }
        try {
            const json = JSON.parse(text);
            if (!json || typeof json !== 'object' || Array.isArray(json)) {
                throw new Error('not an object');
            }
            return json;
        } catch (e) {
            throw new ApiError(
                `O servidor não devolveu dados JSON válidos (HTTP ${response.status}). ${this.describeNonJson(text)}`,
                'PARSE_ERROR'
            );
        }
    }

    describeNonJson(text) {
        const detail = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 160);
        return detail ? `Resposta: ${detail}` : 'Resposta vazia.';
    }
    
    /**
     * Build URL with query params
     */
    buildUrl(action) {
        action = this.normalizeAction(action);
        const url = new URL(validateApiUrl(this.apiUrl));
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

export { ApiService, ApiError, api };
export default api;
