// ============================================
// Toast - Notification system
// ============================================

class Toast {
    constructor(containerId = 'toastContainer') {
        this.container = typeof document !== 'undefined' ? document.getElementById(containerId) : null;
        this.currentToast = null;
        this.timer = null;
        
        if (!this.container && typeof document !== 'undefined') {
            this.createContainer();
        }
    }
    
    /**
     * Create toast container if not exists
     */
    createContainer() {
        if (typeof document === 'undefined') return;
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.style.cssText = `
            position: fixed;
            left: 50%;
            bottom: 96px;
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }
    
    /**
     * Show a toast message
     */
    show(message, options = {}) {
        if (typeof document === 'undefined') return null;
        if (!this.container) this.createContainer();

        const {
            duration = 3500,
            type = 'info', // info, success, warning, error
            dismissible = true
        } = options;
        
        // Clear existing toast
        this.hide();
        
        // Create toast element
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${type}`;
        toastEl.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: #fff;
            padding: 11px 18px;
            border-radius: 30px;
            font-size: 13.5px;
            font-weight: 600;
            white-space: pre-line;
            max-width: 88%;
            text-align: center;
            box-shadow: 0 10px 24px -8px rgba(0,0,0,0.4);
            opacity: 0;
            transform: translate(-50%, 20px);
            transition: all 0.25s ease;
            pointer-events: ${dismissible ? 'auto' : 'none'};
            cursor: ${dismissible ? 'pointer' : 'default'};
        `;
        
        // Add icon based on type
        const icon = this.getIcon(type);
        toastEl.innerHTML = `${icon} ${message}`;
        
        // Add click to dismiss
        if (dismissible) {
            toastEl.addEventListener('click', () => this.hide());
        }
        
        this.container.appendChild(toastEl);
        this.currentToast = toastEl;
        
        // Animate in
        requestAnimationFrame(() => {
            toastEl.style.opacity = '1';
            toastEl.style.transform = 'translate(-50%, 0)';
        });
        
        // Auto dismiss
        if (duration > 0) {
            this.timer = setTimeout(() => this.hide(), duration);
        }
        
        return toastEl;
    }
    
    /**
     * Hide current toast
     */
    hide() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        if (this.currentToast) {
            const toastEl = this.currentToast;
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translate(-50%, 20px)';
            
            setTimeout(() => {
                if (toastEl.parentNode) {
                    toastEl.parentNode.removeChild(toastEl);
                }
            }, 250);
            
            this.currentToast = null;
        }
    }
    
    /**
     * Show info toast
     */
    info(message, duration) {
        return this.show(message, { type: 'info', duration });
    }
    
    /**
     * Show success toast
     */
    success(message, duration) {
        return this.show(message, { type: 'success', duration });
    }
    
    /**
     * Show warning toast
     */
    warning(message, duration) {
        return this.show(message, { type: 'warning', duration });
    }
    
    /**
     * Show error toast
     */
    error(message, duration) {
        return this.show(message, { type: 'error', duration });
    }
    
    /**
     * Show loading toast
     */
    loading(message = 'A processar...') {
        return this.show(`${this.getIcon('loading')} ${message}`, { 
            type: 'info', 
            duration: 0,
            dismissible: false
        });
    }
    
    /**
     * Get background color based on type
     */
    getBackgroundColor(type) {
        const colors = {
            info: 'var(--petrol-900, #0e3341)',
            success: 'var(--ok-500, #3ea472)',
            warning: 'var(--amber-500, #e0a12b)',
            error: 'var(--coral-500, #e0602b)',
            loading: 'var(--petrol-800, #134354)'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * Get icon based on type
     */
    getIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✓',
            warning: '⚠️',
            error: '❌',
            loading: '<span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:6px;"></span>'
        };
        return icons[type] || icons.info;
    }
}

// Export singleton instance
const toast = new Toast();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = toast;
}
