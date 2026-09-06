// ============================================
// Records State Slice
// ============================================

import { store } from './store.js';

export const RecordsStore = {
    /**
     * Get records of a specific type (general, quarto, temperatura)
     * @param {string} type
     * @returns {Array}
     */
    get(type) {
        return store.getRecords(type) || [];
    },

    /**
     * Set full list of records for a type
     */
    set(type, records) {
        store.setRecords(type, records);
    },

    /**
     * Add single record
     */
    add(type, record) {
        store.addRecord(type, record);
    },

    /**
     * Update existing record
     */
    update(type, id, updates) {
        store.updateRecord(type, id, updates);
    },

    /**
     * Delete record
     */
    delete(type, id) {
        store.deleteRecord(type, id);
    },

    /**
     * Subscribe to record changes
     */
    subscribe(listener) {
        return store.subscribe((event, data) => {
            if (event && event.startsWith('records:')) {
                listener(event, data);
            }
        });
    }
};

export default RecordsStore;

if (typeof window !== 'undefined') {
    window.RecordsStore = RecordsStore;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecordsStore;
    module.exports.RecordsStore = RecordsStore;
}
