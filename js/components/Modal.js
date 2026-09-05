// ============================================
// Modal - Reusable modal dialog
// ============================================

class Modal {
    constructor(containerId = 'modalContainer') {
        this.container = typeof document !== 'undefined' ? document.getElementById(containerId) : null;
        this.overlay = null;
        this.box = null;
        this.resolvePromise = null;
        
        if (!this.container && typeof document !== 'undefined') {
            this.createContainer();
        }
        
        if (typeof document !== 'undefined') {
            this.bindEvents();
        }
    }
    
    /**
     * Create modal container and elements
     */
    createContainer() {
        if (typeof document === 'undefined') return;
        this.container = document.createElement('div');
        this.container.id = 'modalContainer';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        
        this.box = document.createElement('div');
        this.box.className = 'modal-box';
        
        this.overlay.appendChild(this.box);
        this.container.appendChild(this.overlay);
        
        // Create default structure
        this.box.innerHTML = `
            <p class="modal-title" id="modalTitle"></p>
            <div class="modal-msg" id="modalMsg"></div>
            <textarea class="modal-textarea" id="modalTextarea" style="display:none"></textarea>
            <div id="modalFormContainer"></div>
            <div class="modal-actions" id="modalActions"></div>
        `;
    }
    
    /**
     * Bind global events
     */
    bindEvents() {
        if (!this.overlay) return;
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close(null);
            }
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close(null);
            }
        });
    }
    
    /**
     * Check if modal is open
     */
    isOpen() {
        return this.container && this.container.style.display !== 'none';
    }
    
    /**
     * Show confirm dialog
     */
    confirm(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
        return this.show({
            title,
            message,
            buttons: [
                { text: cancelText, action: 'cancel', className: 'modal-btn-cancel' },
                { text: confirmText, action: 'confirm', className: 'modal-btn-confirm' }
            ]
        });
    }
    
    /**
     * Show alert dialog
     */
    alert(title, message, buttonText = 'Fechar') {
        return this.show({
            title,
            message,
            buttons: [
                { text: buttonText, action: 'close', className: 'modal-btn-confirm' }
            ]
        });
    }
    
    /**
     * Show prompt dialog
     */
    prompt(title, message, defaultValue = '') {
        return this.show({
            title,
            message,
            inputs: [
                { id: 'promptInput', label: '', value: defaultValue, type: 'text' }
            ],
            buttons: [
                { text: 'Cancelar', action: 'cancel', className: 'modal-btn-cancel' },
                { text: 'Guardar', action: 'confirm', className: 'modal-btn-confirm' }
            ]
        });
    }
    
    /**
     * Show custom modal
     */
    show(options) {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
            
            const {
                title = '',
                message = '',
                messageHtml = '',
                wide = false,
                inputs = [],
                buttons = []
            } = options;
            
            if (!this.container) this.createContainer();

            // Set title
            const titleEl = document.getElementById('modalTitle');
            if (titleEl) titleEl.textContent = title;
            
            // Set message
            const msgEl = document.getElementById('modalMsg');
            if (msgEl) {
                if (messageHtml) {
                    msgEl.innerHTML = messageHtml;
                } else {
                    msgEl.textContent = message;
                }
            }
            
            // Toggle wide
            if (this.box) {
                this.box.classList.toggle('modal-wide', wide);
            }
            
            // Set textarea (hidden by default)
            const textarea = document.getElementById('modalTextarea');
            if (textarea) textarea.style.display = 'none';
            
            // Set form inputs
            const formContainer = document.getElementById('modalFormContainer');
            if (formContainer) {
                if (inputs.length > 0) {
                    formContainer.innerHTML = inputs.map(input => `
                        <label class="field" style="margin-bottom:12px">
                            <span class="lbl">${input.label || ''}</span>
                            <input 
                                type="${input.type || 'text'}" 
                                id="modal_${input.id}" 
                                value="${input.value || ''}"
                                placeholder="${input.placeholder || ''}"
                                inputmode="${input.inputmode || ''}"
                            >
                        </label>
                    `).join('');
                } else {
                    formContainer.innerHTML = '';
                }
            }
            
            // Set buttons
            const actionsEl = document.getElementById('modalActions');
            if (actionsEl) {
                actionsEl.innerHTML = buttons.map(btn => `
                    <button 
                        type="button" 
                        class="${btn.className || ''}"
                        data-action="${btn.action}"
                    >
                        ${btn.text}
                    </button>
                `).join('');
                
                // Bind button events
                actionsEl.querySelectorAll('button').forEach(button => {
                    button.addEventListener('click', () => {
                        const action = button.dataset.action;
                        
                        if (action === 'confirm' && inputs.length > 0) {
                            // Collect input values
                            const values = {};
                            inputs.forEach(input => {
                                const el = document.getElementById(`modal_${input.id}`);
                                values[input.id] = el ? el.value.trim() : '';
                            });
                            this.close(values);
                        } else if (action === 'confirm' && textarea && textarea.style.display !== 'none') {
                            this.close(textarea.value);
                        } else if (action === 'confirm') {
                            this.close(true);
                        } else {
                            this.close(null);
                        }
                    });
                });
            }
            
            // Show modal
            if (this.container) this.container.style.display = 'flex';
            if (this.overlay) this.overlay.classList.add('show');
            
            // Focus first input if exists
            if (formContainer) {
                const firstInput = formContainer.querySelector('input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 50);
                }
            }
        });
    }
    
    /**
     * Close modal
     */
    close(result = null) {
        if (this.overlay) this.overlay.classList.remove('show');
        
        setTimeout(() => {
            if (this.container) this.container.style.display = 'none';
            
            // Clear content
            if (this.resolvePromise) {
                this.resolvePromise(result);
                this.resolvePromise = null;
            }
        }, 200);
    }
    
    /**
     * Show form dialog
     */
    formDialog(title, fields, confirmLabel = 'Guardar') {
        return this.show({
            title,
            inputs: fields,
            buttons: [
                { text: 'Cancelar', action: 'cancel', className: 'modal-btn-cancel' },
                { text: confirmLabel, action: 'confirm', className: 'modal-btn-confirm' }
            ]
        });
    }
}

// Export singleton instance
const modal = new Modal();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = modal;
}
