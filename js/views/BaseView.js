// ============================================
// BaseView - Base class for all views
// ============================================

class BaseView {
    constructor(viewName) {
        this.viewName = viewName;
        this.element = typeof document !== 'undefined' ? document.getElementById(`view-${viewName}`) : null;
        this.isActive = false;
        this.data = {};
        this.isLoading = false;
        this.lastUpdate = 0;
        
        // Bind render method
        this.render = this.render.bind(this);
        this.onShow = this.onShow.bind(this);
        this.onHide = this.onHide.bind(this);
    }
    
    /**
     * Get view element
     */
    getElement() {
        if (!this.element && typeof document !== 'undefined') {
            this.element = document.getElementById(`view-${this.viewName}`);
        }
        return this.element;
    }
    
    /**
     * Check if view is active
     */
    getIsActive() {
        return this.isActive;
    }
    
    /**
     * Initialize the view
     */
    async init() {
        // Override in subclasses
    }
    
    /**
     * Called when view becomes visible
     */
    async onShow() {
        this.isActive = true;
        
        // Refresh data if stale (> 5 min)
        const staleness = Date.now() - this.lastUpdate;
        if (staleness > 300000) {
            await this.refresh();
        }
    }
    
    /**
     * Called when view is hidden
     */
    onHide() {
        this.isActive = false;
    }
    
    /**
     * Render the view
     */
    async render() {
        // Override in subclasses
    }
    
    /**
     * Refresh view data
     */
    async refresh() {
        // Override in subclasses
    }
    
    /**
     * Show loading state
     */
    showLoading(message = 'A carregar...') {
        const el = this.getElement();
        if (!el) return;
        
        this.isLoading = true;
        el.innerHTML = `
            <div class="empty">
                <span class="glyph">◌</span>
                <p>${message}</p>
            </div>
        `;
    }
    
    /**
     * Show error state
     */
    showError(message) {
        const el = this.getElement();
        if (!el) return;
        
        this.isLoading = false;
        el.innerHTML = `
            <div class="empty">
                <span class="glyph">⚠</span>
                <p>${message}</p>
                <button class="primary" onclick="app.getView('${this.viewName}').refresh()">Tentar novamente</button>
            </div>
        `;
    }
    
    /**
     * Show empty state
     */
    showEmpty(message = 'Sem dados') {
        const el = this.getElement();
        if (!el) return;
        
        this.isLoading = false;
        el.innerHTML = `
            <div class="empty">
                <span class="glyph">◌</span>
                <p>${message}</p>
            </div>
        `;
    }
    
    /**
     * Set loading button state
     */
    setLoadingButton(buttonId, loading) {
        if (typeof document === 'undefined') return;
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        btn.disabled = loading;
        btn.classList.toggle('loading', loading);
    }
    
    /**
     * Show toast notification
     */
    showToast(message, isError = false) {
        if (typeof toast !== 'undefined') {
            toast.show(message, { type: isError ? 'error' : 'success' });
        }
    }
    
    /**
     * Get translated text
     */
    t(key) {
        const translations = {
            'loading': 'A carregar...',
            'error': 'Erro',
            'save': 'Guardar',
            'cancel': 'Cancelar',
            'confirm': 'Confirmar',
            'delete': 'Eliminar',
            'edit': 'Editar',
            'noData': 'Sem dados para mostrar',
            'success': 'Operação realizada com sucesso'
        };
        return translations[key] || key;
    }
    
    /**
     * Format date
     */
    formatDate(dateStr) {
        return typeof Formatters !== 'undefined' ? Formatters.date(dateStr) : dateStr;
    }
    
    /**
     * Format datetime
     */
    formatDateTime(dateStr, timeStr) {
        return typeof Formatters !== 'undefined' ? Formatters.dateTime(dateStr, timeStr) : `${dateStr} ${timeStr}`;
    }
    
    /**
     * Format number
     */
    formatNumber(value, decimals = 2) {
        return typeof Formatters !== 'undefined' ? Formatters.number(value, decimals) : value;
    }
    
    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        if (typeof appState === 'undefined') return true;
        const state = appState.state;
        if (permission === 'edit') {
            return state.user && state.user.rol !== 'visualizador';
        }
        if (permission === 'admin') {
            return state.user && state.user.rol === 'admin';
        }
        return true;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseView;
}
