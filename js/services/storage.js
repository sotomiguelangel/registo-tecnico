// ============================================
// Storage Service Module (LocalStorage & IndexedDB)
// ============================================

import StorageService from './StorageService.js';

const storage = (typeof window !== 'undefined' && window.storage) ? window.storage : new StorageService();

export { StorageService, storage };
export default storage;

if (typeof window !== 'undefined') {
    window.storage = storage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = storage;
    module.exports.storage = storage;
    module.exports.StorageService = StorageService;
}
