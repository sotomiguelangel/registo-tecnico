// ============================================
// Sync Service - Background synchronization queue
// ============================================

class SyncService {
    constructor(apiService, storageService) {
        this.api = apiService;
        this.storage = storageService;
        this.queue = [];
        this.isProcessing = false;
        this.processInterval = null;
        this.listeners = new Set();
    }
    
    /**
     * Initialize sync service
     */
    async init() {
        // Load queue from IndexedDB
        const storedQueue = await this.storage.getPendingQueue();
        this.queue = storedQueue || [];
        
        // Start periodic sync
        this.startPeriodicSync();
        
        // Process any pending items
        this.processQueue();
    }
    
    /**
     * Subscribe to sync events
     */
    onSyncEvent(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    
    /**
     * Emit sync event
     */
    emit(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                console.error('Sync listener error:', e);
            }
        });
    }
    
    /**
     * Add item to sync queue
     */
    async enqueue(action, type, payload) {
        const item = {
            action,
            type,
            payload,
            id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            attempts: 0,
            status: 'pending'
        };
        
        // Add to memory queue
        this.queue.push(item);
        
        // Persist to IndexedDB
        await this.storage.addToQueue(item);
        
        // Update UI
        this.emit('queued', { queueLength: this.queue.length });
        
        // Trigger processing
        this.triggerSync(100);
        
        return item.id;
    }
    
    /**
     * Process sync queue
     */
    async processQueue() {
        if (this.isProcessing) return;
        if (this.queue.length === 0) return;
        
        this.isProcessing = true;
        this.emit('processing', { queueLength: this.queue.length });
        
        while (this.queue.length > 0) {
            const item = this.queue[0];
            
            try {
                await this.processItem(item);
                
                // Success - remove from queue
                this.queue.shift();
                await this.storage.removeFromQueue(item.id);
                
                this.emit('itemSuccess', item);
                
            } catch (error) {
                item.attempts++;
                
                if (error.type === 'AUTH') {
                    // Stop processing on auth error
                    this.emit('authError', error);
                    break;
                }
                
                const maxRetries = (typeof CONSTANTS !== 'undefined' && CONSTANTS.DEFAULTS && CONSTANTS.DEFAULTS.MAX_RETRIES) ? CONSTANTS.DEFAULTS.MAX_RETRIES : 3;
                if (item.attempts >= maxRetries) {
                    // Max retries reached - remove and log
                    this.queue.shift();
                    await this.storage.removeFromQueue(item.id);
                    
                    this.emit('itemFailed', { item, error });
                    
                    console.error('Sync item failed after max retries:', item, error);
                } else {
                    // Wait before retry
                    const delay = this.calculateBackoff(item.attempts);
                    this.emit('itemRetry', { item, delay, attempt: item.attempts });
                    
                    await this.sleep(delay);
                }
            }
        }
        
        this.isProcessing = false;
        this.emit('completed', { queueLength: this.queue.length });
    }
    
    /**
     * Process a single queue item
     */
    async processItem(item) {
        const { action, type, payload } = item;
        
        switch (action) {
            case 'save':
                return await this.api.saveRecord(type, payload.data);
                
            case 'update':
                return await this.api.updateRecord(type, payload.id, payload.data);
                
            case 'delete':
                return await this.api.deleteRecord(type, payload.id);
                
            default:
                throw new Error(`Unknown sync action: ${action}`);
        }
    }
    
    /**
     * Trigger sync with optional delay
     */
    triggerSync(delayMs = 500) {
        if (this.processInterval) {
            clearTimeout(this.processInterval);
        }
        
        this.processInterval = setTimeout(() => {
            this.processQueue();
        }, delayMs);
    }
    
    /**
     * Start periodic sync
     */
    startPeriodicSync() {
        // Sync every 30 seconds when online
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                if (typeof navigator !== 'undefined' && navigator.onLine && this.queue.length > 0) {
                    this.processQueue();
                }
            }, 30000);
        }
        
        // Listen for online events
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('Back online - starting sync');
                this.processQueue();
            });
        }
    }
    
    /**
     * Get queue status
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            isProcessing: this.isProcessing,
            pendingCount: this.queue.filter(i => i.status === 'pending').length,
            failedCount: this.queue.filter(i => i.status === 'failed').length
        };
    }
    
    /**
     * Calculate exponential backoff
     */
    calculateBackoff(attempt) {
        const base = 2500;
        const delays = (typeof CONSTANTS !== 'undefined' && CONSTANTS.DEFAULTS && CONSTANTS.DEFAULTS.SYNC_RETRY_DELAYS) 
            ? CONSTANTS.DEFAULTS.SYNC_RETRY_DELAYS 
            : [2500, 3750, 5625, 8437, 12656];
        return delays[Math.min(attempt - 1, delays.length - 1)] || base;
    }
    
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Clear queue
     */
    async clearQueue() {
        this.queue = [];
        this.emit('cleared', {});
    }
}

// Export singleton instance
let syncService = null;

function getSyncService() {
    if (!syncService) {
        syncService = new SyncService(api, storage);
    }
    return syncService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SyncService, getSyncService };
}
