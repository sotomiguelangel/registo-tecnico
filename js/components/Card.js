// ============================================
// Card Component (BEM)
// ============================================

export class Card {
    /**
     * @param {object} options
     * @param {string} [options.title='']
     * @param {string} [options.badge='']
     * @param {string} [options.badgeClass='']
     * @param {string} [options.content='']
     * @param {string} [options.variant=''] elevated, bordered, interactive, success, warning, danger
     * @param {string} [options.className='']
     * @param {string} [options.id='']
     * @param {Function} [options.onClick]
     */
    constructor(options = {}) {
        this.options = {
            title: '',
            badge: '',
            badgeClass: '',
            content: '',
            variant: '',
            className: '',
            id: '',
            ...options
        };
        this.element = null;
    }

    render() {
        if (typeof document === 'undefined') return null;

        const card = document.createElement('div');
        const classes = ['card'];
        if (this.options.variant) classes.push(`card--${this.options.variant}`);
        if (this.options.className) classes.push(this.options.className);
        card.className = classes.join(' ');
        if (this.options.id) card.id = this.options.id;

        let html = '';
        if (this.options.title || this.options.badge) {
            html += `<div class="card__header">`;
            if (this.options.title) {
                html += `<span class="card__title">${this.options.title}</span>`;
            }
            if (this.options.badge) {
                html += `<span class="card__badge ${this.options.badgeClass}">${this.options.badge}</span>`;
            }
            html += `</div>`;
        }

        if (this.options.content) {
            html += `<div class="card__body">${this.options.content}</div>`;
        }

        card.innerHTML = html;

        if (typeof this.options.onClick === 'function') {
            card.classList.add('card--interactive');
            card.addEventListener('click', (e) => this.options.onClick(e, this));
        }

        this.element = card;
        return card;
    }

    /**
     * Static factory for metric / Status Card
     */
    static createStatusCard({ label, value, meta = '', status = 'neutral', icon = '', id = '' }) {
        if (typeof document === 'undefined') return null;
        const div = document.createElement('div');
        div.className = `status-card status-card--${status} ${icon ? 'status-card--icon' : ''}`;
        if (id) div.id = id;

        if (icon) {
            div.innerHTML = `
                <div class="status-card__icon">${icon}</div>
                <div style="flex:1;">
                    <div class="status-card__label">${label}</div>
                    <div class="status-card__value">${value}</div>
                    ${meta ? `<div class="status-card__meta">${meta}</div>` : ''}
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="status-card__header">
                    <span class="status-card__label">${label}</span>
                </div>
                <div class="status-card__value">${value}</div>
                ${meta ? `<div class="status-card__meta">${meta}</div>` : ''}
            `;
        }
        return div;
    }
}

if (typeof window !== 'undefined') {
    window.Card = Card;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Card;
    module.exports.Card = Card;
}

export default Card;
