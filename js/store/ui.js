// ============================================
// UI State Slice
// ============================================

import { store } from './store.js';

export const UiStore = {
    /**
     * Get current active view name
     */
    getCurrentView() {
        return store.get('currentView') || 'dashboard';
    },

    /**
     * Set active view name
     */
    setCurrentView(view) {
        store.setCurrentView(view);
    },

    /**
     * Get loading state
     */
    isLoading() {
        return store.get('isLoading') || false;
    },

    /**
     * Set loading state
     */
    setLoading(loading) {
        store.setLoading(loading);
    },

    /**
     * Get syncing state
     */
    isSyncing() {
        return store.get('isSyncing') || false;
    },

    /**
     * Set syncing state
     */
    setSyncing(syncing) {
        store.set('isSyncing', !!syncing);
        store._notify('ui:syncing', syncing);
    },

    /**
     * Subscribe to UI events
     */
    subscribe(listener) {
        return store.subscribe((event, data) => {
            if (event && (event.startsWith('ui:') || event === 'view:change')) {
                listener(event, data);
            }
        });
    }
};

export default UiStore;

if (typeof window !== 'undefined') {
    window.UiStore = UiStore;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UiStore;
    module.exports.UiStore = UiStore;
}
