// ============================================
// Constants - Application-wide constants and thresholds
// ============================================

const CONSTANTS = {
    // Date/Time formats
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',
    
    // Portuguese month names
    MONTHS: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    
    // Portuguese day names
    DAYS: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    DAYS_SHORT: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    
    // Record types
    RECORD_TYPES: {
        GENERAL: 'general',
        QUARTO: 'quarto',
        TEMPERATURA: 'temperatura'
    },
    
    // User roles
    ROLES: {
        ADMIN: 'admin',
        TECNICO: 'tecnico',
        VISUALIZADOR: 'visualizador'
    },
    
    // Equipment types
    EQUIPMENT_TYPES: {
        FRIDGE: 'Frigorífico',
        FREEZER: 'Congelador',
        VINHEIRA: 'Vinheira',
        GARRAFEIRA: 'Garrafeira',
        ADEGA: 'Adega',
        CAVE: 'Cave'
    },
    
    // Validation thresholds (DGS/HACCP)
    THRESHOLDS: {
        // Geral / Piscina
        PH_MIN: 7.0,
        PH_MAX: 7.8,
        CLORO_MIN: 0.5,
        CLORO_MAX: 3.0,
        CLORO_TOTAL_MAX: 5.0,
        
        // AQS (Legionella prevention)
        AQS_MIN: 45,
        AQS_QUARTOS_MIN: 45,
        
        // Quartos - Água Quente
        PH_CAL_MIN: 7.0,
        PH_CAL_MAX: 7.8,
        CLORO_CAL_MIN: 0.5,
        CLORO_CAL_MAX: 3.0,
        CLORO_TOTAL_CAL_MAX: 5.0,
        
        // Quartos - Água Fria
        PH_FRIA_MIN: 7.0,
        PH_FRIA_MAX: 7.8,
        CLORO_FRIA_MIN: 0.5,
        CLORO_FRIA_MAX: 3.0,
        CLORO_TOTAL_FRIA_MAX: 5.0
    },
    
    // Storage keys
    STORAGE_KEYS: {
        TOKEN: 'bitacora_token',
        USER: 'bitacora_user',
        SYNC_QUEUE: 'bitacora_sync_queue',
        DATA_STORE: 'bitacora_store',
        FECHOS_MENSAIS: 'bitacora_fechos_mensais',
        ROOMS: 'bitacora_rooms',
        CYCLE_DONE: 'bitacora_cicloQuartosHechos'
    },
    
    // API actions
    API_ACTIONS: {
        LOGIN: 'login',
        LIST: 'list',
        SAVE: 'save',
        SAVE_BATCH: 'saveBatch',
        UPDATE: 'update',
        DELETE: 'delete',
        GET_CONFIG: 'getConfig',
        SET_CONFIG: 'setConfig',
        LIST_EQUIPAMENTOS: 'listEquipamentos',
        SAVE_EQUIPAMENTO: 'saveEquipamento',
        DELETE_EQUIPAMENTO: 'deleteEquipamento',
        LIST_USERS: 'listUsers',
        CREATE_USER: 'createUser',
        DELETE_USER: 'deleteUser',
        TOGGLE_USER_ACTIVE: 'toggleUserActive',
        ADMIN_SET_PIN: 'adminSetPin',
        CHANGE_OWN_PIN: 'changeOwnPin',
        SEED_STATUS: 'seedStatus',
        BOOTSTRAP: 'bootstrap',
        HEALTH: 'health'
    },
    
    // Default values
    DEFAULTS: {
        ROOMS_COUNT: 40,
        IDLE_TIMEOUT: 15 * 60 * 1000, // 15 minutes
        SYNC_RETRY_DELAYS: [2500, 3750, 5625, 8437, 12656], // Exponential backoff
        MAX_RETRIES: 3
    },
    
    // Chart colors
    COLORS: {
        AQUA: '#22b8b0',
        AQUA_LIGHT: '#4fd4cb',
        PETROL: '#1b5568',
        PETROL_DARK: '#0e3341',
        CORAL: '#e0602b',
        OK: '#3ea472',
        AMBER: '#e0a12b',
        ICE: '#3d8bd4'
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}
