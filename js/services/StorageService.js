// ============================================
// Storage Service - IndexedDB wrapper for offline storage
// ============================================

class StorageService {
    constructor() {
        this.dbName = 'MoonAndSunDB';
        this.dbVersion = 1;
        this.db = null;
        this.initPromise = null;
    }
    
    /**
     * Initialize the database
     */
    async init() {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // General records store
                if (!db.objectStoreNames.contains('general')) {
                    const generalStore = db.createObjectStore('general', { 
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    generalStore.createIndex('fecha', 'fecha', { unique: false });
                    generalStore.createIndex('hora', 'hora', { unique: false });
                    generalStore.createIndex('fecha_hora', ['fecha', 'hora'], { unique: false });
                }
                
                // Quarto records store
                if (!db.objectStoreNames.contains('quarto')) {
                    const quartoStore = db.createObjectStore('quarto', { 
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    quartoStore.createIndex('fecha', 'fecha', { unique: false });
                    quartoStore.createIndex('numero', 'numero', { unique: false });
                    quartoStore.createIndex('fecha_numero', ['fecha', 'numero'], { unique: false });
                }
                
                // Temperatura records store
                if (!db.objectStoreNames.contains('temperatura')) {
                    const tempStore = db.createObjectStore('temperatura', { 
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    tempStore.createIndex('fecha', 'fecha', { unique: false });
                    tempStore.createIndex('equipamento', 'equipamentoId', { unique: false });
                    tempStore.createIndex('fecha_equipamento', ['fecha', 'equipamentoId'], { unique: false });
                }
                
                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                // Offline queue store
                if (!db.objectStoreNames.contains('offlineQueue')) {
                    const queueStore = db.createObjectStore('offlineQueue', { 
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    queueStore.createIndex('timestamp', 'timestamp', { unique: false });
                    queueStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
        
        return this.initPromise;
    }
    
    /**
     * Get a transaction
     */
    async _transaction(stores, mode = 'readonly') {
        const db = await this.init();
        return db.transaction(stores, mode);
    }
    
    // =======================
    // Record Operations
    // =======================
    
    /**
     * Save records to a store
     */
    async saveRecords(storeName, records) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const results = [];
            records.forEach(record => {
                const request = store.put(record);
                request.onsuccess = () => results.push(request.result);
                request.onerror = () => reject(request.error);
            });
            
            transaction.oncomplete = () => resolve(results);
            transaction.onerror = () => reject(transaction.error);
        });
    }
    
    /**
     * Get all records from a store
     */
    async getAllRecords(storeName) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get records by index
     */
    async getRecordsByIndex(storeName, indexName, value) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get a single record by key
     */
    async getRecord(storeName, key) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Delete a record
     */
    async deleteRecord(storeName, key) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Clear all records from a store
     */
    async clearStore(storeName) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // =======================
    // Settings Operations
    // =======================
    
    /**
     * Save a setting
     */
    async saveSetting(key, value) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('settings', 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value, updated: Date.now() });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get a setting
     */
    async getSetting(key) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('settings', 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    // =======================
    // Offline Queue Operations
    // =======================
    
    /**
     * Add item to offline queue
     */
    async addToQueue(item) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('offlineQueue', 'readwrite');
            const store = transaction.objectStore('offlineQueue');
            const request = store.add({
                ...item,
                timestamp: Date.now(),
                status: 'pending'
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get pending queue items
     */
    async getPendingQueue() {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('offlineQueue', 'readonly');
            const store = transaction.objectStore('offlineQueue');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Remove item from queue
     */
    async removeFromQueue(id) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('offlineQueue', 'readwrite');
            const store = transaction.objectStore('offlineQueue');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // =======================
    // Utility
    // =======================
    
    /**
     * Get store count
     */
    async getCount(storeName) {
        const db = await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Clear entire database
     */
    async clearAll() {
        const db = await this.init();
        const storeNames = Array.from(db.objectStoreNames);
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeNames, 'readwrite');
            
            storeNames.forEach(name => {
                transaction.objectStore(name).clear();
            });
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Export singleton instance
const storage = new StorageService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = storage;
}
