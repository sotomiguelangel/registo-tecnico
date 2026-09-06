// ============================================
// Cryptographic & Token Utilities
// ============================================

/**
 * Generates a random UUID v4
 * @returns {string}
 */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Generates a secure random session token
 * @param {number} length
 * @returns {string}
 */
export function generateToken(length = 32) {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }
    let res = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
}

/**
 * Computes SHA-256 hash string of text
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function sha256(text) {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Simple deterministic string hash fallback
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}

const CryptoUtils = {
    generateUUID,
    generateToken,
    sha256
};

if (typeof window !== 'undefined') {
    window.CryptoUtils = CryptoUtils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoUtils;
    module.exports.generateUUID = generateUUID;
    module.exports.generateToken = generateToken;
    module.exports.sha256 = sha256;
}

export default CryptoUtils;
