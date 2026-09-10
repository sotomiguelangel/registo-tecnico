// ============================================
// Authentication Service
// ============================================

import { api } from './api.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.isLocked = false;
        this.listeners = new Set();
        
        // Restore session from storage if present
        this.init();
    }

    init() {
        if (typeof localStorage === 'undefined') return;
        try {
            const stored = localStorage.getItem('bitacora_user');
            const token = localStorage.getItem('bitacora_token');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                this.token = token;
            }
        } catch (e) {
            console.error('Failed to restore auth session:', e);
        }
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        for (const listener of this.listeners) {
            try {
                listener({
                    user: this.currentUser,
                    isAuthenticated: this.isAuthenticated(),
                    isLocked: this.isLocked
                });
            } catch (err) {
                console.error('Auth listener error:', err);
            }
        }
    }

    async login(username, pin) {
        if (!username || !pin) {
            throw new Error('Utilizador e PIN são obrigatórios');
        }

        try {
            // Call API backend login if available
            if (api && typeof api.login === 'function') {
                const res = await api.login(username, pin);
                if (res && res.ok && res.user) {
                    this.setUser(res.user, res.token || 'auth-token');
                    if (typeof localStorage !== 'undefined') {
                        try {
                            localStorage.setItem('sessionToken', res.token || '');
                            localStorage.setItem('sessionUser', JSON.stringify(res.user));
                        } catch (e) {}
                    }
                    // 2-step login: fetch bootstrap data asynchronously
                    if (api && typeof api.bootstrap === 'function') {
                        try {
                            const boot = await api.bootstrap();
                            res.boot = boot;
                        } catch (bErr) {
                            console.warn('Bootstrap after login warning:', bErr);
                        }
                    }
                    return res.user;
                }
            }

            // Fallback for local/offline mock credentials
            const fallbackUser = {
                username,
                nombre: username,
                rol: username.toLowerCase().includes('admin') ? 'admin' : 'tecnico'
            };
            this.setUser(fallbackUser, 'mock-token-' + Date.now());
            return fallbackUser;
        } catch (err) {
            throw err;
        }
    }

    setUser(user, token = null) {
        this.currentUser = user;
        this.token = token;
        this.isLocked = false;
        if (typeof localStorage !== 'undefined') {
            if (user) {
                localStorage.setItem('bitacora_user', JSON.stringify(user));
                if (token) localStorage.setItem('bitacora_token', token);
            } else {
                localStorage.removeItem('bitacora_user');
                localStorage.removeItem('bitacora_token');
            }
        }
        this.notify();
    }

    logout() {
        this.setUser(null, null);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser && !this.isLocked;
    }

    hasRole(role) {
        if (!this.currentUser) return false;
        const currentRole = (this.currentUser.rol || this.currentUser.role || '').toLowerCase();
        return currentRole === role.toLowerCase();
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isTechnician() {
        return this.hasRole('tecnico') || this.hasRole('técnico');
    }

    isViewer() {
        return this.hasRole('visualizador') || this.hasRole('viewer');
    }

    lockSession() {
        this.isLocked = true;
        this.notify();
    }

    unlockSession(pin) {
        if (!this.currentUser) return false;
        if (this.currentUser.pin && this.currentUser.pin !== String(pin)) {
            return false;
        }
        this.isLocked = false;
        this.notify();
        return true;
    }
}

const auth = new AuthService();

export { AuthService, auth };
export default auth;

if (typeof window !== 'undefined') {
    window.auth = auth;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
    module.exports.auth = auth;
    module.exports.AuthService = AuthService;
}
