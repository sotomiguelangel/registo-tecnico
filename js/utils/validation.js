// ============================================
// Validation Utilities
// ============================================

/**
 * Validates that a required field is not empty, null or undefined
 * @param {any} value
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(value) {
    if (value === null || value === undefined) {
        return 'Campo obligatorio';
    }
    if (typeof value === 'string' && value.trim() === '') {
        return 'Campo obligatorio';
    }
    return null;
}

/**
 * Validates ISO date format (YYYY-MM-DD) and existence
 * @param {string} value
 * @returns {string|null} Error message or null if valid
 */
export function validateDate(value) {
    if (!value || typeof value !== 'string') {
        return 'Formato inválido';
    }
    
    // Strict regex for YYYY-MM-DD
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(value)) {
        return 'Formato inválido';
    }
    
    const [year, month, day] = value.split('-').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return 'Formato inválido';
    }
    
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return 'Formato inválido';
    }
    
    return null;
}

/**
 * Validates a number and optional range
 * @param {any} value
 * @param {number|object} [minOrOptions]
 * @param {number} [max]
 * @returns {string|null} Error message or null if valid
 */
export function validateNumber(value, minOrOptions = null, max = null) {
    if (value === null || value === undefined || value === '') {
        return 'Número inválido';
    }
    
    const normalized = String(value).replace(',', '.').trim();
    const num = Number(normalized);
    
    if (isNaN(num)) {
        return 'Número inválido';
    }
    
    let minLimit = null;
    let maxLimit = null;
    
    if (typeof minOrOptions === 'object' && minOrOptions !== null) {
        minLimit = minOrOptions.min !== undefined ? minOrOptions.min : null;
        maxLimit = minOrOptions.max !== undefined ? minOrOptions.max : null;
    } else {
        minLimit = minOrOptions;
        maxLimit = max;
    }
    
    if (minLimit !== null && num < minLimit) {
        return `O valor não pode ser inferior a ${minLimit}`;
    }
    if (maxLimit !== null && num > maxLimit) {
        return `O valor não pode ser superior a ${maxLimit}`;
    }
    
    return null;
}

/**
 * Validates pH within legal/target limits
 * @param {any} value
 * @param {number} min
 * @param {number} max
 * @returns {{valid: boolean, message: string|null}}
 */
export function validatePh(value, min = 7.0, max = 7.8) {
    const err = validateNumber(value, 0, 14);
    if (err) return { valid: false, message: 'pH inválido (0-14)' };
    const n = Number(String(value).replace(',', '.'));
    if (n < min || n > max) {
        return { valid: false, message: `pH fora do intervalo recomendado (${min} - ${max})` };
    }
    return { valid: true, message: null };
}

/**
 * Validates Chlorine within legal/target limits
 * @param {any} value
 * @param {number} min
 * @param {number} max
 * @returns {{valid: boolean, message: string|null}}
 */
export function validateChlorine(value, min = 0.5, max = 3.0) {
    const err = validateNumber(value, 0, 10);
    if (err) return { valid: false, message: 'Cloro inválido (0-10)' };
    const n = Number(String(value).replace(',', '.'));
    if (n < min || n > max) {
        return { valid: false, message: `Cloro fora do intervalo (${min} - ${max} ppm)` };
    }
    return { valid: true, message: null };
}

const Validation = {
    validateRequired,
    validateDate,
    validateNumber,
    validatePh,
    validateChlorine
};

if (typeof window !== 'undefined') {
    window.Validation = Validation;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validation;
    module.exports.validateRequired = validateRequired;
    module.exports.validateDate = validateDate;
    module.exports.validateNumber = validateNumber;
    module.exports.validatePh = validatePh;
    module.exports.validateChlorine = validateChlorine;
}

export default Validation;
