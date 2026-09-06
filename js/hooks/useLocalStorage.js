// ============================================
// Hook: useLocalStorage
// ============================================

export function useLocalStorage(key, initialValue = null) {
    function getValue() {
        if (typeof localStorage === 'undefined') return initialValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    }

    function setValue(value) {
        if (typeof localStorage === 'undefined') return;
        try {
            const valToStore = value instanceof Function ? value(getValue()) : value;
            if (valToStore === null || valToStore === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(valToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }

    function remove() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
        }
    }

    return [getValue, setValue, remove];
}

export default useLocalStorage;

if (typeof window !== 'undefined') {
    window.useLocalStorage = useLocalStorage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = useLocalStorage;
    module.exports.useLocalStorage = useLocalStorage;
}
