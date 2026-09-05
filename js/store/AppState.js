// ============================================
// Centralized Application State
// Uses Observer pattern for reactivity
// ============================================

class AppState {
    constructor() {
        this._state = {
            // User session
            user: null,
            isAuthenticated: false,
            isViewer: false,
            
            // Navigation
            currentView: 'ejecutivo',
            previousView: null,
            
            // Data records
            records: {
                general: [],
                quarto: [],
                temperatura: []
            },
            
            // Metadata
            recordsMeta: {
                general: { lastFetch: 0, loading: false },
                quarto: { lastFetch: 0, loading: false },
                temperatura: { lastFetch: 0, loading: false }
            },
            
            // Settings
            config: {},
            roomsList: [],
            equipamentos: [],
            
            // UI State
            isLoading: false,
            isSyncing: false,
            syncQueue: [],
            syncErrors: [],
            
            // Cycle state
            cycleDone: [],
            selectedCycle: 'current',
            
            // Timestamps
            lastRender: {},
            
            // Version
            versionState: 'ok',
            latestVersion: null
        };
        
        this._listeners = new Set();
        this._history = [];
        
        // Subscribe to state changes for logging/debug
        this._setupDebugListener();
    }
    
    // Get current state
    get state() {
        return this._state;
    }
    
    // Get specific part of state
    get(selector) {
        if (typeof selector === 'function') {
            return selector(this._state);
        }
        return selector.split('.').reduce((obj, key) => obj?.[key], this._state);
    }
    
    // Subscribe to state changes
    subscribe(callback) {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }
    
    // Update state
    setState(updater) {
        const previousState = { ...this._state };
        
        if (typeof updater === 'function') {
            this._state = { ...this._state, ...updater(this._state) };
        } else {
            this._state = { ...this._state, ...updater };
        }
        
        this._notify(this._state, previousState);
    }
    
    // Batch update multiple states
    batch(updates) {
        const previousState = { ...this._state };
        
        Object.keys(updates).forEach(key => {
            this._deepSet(this._state, key, updates[key]);
        });
        
        this._notify(this._state, previousState);
    }
    
    // Deep set helper
    _deepSet(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        let current = obj;
        for (const key of keys) {
            if (!current[key]) current[key] = {};
            current = current[key];
        }
        current[lastKey] = value;
    }
    
    // Notify all listeners
    _notify(currentState, previousState) {
        const changes = this._diff(previousState, currentState);
        
        this._listeners.forEach(callback => {
            try {
                callback(currentState, previousState, changes);
            } catch (e) {
                console.error('State listener error:', e);
            }
        });
        
        // Add to history for undo/redo
        if (this._history.length > 50) {
            this._history.shift();
        }
        this._history.push({
            state: JSON.parse(JSON.stringify(currentState)),
            timestamp: Date.now()
        });
    }

    _diff(prev, curr) {
        const changes = {};
        for (const key of Object.keys(curr)) {
            if (prev[key] !== curr[key]) {
                changes[key] = { from: prev[key], to: curr[key] };
            }
        }
        return changes;
    }

    _setupDebugListener() {
        if (typeof window !== 'undefined' && window.__DEBUG_APP_STATE__) {
            this.subscribe((curr, prev, diff) => {
                console.debug('[AppState Change]', diff);
            });
        }
    }
}

// Create and export singleton instance
const appState = new AppState();

// Export for use in modules or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, appState };
}

