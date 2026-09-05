// ============================================
// VirtualList - Efficient large list rendering
// ============================================

class VirtualList {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? (typeof document !== 'undefined' ? document.querySelector(container) : null) : container;
        
        this.itemHeight = options.itemHeight || 175;
        this.itemCount = options.itemCount || 0;
        this.renderItem = options.renderItem || (() => '');
        this.searchFn = options.searchFn || (() => true);
        this.emptyHtml = options.emptyHtml || '<div class="empty">Sem resultados</div>';
        
        this.items = [];
        this.filteredItems = [];
        this.searchQuery = '';
        
        this.scrollTop = 0;
        this.clientHeight = 0;
        
        this.viewport = null;
        this.spacer = null;
        this.content = null;
        
        this.lastStartIndex = -1;
        this.lastEndIndex = -1;
        this.isPrinting = false;
        
        this.init();
    }
    
    /**
     * Initialize the virtual list
     */
    init() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="vlist-container">
                <div class="vlist-toolbar">
                    <div class="vlist-badge" id="vlist-badge">
                        📋 <b id="vlist-count">0</b> registos
                    </div>
                    <div class="vlist-search-wrap">
                        <input type="text" class="vlist-search-input" id="vlist-search" placeholder="🔍 Filtrar...">
                    </div>
                </div>
                <div class="vlist-viewport" id="vlist-viewport">
                    <div class="vlist-spacer" id="vlist-spacer"></div>
                    <div class="vlist-content" id="vlist-content"></div>
                </div>
            </div>
        `;
        
        this.viewport = this.container.querySelector('#vlist-viewport');
        this.spacer = this.container.querySelector('#vlist-spacer');
        this.content = this.container.querySelector('#vlist-content');
        
        this.setupEvents();
    }
    
    /**
     * Setup event listeners
     */
    setupEvents() {
        if (!this.container) return;
        const searchInput = this.container.querySelector('#vlist-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.applyFilter();
            });
        }
        
        if (this.viewport) {
            this.viewport.addEventListener('scroll', () => this.onScroll(), { passive: true });
            
            // Get initial client height
            this.clientHeight = this.viewport.clientHeight;
        }
    }
    
    /**
     * Set items data
     */
    setItems(items) {
        this.items = items || [];
        this.applyFilter();
    }
    
    /**
     * Apply search filter
     */
    applyFilter() {
        if (!this.searchQuery) {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => this.searchFn(item, this.searchQuery));
        }
        
        this.itemCount = this.filteredItems.length;
        
        // Update counter
        if (this.container) {
            const countEl = this.container.querySelector('#vlist-count');
            if (countEl) {
                countEl.textContent = this.itemCount;
            }
        }
        
        // Reset scroll
        if (this.viewport) {
            this.viewport.scrollTop = 0;
        }
        
        // Render
        this.lastStartIndex = -1;
        this.lastEndIndex = -1;
        this.render();
    }
    
    /**
     * Handle scroll event
     */
    onScroll() {
        if (this.isPrinting || !this.viewport) return;
        
        this.scrollTop = this.viewport.scrollTop;
        this.render();
    }
    
    /**
     * Render the visible items
     */
    render() {
        if (!this.viewport || !this.spacer || !this.content) return;
        
        const total = this.filteredItems.length;
        
        if (total === 0) {
            this.spacer.style.height = '0px';
            this.content.style.transform = 'none';
            this.content.innerHTML = this.emptyHtml;
            return;
        }
        
        const totalHeight = total * this.itemHeight;
        this.spacer.style.height = `${totalHeight}px`;
        
        const buffer = 4;
        const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - buffer);
        const endIndex = Math.min(total, Math.ceil((this.scrollTop + this.clientHeight) / this.itemHeight) + buffer);
        
        if (startIndex === this.lastStartIndex && endIndex === this.lastEndIndex) {
            return; // No change
        }
        
        this.lastStartIndex = startIndex;
        this.lastEndIndex = endIndex;
        
        const offsetY = startIndex * this.itemHeight;
        this.content.style.transform = `translateY(${offsetY}px)`;
        
        // Render items
        const html = [];
        for (let i = startIndex; i < endIndex; i++) {
            html.push(this.renderItem(this.filteredItems[i], i));
        }
        
        this.content.innerHTML = html.join('');
    }
    
    /**
     * Expand all items for printing
     */
    expandForPrint() {
        this.isPrinting = true;
        
        if (this.spacer) this.spacer.style.height = 'auto';
        if (this.content) {
            this.content.style.transform = 'none';
            this.content.innerHTML = this.filteredItems.map((item, i) => this.renderItem(item, i)).join('');
        }
    }
    
    /**
     * Restore after printing
     */
    restoreAfterPrint() {
        this.isPrinting = false;
        
        this.lastStartIndex = -1;
        this.lastEndIndex = -1;
        this.render();
    }
    
    /**
     * Update search function
     */
    setSearchFn(fn) {
        this.searchFn = fn;
        this.applyFilter();
    }
    
    /**
     * Update render function
     */
    setRenderFn(fn) {
        this.renderItem = fn;
        this.render();
    }
    
    /**
     * Refresh the list
     */
    refresh() {
        this.applyFilter();
    }
    
    /**
     * Destroy the virtual list
     */
    destroy() {
        if (this.viewport) {
            this.viewport.removeEventListener('scroll', this.onScroll);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualList;
}
