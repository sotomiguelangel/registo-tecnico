// ============================================
// Hook: useDebounce
// ============================================

/**
 * Creates a debounced function that delays invoking func until after wait ms
 * @param {Function} func
 * @param {number} wait
 * @returns {Function & {cancel: Function}}
 */
export function useDebounce(func, wait = 300) {
    let timeout = null;

    function debounced(...args) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func.apply(this, args);
            timeout = null;
        }, wait);
    }

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
}

export default useDebounce;

if (typeof window !== 'undefined') {
    window.useDebounce = useDebounce;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = useDebounce;
    module.exports.useDebounce = useDebounce;
}
