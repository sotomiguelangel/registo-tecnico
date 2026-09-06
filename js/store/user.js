// ============================================
// User State Slice
// ============================================

import { store } from './store.js';

export const UserStore = {
    /**
     * Get current authenticated user
     */
    get() {
        return store.get('user');
    },

    /**
     * Set authenticated user
     */
    set(user) {
        store.setUser(user);
    },

    /**
     * Clear user session
     */
    clear() {
        store.setUser(null);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return store.get('isAuthenticated') || false;
    },

    /**
     * Check if user is viewer
     */
    isViewer() {
        return store.get('isViewer') || false;
    },

    /**
     * Check if user is admin
     */
    isAdmin() {
        const u = this.get();
        if (!u) return false;
        return (u.rol || u.role || '').toLowerCase() === 'admin';
    },

    /**
     * Subscribe to user changes
     */
    subscribe(listener) {
        return store.subscribe((event, data) => {
            if (event === 'user:login' || event === 'user:logout' || event === 'user:change') {
                listener(event, data);
            }
        });
    }
};

export default UserStore;

if (typeof window !== 'undefined') {
    window.UserStore = UserStore;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserStore;
    module.exports.UserStore = UserStore;
}
