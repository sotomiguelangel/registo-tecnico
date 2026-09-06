// ============================================
// Form Component (BEM)
// ============================================

export class Form {
    /**
     * @param {object} options
     * @param {string} [options.id='']
     * @param {Array<object>} [options.fields=[]]
     * @param {Function} [options.onSubmit]
     */
    constructor(options = {}) {
        this.id = options.id || '';
        this.fields = options.fields || [];
        this.onSubmit = options.onSubmit || null;
        this.element = null;
        this.fieldElements = {};
        this.errorElements = {};
    }

    /**
     * Render form
     * @returns {HTMLFormElement}
     */
    render() {
        if (typeof document === 'undefined') return null;

        const form = document.createElement('form');
        if (this.id) form.id = this.id;
        form.noValidate = true;

        this.fields.forEach(field => {
            const group = document.createElement('div');
            group.className = 'form-group';
            if (field.groupClass) group.className += ` ${field.groupClass}`;

            // Label
            if (field.label) {
                const label = document.createElement('label');
                label.className = `form-label ${field.required ? 'form-label__required' : ''}`;
                label.htmlFor = field.id || field.name;
                label.textContent = field.label;
                group.appendChild(label);
            }

            // Input / Select / Textarea / Checkbox
            let input;
            if (field.type === 'select') {
                input = document.createElement('select');
                input.className = 'form-input form-select';
                (field.options || []).forEach(opt => {
                    const option = document.createElement('option');
                    option.value = typeof opt === 'object' ? opt.value : opt;
                    option.textContent = typeof opt === 'object' ? opt.label : opt;
                    if (field.value === option.value) option.selected = true;
                    input.appendChild(option);
                });
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.className = 'form-input';
                input.rows = field.rows || 3;
                if (field.value) input.value = field.value;
            } else if (field.type === 'checkbox') {
                const checkWrap = document.createElement('label');
                checkWrap.className = 'form-check';
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'form-checkbox';
                if (field.checked) input.checked = true;
                const span = document.createElement('span');
                span.className = 'form-check__label';
                span.textContent = field.checkLabel || field.label || '';
                checkWrap.appendChild(input);
                checkWrap.appendChild(span);
                group.appendChild(checkWrap);
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
                input.className = 'form-input';
                if (field.placeholder) input.placeholder = field.placeholder;
                if (field.value !== undefined) input.value = field.value;
                if (field.step) input.step = field.step;
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
            }

            if (field.name) input.name = field.name;
            if (field.id) input.id = field.id;
            if (field.disabled) input.disabled = true;

            if (field.type !== 'checkbox') {
                group.appendChild(input);
            }

            // Error display span
            const errorSpan = document.createElement('div');
            errorSpan.className = 'form-error';
            errorSpan.style.display = 'none';
            group.appendChild(errorSpan);

            this.fieldElements[field.name || field.id] = input;
            this.errorElements[field.name || field.id] = errorSpan;

            form.appendChild(group);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof this.onSubmit === 'function') {
                const values = this.getValues();
                this.onSubmit(values, e, this);
            }
        });

        this.element = form;
        return form;
    }

    /**
     * Get serialized form values
     * @returns {object}
     */
    getValues() {
        const values = {};
        for (const [name, el] of Object.entries(this.fieldElements)) {
            if (el.type === 'checkbox') {
                values[name] = el.checked;
            } else if (el.type === 'number') {
                values[name] = el.value === '' ? null : Number(el.value);
            } else {
                values[name] = el.value;
            }
        }
        return values;
    }

    /**
     * Set field error message
     */
    setError(fieldName, message) {
        const input = this.fieldElements[fieldName];
        const err = this.errorElements[fieldName];
        if (input && err) {
            if (message) {
                input.classList.add('form-input--error');
                err.textContent = message;
                err.style.display = 'block';
            } else {
                input.classList.remove('form-input--error');
                err.textContent = '';
                err.style.display = 'none';
            }
        }
    }

    /**
     * Clear all field errors
     */
    clearErrors() {
        for (const name of Object.keys(this.fieldElements)) {
            this.setError(name, null);
        }
    }

    /**
     * Reset form values
     */
    reset() {
        if (this.element) {
            this.element.reset();
            this.clearErrors();
        }
    }
}

if (typeof window !== 'undefined') {
    window.Form = Form;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Form;
    module.exports.Form = Form;
}

export default Form;
