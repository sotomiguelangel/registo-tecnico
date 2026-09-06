// ============================================
// Logger & Telemetry Utility
// ============================================

const Log = {
    levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
    current: 1, // INFO
    
    setLevel(levelName) {
        if (typeof levelName === 'string' && this.levels[levelName.toUpperCase()] !== undefined) {
            this.current = this.levels[levelName.toUpperCase()];
        } else if (typeof levelName === 'number') {
            this.current = levelName;
        }
    },
    
    debug(...args) {
        if (this.current <= this.levels.DEBUG) {
            console.debug('[DEBUG]', ...args);
        }
    },
    
    info(...args) {
        if (this.current <= this.levels.INFO) {
            console.info('[INFO]', ...args);
        }
    },
    
    warn(...args) {
        if (this.current <= this.levels.WARN) {
            console.warn('[WARN]', ...args);
        }
    },
    
    error(...args) {
        if (this.current <= this.levels.ERROR) {
            console.error('[ERROR]', ...args);
        }
    },
    
    // Track de eventos para analytics
    track(event, data = {}) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
            ...data
        };
        
        if (typeof gtag !== 'undefined') {
            try {
                gtag('event', event, data);
            } catch (err) {
                this.debug('gtag error', err);
            }
        }
        
        this.debug('Track:', payload);
        return payload;
    }
};

if (typeof window !== 'undefined') {
    window.Log = Log;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Log;
    module.exports.Log = Log;
}

export { Log };
export default Log;
