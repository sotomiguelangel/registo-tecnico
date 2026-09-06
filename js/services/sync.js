// ============================================
// Sync Service Module (Offline / Online Sync)
// ============================================

import SyncService from './SyncService.js';

let sync = null;
if (typeof window !== 'undefined') {
    if (window.syncService) {
        sync = window.syncService;
    } else if (typeof window.getSyncService === 'function') {
        sync = window.getSyncService();
    }
}
if (!sync) {
    sync = new SyncService();
}

export { SyncService, sync };
export default sync;

if (typeof window !== 'undefined') {
    window.syncService = sync;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = sync;
    module.exports.sync = sync;
    module.exports.SyncService = SyncService;
}
