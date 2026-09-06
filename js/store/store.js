// ============================================
// Central Application Store
// ============================================

import AppState from './AppState.js';

const store = (typeof window !== 'undefined' && window.appState) ? window.appState : new AppState();

export { AppState, store };
export default store;

if (typeof window !== 'undefined') {
    window.store = store;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = store;
    module.exports.store = store;
    module.exports.AppState = AppState;
}
