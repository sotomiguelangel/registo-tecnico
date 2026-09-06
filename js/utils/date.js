// ============================================
// Date Utilities
// ============================================

/**
 * Returns today's date in YYYY-MM-DD format
 * @returns {string}
 */
export function getTodayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Formats date into European standard (DD/MM/YYYY)
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
    if (!dateInput) return '—';
    const d = typeof dateInput === 'string' && dateInput.includes('T') ? new Date(dateInput) : new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    
    // If input is YYYY-MM-DD string, avoid timezone shifts
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [y, m, day] = dateInput.split('-');
        return `${day}/${m}/${y}`;
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formats time (HH:MM)
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatTime(dateInput) {
    if (!dateInput) return '--:--';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '--:--';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Formats date and time
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
    if (!dateInput) return '—';
    return `${formatDate(dateInput)} ${formatTime(dateInput)}`;
}

/**
 * Checks if string is a valid ISO date YYYY-MM-DD
 * @param {string} str
 * @returns {boolean}
 */
export function isValidISODate(str) {
    if (!str || typeof str !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const [y, m, d] = str.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/**
 * Formats relative time (e.g., 'há 5 min', 'ontem')
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatRelativeDate(dateInput) {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 45) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHour < 24) return `há ${diffHour} h`;
    if (diffDay === 1) return 'ontem';
    if (diffDay < 7) return `há ${diffDay} dias`;
    return formatDate(d);
}

const DateUtils = {
    getTodayISO,
    formatDate,
    formatTime,
    formatDateTime,
    isValidISODate,
    formatRelativeDate
};

if (typeof window !== 'undefined') {
    window.DateUtils = DateUtils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateUtils;
    module.exports.getTodayISO = getTodayISO;
    module.exports.formatDate = formatDate;
    module.exports.formatTime = formatTime;
    module.exports.formatDateTime = formatDateTime;
    module.exports.isValidISODate = isValidISODate;
    module.exports.formatRelativeDate = formatRelativeDate;
}

export default DateUtils;
