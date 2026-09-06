// ============================================
// Formatting Utilities
// ============================================

/**
 * Formats a number with specific decimals and locale
 * @param {any} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(String(value).replace(',', '.'));
    if (isNaN(num)) return String(value);
    return num.toLocaleString('pt-PT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formats temperature with °C unit
 * @param {any} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatTemperature(value, decimals = 1) {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(String(value).replace(',', '.'));
    if (isNaN(num)) return `${value} °C`;
    return `${formatNumber(num, decimals)} °C`;
}

/**
 * Formats pH value
 * @param {any} value
 * @returns {string}
 */
export function formatPh(value) {
    return formatNumber(value, 2);
}

/**
 * Formats Chlorine value in ppm
 * @param {any} value
 * @returns {string}
 */
export function formatChlorine(value) {
    if (value === null || value === undefined || value === '') return '—';
    return `${formatNumber(value, 2)} ppm`;
}

/**
 * Formats currency (EUR by default)
 * @param {any} value
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(value, currency = 'EUR') {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(String(value).replace(',', '.'));
    if (isNaN(num)) return String(value);
    return num.toLocaleString('pt-PT', {
        style: 'currency',
        currency
    });
}

/**
 * Formats file size bytes
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const Formatting = {
    formatNumber,
    formatTemperature,
    formatPh,
    formatChlorine,
    formatCurrency,
    formatBytes
};

if (typeof window !== 'undefined') {
    window.Formatting = Formatting;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatting;
    module.exports.formatNumber = formatNumber;
    module.exports.formatTemperature = formatTemperature;
    module.exports.formatPh = formatPh;
    module.exports.formatChlorine = formatChlorine;
    module.exports.formatCurrency = formatCurrency;
    module.exports.formatBytes = formatBytes;
}

export default Formatting;
