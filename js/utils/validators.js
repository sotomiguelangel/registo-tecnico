// ============================================
// Validators - Input validation utilities
// ============================================

const Validators = {
    /**
     * Validate temperature reading based on equipment type
     */
    temperatura: (value, equipamento = {}) => {
        const num = parseFloat(String(value).replace(',', '.'));
        
        if (isNaN(num)) {
            return { valid: false, message: 'Temperatura inválida' };
        }
        
        const min = parseFloat(equipamento.min);
        const max = parseFloat(equipamento.max);
        const tipo = String(equipamento.tipo || '').toLowerCase();
        
        // Check for negative values in freezers
        const isFreezer = tipo.includes('congelador');
        if (isFreezer && num >= 0) {
            return { valid: false, message: 'Congeladores devem ter temperatura negativa' };
        }
        
        // Check for positive values in refrigerators
        const isFridge = tipo.includes('frigorífico') && !tipo.includes('congelador');
        if (isFridge && num < 0) {
            return { valid: false, message: 'Frigoríficos devem ter temperatura positiva' };
        }
        
        // Check range if specified
        if (!isNaN(min) && !isNaN(max)) {
            const outlierThreshold = (max - min) * 2;
            if (num < min - outlierThreshold || num > max + outlierThreshold) {
                return { valid: false, message: `Valor muito diferente do intervalo esperado (${min} a ${max}°C)` };
            }
        }
        
        return { valid: true };
    },
    
    /**
     * Validate pH value
     */
    ph: (value, min = 7.0, max = 7.8) => {
        const num = parseFloat(String(value).replace(',', '.'));
        
        if (isNaN(num)) {
            return { valid: false, message: 'pH inválido' };
        }
        
        if (num < 0 || num > 14) {
            return { valid: false, message: 'pH deve estar entre 0 e 14' };
        }
        
        if (num < min || num > max) {
            return { valid: false, message: `pH deve estar entre ${min} e ${max}` };
        }
        
        // Warning for values close to limits
        const warning = num < min + 0.3 || num > max - 0.3;
        
        return { valid: true, warning };
    },
    
    /**
     * Validate chlorine value (free or total)
     */
    cloro: (value, min = 0.5, max = 3.0) => {
        const num = parseFloat(String(value).replace(',', '.'));
        
        if (isNaN(num)) {
            return { valid: false, message: 'Cloro inválido' };
        }
        
        if (num < 0 || num > 10) {
            return { valid: false, message: 'Cloro deve estar entre 0 e 10 ppm' };
        }
        
        if (num < min || num > max) {
            return { valid: false, message: `Cloro deve estar entre ${min} e ${max} ppm` };
        }
        
        const warning = num < min + 0.2 || num > max - 0.2;
        
        return { valid: true, warning };
    },
    
    /**
     * Validate total chlorine (usually higher limit)
     */
    cloroTotal: (value, max = 5.0) => {
        const num = parseFloat(String(value).replace(',', '.'));
        
        if (isNaN(num)) {
            return { valid: false, message: 'Cloro total inválido' };
        }
        
        if (num < 0 || num > 10) {
            return { valid: false, message: 'Cloro total deve estar entre 0 e 10 ppm' };
        }
        
        if (num > max) {
            return { valid: false, message: `Cloro total não deve exceder ${max} ppm` };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate water temperature (AQS)
     */
    aqs: (value, min = 45) => {
        const num = parseFloat(String(value).replace(',', '.'));
        
        if (isNaN(num)) {
            return { valid: false, message: 'Temperatura AQS inválida' };
        }
        
        if (num < 0 || num > 100) {
            return { valid: false, message: 'Temperatura deve estar entre 0 e 100°C' };
        }
        
        if (num < min) {
            return { valid: false, message: `AQS deve ser pelo menos ${min}°C para prevenção de Legionella` };
        }
        
        const warning = num < min + 5;
        
        return { valid: true, warning };
    },
    
    /**
     * Validate Date in YYYY-MM-DD format
     */
    date: (value) => {
        if (!value || typeof value !== 'string') {
            return { valid: false, message: 'Data obrigatória' };
        }
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(value)) {
            return { valid: false, message: 'Formato de data inválido (AAAA-MM-DD)' };
        }
        const d = new Date(value + 'T00:00:00');
        if (isNaN(d.getTime())) {
            return { valid: false, message: 'Data inválida no calendário' };
        }
        return { valid: true };
    },

    /**
     * Validate Time in HH:mm format
     */
    time: (value) => {
        if (!value || typeof value !== 'string') {
            return { valid: false, message: 'Hora obrigatória' };
        }
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!regex.test(value)) {
            return { valid: false, message: 'Formato de hora inválido (HH:mm)' };
        }
        return { valid: true };
    },

    /**
     * Validate room number (e.g. 101, 204, 312, etc.)
     */
    quarto: (value) => {
        const s = String(value || '').trim();
        if (!s) return { valid: false, message: 'Número de quarto obrigatório' };
        if (!/^[0-4]\d{2}$/.test(s)) {
            return { valid: false, message: 'Número de quarto inválido (deve ser de 3 dígitos com piso 0 a 4)' };
        }
        return { valid: true };
    },

    /**
     * Validate user PIN (4-6 digits)
     */
    pin: (value) => {
        const s = String(value || '').trim();
        if (!s) return { valid: false, message: 'PIN obrigatório' };
        if (!/^\d{4,6}$/.test(s)) {
            return { valid: false, message: 'O PIN deve ter entre 4 e 6 dígitos' };
        }
        return { valid: true };
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validators;
}
