// ============================================
// DOM Utilities
// ============================================

/**
 * Query selector helper
 * @param {string} selector
 * @param {Element|Document} [context=document]
 * @returns {Element|null}
 */
export function $(selector, context = typeof document !== 'undefined' ? document : null) {
    if (!context) return null;
    return context.querySelector(selector);
}

/**
 * Query selector all helper, returns Array
 * @param {string} selector
 * @param {Element|Document} [context=document]
 * @returns {Element[]}
 */
export function $$(selector, context = typeof document !== 'undefined' ? document : null) {
    if (!context) return [];
    return Array.from(context.querySelectorAll(selector));
}

/**
 * Safe element creator
 * @param {string} tag
 * @param {object} options
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
    if (typeof document === 'undefined') return null;
    const el = document.createElement(tag);
    
    if (options.className) el.className = options.className;
    if (options.id) el.id = options.id;
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    
    if (options.attributes) {
        for (const [k, v] of Object.entries(options.attributes)) {
            if (v !== null && v !== undefined) el.setAttribute(k, v);
        }
    }
    
    if (options.events) {
        for (const [event, handler] of Object.entries(options.events)) {
            el.addEventListener(event, handler);
        }
    }
    
    if (options.children) {
        options.children.forEach(child => {
            if (child) el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
    }
    
    return el;
}

/**
 * Show element
 * @param {HTMLElement|string} el
 * @param {string} display
 */
export function show(el, display = 'block') {
    const target = typeof el === 'string' ? $(el) : el;
    if (target) target.style.display = display;
}

/**
 * Hide element
 * @param {HTMLElement|string} el
 */
export function hide(el) {
    const target = typeof el === 'string' ? $(el) : el;
    if (target) target.style.display = 'none';
}

/**
 * Toggle class
 * @param {HTMLElement|string} el
 * @param {string} className
 * @param {boolean} [force]
 */
export function toggleClass(el, className, force) {
    const target = typeof el === 'string' ? $(el) : el;
    if (target) target.classList.toggle(className, force);
}

const DOM = {
    $,
    $$,
    createElement,
    show,
    hide,
    toggleClass
};

if (typeof window !== 'undefined') {
    window.DOM = DOM;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOM;
    module.exports.$ = $;
    module.exports.$$ = $$;
    module.exports.createElement = createElement;
    module.exports.show = show;
    module.exports.hide = hide;
    module.exports.toggleClass = toggleClass;
}

export default DOM;
