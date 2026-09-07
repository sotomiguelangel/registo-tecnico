// ============================================
// Constants - Application-wide constants
// ============================================

const CONSTANTS = Object.freeze({
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',

  MONTHS: Object.freeze([
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ]),

  DAYS: Object.freeze([
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
  ]),

  DAYS_SHORT: Object.freeze([
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb'
  ]),

  RECORD_TYPES: Object.freeze({
    GENERAL: 'general',
    QUARTO: 'quarto',
    TEMPERATURA: 'temperatura',
    TICKET: 'ticket'
  }),

  ROLES: Object.freeze({
    ADMIN: 'admin',
    TECNICO: 'tecnico',
    VISUALIZADOR: 'visualizador'
  }),

  PERMISSIONS: Object.freeze({
    READ: 'read',
    EDIT: 'edit',
    ADMIN: 'admin',
    DELETE: 'delete',
    CLOSE_TICKET: 'close-ticket'
  }),

  TICKET_STATUS: Object.freeze({
    ABERTO: 'aberto',
    ATRIBUIDO: 'atribuido',
    EM_ANDAMENTO: 'em_andamento',
    PAUSADO: 'pausado',
    AGUARDANDO_MATERIAL: 'aguardando_material',
    RESOLVIDO: 'resolvido',
    FINALIZADO: 'finalizado'
  }),

  TICKET_PRIORITY: Object.freeze({
    BAIXA: 'baixa',
    MEDIA: 'media',
    ALTA: 'alta',
    CRITICA: 'critica'
  }),

  EQUIPMENT_TYPES: Object.freeze({
    FRIDGE: 'Frigorífico',
    FREEZER: 'Congelador',
    VINHEIRA: 'Vinheira',
    GARRAFEIRA: 'Garrafeira',
    ADEGA: 'Adega',
    CAVE: 'Cave'
  }),

  THRESHOLDS: Object.freeze({
    PH_MIN: 7.0,
    PH_MAX: 7.8,
    CLORO_MIN: 0.5,
    CLORO_MAX: 3.0,
    CLORO_TOTAL_MAX: 5.0,

    AQS_MIN: 45,
    AQS_QUARTOS_MIN: 45,

    PH_CAL_MIN: 7.0,
    PH_CAL_MAX: 7.8,
    CLORO_CAL_MIN: 0.5,
    CLORO_CAL_MAX: 3.0,
    CLORO_TOTAL_CAL_MAX: 5.0,

    PH_FRIA_MIN: 7.0,
    PH_FRIA_MAX: 7.8,
    CLORO_FRIA_MIN: 0.5,
    CLORO_FRIA_MAX: 3.0,
    CLORO_TOTAL_FRIA_MAX: 5.0
  }),

  STORAGE_KEYS: Object.freeze({
    TOKEN: 'bitacora_token',
    USER: 'bitacora_user',
    SESSION: 'bitacora_session',
    SYNC_QUEUE: 'bitacora_sync_queue',
    DATA_STORE: 'bitacora_store',
    FECHOS_MENSAIS: 'bitacora_fechos_mensais',
    ROOMS: 'bitacora_rooms',
    CYCLE_DONE: 'bitacora_cicloQuartosHechos'
  }),

  API_ACTIONS: Object.freeze({
    LOGIN: 'login',
    LOGOUT: 'logout',
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
    HEALTH: 'health',

    LIST_TICKETS: 'listTickets',
    SAVE_TICKET: 'saveTicket',
    UPDATE_TICKET: 'updateTicket',
    DELETE_TICKET: 'deleteTicket'
  }),

  DEFAULTS: Object.freeze({
    ROOMS_COUNT: 40,
    IDLE_TIMEOUT: 15 * 60_000,
    SESSION_MAX_AGE: 12 * 60 * 60_000,

    SYNC_RETRY_DELAYS: Object.freeze([
      2500,
      3750,
      5625,
      8437,
      12656
    ]),

    MAX_RETRIES: 3
  }),

  COLORS: Object.freeze({
    AQUA: '#22b8b0',
    AQUA_LIGHT: '#4fd4cb',
    PETROL: '#1b5568',
    PETROL_DARK: '#0e3341',
    CORAL: '#e0602b',
    OK: '#3ea472',
    AMBER: '#e0a12b',
    ICE: '#3d8bd4'
  })
});

// Compatibilidad temporal con los módulos heredados.
if (typeof window !== 'undefined') {
  window.CONSTANTS = CONSTANTS;
}

export { CONSTANTS };
export default CONSTANTS;
