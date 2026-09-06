// ============================================
// Button Component (BEM)
// ============================================

/**
 * Reusable Button Generator & Manager
 */
export class Button {
    /**
     * @param {object} options
     * @param {string} [options.text='']
     * @param {string} [options.variant='primary'] primary, secondary, danger, ghost, white
     * @param {string} [options.size='md'] sm, md, lg
     * @param {boolean} [options.block=false]
     * @param {string} [options.icon='']
     * @param {boolean} [options.disabled=false]
     * @param {string} [options.id='']
     * @param {string} [options.type='button']
     * @param {Function} [options.onClick]
     */
    constructor(options = {}) {
        this.options = {
            text: '',
            variant: 'primary',
            size: 'md',
            block: false,
            icon: '',
            disabled: false,
            id: '',
            type: 'button',
            ...options
        };
        this.element = null;
    }

    /**
     * Render button HTML element
     * @returns {HTMLButtonElement}
     */
    render() {
        if (typeof document === 'undefined') return null;
        
        const btn = document.createElement('button');
        btn.type = this.options.type;
        
        // Classes
        const classes = ['btn'];
        if (this.options.variant) classes.push(`btn--${this.options.variant}`);
        if (this.options.size && this.options.size !== 'md') classes.push(`btn--${this.options.size}`);
        if (this.options.block) classes.push('btn--block');
        if (this.options.className) classes.push(this.options.className);
        
        btn.className = classes.join(' ');
        if (this.options.id) btn.id = this.options.id;
        btn.disabled = !!this.options.disabled;
        
        this.updateContent(btn);
        
        if (typeof this.options.onClick === 'function') {
            btn.addEventListener('click', (e) => this.options.onClick(e, this));
        }
        
        this.element = btn;
        return btn;
    }

    /**
     * Set loading state
     * @param {boolean} loading
     * @param {string} [loadingText]
     */
    setLoading(loading, loadingText = null) {
        if (!this.element) return;
        this.element.disabled = !!loading;
        if (loading) {
            this.element.innerHTML = `<span class="spinner spinner--sm"></span> <span>${loadingText || this.options.text}</span>`;
        } else {
            this.updateContent(this.element);
        }
    }

    /**
     * Update internal content
     * @private
     */
    updateContent(btn) {
        let content = '';
        if (this.options.icon) {
            content += `<span class="btn__icon">${this.options.icon}</span> `;
        }
        content += `<span>${this.options.text}</span>`;
        btn.innerHTML = content;
    }

    /**
     * Static helper to create and mount a button
     */
    static create(options, targetContainer = null) {
        const btnInstance = new Button(options);
        const el = btnInstance.render();
        if (targetContainer && el) {
            targetContainer.appendChild(el);
        }
        return btnInstance;
    }
}

if (typeof window !== 'undefined') {
    window.Button = Button;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Button;
    module.exports.Button = Button;
}

export default Button;
