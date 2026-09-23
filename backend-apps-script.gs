/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 1/13 — Núcleo, constantes, campos y utilidades
 *
 * Todos los archivos .gs del proyecto comparten el mismo
 * ámbito global. No duplique estas constantes.
 */

// =========================================================
// VERSÃO DO BACKEND
// =========================================================

var BACKEND_RELEASE = Object.freeze({
  NAME: 'Registo Técnico · Moon and Sun',
  VERSION: '6.0.0',
  BUILD_ID: '2026.03.01',
  CHANNEL: 'Produção',

  MIN_APP_VERSION: '3.3.0',

  SESSION_TTL_MS:
    12 * 60 * 60 * 1000,

  MAX_BATCH_SIZE: 500,
  MAX_AUDIT_DETAIL_LENGTH: 4000,

  CACHE_TTL_SECONDS: 45,
  COLUMNS_CACHE_TTL_SECONDS: 300
});

// =========================================================
// NOMES DAS FOLHAS
// =========================================================

var SHEET_NAMES = Object.freeze({
  GENERAL: 'General',
  QUARTOS: 'Quartos',
  TEMPERATURAS: 'Temperaturas',
  EQUIPAMENTOS: 'Equipamentos',
  TICKETS: 'Tickets',
  USERS: 'Usuarios',
  CONFIG: 'Config',
  AUDIT: 'Auditoria',
  TICKET_MATERIALS: 'TicketMateriais'
});

// =========================================================
// CAMPOS DOS REGISTOS OPERACIONAIS
// Não alterar os labels existentes.
// =========================================================

var GENERAL_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  {
    key: 'marcaTiempo',
    label: 'Marca de Tiempo (servidor)'
  },
  { key: 'usuario', label: 'Usuario' },
  { key: 'agua', label: 'Agua (m3)' },
  {
    key: 'electricidad',
    label: 'Electricidad (kWh)'
  },
  {
    key: 'retornoAqs',
    label: 'Retorno AQS (C)'
  },
  {
    key: 'aqsQuartos',
    label: 'AQS Quartos (C)'
  },
  {
    key: 'estadoPiscina',
    label: 'Estado Piscina'
  },
  {
    key: 'lavadoPrefiltro',
    label: 'Lavado Prefiltro'
  },
  {
    key: 'lavadoFiltroArena',
    label: 'Lavado Filtro Arena'
  },
  {
    key: 'limpiezaSkimmer',
    label: 'Limpieza Skimmer'
  },
  {
    key: 'tempPiscina',
    label: 'Temp Piscina (C)'
  },
  {
    key: 'phPiscina',
    label: 'pH Piscina'
  },
  {
    key: 'cloroLibre',
    label: 'Cloro Libre (ppm)'
  },
  {
    key: 'cloroTotal',
    label: 'Cloro Total (ppm)'
  },
  {
    key: 'observacoes',
    label: 'Observacoes'
  }
];

var QUARTO_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  {
    key: 'marcaTiempo',
    label: 'Marca de Tiempo (servidor)'
  },
  { key: 'usuario', label: 'Usuario' },
  { key: 'numero', label: 'Quarto' },
  {
    key: 'phCaliente',
    label: 'pH Caliente'
  },
  {
    key: 'cloroCaliente',
    label: 'Cloro Caliente'
  },
  {
    key: 'cloroTotalCaliente',
    label: 'Cloro Total Caliente'
  },
  { key: 'phFria', label: 'pH Fria' },
  {
    key: 'cloroFria',
    label: 'Cloro Fria'
  },
  {
    key: 'cloroTotalFria',
    label: 'Cloro Total Fria'
  }
];

var TEMPERATURA_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  {
    key: 'marcaTiempo',
    label: 'Marca de Tiempo (servidor)'
  },
  { key: 'usuario', label: 'Usuario' },
  {
    key: 'equipamentoId',
    label: 'EquipamentoID'
  },
  {
    key: 'nome',
    label: 'Equipamento'
  },
  { key: 'tipo', label: 'Tipo' },
  { key: 'ubicacao', label: 'Ubicacao' },
  {
    key: 'temperatura',
    label: 'Temperatura (C)'
  },
  {
    key: 'temperaturaMin',
    label: 'Temperatura Min (C)'
  },
  {
    key: 'temperaturaMax',
    label: 'Temperatura Max (C)'
  },
  {
    key: 'tipoRegisto',
    label: 'Tipo Registo'
  },
  {
    key: 'dentroIntervalo',
    label: 'Dentro do Intervalo'
  },
  {
    key: 'observacoes',
    label: 'Observacoes'
  }
];

var EQUIPAMENTO_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'ubicacao', label: 'Ubicacao' },
  { key: 'min', label: 'Min (C)' },
  { key: 'max', label: 'Max (C)' },
  { key: 'ativo', label: 'Ativo' }
];

var USER_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'pin', label: 'PIN' },
  { key: 'rol', label: 'Rol' },
  { key: 'activo', label: 'Activo' },
  {
    key: 'verSessao',
    label: 'Ver Sessao'
  },
  {
    key: 'deveAlterarPin',
    label: 'Deve Alterar PIN'
  },
  {
    key: 'ultimoLogin',
    label: 'Ultimo Login'
  }
];

// =========================================================
// TICKETS — MODELO NOVO E RETROCOMPATÍVEL
// Os labels antigos foram mantidos.
// =========================================================

var TICKET_FIELDS = [
  // Identificação
  { key: 'id', label: 'ID' },
  {
    key: 'numeroTicket',
    label: 'Numero Ticket'
  },
  {
    key: 'versao',
    label: 'Versao'
  },

  // Local e ativo
  { key: 'quarto', label: 'Quarto' },
  {
    key: 'ativoId',
    label: 'Ativo ID'
  },
  {
    key: 'ativoNome',
    label: 'Ativo Nome'
  },

  // Classificação
  {
    key: 'situacao',
    label: 'Situação'
  },
  {
    key: 'prioridade',
    label: 'Prioridade'
  },
  {
    key: 'tipoManutencao',
    label: 'Tipo Manutencao'
  },
  {
    key: 'categoria',
    label: 'Categoria'
  },

  // Abertura
  {
    key: 'colaborador',
    label: 'Colaborador'
  },
  {
    key: 'criadoPorId',
    label: 'Criado Por ID'
  },
  {
    key: 'dataReporte',
    label: 'Data de Reporte'
  },
  {
    key: 'horaReporte',
    label: 'Hora de Reporte'
  },
  { key: 'turno', label: 'Turno' },
  {
    key: 'semanaISO',
    label: 'Semana ISO'
  },

  // Descrição
  {
    key: 'descricao',
    label: 'Descrição'
  },
  {
    key: 'observacao',
    label: 'Observação'
  },

  // Atribuição
  {
    key: 'responsavelId',
    label: 'Responsavel ID'
  },
  {
    key: 'responsavelNome',
    label: 'Responsavel Nome'
  },
  {
    key: 'atribuidoEm',
    label: 'Atribuido Em'
  },
  {
    key: 'atribuidoPorId',
    label: 'Atribuido Por ID'
  },

  // SLA
  {
    key: 'prazoResposta',
    label: 'Prazo Resposta'
  },
  {
    key: 'prazoResolucao',
    label: 'Prazo Resolucao'
  },
  {
    key: 'respostaEm',
    label: 'Resposta Em'
  },
  {
    key: 'slaRespostaCumprido',
    label: 'SLA Resposta Cumprido'
  },
  {
    key: 'slaResolucaoCumprido',
    label: 'SLA Resolucao Cumprido'
  },

  // Execução
  {
    key: 'iniciadoEm',
    label: 'Iniciado Em'
  },
  {
    key: 'pausadoEm',
    label: 'Pausado Em'
  },
  {
    key: 'motivoPausa',
    label: 'Motivo Pausa'
  },
  {
    key: 'minutosPausa',
    label: 'Minutos Pausa'
  },

  // Diagnóstico e resolução
  {
    key: 'diagnostico',
    label: 'Diagnostico'
  },
  {
    key: 'trabalhoRealizado',
    label: 'Trabalho Realizado'
  },
  {
    key: 'causaRaiz',
    label: 'Causa Raiz'
  },
  {
    key: 'materiais',
    label: 'Materiais JSON'
  },
  {
    key: 'tempoTrabalhoMinutos',
    label: 'Tempo Trabalho Minutos'
  },
  {
    key: 'tempoParagemMinutos',
    label: 'Tempo Paragem Minutos'
  },
  {
    key: 'custoEstimado',
    label: 'Custo Estimado'
  },
  {
    key: 'custoReal',
    label: 'Custo Real'
  },
  {
    key: 'necessitaSeguimento',
    label: 'Necessita Seguimento'
  },
  {
    key: 'dataSeguimento',
    label: 'Data Seguimento'
  },

  // Resolvido y cerrado
  {
    key: 'resolvidoEm',
    label: 'Resolvido Em'
  },
  {
    key: 'resolvidoPorId',
    label: 'Resolvido Por ID'
  },

  // Label antiguo conservado
  {
    key: 'dataFechamento',
    label: 'Data Fechamento'
  },
  {
    key: 'fechadoEm',
    label: 'Fechado Em'
  },
  {
    key: 'fechadoPorId',
    label: 'Fechado Por ID'
  },
  {
    key: 'comentarioCierre',
    label: 'Comentario Cierre'
  },

  // Auditoría del registro
  {
    key: 'criadoEm',
    label: 'Criado Em'
  },
  {
    key: 'atualizadoEm',
    label: 'Atualizado Em'
  },
  {
    key: 'atualizadoPorId',
    label: 'Atualizado Por ID'
  },

  // Borrado lógico
  {
    key: 'arquivado',
    label: 'Arquivado'
  },
  {
    key: 'arquivadoEm',
    label: 'Arquivado Em'
  },
  {
    key: 'arquivadoPorId',
    label: 'Arquivado Por ID'
  },
  {
    key: 'motivoArquivo',
    label: 'Motivo Arquivo'
  }
];

// =========================================================
// AUDITORIA E MATERIAIS
// =========================================================

var AUDIT_FIELDS = [
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: 'timestamp',
    label: 'Data/Hora'
  },
  {
    key: 'usuario',
    label: 'Utilizador'
  },
  {
    key: 'usuarioId',
    label: 'Utilizador ID'
  },
  {
    key: 'acao',
    label: 'Ação'
  },
  {
    key: 'tipo',
    label: 'Tipo'
  },
  {
    key: 'registroId',
    label: 'ID Registo'
  },
  {
    key: 'detalhes',
    label: 'Detalhes'
  },
  {
    key: 'requestId',
    label: 'Request ID'
  }
];
var TICKET_MATERIAL_FIELDS = [
  { key: 'id', label: 'ID' },
  {
    key: 'ticketId',
    label: 'Ticket ID'
  },
  {
    key: 'codigo',
    label: 'Codigo'
  },
  {
    key: 'descricao',
    label: 'Descricao'
  },
  {
    key: 'quantidade',
    label: 'Quantidade'
  },
  {
    key: 'unidade',
    label: 'Unidade'
  },
  {
    key: 'custoUnitario',
    label: 'Custo Unitario'
  },
  {
    key: 'custoTotal',
    label: 'Custo Total'
  },
  {
    key: 'registadoEm',
    label: 'Registado Em'
  },
  {
    key: 'registadoPorId',
    label: 'Registado Por ID'
  }
];

// =========================================================
// PERFIS E PERMISSÕES
// =========================================================

var USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  TECNICO: 'tecnico',
  VISUALIZADOR: 'visualizador'
});

var PERMISSIONS = Object.freeze({
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',

  CREATE_TICKET: 'createTicket',
  UPDATE_TICKET: 'updateTicket',
  ASSIGN_TICKET: 'assignTicket',
  START_TICKET: 'startTicket',
  PAUSE_TICKET: 'pauseTicket',
  RESOLVE_TICKET: 'resolveTicket',
  CLOSE_TICKET: 'closeTicket',
  REOPEN_TICKET: 'reopenTicket',
  ARCHIVE_TICKET: 'archiveTicket',
  DELETE_TICKET: 'deleteTicket'
});

// =========================================================
// ESTADOS DOS TICKETS
// =========================================================

var TICKET_STATUS = Object.freeze({
  ABERTO: 'aberto',
  ATRIBUIDO: 'atribuido',
  EM_ANDAMENTO: 'em_andamento',
  PAUSADO: 'pausado',
  AGUARDANDO_MATERIAL:
    'aguardando_material',
  RESOLVIDO: 'resolvido',
  FINALIZADO: 'finalizado'
});

var TICKET_STATUS_LABELS = Object.freeze({
  aberto: 'Aberto',
  atribuido: 'Atribuído',
  em_andamento: 'Em Andamento',
  pausado: 'Pausado',
  aguardando_material:
    'Aguardando Material',
  resolvido: 'Resolvido',
  finalizado: 'Finalizado'
});

var TICKET_STATUS_VALUES = [
  TICKET_STATUS.ABERTO,
  TICKET_STATUS.ATRIBUIDO,
  TICKET_STATUS.EM_ANDAMENTO,
  TICKET_STATUS.PAUSADO,
  TICKET_STATUS.AGUARDANDO_MATERIAL,
  TICKET_STATUS.RESOLVIDO,
  TICKET_STATUS.FINALIZADO
];

/*
 * Transições permitidas.
 *
 * As permissões do utilizador são verificadas
 * posteriormente pelo serviço de tickets.
 */
var TICKET_TRANSITIONS = Object.freeze({
  aberto: [
    'atribuido',
    'em_andamento'
  ],

  atribuido: [
    'aberto',
    'em_andamento',
    'pausado',
    'aguardando_material'
  ],

  em_andamento: [
    'pausado',
    'aguardando_material',
    'resolvido'
  ],

  pausado: [
    'em_andamento',
    'aguardando_material'
  ],

  aguardando_material: [
    'em_andamento',
    'pausado'
  ],

  resolvido: [
    'em_andamento',
    'finalizado'
  ],

  finalizado: []
});

// =========================================================
// PRIORIDADES E SLA
// =========================================================

var TICKET_PRIORITY = Object.freeze({
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica'
});

var TICKET_PRIORITY_VALUES = [
  TICKET_PRIORITY.BAIXA,
  TICKET_PRIORITY.MEDIA,
  TICKET_PRIORITY.ALTA,
  TICKET_PRIORITY.CRITICA
];

var TICKET_PRIORITY_LABELS = Object.freeze({
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica'
});

/*
 * Tempos em minutos.
 *
 * resposta:
 * tempo máximo até o início da intervenção.
 *
 * resolucao:
 * tempo máximo até a resolução técnica.
 */
var TICKET_SLA = Object.freeze({
  baixa: Object.freeze({
    resposta: 480,
    resolucao: 4320
  }),

  media: Object.freeze({
    resposta: 120,
    resolucao: 1440
  }),

  alta: Object.freeze({
    resposta: 30,
    resolucao: 240
  }),

  critica: Object.freeze({
    resposta: 15,
    resolucao: 120
  })
});

// =========================================================
// TIPOS E CATEGORIAS DE MANUTENÇÃO
// =========================================================

var TICKET_MAINTENANCE_TYPES = [
  'correctivo',
  'preventivo',
  'inspecao',
  'melhoria',
  'estrategico'
];

var TICKET_MAINTENANCE_TYPE_LABELS =
  Object.freeze({
    correctivo: 'Corretivo',
    preventivo: 'Preventivo',
    inspecao: 'Inspeção',
    melhoria: 'Melhoria',
    estrategico: 'Estratégico'
  });

var TICKET_CATEGORIAS = [
  'Canalização',
  'Portas/Fechaduras',
  'Acabamentos/Decoração',
  'Climatização',
  'Casa de Banho',
  'Outros',
  'Elétrico',
  'Cortinados',
  'Cozinha/Equipamento',
  'Amenities/Acessórios',
  'Mobiliário',
  'Pintura Preventiva',
  'Limpeza/Manutenção Geral',
  'Equipamento',
  'Minibar'
];

var TICKET_TURNOS = [
  'Manhã',
  'Tarde',
  'Noite'
];

// =========================================================
// TIPOS DE EQUIPAMENTOS
// =========================================================

var EQUIP_TIPOS = Object.freeze({
  Frigorifico: Object.freeze({
    min: 0,
    max: 8
  }),

  Congelador: Object.freeze({
    min: -25,
    max: -12
  }),

  Vinheira: Object.freeze({
    min: 8,
    max: 18
  }),

  Garrafeira: Object.freeze({
    min: 8,
    max: 18
  }),

  Adega: Object.freeze({
    min: 8,
    max: 18
  })
});

// =========================================================
// LIMITES OPERACIONAIS
// =========================================================

var THRESHOLDS = Object.freeze({
  phMin: 7.0,
  phMax: 7.8,

  cloroMin: 0.5,
  cloroMax: 3.0,
  cloroTotalMax: 5.0,

  aqsMin: 45,
  aqsQuartosMin: 45,

  phCalMin: 7.0,
  phCalMax: 7.8,
  cloroCalMin: 0.5,
  cloroCalMax: 3.0,
  cloroTotalCalMax: 5.0,

  phFriaMin: 7.0,
  phFriaMax: 7.8,
  cloroFriaMin: 0.5,
  cloroFriaMax: 3.0,
  cloroTotalFriaMax: 5.0
});

// =========================================================
// CONFIGURAÇÕES RESTRITAS AO ADMINISTRADOR
// =========================================================

var ADMIN_CONFIG_KEYS = [
  'rooms',
  'baselineAgua',
  'baselineElectricidad',

  'alertEmails',
  'alertsEnabled',

  'tarifaAgua',
  'tarifaElectricidad',

  'ref_phMin',
  'ref_phMax',
  'ref_cloroMin',
  'ref_cloroMax',
  'ref_cloroTotalMax',
  'ref_aqsMin',
  'ref_aqsQuartosMin',

  'ref_phCalMin',
  'ref_phCalMax',
  'ref_cloroCalMin',
  'ref_cloroCalMax',
  'ref_cloroTotalCalMax',

  'ref_phFriaMin',
  'ref_phFriaMax',
  'ref_cloroFriaMin',
  'ref_cloroFriaMax',
  'ref_cloroTotalFriaMax',

  'fechos_mensais',

  'ticketSlaBaixaResposta',
  'ticketSlaBaixaResolucao',
  'ticketSlaMediaResposta',
  'ticketSlaMediaResolucao',
  'ticketSlaAltaResposta',
  'ticketSlaAltaResolucao',
  'ticketSlaCriticaResposta',
  'ticketSlaCriticaResolucao'
];

// =========================================================
// AÇÕES DA API
// =========================================================

var API_ACTIONS = Object.freeze({
  HEALTH: 'health',
  VERSION: 'version',

  LOGIN: 'login',
  LOGOUT: 'logout',
  BOOTSTRAP: 'bootstrap',
  ME: 'me',
  SEED_STATUS: 'seedStatus',

  LIST: 'list',
  SAVE: 'save',
  SAVE_BATCH: 'saveBatch',
  UPDATE: 'update',
  DELETE: 'delete',

  GET_CONFIG: 'getConfig',
  GET_CONFIG_ALL: 'getConfigAll',
  SET_CONFIG: 'setConfig',

  LIST_EQUIPAMENTOS:
    'listEquipamentos',
  SAVE_EQUIPAMENTO:
    'saveEquipamento',
  DELETE_EQUIPAMENTO:
    'deleteEquipamento',

  TEMPERATURA_STATUS:
    'temperaturaStatus',

  LIST_USERS: 'listUsers',
  CREATE_USER: 'createUser',
  DELETE_USER: 'deleteUser',
  TOGGLE_USER_ACTIVE:
    'toggleUserActive',
  ADMIN_SET_PIN: 'adminSetPin',
  CHANGE_OWN_PIN: 'changeOwnPin',

  LIST_TICKETS: 'listTickets',
  GET_TICKET: 'getTicket',
  SAVE_TICKET: 'saveTicket',
  UPDATE_TICKET: 'updateTicket',
  ASSIGN_TICKET: 'assignTicket',
  START_TICKET: 'startTicket',
  PAUSE_TICKET: 'pauseTicket',
  RESUME_TICKET: 'resumeTicket',
  RESOLVE_TICKET: 'resolveTicket',
  CLOSE_TICKET: 'closeTicket',
  REOPEN_TICKET: 'reopenTicket',
  ARCHIVE_TICKET: 'archiveTicket',
  DELETE_TICKET: 'deleteTicket',
  TICKET_STATS: 'ticketStats',
  TICKET_HISTORY: 'ticketHistory'
});

var WRITE_ACTIONS = [
  API_ACTIONS.SAVE,
  API_ACTIONS.SAVE_BATCH,
  API_ACTIONS.UPDATE,
  API_ACTIONS.DELETE,

  API_ACTIONS.SET_CONFIG,

  API_ACTIONS.CREATE_USER,
  API_ACTIONS.DELETE_USER,
  API_ACTIONS.TOGGLE_USER_ACTIVE,
  API_ACTIONS.ADMIN_SET_PIN,
  API_ACTIONS.CHANGE_OWN_PIN,

  API_ACTIONS.SAVE_EQUIPAMENTO,
  API_ACTIONS.DELETE_EQUIPAMENTO,

  API_ACTIONS.SAVE_TICKET,
  API_ACTIONS.UPDATE_TICKET,
  API_ACTIONS.ASSIGN_TICKET,
  API_ACTIONS.START_TICKET,
  API_ACTIONS.PAUSE_TICKET,
  API_ACTIONS.RESUME_TICKET,
  API_ACTIONS.RESOLVE_TICKET,
  API_ACTIONS.CLOSE_TICKET,
  API_ACTIONS.REOPEN_TICKET,
  API_ACTIONS.ARCHIVE_TICKET,
  API_ACTIONS.DELETE_TICKET
];

// =========================================================
// CÓDIGOS DE ERRO
// =========================================================

var API_ERROR_CODES = Object.freeze({
  BAD_REQUEST: 'BAD_REQUEST',
  AUTH: 'AUTH',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  CONFLICT: 'CONFLICT',
  LOCKED: 'LOCKED',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR'
});

function apiError(code, message, details) {
  var error = new Error(
    String(message || 'Erro da API')
  );

  error.code = String(
    code ||
    API_ERROR_CODES.SERVER_ERROR
  );

  error.details =
    details === undefined
      ? null
      : details;

  return error;
}
function createOperationalBatch(
  type,
  rows,
  uid,
  options
) {
  requireWriter(uid);

  if (
    type !== 'general' &&
    type !== 'quarto'
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo inválido para importação'
    );
  }

  var source = requireArray(
    rows,
    'Lista de registos',
    BACKEND_RELEASE.MAX_BATCH_SIZE,
    false
  );

  if (!source.length) {
    return {
      ok: true,
      ids: [],
      created: 0,
      skipped: 0
    };
  }

  var preparedRows = [];

  source.forEach(function (row, index) {
    try {
      var prepared =
        type === 'general'
          ? prepareGeneralRecord(
              row,
              uid,
              null
            )
          : prepareRoomRecord(
              row,
              uid,
              null
            );

      if (row.id) {
        prepared.id = requireId(
          row.id,
          'ID da linha ' + (index + 1)
        );
      }

      preparedRows.push(prepared);
    } catch (error) {
      throw apiError(
        getApiErrorCode(
          error,
          API_ERROR_CODES.VALIDATION
        ),
        'Linha ' +
          (index + 1) +
          ': ' +
          safeString(
            error.message || error
          )
      );
    }
  });

  var settings = options || {};

  var result = repositoryCreateBatch(
    type,
    preparedRows,
    {
      idPrefix: type,
      failIfExists: false
    }
  );

  if (
    result.created > 0 &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'createBatch',
      type,
      '',
      {
        quantidade: result.created,
        ignorados: result.skipped,
        ids: result.ids
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    ids: result.ids,
    created: result.created,
    skipped: result.skipped
  };
}

function getApiErrorCode(
  error,
  fallbackCode
) {
  if (
    error &&
    error.code &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return (
    fallbackCode ||
    API_ERROR_CODES.SERVER_ERROR
  );
}

function getApiErrorDetails(error) {
  if (
    !error ||
    error.details === undefined
  ) {
    return null;
  }

  return error.details;
}

// =========================================================
// RESPOSTA JSON
// =========================================================

function jsonOut(object) {
  var payload = object || {};

  if (
    payload.serverTime === undefined
  ) {
    payload.serverTime =
      new Date().toISOString();
  }

  if (
    payload.backendVersion === undefined
  ) {
    payload.backendVersion =
      BACKEND_RELEASE.VERSION;
  }

  return ContentService
    .createTextOutput(
      JSON.stringify(payload)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

function successOut(data) {
  var response = {
    ok: true
  };

  if (
    data &&
    typeof data === 'object'
  ) {
    Object.keys(data).forEach(
      function (key) {
        response[key] = data[key];
      }
    );
  }

  return jsonOut(response);
}

function errorOut(
  error,
  fallbackCode
) {
  var code = getApiErrorCode(
    error,
    fallbackCode ||
      API_ERROR_CODES.SERVER_ERROR
  );

  var message = String(
    error && error.message
      ? error.message
      : error || 'Erro inesperado'
  );

  var response = {
    ok: false,
    code: code,
    error: message
  };

  var details =
    getApiErrorDetails(error);

  if (details !== null) {
    response.details = details;
  }

  return jsonOut(response);
}

// =========================================================
// UTILITÁRIOS DE TEXTO
// =========================================================

function safeString(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value);
}

function trimText(value, maxLength) {
  var text = safeString(value).trim();

  if (
    maxLength &&
    text.length > maxLength
  ) {
    return text.substring(
      0,
      maxLength
    );
  }

  return text;
}

function normalizeKey(value) {
  return safeString(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-z0-9_-]/g,
      ''
    );
}

function normalizeUsername(value) {
  return safeString(value)
    .trim()
    .toLowerCase();
}

function isNo(value) {
  var text = safeString(value)
    .trim()
    .toLowerCase();

  return (
    value === false ||
    value === 0 ||
    text === 'false' ||
    text === 'no' ||
    text === 'não'
  );
}

function isYes(value) {
  var text = safeString(value)
    .trim()
    .toLowerCase();

  return (
    value === true ||
    value === 1 ||
    text === 'true' ||
    text === 'sim' ||
    text === 'sí' ||
    text === 'si'
  );
}

function normalizeYesNo(value) {
  return isYes(value)
    ? 'Sim'
    : 'Não';
}
// =========================================================
// UTILITÁRIOS NUMÉRICOS
// =========================================================

function parseDecimal(
  value,
  defaultValue
) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return defaultValue === undefined
      ? null
      : defaultValue;
  }

  var numberValue = parseFloat(
    safeString(value).replace(',', '.')
  );

  if (
    isNaN(numberValue) ||
    !isFinite(numberValue)
  ) {
    return defaultValue === undefined
      ? null
      : defaultValue;
  }

  return numberValue;
}

function requireNumberRange(
  value,
  minimum,
  maximum,
  label,
  optional
) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    if (optional) {
      return null;
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      label + ' é obrigatório'
    );
  }

  var numberValue =
    parseDecimal(value, null);

  if (numberValue === null) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      label + ': valor não numérico'
    );
  }

  if (
    minimum !== null &&
    minimum !== undefined &&
    numberValue < minimum
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      label +
        ': o valor mínimo permitido é ' +
        minimum
    );
  }

  if (
    maximum !== null &&
    maximum !== undefined &&
    numberValue > maximum
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      label +
        ': o valor máximo permitido é ' +
        maximum
    );
  }

  return numberValue;
}

function requireIntegerRange(
  value,
  minimum,
  maximum,
  label,
  optional
) {
  var numberValue = requireNumberRange(
    value,
    minimum,
    maximum,
    label,
    optional
  );

  if (
    numberValue === null &&
    optional
  ) {
    return null;
  }

  if (
    Math.floor(numberValue) !==
    numberValue
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      label + ' deve ser um número inteiro'
    );
  }

  return numberValue;
}

function roundMoney(value) {
  var numberValue =
    parseDecimal(value, 0);

  return Math.round(
    numberValue * 100
  ) / 100;
}

// =========================================================
// UTILITÁRIOS DE DATA E HORA
// =========================================================

function getTimeZone() {
  return (
    Session.getScriptTimeZone() ||
    'Europe/Lisbon'
  );
}

function formatServerDate(date) {
  return Utilities.formatDate(
    date || new Date(),
    getTimeZone(),
    'yyyy-MM-dd'
  );
}

function formatServerTime(date) {
  return Utilities.formatDate(
    date || new Date(),
    getTimeZone(),
    'HH:mm'
  );
}

function formatServerDateTime(date) {
  return Utilities.formatDate(
    date || new Date(),
    getTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );
}

function formatIsoDateTime(date) {
  return Utilities.formatDate(
    date || new Date(),
    getTimeZone(),
    "yyyy-MM-dd'T'HH:mm:ss"
  );
}

function isValidIsoDate(value) {
  var text = safeString(value).trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(text)
  ) {
    return false;
  }

  var parts = text.split('-');

  var year = Number(parts[0]);
  var month = Number(parts[1]);
  var day = Number(parts[2]);

  var date = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0
  );

  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function requireIsoDate(
  value,
  label,
  optional
) {
  var text = safeString(value).trim();

  if (!text) {
    if (optional) {
      return '';
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Data') +
        ' é obrigatória'
    );
  }

  if (!isValidIsoDate(text)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Data') +
        ' inválida (AAAA-MM-DD)'
    );
  }

  return text;
}

function isValidTime(value) {
  var text = safeString(value).trim();

  if (
    !/^\d{2}:\d{2}$/.test(text)
  ) {
    return false;
  }

  var parts = text.split(':');

  var hours = Number(parts[0]);
  var minutes = Number(parts[1]);

  return (
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
}

function requireTime(
  value,
  label,
  optional
) {
  var text = safeString(value)
    .trim()
    .substring(0, 5);

  if (!text) {
    if (optional) {
      return '';
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Hora') +
        ' é obrigatória'
    );
  }

  if (!isValidTime(text)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Hora') +
        ' inválida (HH:mm)'
    );
  }

  return text;
}

function parseLocalDateTime(
  dateValue,
  timeValue
) {
  var dateText = requireIsoDate(
    dateValue,
    'Data',
    false
  );

  var timeText = requireTime(
    timeValue || '00:00',
    'Hora',
    false
  );

  var dateParts = dateText.split('-');
  var timeParts = timeText.split(':');

  var date = new Date(
    Number(dateParts[0]),
    Number(dateParts[1]) - 1,
    Number(dateParts[2]),
    Number(timeParts[0]),
    Number(timeParts[1]),
    0,
    0
  );

  if (isNaN(date.getTime())) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Data e hora inválidas'
    );
  }

  return date;
}

function parseStoredDateTime(value) {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  var text = safeString(value).trim();

  if (!text) {
    return null;
  }

  var normalized = text
    .replace('T', ' ')
    .replace('Z', '')
    .substring(0, 19);

  var match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!match) {
    return null;
  }

  var date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] || 0),
    Number(match[5] || 0),
    Number(match[6] || 0),
    0
  );

  return isNaN(date.getTime())
    ? null
    : date;
}

function addMinutes(
  date,
  minutes
) {
  var source = date instanceof Date
    ? date
    : new Date(date);

  if (isNaN(source.getTime())) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Data inválida para calcular o prazo'
    );
  }

  var amount = Number(minutes || 0);

  return new Date(
    source.getTime() +
    amount * 60000
  );
}

function diffMinutes(
  start,
  end
) {
  var startDate = start instanceof Date
    ? start
    : parseStoredDateTime(start);

  var endDate = end instanceof Date
    ? end
    : parseStoredDateTime(end);

  if (!startDate || !endDate) {
    return null;
  }

  return Math.max(
    0,
    Math.round(
      (
        endDate.getTime() -
        startDate.getTime()
      ) / 60000
    )
  );
}

function compareDateTimes(
  left,
  right
) {
  var leftDate =
    left instanceof Date
      ? left
      : parseStoredDateTime(left);

  var rightDate =
    right instanceof Date
      ? right
      : parseStoredDateTime(right);

  if (!leftDate || !rightDate) {
    return 0;
  }

  if (
    leftDate.getTime() <
    rightDate.getTime()
  ) {
    return -1;
  }

  if (
    leftDate.getTime() >
    rightDate.getTime()
  ) {
    return 1;
  }

  return 0;
}

function isPastDateTime(value) {
  var date = parseStoredDateTime(value);

  return date
    ? date.getTime() < Date.now()
    : false;
}

// =========================================================
// SEMANA ISO
// =========================================================

function getSemanaISO(dateStr) {
  var value = safeString(dateStr).trim();

  if (!isValidIsoDate(value)) {
    return '';
  }

  var parts = value.split('-');

  var date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2]),
    12,
    0,
    0
  );

  var day =
    (date.getDay() + 6) % 7;

  var thursday =
    new Date(date.getTime());

  thursday.setDate(
    date.getDate() - day + 3
  );

  var firstThursday = new Date(
    thursday.getFullYear(),
    0,
    4,
    12,
    0,
    0
  );

  var firstDay =
    (firstThursday.getDay() + 6) % 7;

  firstThursday.setDate(
    firstThursday.getDate() -
      firstDay +
      3
  );

  var week =
    1 +
    Math.round(
      (
        thursday.getTime() -
        firstThursday.getTime()
      ) / 604800000
    );

  return (
    thursday.getFullYear() +
    '-W' +
    ('0' + week).slice(-2)
  );
}

// =========================================================
// IDENTIFICADORES
// =========================================================

function createId(prefix) {
  var normalizedPrefix =
    normalizeKey(prefix || 'id') ||
    'id';

  return (
    normalizedPrefix +
    '_' +
    new Date().getTime() +
    '_' +
    Utilities
      .getUuid()
      .replace(/-/g, '')
      .substring(0, 10)
  );
}

function createRequestId() {
  return createId('req');
}

function createTicketNumber(date) {
  var source = date || new Date();

  var datePart = Utilities.formatDate(
    source,
    getTimeZone(),
    'yyyyMMdd'
  );

  var randomPart = Math.floor(
    1000 + Math.random() * 9000
  );

  return (
    'OT-' +
    datePart +
    '-' +
    randomPart
  );
}

// =========================================================
// OBJETOS E SERIALIZAÇÃO
// =========================================================

function cloneObject(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return value;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

function safeJsonParse(
  value,
  defaultValue
) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return defaultValue;
  }

  if (
    typeof value === 'object'
  ) {
    return cloneObject(value);
  }

  try {
    return JSON.parse(String(value));
  } catch (error) {
    return defaultValue;
  }
}

function safeJsonStringify(
  value,
  maxLength
) {
  var serialized;

  try {
    serialized = JSON.stringify(
      value === undefined
        ? null
        : value
    );
  } catch (error) {
    serialized = JSON.stringify({
      error:
        'Conteúdo não serializável'
    });
  }

  if (
    maxLength &&
    serialized.length > maxLength
  ) {
    serialized =
      serialized.substring(
        0,
        maxLength
      ) + '…';
  }

  return serialized;
}

function pickObject(
  source,
  keys
) {
  var output = {};
  var object = source || {};

  (keys || []).forEach(
    function (key) {
      if (
        Object.prototype
          .hasOwnProperty
          .call(object, key)
      ) {
        output[key] = object[key];
      }
    }
  );

  return output;
}

function omitPrivateFields(source) {
  var output = {};
  var object = source || {};

  Object.keys(object).forEach(
    function (key) {
      if (
        key.charAt(0) !== '_'
      ) {
        output[key] = object[key];
      }
    }
  );

  return output;
}

function objectHasChanges(
  previous,
  next,
  ignoredFields
) {
  var before = previous || {};
  var after = next || {};
  var ignored = ignoredFields || [];

  var keys = {};

  Object.keys(before).forEach(
    function (key) {
      keys[key] = true;
    }
  );

  Object.keys(after).forEach(
    function (key) {
      keys[key] = true;
    }
  );

  var allKeys = Object.keys(keys);

  for (
    var index = 0;
    index < allKeys.length;
    index++
  ) {
    var field = allKeys[index];

    if (
      ignored.indexOf(field) !== -1
    ) {
      continue;
    }

    if (
      safeJsonStringify(before[field]) !==
      safeJsonStringify(after[field])
    ) {
      return true;
    }
  }

  return false;
}

function buildObjectDiff(
  previous,
  next,
  ignoredFields
) {
  var before = previous || {};
  var after = next || {};
  var ignored = ignoredFields || [];
  var fields = {};

  Object.keys(before).forEach(
    function (key) {
      fields[key] = true;
    }
  );

  Object.keys(after).forEach(
    function (key) {
      fields[key] = true;
    }
  );

  var changes = {};

  Object.keys(fields).forEach(
    function (field) {
      if (
        ignored.indexOf(field) !== -1
      ) {
        return;
      }

      var oldValue = before[field];
      var newValue = after[field];

      if (
        safeJsonStringify(oldValue) !==
        safeJsonStringify(newValue)
      ) {
        changes[field] = {
          antes: oldValue,
          depois: newValue
        };
      }
    }
  );

  return changes;
}

// =========================================================
// CAMPOS E FOLHAS
// =========================================================

function getFields(type) {
  switch (safeString(type)) {
    case 'general':
      return GENERAL_FIELDS;

    case 'quarto':
      return QUARTO_FIELDS;

    case 'temperatura':
      return TEMPERATURA_FIELDS;

    case 'ticket':
      return TICKET_FIELDS;

    case 'equipamento':
      return EQUIPAMENTO_FIELDS;

    case 'user':
      return USER_FIELDS;

    case 'audit':
      return AUDIT_FIELDS;

    case 'ticketMaterial':
      return TICKET_MATERIAL_FIELDS;

    default:
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de registo inválido: ' +
          safeString(type)
      );
  }
}

function getSheetName(type) {
  switch (safeString(type)) {
    case 'general':
      return SHEET_NAMES.GENERAL;

    case 'quarto':
      return SHEET_NAMES.QUARTOS;

    case 'temperatura':
      return SHEET_NAMES.TEMPERATURAS;

    case 'ticket':
      return SHEET_NAMES.TICKETS;

    case 'equipamento':
      return SHEET_NAMES.EQUIPAMENTOS;

    case 'user':
      return SHEET_NAMES.USERS;

    case 'audit':
      return SHEET_NAMES.AUDIT;

    case 'ticketMaterial':
      return SHEET_NAMES.TICKET_MATERIALS;

    default:
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de folha inválido: ' +
          safeString(type)
      );
  }
}

function getFieldDefinition(
  fields,
  key
) {
  var source = fields || [];

  for (
    var index = 0;
    index < source.length;
    index++
  ) {
    if (
      source[index].key === key
    ) {
      return source[index];
    }
  }

  return null;
}

// =========================================================
// CACHE
// =========================================================

function getCacheKey(
  namespace,
  identifier
) {
  return (
    normalizeKey(namespace || 'cache') +
    '_' +
    normalizeKey(identifier || 'all')
  );
}

function cacheGetJson(key) {
  try {
    var raw = CacheService
      .getScriptCache()
      .get(String(key));

    return raw
      ? JSON.parse(raw)
      : null;
  } catch (error) {
    return null;
  }
}
function cachePutJson(
  key,
  value,
  ttlSeconds
) {
  try {
    var ttl = Number(
      ttlSeconds ||
      BACKEND_RELEASE.CACHE_TTL_SECONDS
    );

    /*
     * CacheService admite un máximo de 21600 segundos.
     */
    ttl = Math.max(
      1,
      Math.min(ttl, 21600)
    );

    CacheService
      .getScriptCache()
      .put(
        String(key),
        JSON.stringify(value),
        ttl
      );

    return true;
  } catch (error) {
    /*
     * Un error de caché nunca debe impedir
     * la operación principal.
     */
    return false;
  }
}

function cacheRemove(key) {
  try {
    CacheService
      .getScriptCache()
      .remove(String(key));

    return true;
  } catch (error) {
    return false;
  }
}

function cacheRemoveMany(keys) {
  var source = Array.isArray(keys)
    ? keys
    : [];

  source.forEach(function (key) {
    cacheRemove(key);
  });
}

function invalidateTypeCache(type) {
  var normalizedType =
    normalizeKey(type);

  cacheRemoveMany([
    'records_' + normalizedType,
    normalizedType + '_list',
    'list_' + normalizedType
  ]);

  if (normalizedType === 'ticket') {
    cacheRemoveMany([
      'tickets_list',
      'ticket_stats',
      'ticket_dashboard'
    ]);
  }

  if (normalizedType === 'equipamento') {
    cacheRemoveMany([
      'equip_raw',
      'equipamentos_list'
    ]);
  }

  if (normalizedType === 'user') {
    cacheRemoveMany([
      'users_raw',
      'users_list'
    ]);
  }
}

function invalidateColumnsCache(
  sheetName
) {
  cacheRemove(
    'cols_' + safeString(sheetName)
  );
}

function invalidateAllCoreCaches() {
  cacheRemoveMany([
    'records_general',
    'records_quarto',
    'records_temperatura',
    'records_ticket',

    'tickets_list',
    'ticket_stats',
    'ticket_dashboard',

    'equip_raw',
    'equipamentos_list',

    'users_raw',
    'users_list',

    'config_all',

    'cols_General',
    'cols_Quartos',
    'cols_Temperaturas',
    'cols_Tickets',
    'cols_Equipamentos',
    'cols_Usuarios',
    'cols_Config',
    'cols_Auditoria',
    'cols_TicketMateriais'
  ]);
}

// =========================================================
// BLOQUEIOS DE ESCRITA
// =========================================================

function withScriptLock(
  operation,
  timeoutMs
) {
  if (typeof operation !== 'function') {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Operação de escrita inválida'
    );
  }

  var timeout = Number(
    timeoutMs || 20000
  );

  var lock =
    LockService.getScriptLock();

  if (!lock.tryLock(timeout)) {
    throw apiError(
      API_ERROR_CODES.LOCKED,
      'O servidor está ocupado com outra operação. Tente novamente dentro de alguns segundos.'
    );
  }

  try {
    return operation();
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {}
  }
}

function withUserLock(
  userId,
  operation,
  timeoutMs
) {
  if (typeof operation !== 'function') {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Operação de utilizador inválida'
    );
  }

  /*
   * Google Apps Script não oferece locks nomeados.
   * O UserLock separa execuções pelo utilizador Google,
   * enquanto o ScriptLock protege o projeto inteiro.
   */
  var lock =
    LockService.getUserLock();

  var timeout = Number(
    timeoutMs || 10000
  );

  if (!lock.tryLock(timeout)) {
    throw apiError(
      API_ERROR_CODES.LOCKED,
      'Existe outra operação deste utilizador em curso.'
    );
  }

  try {
    return operation(userId);
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {}
  }
}

// =========================================================
// VALIDAÇÕES GENÉRICAS
// =========================================================

function requireText(
  value,
  label,
  minimumLength,
  maximumLength,
  optional
) {
  var text = safeString(value).trim();

  if (!text) {
    if (optional) {
      return '';
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Campo') +
        ' é obrigatório'
    );
  }

  var minimum = Number(
    minimumLength || 0
  );

  if (
    minimum > 0 &&
    text.length < minimum
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Campo') +
        ' deve ter pelo menos ' +
        minimum +
        ' caracteres'
    );
  }

  var maximum = Number(
    maximumLength || 0
  );

  if (
    maximum > 0 &&
    text.length > maximum
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Campo') +
        ' não pode ultrapassar ' +
        maximum +
        ' caracteres'
    );
  }

  return text;
}

function requireEnum(
  value,
  allowedValues,
  label,
  optional
) {
  var text = safeString(value).trim();

  if (!text) {
    if (optional) {
      return '';
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Valor') +
        ' é obrigatório'
    );
  }

  var allowed = Array.isArray(
    allowedValues
  )
    ? allowedValues
    : [];

  if (allowed.indexOf(text) === -1) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Valor') +
        ' inválido',
      {
        recebido: text,
        permitidos: allowed
      }
    );
  }

  return text;
}

function requireId(
  value,
  label
) {
  var id = safeString(value).trim();

  if (!id) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'ID') +
        ' ausente'
    );
  }

  if (id.length > 120) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'ID') +
        ' demasiado comprido'
    );
  }

  if (
    !/^[a-zA-Z0-9._:-]+$/.test(id)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'ID') +
        ' contém caracteres inválidos'
    );
  }

  return id;
}

function requireArray(
  value,
  label,
  maximumLength,
  optional
) {
  if (
    value === undefined ||
    value === null
  ) {
    if (optional) {
      return [];
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Lista') +
        ' é obrigatória'
    );
  }

  if (!Array.isArray(value)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Lista') +
        ' deve ser uma lista'
    );
  }

  if (
    maximumLength &&
    value.length > maximumLength
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Lista') +
        ' ultrapassa o máximo de ' +
        maximumLength +
        ' elementos'
    );
  }

  return value;
}

function assertCondition(
  condition,
  code,
  message,
  details
) {
  if (!condition) {
    throw apiError(
      code ||
        API_ERROR_CODES.VALIDATION,
      message ||
        'Condição inválida',
      details
    );
  }
}

// =========================================================
// VERSÕES SEMÂNTICAS
// =========================================================

function parseSemver(value) {
  var clean = safeString(value)
    .replace(/^v/i, '')
    .split('-')[0]
    .split('(')[0]
    .trim();

  var parts = clean.split('.');

  return [
    Number(parts[0] || 0),
    Number(parts[1] || 0),
    Number(parts[2] || 0)
  ].map(function (part) {
    return (
      isNaN(part) ||
      !isFinite(part)
    )
      ? 0
      : part;
  });
}

function compareSemver(
  left,
  right
) {
  var leftParts =
    parseSemver(left);

  var rightParts =
    parseSemver(right);

  for (var index = 0; index < 3; index++) {
    if (
      leftParts[index] >
      rightParts[index]
    ) {
      return 1;
    }

    if (
      leftParts[index] <
      rightParts[index]
    ) {
      return -1;
    }
  }

  return 0;
}

function requireCompatibleAppVersion(
  version
) {
  var clientVersion =
    safeString(version).trim();

  /*
   * Mantemos compatibilidade com clientes antigos
   * que ainda não enviam appVersion.
   */
  if (!clientVersion) {
    return true;
  }

  if (
    compareSemver(
      clientVersion,
      BACKEND_RELEASE.MIN_APP_VERSION
    ) < 0
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'A versão da aplicação é demasiado antiga. Atualize a aplicação para continuar.',
      {
        versaoAtual: clientVersion,
        versaoMinima:
          BACKEND_RELEASE.MIN_APP_VERSION
      }
    );
  }

  return true;
}

// =========================================================
// CONTEXTO DOS PEDIDOS
// =========================================================

function buildRequestContext(
  e,
  body
) {
  var payload = body || {};

  requireCompatibleAppVersion(
    payload.appVersion
  );

  return {
    requestId:
      trimText(
        payload.requestId,
        120
      ) || createRequestId(),

    action: trimText(
      payload.action,
      80
    ),

    appVersion: trimText(
      payload.appVersion,
      30
    ),

    timestamp: trimText(
      payload.timestamp,
      50
    ),

    receivedAt:
      formatIsoDateTime(new Date()),

    hasToken: Boolean(
      payload.token ||
      (
        e &&
        e.parameter &&
        e.parameter.token
      )
    )
  };
}

// =========================================================
// SLA DOS TICKETS
// =========================================================

function getTicketSla(
  priority
) {
  var normalized = requireEnum(
    priority,
    TICKET_PRIORITY_VALUES,
    'Prioridade',
    false
  );

  var defaults =
    TICKET_SLA[normalized];

  if (!defaults) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Prioridade sem configuração de SLA'
    );
  }

  return {
    resposta:
      Number(defaults.resposta),

    resolucao:
      Number(defaults.resolucao)
  };
}

function calculateTicketDeadlines(
  openedAt,
  priority
) {
  var openingDate =
    openedAt instanceof Date
      ? openedAt
      : parseStoredDateTime(openedAt);

  if (!openingDate) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Data de abertura inválida para calcular o SLA'
    );
  }

  var sla =
    getTicketSla(priority);

  return {
    prazoResposta:
      formatIsoDateTime(
        addMinutes(
          openingDate,
          sla.resposta
        )
      ),

    prazoResolucao:
      formatIsoDateTime(
        addMinutes(
          openingDate,
          sla.resolucao
        )
      ),

    respostaMinutos:
      sla.resposta,

    resolucaoMinutos:
      sla.resolucao
  };
}

function calculateSlaCompliance(
  deadline,
  completedAt
) {
  if (!deadline) {
    return '';
  }

  var deadlineDate =
    parseStoredDateTime(deadline);

  var completedDate =
    completedAt
      ? parseStoredDateTime(completedAt)
      : new Date();

  if (
    !deadlineDate ||
    !completedDate
  ) {
    return '';
  }

  return (
    completedDate.getTime() <=
    deadlineDate.getTime()
  )
    ? 'Sim'
    : 'Não';
}

// =========================================================
// TRANSIÇÕES DE TICKETS
// =========================================================

function canTransitionTicket(
  currentStatus,
  nextStatus
) {
  var current =
    safeString(currentStatus).trim();

  var next =
    safeString(nextStatus).trim();

  if (current === next) {
    return true;
  }

  var allowed =
    TICKET_TRANSITIONS[current] || [];

  return allowed.indexOf(next) !== -1;
}

function requireTicketTransition(
  currentStatus,
  nextStatus
) {
  requireEnum(
    currentStatus,
    TICKET_STATUS_VALUES,
    'Estado atual',
    false
  );

  requireEnum(
    nextStatus,
    TICKET_STATUS_VALUES,
    'Novo estado',
    false
  );

  if (
    !canTransitionTicket(
      currentStatus,
      nextStatus
    )
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Transição de estado não permitida: ' +
        safeString(currentStatus) +
        ' → ' +
        safeString(nextStatus),
      {
        estadoAtual: currentStatus,
        novoEstado: nextStatus,
        permitidos:
          TICKET_TRANSITIONS[
            currentStatus
          ] || []
      }
    );
  }

  return true;
}

// =========================================================
// VALIDAÇÃO DOS MATERIAIS DE UM TICKET
// =========================================================

function normalizeTicketMaterials(
  materials
) {
  var source;

  if (
    typeof materials === 'string'
  ) {
    source = safeJsonParse(
      materials,
      []
    );
  } else {
    source = materials || [];
  }

  source = requireArray(
    source,
    'Materiais',
    100,
    true
  );

  return source.map(
    function (material, index) {
      var item = material || {};

      var description = requireText(
        item.descricao ||
          item.description,
        'Descrição do material ' +
          (index + 1),
        2,
        120,
        false
      );

      var quantity =
        requireNumberRange(
          item.quantidade !== undefined
            ? item.quantidade
            : item.quantity,
          0.001,
          100000,
          'Quantidade do material ' +
            (index + 1),
          false
        );

      var unitCost =
        requireNumberRange(
          item.custoUnitario !== undefined
            ? item.custoUnitario
            : item.unitCost,
          0,
          1000000,
          'Custo unitário do material ' +
            (index + 1),
          true
        );

      unitCost =
        unitCost === null
          ? 0
          : roundMoney(unitCost);

      return {
        codigo: trimText(
          item.codigo ||
            item.code,
          50
        ),

        descricao: description,

        quantidade: quantity,

        unidade:
          trimText(
            item.unidade ||
              item.unit ||
              'un',
            20
          ) || 'un',

        custoUnitario: unitCost,

        custoTotal:
          roundMoney(
            quantity * unitCost
          )
      };
    }
  );
}

function getMaterialsTotal(
  materials
) {
  return normalizeTicketMaterials(
    materials
  ).reduce(
    function (total, item) {
      return roundMoney(
        total +
        Number(item.custoTotal || 0)
      );
    },
    0
  );
}

// =========================================================
// MARCADOR DE FIM DA PARTE 1
// =========================================================

/*
 * FIM DE 01_Core.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 1/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 2/13 — Repositório de Google Sheets
 *
 * Dependências:
 * - 01_Core.gs
 */

// =========================================================
// ACESSO AO SPREADSHEET
// =========================================================

function getApplicationSpreadsheet() {
  var spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Não foi possível aceder à folha de cálculo da aplicação'
    );
  }

  return spreadsheet;
}

function getOrCreateSheetByName(
  sheetName,
  options
) {
  var name = requireText(
    sheetName,
    'Nome da folha',
    1,
    100,
    false
  );

  var settings = options || {};
  var spreadsheet =
    getApplicationSpreadsheet();

  var sheet =
    spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);

    if (
      settings.freezeHeader !== false
    ) {
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function getOrCreateSheet(type) {
  var sheetName = getSheetName(type);

  return getOrCreateSheetByName(
    sheetName,
    {
      freezeHeader: true
    }
  );
}

function getSheetByType(type) {
  var sheetName = getSheetName(type);

  return getApplicationSpreadsheet()
    .getSheetByName(sheetName);
}

// =========================================================
// GESTÃO DAS COLUNAS
// =========================================================

function ensureColumns(
  sheet,
  fields
) {
  if (!sheet) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Folha de cálculo inválida'
    );
  }

  if (
    !Array.isArray(fields) ||
    !fields.length
  ) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Definição de colunas inválida'
    );
  }

  var cacheKey =
    'cols_' + sheet.getName();

  var cached =
    cacheGetJson(cacheKey);

  if (
    cached &&
    typeof cached === 'object'
  ) {
    var cacheIsComplete =
      fields.every(function (field) {
        return Boolean(
          cached[field.key]
        );
      });

    if (cacheIsComplete) {
      return cached;
    }
  }

  var lastColumn =
    sheet.getLastColumn();

  var headerRow = lastColumn > 0
    ? sheet.getRange(
        1,
        1,
        1,
        lastColumn
      ).getDisplayValues()[0]
    : [];

  var columnIndex = {};
  var currentLastColumn =
    lastColumn;

  fields.forEach(function (field) {
    var label = safeString(
      field.label
    );

    var existingIndex =
      headerRow.indexOf(label);

    if (existingIndex === -1) {
      currentLastColumn++;

      sheet.getRange(
        1,
        currentLastColumn
      )
        .setValue(label)
        .setFontWeight('bold');

      /*
       * Guardamos os dados como texto para preservar:
       * - IDs;
       * - zeros iniciais;
       * - datas no formato ISO;
       * - números de quartos;
       * - valores negativos.
       */
      sheet.getRange(
        2,
        currentLastColumn,
        4000,
        1
      ).setNumberFormat('@');

      headerRow.push(label);

      columnIndex[field.key] =
        currentLastColumn;
    } else {
      columnIndex[field.key] =
        existingIndex + 1;
    }
  });

  if (
    sheet.getFrozenRows() < 1
  ) {
    sheet.setFrozenRows(1);
  }

  cachePutJson(
    cacheKey,
    columnIndex,
    BACKEND_RELEASE
      .COLUMNS_CACHE_TTL_SECONDS
  );

  return columnIndex;
}

function ensureTypeColumns(type) {
  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  return ensureColumns(
    sheet,
    fields
  );
}

function getMappedColumnCount(
  fields,
  columnIndex
) {
  var maximum = 0;

  (fields || []).forEach(
    function (field) {
      var index =
        Number(
          columnIndex[field.key] || 0
        );

      if (index > maximum) {
        maximum = index;
      }
    }
  );

  return maximum;
}

// =========================================================
// PROTEÇÃO DOS VALORES ESCRITOS
// =========================================================

function sanitizeSheetValue(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  if (value instanceof Date) {
    return formatIsoDateTime(value);
  }

  if (typeof value === 'object') {
    return safeJsonStringify(
      value,
      50000
    );
  }

  var text = String(value);

  /*
   * Range.setValues interpreta valores iniciados por "="
   * como fórmulas. Também protegemos os restantes prefixos
   * utilizados em ataques de CSV/Sheets.
   *
   * O apóstrofo não é apresentado visualmente na folha.
   */
  if (/^[=+@]/.test(text)) {
    return "'" + text;
  }

  /*
   * Não adicionamos apóstrofo a números negativos,
   * pois temperaturas abaixo de zero são válidas.
   */
  if (
    /^-\s*[a-zA-Z=+@]/.test(text)
  ) {
    return "'" + text;
  }

  return text;
}

function normalizeReadValue(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      getTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
  }

  var text = String(value);

  /*
   * Caso a API devolva o apóstrofo protetor,
   * removemo-lo apenas quando antecede um
   * possível prefixo de fórmula.
   */
  if (/^'[=+@]/.test(text)) {
    return text.substring(1);
  }

  if (/^'-\s*[a-zA-Z=+@]/.test(text)) {
    return text.substring(1);
  }

  return value;
}

// =========================================================
// LOCALIZAÇÃO E LEITURA DE LINHAS
// =========================================================

function findRowIndexById(
  sheet,
  columnIndex,
  id
) {
  var recordId =
    safeString(id).trim();

  if (!recordId) {
    return -1;
  }

  var idColumn =
    Number(columnIndex.id || 0);

  if (idColumn < 1) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'A folha não possui uma coluna ID válida'
    );
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return -1;
  }

  var ids = sheet.getRange(
    2,
    idColumn,
    lastRow - 1,
    1
  ).getDisplayValues();

  for (
    var index = 0;
    index < ids.length;
    index++
  ) {
    if (
      safeString(ids[index][0]) ===
      recordId
    ) {
      return index + 2;
    }
  }

  return -1;
}

function readRowData(
  sheet,
  fields,
  columnIndex,
  rowNumber
) {
  var row = requireIntegerRange(
    rowNumber,
    2,
    Math.max(
      2,
      sheet.getMaxRows()
    ),
    'Número da linha',
    false
  );

  var columnCount =
    getMappedColumnCount(
      fields,
      columnIndex
    );

  if (columnCount < 1) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Não existem colunas para ler'
    );
  }

  var values = sheet.getRange(
    row,
    1,
    1,
    columnCount
  ).getValues()[0];

  var record = {};

  fields.forEach(function (field) {
    record[field.key] =
      normalizeReadValue(
        values[
          columnIndex[field.key] - 1
        ]
      );
  });

  Object.defineProperty(
    record,
    '_row',
    {
      value: row,
      enumerable: false,
      configurable: true
    }
  );

  return record;
}

function readAllRows(
  sheet,
  fields,
  columnIndex
) {
  var lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  var lastColumn = Math.max(
    sheet.getLastColumn(),
    getMappedColumnCount(
      fields,
      columnIndex
    )
  );

  var values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    lastColumn
  ).getValues();

  var idColumn =
    columnIndex.id;

  var records = [];

  for (
    var rowIndex = 0;
    rowIndex < values.length;
    rowIndex++
  ) {
    var rowValues =
      values[rowIndex];

    var rawId =
      rowValues[idColumn - 1];

    if (
      rawId === undefined ||
      rawId === null ||
      safeString(rawId).trim() === ''
    ) {
      continue;
    }

    var record = {};

    fields.forEach(
      function (field) {
        record[field.key] =
          normalizeReadValue(
            rowValues[
              columnIndex[field.key] - 1
            ]
          );
      }
    );

    Object.defineProperty(
      record,
      '_row',
      {
        value: rowIndex + 2,
        enumerable: false,
        configurable: true
      }
    );

    records.push(record);
  }

  return records;
}

// =========================================================
// CONSTRUÇÃO DE LINHAS
// =========================================================

function buildRow(
  fields,
  columnIndex,
  id,
  data,
  options
) {
  var settings = options || {};
  var source = data || {};

  var columnCount =
    getMappedColumnCount(
      fields,
      columnIndex
    );

  var rowValues =
    new Array(columnCount).fill('');

  var serverTimestamp =
    formatServerDateTime(
      new Date()
    );

  fields.forEach(function (field) {
    var value;

    if (field.key === 'id') {
      value = id;
    } else if (
      field.key === 'marcaTiempo'
    ) {
      value = settings.isUpdate
        ? serverTimestamp + ' (editado)'
        : serverTimestamp;
    } else {
      value = source[field.key];
    }

    rowValues[
      columnIndex[field.key] - 1
    ] = sanitizeSheetValue(value);
  });

  return rowValues;
}

// =========================================================
// REPOSITÓRIO — LISTAR E ENCONTRAR
// =========================================================

function repositoryList(
  type,
  options
) {
  var settings = options || {};
  var cacheKey =
    'records_' + normalizeKey(type);

  if (!settings.fresh) {
    var cached =
      cacheGetJson(cacheKey);

    if (Array.isArray(cached)) {
      return cached;
    }
  }

  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  var columnIndex =
    ensureColumns(
      sheet,
      fields
    );

  var records = readAllRows(
    sheet,
    fields,
    columnIndex
  );

  cachePutJson(
    cacheKey,
    records,
    settings.cacheTtl ||
      BACKEND_RELEASE
        .CACHE_TTL_SECONDS
  );

  return records;
}

function repositoryFindById(
  type,
  id,
  options
) {
  var recordId = requireId(
    id,
    'ID do registo'
  );

  var settings = options || {};

  if (!settings.fresh) {
    var cachedRecords =
      repositoryList(
        type,
        settings
      );

    for (
      var cacheIndex = 0;
      cacheIndex <
        cachedRecords.length;
      cacheIndex++
    ) {
      if (
        safeString(
          cachedRecords[cacheIndex].id
        ) === recordId
      ) {
        return cachedRecords[
          cacheIndex
        ];
      }
    }

    return null;
  }

  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  var columnIndex =
    ensureColumns(
      sheet,
      fields
    );

  var rowNumber =
    findRowIndexById(
      sheet,
      columnIndex,
      recordId
    );

  if (rowNumber === -1) {
    return null;
  }

  return readRowData(
    sheet,
    fields,
    columnIndex,
    rowNumber
  );
}

function repositoryRequireById(
  type,
  id,
  options
) {
  var record =
    repositoryFindById(
      type,
      id,
      options
    );

  if (!record) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Registo não encontrado',
      {
        tipo: type,
        id: id
      }
    );
  }

  return record;
}

// =========================================================
// REPOSITÓRIO — CRIAR
// =========================================================

function repositoryCreate(
  type,
  data,
  options
) {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados do registo ausentes'
    );
  }

  var settings = options || {};
  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  var columnIndex =
    ensureColumns(
      sheet,
      fields
    );

  var suppliedId =
    Boolean(
      data.id
    );

  var id = suppliedId
    ? requireId(
        data.id,
        'ID do registo'
      )
    : createId(
        settings.idPrefix ||
        type
      );

  var generatedByServer =
    !suppliedId;

  var skipExistenceCheck =
    canSkipRepositoryExistenceCheck(
      type,
      settings,
      generatedByServer
    );

  var existingRow = -1;

  if (!skipExistenceCheck) {
    existingRow =
      findRowIndexById(
        sheet,
        columnIndex,
        id
      );
  }

  /*
   * Operação idempotente:
   *
   * Se o cliente reenviar a mesma criação devido
   * a timeout, não criamos uma segunda linha.
   */
  if (existingRow !== -1) {
    if (
      settings.failIfExists === true
    ) {
      throw apiError(
        API_ERROR_CODES.CONFLICT,
        'Já existe um registo com este ID',
        {
          tipo: type,
          id: id
        }
      );
    }

    return {
      id: id,
      created: false,
      idempotent: true,
      record: readRowData(
        sheet,
        fields,
        columnIndex,
        existingRow
      )
    };
  }

  var recordData =
    Object.assign({}, data, {
      id: id
    });

  var rowValues = buildRow(
    fields,
    columnIndex,
    id,
    recordData,
    {
      isUpdate: false
    }
  );

  var targetRow =
    sheet.getLastRow() + 1;

  sheet.getRange(
    targetRow,
    1,
    1,
    rowValues.length
  ).setValues([rowValues]);

  invalidateTypeCache(type);

  return {
    id: id,
    created: true,
    idempotent: false,
    record: Object.assign(
      {},
      recordData,
      {
        id: id
      }
    )
  };
}

// =========================================================
// REPOSITÓRIO — ATUALIZAR
// =========================================================

function repositoryUpdate(
  type,
  id,
  data,
  options
) {
  var recordId = requireId(
    id,
    'ID do registo'
  );

  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados de atualização inválidos'
    );
  }

  var settings = options || {};
  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  var columnIndex = ensureColumns(
    sheet,
    fields
  );

  var rowNumber = findRowIndexById(
    sheet,
    columnIndex,
    recordId
  );

  if (rowNumber === -1) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Registo não encontrado para atualizar',
      {
        tipo: type,
        id: recordId
      }
    );
  }

  var previousRecord = readRowData(
    sheet,
    fields,
    columnIndex,
    rowNumber
  );

  /*
   * Controlo de concorrência otimista.
   *
   * Se o cliente enviar expectedVersion e outra pessoa
   * já tiver modificado o registo, a atualização é recusada.
   */
  if (
    settings.expectedVersion !== undefined &&
    settings.expectedVersion !== null &&
    safeString(settings.expectedVersion).trim() !== ''
  ) {
    var currentVersion = Number(
      previousRecord.versao || 1
    );

    var expectedVersion = Number(
      settings.expectedVersion
    );

    if (
      !isFinite(expectedVersion) ||
      expectedVersion < 1
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Versão esperada inválida'
      );
    }

    if (
      currentVersion !== expectedVersion
    ) {
      throw apiError(
        API_ERROR_CODES.CONFLICT,
        'O registo foi alterado por outro utilizador. Atualize os dados e tente novamente.',
        {
          id: recordId,
          versaoEsperada:
            expectedVersion,
          versaoAtual:
            currentVersion
        }
      );
    }
  }

  /*
   * Por defeito, a atualização é parcial:
   * os campos não enviados conservam o valor anterior.
   *
   * Use replace:true apenas quando quiser substituir
   * conscientemente todo o conteúdo do registo.
   */
  var nextRecord =
    settings.replace === true
      ? Object.assign(
          {},
          data,
          {
            id: recordId
          }
        )
      : Object.assign(
          {},
          previousRecord,
          data,
          {
            id: recordId
          }
        );

  /*
   * Incrementar a versão apenas nos tipos que possuem
   * o campo "versao", atualmente os tickets.
   */
  if (
    getFieldDefinition(
      fields,
      'versao'
    )
  ) {
    var previousVersion = Number(
      previousRecord.versao || 0
    );

    if (
      !isFinite(previousVersion) ||
      previousVersion < 0
    ) {
      previousVersion = 0;
    }

    nextRecord.versao =
      previousVersion + 1;
  }

  var hasChanges = objectHasChanges(
    previousRecord,
    nextRecord,
    settings.ignoredFields || [
      '_row',
      'marcaTiempo',
      'atualizadoEm',
      'atualizadoPorId'
    ]
  );

  if (
    !hasChanges &&
    settings.allowNoChanges !== true
  ) {
    return {
      id: recordId,
      updated: false,
      unchanged: true,
      before: previousRecord,
      record: previousRecord
    };
  }

  var rowValues = buildRow(
    fields,
    columnIndex,
    recordId,
    nextRecord,
    {
      isUpdate: true
    }
  );

  sheet.getRange(
    rowNumber,
    1,
    1,
    rowValues.length
  ).setValues([rowValues]);

  invalidateTypeCache(type);

  return {
    id: recordId,
    updated: true,
    unchanged: false,
    before: previousRecord,
    record: nextRecord,
    changes: buildObjectDiff(
      previousRecord,
      nextRecord,
      settings.ignoredFields || [
        '_row',
        'marcaTiempo'
      ]
    )
  };
}

function repositoryPatch(
  type,
  id,
  patch,
  options
) {
  var settings = Object.assign(
    {},
    options || {},
    {
      replace: false
    }
  );

  return repositoryUpdate(
    type,
    id,
    patch,
    settings
  );
}

// =========================================================
// REPOSITÓRIO — CRIAÇÃO EM LOTE
// =========================================================

function repositoryCreateBatch(
  type,
  dataArray,
  options
) {
  var rows = requireArray(
    dataArray,
    'Lista de registos',
    BACKEND_RELEASE.MAX_BATCH_SIZE,
    false
  );

  if (!rows.length) {
    return {
      ids: [],
      created: 0,
      skipped: 0,
      records: []
    };
  }

  var settings = options || {};
  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  var columnIndex = ensureColumns(
    sheet,
    fields
  );

  /*
   * IDs já existentes na folha.
   * Permite que o lote seja idempotente.
   */
  var existingIds = {};
  var lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    var idValues = sheet.getRange(
      2,
      columnIndex.id,
      lastRow - 1,
      1
    ).getDisplayValues();

    idValues.forEach(function (row) {
      var existingId =
        safeString(row[0]).trim();

      if (existingId) {
        existingIds[existingId] = true;
      }
    });
  }

  var timestamp =
    new Date().getTime();

  var ids = [];
  var createdRecords = [];
  var sheetRows = [];
  var skipped = 0;

  rows.forEach(
    function (data, index) {
      if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data)
      ) {
        throw apiError(
          API_ERROR_CODES.VALIDATION,
          'Linha ' +
            (index + 1) +
            ': dados inválidos'
        );
      }

      var id = data.id
        ? requireId(
            data.id,
            'ID da linha ' +
              (index + 1)
          )
        : (
            normalizeKey(
              settings.idPrefix ||
              type
            ) +
            '_' +
            timestamp +
            '_' +
            index +
            '_' +
            Utilities
              .getUuid()
              .replace(/-/g, '')
              .substring(0, 8)
          );

      ids.push(id);

      /*
       * Se já existir, não se cria outra linha.
       */
      if (existingIds[id]) {
        if (
          settings.failIfExists === true
        ) {
          throw apiError(
            API_ERROR_CODES.CONFLICT,
            'Linha ' +
              (index + 1) +
              ': já existe um registo com o ID ' +
              id
          );
        }

        skipped++;
        return;
      }

      existingIds[id] = true;

      var record = Object.assign(
        {},
        data,
        {
          id: id
        }
      );

      sheetRows.push(
        buildRow(
          fields,
          columnIndex,
          id,
          record,
          {
            isUpdate: false
          }
        )
      );

      createdRecords.push(record);
    }
  );

  if (sheetRows.length) {
    sheet.getRange(
      sheet.getLastRow() + 1,
      1,
      sheetRows.length,
      sheetRows[0].length
    ).setValues(sheetRows);
  }

  invalidateTypeCache(type);

  return {
    ids: ids,
    created: createdRecords.length,
    skipped: skipped,
    records: createdRecords
  };
}

// =========================================================
// REPOSITÓRIO — ELIMINAÇÃO FÍSICA
// =========================================================

function repositoryDeletePhysical(
  type,
  id,
  options
) {
  var recordId = requireId(
    id,
    'ID do registo'
  );

  var settings = options || {};
  var fields = getFields(type);
  var sheet = getOrCreateSheet(type);

  var columnIndex = ensureColumns(
    sheet,
    fields
  );

  var rowNumber = findRowIndexById(
    sheet,
    columnIndex,
    recordId
  );

  if (rowNumber === -1) {
    if (settings.ignoreMissing) {
      return {
        id: recordId,
        deleted: false,
        missing: true,
        record: null
      };
    }

    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Registo não encontrado para eliminar',
      {
        tipo: type,
        id: recordId
      }
    );
  }

  var previousRecord = readRowData(
    sheet,
    fields,
    columnIndex,
    rowNumber
  );

  sheet.deleteRow(rowNumber);

  invalidateTypeCache(type);

  return {
    id: recordId,
    deleted: true,
    missing: false,
    record: previousRecord
  };
}

// =========================================================
// REPOSITÓRIO — CONSULTA E FILTROS
// =========================================================

function repositoryQuery(
  type,
  predicate,
  options
) {
  var records = repositoryList(
    type,
    options
  );

  if (
    typeof predicate !== 'function'
  ) {
    return records;
  }

  return records.filter(
    function (record, index) {
      return predicate(
        record,
        index
      );
    }
  );
}

function repositoryFindOne(
  type,
  predicate,
  options
) {
  var records = repositoryList(
    type,
    options
  );

  if (
    typeof predicate !== 'function'
  ) {
    return null;
  }

  for (
    var index = 0;
    index < records.length;
    index++
  ) {
    if (
      predicate(
        records[index],
        index
      )
    ) {
      return records[index];
    }
  }

  return null;
}

function repositoryCount(
  type,
  predicate,
  options
) {
  if (
    typeof predicate !== 'function'
  ) {
    return repositoryList(
      type,
      options
    ).length;
  }

  return repositoryQuery(
    type,
    predicate,
    options
  ).length;
}

// =========================================================
// REPOSITÓRIO — ATUALIZAÇÃO DIRETA DE UMA CÉLULA
// =========================================================

function repositoryUpdateField(
  type,
  id,
  fieldKey,
  value
) {
  var recordId = requireId(
    id,
    'ID do registo'
  );

  var fields = getFields(type);

  if (
    !getFieldDefinition(
      fields,
      fieldKey
    )
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Campo inválido: ' +
        safeString(fieldKey)
    );
  }

  var sheet = getOrCreateSheet(type);

  var columnIndex = ensureColumns(
    sheet,
    fields
  );

  var rowNumber = findRowIndexById(
    sheet,
    columnIndex,
    recordId
  );

  if (rowNumber === -1) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Registo não encontrado'
    );
  }

  sheet.getRange(
    rowNumber,
    columnIndex[fieldKey]
  ).setValue(
    sanitizeSheetValue(value)
  );

  invalidateTypeCache(type);

  return {
    id: recordId,
    field: fieldKey,
    value: value
  };
}

// =========================================================
// FUNÇÕES ESPECÍFICAS DE ACESSO ÀS FOLHAS
// Compatibilidade com o backend anterior.
// =========================================================

function getTicketSheet() {
  return getOrCreateSheet('ticket');
}

function ensureTicketColumns(
  sheet
) {
  return ensureColumns(
    sheet || getTicketSheet(),
    TICKET_FIELDS
  );
}

function getEquipSheet() {
  return getOrCreateSheet(
    'equipamento'
  );
}

function ensureEquipColumns(
  sheet
) {
  return ensureColumns(
    sheet || getEquipSheet(),
    EQUIPAMENTO_FIELDS
  );
}

function getAuditSheet() {
  return getOrCreateSheet('audit');
}

function ensureAuditColumns(
  sheet
) {
  return ensureColumns(
    sheet || getAuditSheet(),
    AUDIT_FIELDS
  );
}

function getTicketMaterialSheet() {
  return getOrCreateSheet(
    'ticketMaterial'
  );
}

function ensureTicketMaterialColumns(
  sheet
) {
  return ensureColumns(
    sheet ||
      getTicketMaterialSheet(),
    TICKET_MATERIAL_FIELDS
  );
}

// =========================================================
// COMPATIBILIDADE COM AS FUNÇÕES ANTIGAS
// =========================================================

function listRecords(type) {
  return repositoryList(type);
}

function saveRecord(
  type,
  data,
  uid
) {
  var result = repositoryCreate(
    type,
    data,
    {
      idPrefix: type
    }
  );

  /*
   * A criação específica de tickets regista uma
   * auditoria mais detalhada no TicketService.
   * Para os restantes tipos mantemos auditoria básica.
   */
  if (
    type !== 'ticket' &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'create',
      type,
      result.id,
      {
        depois: result.record
      }
    );
  }

  return result.id;
}

function saveRecordsBatch(
  type,
  dataArray,
  uid
) {
  var result =
    repositoryCreateBatch(
      type,
      dataArray,
      {
        idPrefix: type
      }
    );

  if (
    type !== 'ticket' &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'createBatch',
      type,
      '',
      {
        quantidade:
          result.created,
        ids: result.ids
      }
    );
  }

  return result;
}

function updateRecord(
  type,
  id,
  data,
  uid
) {
  var result = repositoryUpdate(
    type,
    id,
    data,
    {
      replace: false
    }
  );

  if (
    type !== 'ticket' &&
    result.updated &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'update',
      type,
      id,
      {
        alteracoes:
          result.changes,
        antes:
          result.before,
        depois:
          result.record
      }
    );
  }

  return result;
}

function deleteRecord(
  type,
  id,
  uid
) {
  /*
   * Os tickets utilizam arquivo lógico através do
   * TicketService. A eliminação física só deve ser
   * usada por uma operação administrativa explícita.
   */
  if (type === 'ticket') {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'Os tickets não podem ser eliminados diretamente. Utilize o arquivo administrativo.'
    );
  }

  var result =
    repositoryDeletePhysical(
      type,
      id
    );

  if (
    result.deleted &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'delete',
      type,
      id,
      {
        antes: result.record
      }
    );
  }

  return result;
}

function invalidateRecordsCache(type) {
  invalidateTypeCache(type);
}

// =========================================================
// DIAGNÓSTICO DO REPOSITÓRIO
// =========================================================

function diagnoseRepository() {
  var types = [
    'general',
    'quarto',
    'temperatura',
    'ticket',
    'equipamento',
    'user',
    'audit',
    'ticketMaterial'
  ];

  var result = {
    ok: true,
    checkedAt:
      formatIsoDateTime(
        new Date()
      ),
    sheets: {}
  };

  types.forEach(function (type) {
    try {
      var fields = getFields(type);
      var sheet = getOrCreateSheet(type);

      var columns = ensureColumns(
        sheet,
        fields
      );

      result.sheets[type] = {
        ok: true,
        name: sheet.getName(),
        rows: Math.max(
          0,
          sheet.getLastRow() - 1
        ),
        columns:
          Object.keys(columns).length
      };
    } catch (error) {
      result.ok = false;

      result.sheets[type] = {
        ok: false,
        error: safeString(
          error && error.message
            ? error.message
            : error
        )
      };
    }
  });

  return result;
}
// =========================================================
// MARCADOR DE FIM DA PARTE 2
// =========================================================

/*
 * FIM DE 02_SheetsRepository.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 2/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 3/13 — Utilizadores, autenticação e autorização
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 */

// =========================================================
// POLÍTICA DE PIN
// =========================================================

var COMMON_PINS = [
  '1234',
  '4321',
  '0000',
  '1111',
  '2222',
  '3333',
  '4444',
  '5555',
  '6666',
  '7777',
  '8888',
  '9999',
  '1212',
  '1122',
  '1010',
  '1004',
  '2000',
  '2580',
  '123456',
  '654321',
  '111111',
  '121212',
  '123123',
  '112233',
  '000000',
  '12345',
  '54321'
];

var PIN_HASH_ITERATIONS = 3000;
var MAX_LOGIN_FAILURES = 5;
var LOGIN_LOCK_SECONDS = 600;

function validatePinFormat(pin) {
  var value = safeString(pin);

  if (!/^\d{4,8}$/.test(value)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O PIN deve ter 4 a 8 dígitos numéricos'
    );
  }

  return value;
}

function validatePinStrength(pin) {
  var value = validatePinFormat(pin);

  if (/^(\d)\1+$/.test(value)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Esse PIN é demasiado previsível — escolha outro'
    );
  }

  if (
    COMMON_PINS.indexOf(value) !== -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Esse PIN é demasiado comum — escolha outro'
    );
  }

  if (
    '0123456789'.indexOf(value) !== -1 ||
    '9876543210'.indexOf(value) !== -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Esse PIN é demasiado previsível — escolha outro'
    );
  }

  return value;
}

// =========================================================
// HASH E COMPARAÇÃO SEGURA
// =========================================================

function bytesToHex(bytes) {
  return (bytes || []).map(
    function (byteValue) {
      return (
        '0' +
        (
          byteValue & 0xFF
        ).toString(16)
      ).slice(-2);
    }
  ).join('');
}

function sha256Hex(value) {
  var digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      safeString(value),
      Utilities.Charset.UTF_8
    );

  return bytesToHex(digest);
}

function derivePinHash(
  pin,
  salt,
  iterations
) {
  var rounds = Number(
    iterations ||
    PIN_HASH_ITERATIONS
  );

  if (
    !isFinite(rounds) ||
    rounds < 1
  ) {
    rounds = PIN_HASH_ITERATIONS;
  }

  rounds = Math.min(
    rounds,
    10000
  );

  var hash = safeString(
    salt
  ) + ':' + safeString(pin);

  for (
    var index = 0;
    index < rounds;
    index++
  ) {
    hash = sha256Hex(
      hash +
      ':' +
      safeString(salt) +
      ':' +
      index
    );
  }

  return hash;
}

function constantTimeEqual(
  left,
  right
) {
  var leftText =
    safeString(left);

  var rightText =
    safeString(right);

  var maximumLength = Math.max(
    leftText.length,
    rightText.length
  );

  var difference =
    leftText.length ^
    rightText.length;

  for (
    var index = 0;
    index < maximumLength;
    index++
  ) {
    var leftCode = index <
      leftText.length
      ? leftText.charCodeAt(index)
      : 0;

    var rightCode = index <
      rightText.length
      ? rightText.charCodeAt(index)
      : 0;

    difference |=
      leftCode ^ rightCode;
  }

  return difference === 0;
}

function makePinStore(pin) {
  var value =
    validatePinFormat(pin);

  var salt = Utilities
    .getUuid()
    .replace(/-/g, '');

  var iterations =
    PIN_HASH_ITERATIONS;

  var hash = derivePinHash(
    value,
    salt,
    iterations
  );

  return [
    'v2',
    salt,
    iterations,
    hash
  ].join('$');
}

function verifyPin(
  storedPin,
  suppliedPin
) {
  var stored =
    safeString(storedPin);

  var supplied =
    safeString(suppliedPin);

  if (
    !stored ||
    !/^\d{4,8}$/.test(supplied)
  ) {
    return {
      ok: false,
      legacy: false,
      needsUpgrade: false
    };
  }

  var parts = stored.split('$');

  // Formato atual: v2$salt$iterations$hash
  if (
    parts.length === 4 &&
    parts[0] === 'v2'
  ) {
    var iterations =
      Number(parts[2]);

    var calculated =
      derivePinHash(
        supplied,
        parts[1],
        iterations
      );

    return {
      ok: constantTimeEqual(
        calculated,
        parts[3]
      ),

      legacy: false,

      needsUpgrade:
        iterations <
        PIN_HASH_ITERATIONS
    };
  }

  // Compatibilidade com v1$salt$hash.
  if (
    parts.length === 3 &&
    parts[0] === 'v1'
  ) {
    var oldHash = sha256Hex(
      parts[1] +
      ':' +
      supplied
    );

    return {
      ok: constantTimeEqual(
        oldHash,
        parts[2]
      ),

      legacy: true,
      needsUpgrade: true
    };
  }

  // Compatibilidade temporária com PIN em texto simples.
  return {
    ok: constantTimeEqual(
      stored,
      supplied
    ),

    legacy: true,
    needsUpgrade: true
  };
}

// =========================================================
// FOLHA DE UTILIZADORES
// =========================================================

function getOrCreateUsersSheet() {
  var sheet = getOrCreateSheet(
    'user'
  );

  var columnIndex =
    ensureColumns(
      sheet,
      USER_FIELDS
    );

  if (sheet.getLastRow() < 2) {
    seedInitialAdministrator(
      sheet,
      columnIndex
    );
  }

  return sheet;
}

function seedInitialAdministrator(
  sheet,
  columnIndex
) {
  var fields = USER_FIELDS;

  var id = createId('user');

  var initialUser = {
    id: id,
    nombre: 'Administrador',
    usuario: 'admin',
    pin: makePinStore('1234'),
    rol: USER_ROLES.ADMIN,
    activo: 'Sim',
    verSessao: '0',
    deveAlterarPin: 'Sim',
    ultimoLogin: ''
  };

  var rowValues = buildRow(
    fields,
    columnIndex,
    id,
    initialUser,
    {
      isUpdate: false
    }
  );

  sheet.getRange(
    2,
    1,
    1,
    rowValues.length
  ).setValues([rowValues]);

  invalidateTypeCache('user');

  PropertiesService
    .getScriptProperties()
    .setProperty(
      'FIRST_RUN',
      String(Date.now())
    );
}

function getAllUsersRaw(options) {
  getOrCreateUsersSheet();

  return repositoryList(
    'user',
    options
  );
}

function invalidateUsersCache() {
  invalidateTypeCache('user');
}

function buildPublicSessionUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    nome:
      user.nombre ||
      user.nome ||
      user.usuario,

    nombre:
      user.nombre ||
      user.nome ||
      user.usuario,

    usuario: user.usuario,
    rol: user.rol,
    activo: user.activo,

    deveAlterarPin:
      normalizeYesNo(
        user.deveAlterarPin
      ),

    ultimoLogin:
      user.ultimoLogin || ''
  };
}

function listUsers() {
  return getAllUsersRaw().map(
    function (user) {
      return publicUser(user);
    }
  );
}

function findUserById(
  id,
  options
) {
  var userId =
    safeString(id).trim();

  if (!userId) {
    return null;
  }

  return repositoryFindOne(
    'user',
    function (user) {
      return safeString(user.id) ===
        userId;
    },
    options
  );
}

function findUserByUsername(
  username,
  options
) {
  var normalized =
    normalizeUsername(username);

  if (!normalized) {
    return null;
  }

  return repositoryFindOne(
    'user',
    function (user) {
      return normalizeUsername(
        user.usuario
      ) === normalized;
    },
    options
  );
}

function writeUserCell(
  id,
  fieldKey,
  value
) {
  var allowedFields = [
    'nombre',
    'usuario',
    'pin',
    'rol',
    'activo',
    'verSessao',
    'deveAlterarPin',
    'ultimoLogin'
  ];

  if (
    allowedFields.indexOf(
      fieldKey
    ) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Campo de utilizador inválido'
    );
  }

  return repositoryUpdateField(
    'user',
    id,
    fieldKey,
    value
  );
}

// =========================================================
// SEGREDO E TOKENS DE SESSÃO
// =========================================================

function getSecret() {
  var properties =
    PropertiesService
      .getScriptProperties();

  var secret =
    properties.getProperty(
      'SESSION_SECRET'
    );

  if (!secret) {
    secret =
      Utilities.getUuid() +
      Utilities.getUuid() +
      Utilities.getUuid();

    properties.setProperty(
      'SESSION_SECRET',
      secret
    );
  }

  return secret;
}

function hmacHex(payload) {
  var bytes =
    Utilities.computeHmacSignature(
      Utilities.MacAlgorithm
        .HMAC_SHA_256,
      safeString(payload),
      getSecret(),
      Utilities.Charset.UTF_8
    );

  return bytesToHex(bytes);
}

function makeToken(
  userId,
  sessionVersion
) {
  var uid = requireId(
    userId,
    'ID do utilizador'
  );

  var version =
    safeString(
      sessionVersion === undefined
        ? '0'
        : sessionVersion
    );

  var issuedAt = Date.now();

  var expiration =
    issuedAt +
    BACKEND_RELEASE
      .SESSION_TTL_MS;

  var nonce = Utilities
    .getUuid()
    .replace(/-/g, '')
    .substring(0, 16);

  var payload = [
    uid,
    issuedAt,
    expiration,
    version,
    nonce
  ].join('|');

  var encodedPayload =
    Utilities.base64EncodeWebSafe(
      payload,
      Utilities.Charset.UTF_8
    );

  var signature =
    hmacHex(payload);

  return (
    encodedPayload +
    '.' +
    signature
  );
}

function verifyToken(token) {
  try {
    var tokenValue =
      safeString(token).trim();

    if (
      !tokenValue ||
      tokenValue.indexOf('.') === -1
    ) {
      return null;
    }

    var parts =
      tokenValue.split('.');

    if (parts.length !== 2) {
      return null;
    }

    var payload = Utilities
      .newBlob(
        Utilities
          .base64DecodeWebSafe(
            parts[0]
          )
      )
      .getDataAsString();

    var expectedSignature =
      hmacHex(payload);

    if (
      !constantTimeEqual(
        expectedSignature,
        parts[1]
      )
    ) {
      return null;
    }

    var segments =
      payload.split('|');

    if (segments.length !== 5) {
      return null;
    }

    var userId =
      safeString(segments[0]);

    var issuedAt =
      Number(segments[1]);

    var expiration =
      Number(segments[2]);

    var sessionVersion =
      safeString(segments[3]);

    var nonce =
      safeString(segments[4]);

    if (
      !userId ||
      !isFinite(issuedAt) ||
      !isFinite(expiration) ||
      expiration <= Date.now() ||
      issuedAt > Date.now() + 60000 ||
      !nonce
    ) {
      return null;
    }

    return {
      uid: userId,
      iat: issuedAt,
      exp: expiration,
      ver: sessionVersion,
      nonce: nonce
    };
  } catch (error) {
    return null;
  }
}

function bumpSessionVersion(id) {
  var user = findUserById(
    id,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  var currentVersion =
    Number(
      user.verSessao || 0
    );

  if (
    !isFinite(currentVersion) ||
    currentVersion < 0
  ) {
    currentVersion = 0;
  }

  var newVersion =
    currentVersion + 1;

  writeUserCell(
    id,
    'verSessao',
    String(newVersion)
  );

  return newVersion;
}

// =========================================================
// AUTENTICAÇÃO
// =========================================================

function extractRequestToken(
  e,
  body
) {
  if (
    body &&
    body.token
  ) {
    return safeString(
      body.token
    ).trim();
  }

  if (
    e &&
    e.parameter &&
    e.parameter.token
  ) {
    return safeString(
      e.parameter.token
    ).trim();
  }

  return '';
}
// =========================================================
// AUTENTICAÇÃO
// =========================================================

function requireAuth(
  e,
  body,
  adminOnly
) {
  var token =
    extractRequestToken(
      e,
      body
    );

  var tokenData =
    verifyToken(token);

  if (!tokenData) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Sessão inválida ou expirada — inicie sessão novamente'
    );
  }

  var user = findUserById(
    tokenData.uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Sessão inválida — utilizador não encontrado'
    );
  }

  if (isNo(user.activo)) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Este utilizador está desativado. Contacte o administrador.'
    );
  }

  if (
    safeString(
      user.verSessao || '0'
    ) !==
    safeString(tokenData.ver)
  ) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Sessão revogada — inicie sessão novamente'
    );
  }

  if (
    adminOnly &&
    user.rol !== USER_ROLES.ADMIN
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'Esta ação requer permissões de administrador'
    );
  }

  return tokenData.uid;
}

function requireAuthenticatedUser(
  e,
  body
) {
  var uid = requireAuth(
    e,
    body,
    false
  );

  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador autenticado não encontrado'
    );
  }

  return user;
}

// =========================================================
// AUTORIZAÇÃO
// =========================================================

function requireWriter(uid) {
  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  if (isNo(user.activo)) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Este utilizador está desativado'
    );
  }

  if (
    user.rol ===
    USER_ROLES.VISUALIZADOR
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'O seu perfil é apenas de visualização — não pode modificar dados'
    );
  }

  if (
    user.rol !== USER_ROLES.TECNICO &&
    user.rol !== USER_ROLES.ADMIN
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'O perfil do utilizador não permite esta ação'
    );
  }

  return user;
}

function requireAdmin(uid) {
  var user = requireWriter(uid);

  if (
    user.rol !== USER_ROLES.ADMIN
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'Esta ação requer permissões de administrador'
    );
  }

  return user;
}

function hasPermission(
  user,
  permission,
  resource
) {
  if (
    !user ||
    isNo(user.activo)
  ) {
    return false;
  }

  if (
    permission === PERMISSIONS.READ
  ) {
    return true;
  }

  if (
    user.rol === USER_ROLES.ADMIN
  ) {
    return true;
  }

  if (
    user.rol ===
    USER_ROLES.VISUALIZADOR
  ) {
    return false;
  }

  if (
    user.rol !== USER_ROLES.TECNICO
  ) {
    return false;
  }

  var technicianPermissions = [
    PERMISSIONS.WRITE,
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.UPDATE_TICKET,
    PERMISSIONS.START_TICKET,
    PERMISSIONS.PAUSE_TICKET,
    PERMISSIONS.RESOLVE_TICKET
  ];

  if (
    technicianPermissions.indexOf(
      permission
    ) === -1
  ) {
    return false;
  }

  /*
   * Se existir um responsável atribuído, apenas esse
   * técnico ou um administrador poderá executar a ordem.
   */
  if (
    resource &&
    resource.responsavelId &&
    [
      PERMISSIONS.START_TICKET,
      PERMISSIONS.PAUSE_TICKET,
      PERMISSIONS.RESOLVE_TICKET
    ].indexOf(permission) !== -1
  ) {
    return (
      safeString(
        resource.responsavelId
      ) === safeString(user.id)
    );
  }

  return true;
}

function requirePermission(
  uid,
  permission,
  resource
) {
  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  if (
    !hasPermission(
      user,
      permission,
      resource
    )
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'Não tem permissão para realizar esta operação',
      {
        permissao: permission
      }
    );
  }

  return user;
}

// =========================================================
// EXECUÇÃO PROTEGIDA
// =========================================================

function guard(
  e,
  body,
  adminOnly,
  operation
) {
  var uid;

  try {
    uid = requireAuth(
      e,
      body,
      Boolean(adminOnly)
    );
  } catch (authError) {
    return errorOut(
      authError,
      API_ERROR_CODES.AUTH
    );
  }

  try {
    return operation(uid);
  } catch (operationError) {
    return errorOut(
      operationError,
      API_ERROR_CODES.SERVER_ERROR
    );
  }
}

// =========================================================
// CONTROLO DE TENTATIVAS DE LOGIN
// =========================================================

function getLoginFailureKey(
  username
) {
  return (
    'login_failures_' +
    sha256Hex(
      normalizeUsername(username)
    ).substring(0, 24)
  );
}

function getLoginFailures(
  username
) {
  var value = CacheService
    .getScriptCache()
    .get(
      getLoginFailureKey(username)
    );

  var failures = Number(
    value || 0
  );

  return (
    isFinite(failures) &&
    failures >= 0
  )
    ? failures
    : 0;
}

function registerLoginFailure(
  username
) {
  var failures =
    getLoginFailures(username) + 1;

  CacheService
    .getScriptCache()
    .put(
      getLoginFailureKey(username),
      String(failures),
      LOGIN_LOCK_SECONDS
    );

  return failures;
}

function clearLoginFailures(
  username
) {
  cacheRemove(
    getLoginFailureKey(username)
  );
}

// =========================================================
// INÍCIO E FIM DE SESSÃO
// =========================================================

function loginUser(
  usuario,
  pin
) {
  var username =
    normalizeUsername(usuario);

  var suppliedPin =
    safeString(pin);

  if (
    !username ||
    username.length > 40 ||
    !/^[a-zA-Z0-9._-]+$/.test(username)
  ) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador ou PIN incorretos'
    );
  }

  if (
    !/^\d{4,8}$/.test(
      suppliedPin
    )
  ) {
    registerLoginFailure(username);

    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador ou PIN incorretos'
    );
  }

  var failures =
    getLoginFailures(username);

  if (
    failures >= MAX_LOGIN_FAILURES
  ) {
    throw apiError(
      API_ERROR_CODES.RATE_LIMIT,
      'Demasiadas tentativas falhadas. Aguarde 10 minutos e tente novamente.'
    );
  }

  var user = findUserByUsername(
    username,
    {
      fresh: true
    }
  );

  /*
   * Executar uma verificação fictícia reduz a diferença
   * de tempo entre utilizador inexistente e PIN incorreto.
   */
  if (!user) {
    derivePinHash(
      suppliedPin,
      '00000000000000000000000000000000',
      PIN_HASH_ITERATIONS
    );

    registerLoginFailure(username);

    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador ou PIN incorretos'
    );
  }

  var verification =
    verifyPin(
      user.pin,
      suppliedPin
    );

  if (!verification.ok) {
    var newFailures =
      registerLoginFailure(username);

    if (
      newFailures >=
      MAX_LOGIN_FAILURES
    ) {
      throw apiError(
        API_ERROR_CODES.RATE_LIMIT,
        'Demasiadas tentativas falhadas. Aguarde 10 minutos e tente novamente.'
      );
    }

    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador ou PIN incorretos'
    );
  }

  clearLoginFailures(username);

  if (isNo(user.activo)) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Este utilizador está desativado. Contacte o administrador.'
    );
  }

  /*
   * Migrar automaticamente PINs em texto simples,
   * v1 ou com um número antigo de iterações.
   */
  if (
    verification.legacy ||
    verification.needsUpgrade
  ) {
    writeUserCell(
      user.id,
      'pin',
      makePinStore(suppliedPin)
    );

    user = findUserById(
      user.id,
      {
        fresh: true
      }
    ) || user;
  }

  var loginTimestamp =
    formatIsoDateTime(
      new Date()
    );

  writeUserCell(
    user.id,
    'ultimoLogin',
    loginTimestamp
  );

  user.ultimoLogin =
    loginTimestamp;

  var token = makeToken(
    user.id,
    user.verSessao || '0'
  );

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      user.id,
      'login',
      'user',
      user.id,
      {
        usuario: user.usuario
      }
    );
  }

return {
    user:
      buildPublicSessionUser(
        user
      ),

    token:
      token,

    expiresInMs:
      BACKEND_RELEASE
        .SESSION_TTL_MS
  };
}

function logoutUser(uid) {
  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  bumpSessionVersion(uid);

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'logout',
      'user',
      uid
    );
  }

  return {
    ok: true
  };
}

// =========================================================
// CRIAÇÃO DE UTILIZADORES
// =========================================================

function createUser(
  nombre,
  usuario,
  pin,
  rol,
  actorUid
) {
  var displayName = requireText(
    nombre,
    'Nome',
    2,
    80,
    false
  );

  var username =
    normalizeUsername(usuario);

  if (
    !username ||
    username.length > 40 ||
    !/^[a-zA-Z0-9._-]+$/.test(
      username
    )
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O utilizador só pode conter letras, números, ponto, hífen e sublinhado'
    );
  }

  var pinValue =
    validatePinStrength(pin);

  var role = requireEnum(
    rol || USER_ROLES.TECNICO,
    [
      USER_ROLES.ADMIN,
      USER_ROLES.TECNICO,
      USER_ROLES.VISUALIZADOR
    ],
    'Perfil',
    false
  );

  if (
    findUserByUsername(
      username,
      {
        fresh: true
      }
    )
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Já existe um utilizador com esse nome'
    );
  }

  var userData = {
    nombre: displayName,
    usuario: username,
    pin: makePinStore(pinValue),
    rol: role,
    activo: 'Sim',
    verSessao: '0',
    deveAlterarPin: 'Sim',
    ultimoLogin: ''
  };

  var result =
    repositoryCreate(
      'user',
      userData,
      {
        idPrefix: 'user',
        failIfExists: true
      }
    );

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      actorUid,
      'createUser',
      'user',
      result.id,
      {
        usuario: username,
        rol: role
      }
    );
  }

  return publicUser(
    Object.assign(
      {},
      userData,
      {
        id: result.id
      }
    )
  );
}

// =========================================================
// ALTERAÇÃO DO PRÓPRIO PIN
// =========================================================

function changeOwnPin(
  id,
  oldPin,
  newPin
) {
  var user = findUserById(
    id,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  var oldValue =
    safeString(oldPin);

  var newValue =
    validatePinStrength(newPin);

  if (
    !verifyPin(
      user.pin,
      oldValue
    ).ok
  ) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'O seu PIN atual não está correto'
    );
  }

  if (oldValue === newValue) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O novo PIN deve ser diferente do PIN atual'
    );
  }

  repositoryPatch(
    'user',
    id,
    {
      pin: makePinStore(newValue),
      deveAlterarPin: 'Não'
    },
    {
      allowNoChanges: false
    }
  );

  bumpSessionVersion(id);

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      id,
      'changeOwnPin',
      'user',
      id
    );
  }

  return {
    ok: true,
    sessionRevoked: true
  };
}

// =========================================================
// GESTÃO ADMINISTRATIVA DE UTILIZADORES
// =========================================================

function adminSetPin(
  id,
  newPin,
  uid
) {
  requireAdmin(uid);

  var userId = requireId(
    id,
    'ID do utilizador'
  );

  var target = findUserById(
    userId,
    {
      fresh: true
    }
  );

  if (!target) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  var pinValue =
    validatePinStrength(newPin);

  repositoryPatch(
    'user',
    userId,
    {
      pin: makePinStore(pinValue),
      deveAlterarPin: 'Sim'
    }
  );

  bumpSessionVersion(userId);

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'adminSetPin',
      'user',
      userId,
      {
        usuario: target.usuario
      }
    );
  }

  return {
    ok: true,
    sessionRevoked: true
  };
}

function countActiveAdministrators() {
  return getAllUsersRaw(
    {
      fresh: true
    }
  ).filter(function (user) {
    return (
      user.rol ===
        USER_ROLES.ADMIN &&
      !isNo(user.activo)
    );
  }).length;
}

function toggleUserActive(
  id,
  active,
  uid
) {
  requireAdmin(uid);

  var userId = requireId(
    id,
    'ID do utilizador'
  );

  var target = findUserById(
    userId,
    {
      fresh: true
    }
  );

  if (!target) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  var newActive =
    normalizeYesNo(active);

  if (
    newActive === 'Não' &&
    safeString(uid) === userId
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não pode desativar o utilizador com a sessão atual'
    );
  }

  if (
    newActive === 'Não' &&
    target.rol === USER_ROLES.ADMIN &&
    !isNo(target.activo) &&
    countActiveAdministrators() <= 1
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não pode desativar o último administrador ativo'
    );
  }

  repositoryPatch(
    'user',
    userId,
    {
      activo: newActive
    }
  );

  if (newActive === 'Não') {
    bumpSessionVersion(userId);
  }

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'toggleUserActive',
      'user',
      userId,
      {
        usuario: target.usuario,
        antes: target.activo,
        depois: newActive
      }
    );
  }

  return {
    ok: true,
    activo: newActive,
    sessionRevoked:
      newActive === 'Não'
  };
}

// =========================================================
// ELIMINAÇÃO DE UTILIZADORES
// =========================================================

function deleteUser(
  id,
  uid
) {
  requireAdmin(uid);

  var userId = requireId(
    id,
    'ID do utilizador'
  );

  if (
    safeString(uid) === userId
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não pode eliminar o utilizador com a sessão atual'
    );
  }

  var target = findUserById(
    userId,
    {
      fresh: true
    }
  );

  if (!target) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  if (
    target.rol === USER_ROLES.ADMIN &&
    !isNo(target.activo) &&
    countActiveAdministrators() <= 1
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não pode eliminar o último administrador ativo'
    );
  }

  /*
   * Antes de eliminar, revogar todas as sessões.
   * Embora a linha seja apagada logo depois, isto
   * mantém a intenção de segurança explícita.
   */
  bumpSessionVersion(userId);

  var result =
    repositoryDeletePhysical(
      'user',
      userId
    );

  if (
    result.deleted &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'deleteUser',
      'user',
      userId,
      {
        usuario: target.usuario,
        nome: target.nombre,
        rol: target.rol,
        activo: target.activo
      }
    );
  }

  return {
    ok: true,
    deleted: result.deleted,
    userId: userId
  };
}

// =========================================================
// ALTERAÇÃO DO PERFIL DO UTILIZADOR
// =========================================================

function updateUserRole(
  id,
  newRole,
  uid
) {
  requireAdmin(uid);

  var userId = requireId(
    id,
    'ID do utilizador'
  );

  var role = requireEnum(
    newRole,
    [
      USER_ROLES.ADMIN,
      USER_ROLES.TECNICO,
      USER_ROLES.VISUALIZADOR
    ],
    'Perfil',
    false
  );

  var target = findUserById(
    userId,
    {
      fresh: true
    }
  );

  if (!target) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  if (
    target.rol === USER_ROLES.ADMIN &&
    role !== USER_ROLES.ADMIN &&
    !isNo(target.activo) &&
    countActiveAdministrators() <= 1
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não pode alterar o perfil do último administrador ativo'
    );
  }

  if (
    safeString(uid) === userId &&
    role !== USER_ROLES.ADMIN
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não pode retirar o seu próprio perfil de administrador'
    );
  }

  var previousRole =
    target.rol;

  if (previousRole === role) {
    return {
      ok: true,
      changed: false,
      user: publicUser(target)
    };
  }

  repositoryPatch(
    'user',
    userId,
    {
      rol: role
    }
  );

  /*
   * A mudança de perfil revoga todas as sessões,
   * para que as novas permissões sejam aplicadas.
   */
  bumpSessionVersion(userId);

  var updatedUser = findUserById(
    userId,
    {
      fresh: true
    }
  );

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'updateUserRole',
      'user',
      userId,
      {
        usuario: target.usuario,
        antes: previousRole,
        depois: role
      }
    );
  }

  return {
    ok: true,
    changed: true,
    sessionRevoked: true,
    user: publicUser(updatedUser)
  };
}

// =========================================================
// ALTERAÇÃO DOS DADOS BÁSICOS DO UTILIZADOR
// =========================================================

function updateUserProfile(
  id,
  data,
  uid
) {
  requireAdmin(uid);

  var userId = requireId(
    id,
    'ID do utilizador'
  );

  var source = data || {};

  var target = findUserById(
    userId,
    {
      fresh: true
    }
  );

  if (!target) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Utilizador não encontrado'
    );
  }

  var displayName = requireText(
    source.nombre !== undefined
      ? source.nombre
      : target.nombre,
    'Nome',
    2,
    80,
    false
  );

  var username = normalizeUsername(
    source.usuario !== undefined
      ? source.usuario
      : target.usuario
  );

  if (
    !username ||
    username.length > 40 ||
    !/^[a-zA-Z0-9._-]+$/.test(
      username
    )
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O utilizador só pode conter letras, números, ponto, hífen e sublinhado'
    );
  }

  var existingUsername =
    findUserByUsername(
      username,
      {
        fresh: true
      }
    );

  if (
    existingUsername &&
    safeString(existingUsername.id) !==
      userId
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Já existe outro utilizador com esse nome'
    );
  }

  var result = repositoryPatch(
    'user',
    userId,
    {
      nombre: displayName,
      usuario: username
    }
  );

  if (
    result.updated &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'updateUserProfile',
      'user',
      userId,
      {
        alteracoes: result.changes
      }
    );
  }

  return {
    ok: true,
    changed: result.updated,
    user: publicUser(
      result.record
    )
  };
}

// =========================================================
// ESTADO DO PRIMEIRO ARRANQUE
// =========================================================

function getFirstRunDate() {
  var properties =
    PropertiesService
      .getScriptProperties();

  var firstRun =
    properties.getProperty(
      'FIRST_RUN'
    );

  if (!firstRun) {
    firstRun = String(
      Date.now()
    );

    properties.setProperty(
      'FIRST_RUN',
      firstRun
    );
  }

  var timestamp =
    Number(firstRun);

  return (
    isFinite(timestamp) &&
    timestamp > 0
  )
    ? timestamp
    : Date.now();
}

function getSeedStatus() {
  var firstRun =
    getFirstRunDate();

  var daysSinceFirstRun =
    (
      Date.now() - firstRun
    ) / 86400000;

  var admin =
    findUserByUsername(
      'admin',
      {
        fresh: true
      }
    );

  var showSeedNote = false;

  if (
    admin &&
    !isNo(admin.activo) &&
    daysSinceFirstRun < 7
  ) {
    /*
     * Não verificamos o PIN inicial aqui.
     * O campo deveAlterarPin é a fonte de verdade.
     */
    showSeedNote =
      isYes(admin.deveAlterarPin);
  }

  return {
    showSeedNote: showSeedNote,
    firstRunAt:
      new Date(
        firstRun
      ).toISOString()
  };
}

// =========================================================
// CONSULTA DA SESSÃO ATUAL
// =========================================================

function getCurrentSession(
  e,
  body
) {
  var uid = requireAuth(
    e,
    body,
    false
  );

  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  var token = extractRequestToken(
    e,
    body
  );

  var tokenData =
    verifyToken(token);

  return {
    user: publicUser(user),
    session: {
      issuedAt: tokenData
        ? new Date(
            tokenData.iat
          ).toISOString()
        : null,

      expiresAt: tokenData
        ? new Date(
            tokenData.exp
          ).toISOString()
        : null,

      sessionVersion:
        tokenData
          ? tokenData.ver
          : null
    }
  };
}

// =========================================================
// INFORMAÇÃO DE PERMISSÕES PARA O FRONTEND
// =========================================================

function getUserPermissions(user) {
  if (
    !user ||
    isNo(user.activo)
  ) {
    return [];
  }

  if (
    user.rol === USER_ROLES.ADMIN
  ) {
    return [
      PERMISSIONS.READ,
      PERMISSIONS.WRITE,
      PERMISSIONS.ADMIN,
      PERMISSIONS.CREATE_TICKET,
      PERMISSIONS.UPDATE_TICKET,
      PERMISSIONS.ASSIGN_TICKET,
      PERMISSIONS.START_TICKET,
      PERMISSIONS.PAUSE_TICKET,
      PERMISSIONS.RESOLVE_TICKET,
      PERMISSIONS.CLOSE_TICKET,
      PERMISSIONS.REOPEN_TICKET,
      PERMISSIONS.ARCHIVE_TICKET,
      PERMISSIONS.DELETE_TICKET
    ];
  }

  if (
    user.rol === USER_ROLES.TECNICO
  ) {
    return [
      PERMISSIONS.READ,
      PERMISSIONS.WRITE,
      PERMISSIONS.CREATE_TICKET,
      PERMISSIONS.UPDATE_TICKET,
      PERMISSIONS.START_TICKET,
      PERMISSIONS.PAUSE_TICKET,
      PERMISSIONS.RESOLVE_TICKET
    ];
  }

  if (
    user.rol ===
    USER_ROLES.VISUALIZADOR
  ) {
    return [
      PERMISSIONS.READ
    ];
  }

  return [];
}

function buildPublicSessionUser(user) {
  var publicData =
    publicUser(user);

  if (!publicData) {
    return null;
  }

  publicData.permissions =
    getUserPermissions(user);

  return publicData;
}

// =========================================================
// LIMPEZA E RECUPERAÇÃO ADMINISTRATIVA
// =========================================================

function clearLoginLock(
  username,
  actorUid
) {
  if (actorUid) {
    requireAdmin(actorUid);
  }

  var normalized =
    normalizeUsername(username);

  if (!normalized) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Utilizador ausente'
    );
  }

  clearLoginFailures(
    normalized
  );

  if (
    actorUid &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      actorUid,
      'clearLoginLock',
      'user',
      '',
      {
        usuario: normalized
      }
    );
  }

  return {
    ok: true,
    usuario: normalized
  };
}

/*
 * Função manual para recuperação do administrador.
 * Executar apenas a partir do editor do Apps Script.
 */
function clearLoginLockAdmin() {
  var result =
    clearLoginLock(
      'admin',
      null
    );

  Logger.log(
    'Bloqueio eliminado para o utilizador "admin".'
  );

  return result;
}

/*
 * Função manual de emergência.
 *
 * Redefine o PIN do utilizador admin e revoga as
 * respetivas sessões. Deve ser usada apenas pelo
 * proprietário do projeto Apps Script.
 */
function emergencyResetAdminPin(
  newPin
) {
  var pin = validatePinStrength(
    newPin
  );

  var admin =
    findUserByUsername(
      'admin',
      {
        fresh: true
      }
    );

  if (!admin) {
    throw new Error(
      'O utilizador admin não existe'
    );
  }

  repositoryPatch(
    'user',
    admin.id,
    {
      pin: makePinStore(pin),
      deveAlterarPin: 'Sim',
      activo: 'Sim'
    }
  );

  bumpSessionVersion(
    admin.id
  );

  clearLoginFailures(
    'admin'
  );

  Logger.log(
    'PIN do administrador redefinido. Todas as sessões foram revogadas.'
  );

  return {
    ok: true,
    adminId: admin.id,
    sessionRevoked: true
  };
}

// =========================================================
// DIAGNÓSTICO DE AUTENTICAÇÃO
// =========================================================

function diagnoseAuthentication() {
  var users =
    getAllUsersRaw(
      {
        fresh: true
      }
    );

  var activeAdmins =
    users.filter(
      function (user) {
        return (
          user.rol ===
            USER_ROLES.ADMIN &&
          !isNo(user.activo)
        );
      }
    );

  var weakOrLegacyPins =
    users.filter(
      function (user) {
        var stored =
          safeString(user.pin);

        return (
          stored.indexOf('v2$') !== 0
        );
      }
    );

  var mustChangePin =
    users.filter(
      function (user) {
        return isYes(
          user.deveAlterarPin
        );
      }
    );

  return {
    ok:
      activeAdmins.length > 0,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    totalUsers:
      users.length,

    activeUsers:
      users.filter(
        function (user) {
          return !isNo(
            user.activo
          );
        }
      ).length,

    activeAdmins:
      activeAdmins.length,

    usersWithLegacyPin:
      weakOrLegacyPins.map(
        function (user) {
          return user.usuario;
        }
      ),

    usersRequiredToChangePin:
      mustChangePin.map(
        function (user) {
          return user.usuario;
        }
      ),

    sessionTtlHours:
      Math.round(
        BACKEND_RELEASE
          .SESSION_TTL_MS /
        3600000
      )
  };
}

// =========================================================
// MARCADOR DE FIM DA PARTE 3
// =========================================================

/*
 * FIM DE 03_UsersAuth.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 3/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 4/13 — Configurações da aplicação
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 */

// =========================================================
// CAMPOS E VALORES PADRÃO
// =========================================================

var CONFIG_FIELDS = [
  {
    key: 'key',
    label: 'Clave'
  },
  {
    key: 'value',
    label: 'Valor'
  },
  {
    key: 'updatedAt',
    label: 'Atualizado Em'
  },
  {
    key: 'updatedBy',
    label: 'Atualizado Por'
  }
];

var DEFAULT_CONFIG = Object.freeze({
  alertsEnabled: 'Sim',
  alertEmails: '',

  tarifaAgua: '',
  tarifaElectricidad: '',

  rooms: '[]',
  cicloQuartosHechos: '[]',

  baselineAgua: '',
  baselineElectricidad: '',

  fechos_mensais: '[]',

  ref_phMin: '7.0',
  ref_phMax: '7.8',
  ref_cloroMin: '0.5',
  ref_cloroMax: '3.0',
  ref_cloroTotalMax: '5.0',

  ref_aqsMin: '45',
  ref_aqsQuartosMin: '45',

  ref_phCalMin: '7.0',
  ref_phCalMax: '7.8',
  ref_cloroCalMin: '0.5',
  ref_cloroCalMax: '3.0',
  ref_cloroTotalCalMax: '5.0',

  ref_phFriaMin: '7.0',
  ref_phFriaMax: '7.8',
  ref_cloroFriaMin: '0.5',
  ref_cloroFriaMax: '3.0',
  ref_cloroTotalFriaMax: '5.0',

  ticketSlaBaixaResposta: '480',
  ticketSlaBaixaResolucao: '4320',

  ticketSlaMediaResposta: '120',
  ticketSlaMediaResolucao: '1440',

  ticketSlaAltaResposta: '30',
  ticketSlaAltaResolucao: '240',

  ticketSlaCriticaResposta: '15',
  ticketSlaCriticaResolucao: '120'
});

var CONFIG_CACHE_KEY = 'config_all';

// =========================================================
// CHAVES INTERNAS PROIBIDAS
// =========================================================

var FORBIDDEN_CONFIG_KEYS = [
  'SESSION_SECRET',
  'PIN_SECRET',
  'API_SECRET',
  'PASSWORD',
  'TOKEN',
  'PRIVATE_KEY'
];

function validateConfigKey(key) {
  var configKey = safeString(key).trim();

  if (!configKey) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Chave de configuração ausente'
    );
  }

  if (configKey.length > 80) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Chave de configuração demasiado comprida'
    );
  }

  if (
    !/^[a-zA-Z0-9_.-]+$/.test(configKey)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Chave de configuração inválida'
    );
  }

  var normalizedUpper =
    configKey.toUpperCase();

  var isForbidden =
    FORBIDDEN_CONFIG_KEYS.some(
      function (forbiddenKey) {
        return (
          normalizedUpper ===
            forbiddenKey ||
          normalizedUpper.indexOf(
            forbiddenKey + '_'
          ) === 0
        );
      }
    );

  if (isForbidden) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'Esta configuração não pode ser armazenada na folha Config'
    );
  }

  return configKey;
}

// =========================================================
// FOLHA DE CONFIGURAÇÕES
// =========================================================

function getConfigSheet() {
  var sheet =
    getOrCreateSheetByName(
      SHEET_NAMES.CONFIG,
      {
        freezeHeader: true
      }
    );

  ensureColumns(
    sheet,
    CONFIG_FIELDS
  );

  return sheet;
}

function ensureConfigColumns(sheet) {
  return ensureColumns(
    sheet || getConfigSheet(),
    CONFIG_FIELDS
  );
}

function invalidateConfigCache() {
  cacheRemove(CONFIG_CACHE_KEY);
}

// =========================================================
// LEITURA DAS CONFIGURAÇÕES
// =========================================================

function readConfigRows() {
  var sheet = getConfigSheet();

  var columnIndex =
    ensureConfigColumns(sheet);

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  var lastColumn = Math.max(
    sheet.getLastColumn(),
    getMappedColumnCount(
      CONFIG_FIELDS,
      columnIndex
    )
  );

  var values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    lastColumn
  ).getValues();

  var records = [];

  values.forEach(function (row, index) {
    var key = normalizeReadValue(
      row[columnIndex.key - 1]
    );

    if (!safeString(key).trim()) {
      return;
    }

    records.push({
      key: safeString(key),
      value: normalizeReadValue(
        row[columnIndex.value - 1]
      ),
      updatedAt: normalizeReadValue(
        row[
          columnIndex.updatedAt - 1
        ]
      ),
      updatedBy: normalizeReadValue(
        row[
          columnIndex.updatedBy - 1
        ]
      ),
      _row: index + 2
    });
  });

  return records;
}

function getAllConfig(options) {
  var settings = options || {};

  if (!settings.fresh) {
    var cached =
      cacheGetJson(
        CONFIG_CACHE_KEY
      );

    if (
      cached &&
      typeof cached === 'object' &&
      !Array.isArray(cached)
    ) {
      return cached;
    }
  }

  var config = {};

  Object.keys(
    DEFAULT_CONFIG
  ).forEach(function (key) {
    config[key] =
      DEFAULT_CONFIG[key];
  });

  readConfigRows().forEach(
    function (record) {
      config[record.key] =
        record.value;
    }
  );

  cachePutJson(
    CONFIG_CACHE_KEY,
    config,
    BACKEND_RELEASE
      .CACHE_TTL_SECONDS
  );

  return config;
}

function getConfig(
  key,
  defaultValue
) {
  var configKey =
    validateConfigKey(key);

  var config =
    getAllConfig();

  if (
    Object.prototype
      .hasOwnProperty
      .call(config, configKey)
  ) {
    return config[configKey];
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return null;
}

// =========================================================
// CONVERSORES DE CONFIGURAÇÃO
// =========================================================

function getConfigNumber(
  key,
  defaultValue,
  minimum,
  maximum
) {
  var value = getConfig(
    key,
    defaultValue
  );

  var numberValue =
    parseDecimal(
      value,
      defaultValue
    );

  if (
    numberValue === null ||
    !isFinite(numberValue)
  ) {
    return defaultValue;
  }

  if (
    minimum !== undefined &&
    minimum !== null &&
    numberValue < minimum
  ) {
    return defaultValue;
  }

  if (
    maximum !== undefined &&
    maximum !== null &&
    numberValue > maximum
  ) {
    return defaultValue;
  }

  return numberValue;
}

function getConfigBoolean(
  key,
  defaultValue
) {
  var value = getConfig(
    key,
    defaultValue ? 'Sim' : 'Não'
  );

  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return Boolean(defaultValue);
  }

  return !isNo(value);
}

function getConfigJson(
  key,
  defaultValue
) {
  return safeJsonParse(
    getConfig(key, ''),
    defaultValue
  );
}

// =========================================================
// VALIDAÇÃO DOS VALORES
// =========================================================

function validateEmailList(value) {
  var text = safeString(value).trim();

  if (!text) {
    return '';
  }

  var emails = text
    .split(/[;,]/)
    .map(function (email) {
      return email
        .trim()
        .toLowerCase();
    })
    .filter(Boolean);

  if (emails.length > 20) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O máximo permitido é de 20 emails'
    );
  }

  var invalidEmails =
    emails.filter(function (email) {
      return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
        email
      );
    });

  if (invalidEmails.length) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Email inválido: ' +
        invalidEmails.join(', ')
    );
  }

  return emails
    .filter(function (
      email,
      index,
      source
    ) {
      return (
        source.indexOf(email) === index
      );
    })
    .join(', ');
}

function validateRoomsConfig(value) {
  var rooms =
    typeof value === 'string'
      ? safeJsonParse(value, null)
      : value;

  if (!Array.isArray(rooms)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A configuração de quartos deve ser uma lista'
    );
  }

  if (
    rooms.length < 1 ||
    rooms.length > 500
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A lista deve possuir entre 1 e 500 quartos'
    );
  }

  var normalizedRooms = [];

  rooms.forEach(
    function (room, index) {
      var normalized =
        trimText(room, 20)
          .toUpperCase();

      if (!normalized) {
        throw apiError(
          API_ERROR_CODES.VALIDATION,
          'Quarto inválido na posição ' +
            (index + 1)
        );
      }

      if (
        normalizedRooms.indexOf(
          normalized
        ) === -1
      ) {
        normalizedRooms.push(
          normalized
        );
      }
    }
  );

  return JSON.stringify(
    normalizedRooms
  );
}

function validateCycleRoomsConfig(value) {
  var rooms =
    typeof value === 'string'
      ? safeJsonParse(value, null)
      : value;

  if (!Array.isArray(rooms)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O progresso do ciclo deve ser uma lista'
    );
  }

  if (rooms.length > 500) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O progresso do ciclo possui demasiados quartos'
    );
  }

  var normalized = [];

  rooms.forEach(function (room) {
    var item = trimText(
      room,
      20
    ).toUpperCase();

    if (
      item &&
      normalized.indexOf(item) === -1
    ) {
      normalized.push(item);
    }
  });

  return JSON.stringify(normalized);
}

function validateBaselineConfig(
  value,
  label
) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return '';
  }

  var baseline =
    typeof value === 'string'
      ? safeJsonParse(value, null)
      : value;

  if (
    !baseline ||
    typeof baseline !== 'object'
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      (label || 'Linha base') +
        ' inválida'
    );
  }

  var numericValue =
    requireNumberRange(
      baseline.valor,
      0,
      1000000000,
      (label || 'Linha base') +
        ' — valor',
      false
    );

  var date = requireIsoDate(
    baseline.fecha ||
      baseline.data,
    (label || 'Linha base') +
      ' — data',
    false
  );

  return JSON.stringify({
    valor: numericValue,
    fecha: date
  });
}

function validateClosedMonthsConfig(value) {
  var items =
    typeof value === 'string'
      ? safeJsonParse(value, null)
      : value;

  if (!Array.isArray(items)) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O arquivo de fechos mensais deve ser uma lista'
    );
  }

  if (items.length > 240) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O arquivo de fechos mensais ultrapassa o limite permitido'
    );
  }

  var normalized = items.map(
    function (item, index) {
      if (
        !item ||
        typeof item !== 'object'
      ) {
        throw apiError(
          API_ERROR_CODES.VALIDATION,
          'Fecho mensal inválido na posição ' +
            (index + 1)
        );
      }

      var monthKey =
        safeString(
          item.mesKey
        ).trim();

      if (
        !/^\d{4}-\d{2}$/.test(
          monthKey
        )
      ) {
        throw apiError(
          API_ERROR_CODES.VALIDATION,
          'Mês inválido no fecho mensal ' +
            (index + 1)
        );
      }

      return cloneObject(item);
    }
  );

  return safeJsonStringify(
    normalized,
    200000
  );
}

function validateReferenceValue(
  key,
  value
) {
  var ranges = {
    ref_phMin: [0, 14],
    ref_phMax: [0, 14],

    ref_cloroMin: [0, 20],
    ref_cloroMax: [0, 20],
    ref_cloroTotalMax: [0, 20],

    ref_aqsMin: [20, 90],
    ref_aqsQuartosMin: [20, 90],

    ref_phCalMin: [0, 14],
    ref_phCalMax: [0, 14],
    ref_cloroCalMin: [0, 20],
    ref_cloroCalMax: [0, 20],
    ref_cloroTotalCalMax: [0, 20],

    ref_phFriaMin: [0, 14],
    ref_phFriaMax: [0, 14],
    ref_cloroFriaMin: [0, 20],
    ref_cloroFriaMax: [0, 20],
    ref_cloroTotalFriaMax: [0, 20]
  };

  if (!ranges[key]) {
    return null;
  }

  return String(
    requireNumberRange(
      value,
      ranges[key][0],
      ranges[key][1],
      'Valor de referência',
      false
    )
  );
}

function validateTicketSlaConfig(
  key,
  value
) {
  if (
    key.indexOf('ticketSla') !== 0
  ) {
    return null;
  }

  return String(
    requireIntegerRange(
      value,
      1,
      525600,
      'SLA do ticket',
      false
    )
  );
}

function validateConfigValue(
  key,
  value
) {
  if (key === 'alertsEnabled') {
    return normalizeYesNo(value);
  }

  if (key === 'alertEmails') {
    return validateEmailList(value);
  }

  if (
    key === 'tarifaAgua' ||
    key === 'tarifaElectricidad'
  ) {
    if (
      value === undefined ||
      value === null ||
      safeString(value).trim() === ''
    ) {
      return '';
    }

    return String(
      requireNumberRange(
        value,
        0,
        100000,
        'Tarifa',
        false
      )
    );
  }

  if (key === 'rooms') {
    return validateRoomsConfig(value);
  }

  if (
    key === 'cicloQuartosHechos'
  ) {
    return validateCycleRoomsConfig(
      value
    );
  }

  if (key === 'baselineAgua') {
    return validateBaselineConfig(
      value,
      'Linha base de água'
    );
  }

  if (
    key === 'baselineElectricidad'
  ) {
    return validateBaselineConfig(
      value,
      'Linha base de eletricidade'
    );
  }

  if (key === 'fechos_mensais') {
    return validateClosedMonthsConfig(
      value
    );
  }

  var referenceValue =
    validateReferenceValue(
      key,
      value
    );

  if (referenceValue !== null) {
    return referenceValue;
  }

  var slaValue =
    validateTicketSlaConfig(
      key,
      value
    );

  if (slaValue !== null) {
    return slaValue;
  }

  return trimText(value, 5000);
}

// =========================================================
// ESCRITA DE CONFIGURAÇÕES
// =========================================================

function findConfigRow(
  key,
  rows
) {
  var configKey =
    safeString(key).trim();

  var source =
    Array.isArray(rows)
      ? rows
      : readConfigRows();

  for (
    var index = 0;
    index < source.length;
    index++
  ) {
    if (
      safeString(source[index].key) ===
      configKey
    ) {
      return source[index];
    }
  }

  return null;
}

function isAdminConfigKey(key) {
  return (
    ADMIN_CONFIG_KEYS.indexOf(
      safeString(key).trim()
    ) !== -1
  );
}

function requireConfigPermission(
  key,
  uid
) {
  var configKey =
    validateConfigKey(key);

  if (isAdminConfigKey(configKey)) {
    requireAdmin(uid);
    return true;
  }

  /*
   * As configurações não administrativas também
   * exigem um utilizador com permissão de escrita.
   */
  requireWriter(uid);

  return true;
}

function writeConfigValue(
  key,
  value,
  uid
) {
  var configKey =
    validateConfigKey(key);

  var validatedValue =
    validateConfigValue(
      configKey,
      value
    );

  var sheet =
    getConfigSheet();

  var columnIndex =
    ensureConfigColumns(sheet);

  var existing =
    findConfigRow(configKey);

  var updatedAt =
    formatIsoDateTime(
      new Date()
    );

  var updatedBy =
    safeString(uid);

  if (existing) {
    sheet.getRange(
      existing._row,
      columnIndex.value
    ).setValue(
      sanitizeSheetValue(
        validatedValue
      )
    );

    sheet.getRange(
      existing._row,
      columnIndex.updatedAt
    ).setValue(updatedAt);

    sheet.getRange(
      existing._row,
      columnIndex.updatedBy
    ).setValue(updatedBy);
  } else {
    var columnCount =
      getMappedColumnCount(
        CONFIG_FIELDS,
        columnIndex
      );

    var row =
      new Array(columnCount)
        .fill('');

    row[
      columnIndex.key - 1
    ] = sanitizeSheetValue(
      configKey
    );

    row[
      columnIndex.value - 1
    ] = sanitizeSheetValue(
      validatedValue
    );

    row[
      columnIndex.updatedAt - 1
    ] = updatedAt;

    row[
      columnIndex.updatedBy - 1
    ] = updatedBy;

    sheet.getRange(
      sheet.getLastRow() + 1,
      1,
      1,
      row.length
    ).setValues([row]);
  }

  invalidateConfigCache();

  return {
    key: configKey,
    value: validatedValue,
    updatedAt: updatedAt,
    updatedBy: updatedBy
  };
}

/**
 * Compatibilidade com o backend anterior.
 *
 * Se uid for informado, verifica permissões.
 * Chamadas internas sem uid são permitidas para tarefas
 * automáticas e migrações executadas pelo servidor.
 */
function setConfig(
  key,
  value,
  uid
) {
  var configKey =
    validateConfigKey(key);

  if (uid) {
    requireConfigPermission(
      configKey,
      uid
    );
  }

  var previousValue =
    getConfig(
      configKey,
      null
    );

  var result =
    writeConfigValue(
      configKey,
      value,
      uid || 'system'
    );

  if (
    uid &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'setConfig',
      'config',
      configKey,
      {
        antes: previousValue,
        depois: result.value
      }
    );
  }

  return result;
}

function setConfigAuthorized(
  key,
  value,
  uid
) {
  requireConfigPermission(
    key,
    uid
  );

  return setConfig(
    key,
    value,
    uid
  );
}

// =========================================================
// ESCRITA EM LOTE
// =========================================================

function setConfigBatch(
  values,
  uid
) {
  if (
    !values ||
    typeof values !== 'object' ||
    Array.isArray(values)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Configurações inválidas'
    );
  }

  var keys =
    Object.keys(values);

  if (keys.length > 100) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O máximo permitido é de 100 configurações por operação'
    );
  }

  keys.forEach(function (key) {
    requireConfigPermission(
      key,
      uid
    );
  });

  /*
   * Validar todos os valores antes de escrever qualquer
   * alteração, evitando atualizações parcialmente aplicadas.
   */
  var validated = {};

  keys.forEach(function (key) {
    var configKey =
      validateConfigKey(key);

    validated[configKey] =
      validateConfigValue(
        configKey,
        values[key]
      );
  });

  var before = {};

  keys.forEach(function (key) {
    before[key] =
      getConfig(key, null);
  });

  var results = [];

  keys.forEach(function (key) {
    results.push(
      writeConfigValue(
        key,
        validated[key],
        uid
      )
    );
  });

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'setConfigBatch',
      'config',
      '',
      {
        chaves: keys,
        antes: before,
        depois: validated
      }
    );
  }

  return {
    ok: true,
    updated: results.length,
    values: validated
  };
}

// =========================================================
// ELIMINAÇÃO DE CONFIGURAÇÕES
// =========================================================

function deleteConfig(
  key,
  uid
) {
  requireAdmin(uid);

  var configKey =
    validateConfigKey(key);

  var existing =
    findConfigRow(configKey);

  if (!existing) {
    return {
      ok: true,
      deleted: false,
      missing: true,
      key: configKey
    };
  }

  var previousValue =
    existing.value;

  var sheet =
    getConfigSheet();

  sheet.deleteRow(
    existing._row
  );

  invalidateConfigCache();

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'deleteConfig',
      'config',
      configKey,
      {
        antes: previousValue
      }
    );
  }

  return {
    ok: true,
    deleted: true,
    missing: false,
    key: configKey
  };
}

// =========================================================
// VALORES DE REFERÊNCIA TÉCNICOS
// =========================================================

function getTechnicalThresholds() {
  return {
    phMin: getConfigNumber(
      'ref_phMin',
      THRESHOLDS.phMin,
      0,
      14
    ),

    phMax: getConfigNumber(
      'ref_phMax',
      THRESHOLDS.phMax,
      0,
      14
    ),

    cloroMin: getConfigNumber(
      'ref_cloroMin',
      THRESHOLDS.cloroMin,
      0,
      20
    ),

    cloroMax: getConfigNumber(
      'ref_cloroMax',
      THRESHOLDS.cloroMax,
      0,
      20
    ),

    cloroTotalMax: getConfigNumber(
      'ref_cloroTotalMax',
      THRESHOLDS.cloroTotalMax,
      0,
      20
    ),

    aqsMin: getConfigNumber(
      'ref_aqsMin',
      THRESHOLDS.aqsMin,
      20,
      90
    ),

    aqsQuartosMin: getConfigNumber(
      'ref_aqsQuartosMin',
      THRESHOLDS.aqsQuartosMin,
      20,
      90
    ),

    phCalMin: getConfigNumber(
      'ref_phCalMin',
      THRESHOLDS.phCalMin,
      0,
      14
    ),

    phCalMax: getConfigNumber(
      'ref_phCalMax',
      THRESHOLDS.phCalMax,
      0,
      14
    ),

    cloroCalMin: getConfigNumber(
      'ref_cloroCalMin',
      THRESHOLDS.cloroCalMin,
      0,
      20
    ),

    cloroCalMax: getConfigNumber(
      'ref_cloroCalMax',
      THRESHOLDS.cloroCalMax,
      0,
      20
    ),

    cloroTotalCalMax:
      getConfigNumber(
        'ref_cloroTotalCalMax',
        THRESHOLDS
          .cloroTotalCalMax,
        0,
        20
      ),

    phFriaMin: getConfigNumber(
      'ref_phFriaMin',
      THRESHOLDS.phFriaMin,
      0,
      14
    ),

    phFriaMax: getConfigNumber(
      'ref_phFriaMax',
      THRESHOLDS.phFriaMax,
      0,
      14
    ),

    cloroFriaMin: getConfigNumber(
      'ref_cloroFriaMin',
      THRESHOLDS.cloroFriaMin,
      0,
      20
    ),

    cloroFriaMax: getConfigNumber(
      'ref_cloroFriaMax',
      THRESHOLDS.cloroFriaMax,
      0,
      20
    ),

    cloroTotalFriaMax:
      getConfigNumber(
        'ref_cloroTotalFriaMax',
        THRESHOLDS
          .cloroTotalFriaMax,
        0,
        20
      )
  };
}

function validateTechnicalThresholdRelations(
  thresholds
) {
  var values =
    thresholds ||
    getTechnicalThresholds();

  var pairs = [
    [
      'phMin',
      'phMax',
      'pH da piscina'
    ],
    [
      'cloroMin',
      'cloroMax',
      'cloro da piscina'
    ],
    [
      'phCalMin',
      'phCalMax',
      'pH da água quente'
    ],
    [
      'cloroCalMin',
      'cloroCalMax',
      'cloro da água quente'
    ],
    [
      'phFriaMin',
      'phFriaMax',
      'pH da água fria'
    ],
    [
      'cloroFriaMin',
      'cloroFriaMax',
      'cloro da água fria'
    ]
  ];

  pairs.forEach(function (pair) {
    if (
      Number(values[pair[0]]) >=
      Number(values[pair[1]])
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'O valor mínimo de ' +
          pair[2] +
          ' deve ser inferior ao máximo'
      );
    }
  });

  return true;
}

// =========================================================
// SLA CONFIGURÁVEL DOS TICKETS
// =========================================================

var TICKET_SLA_CONFIG_KEYS =
  Object.freeze({
    baixa: Object.freeze({
      resposta:
        'ticketSlaBaixaResposta',
      resolucao:
        'ticketSlaBaixaResolucao'
    }),

    media: Object.freeze({
      resposta:
        'ticketSlaMediaResposta',
      resolucao:
        'ticketSlaMediaResolucao'
    }),

    alta: Object.freeze({
      resposta:
        'ticketSlaAltaResposta',
      resolucao:
        'ticketSlaAltaResolucao'
    }),

    critica: Object.freeze({
      resposta:
        'ticketSlaCriticaResposta',
      resolucao:
        'ticketSlaCriticaResolucao'
    })
  });

function getConfiguredTicketSla(
  priority
) {
  var normalized =
    requireEnum(
      priority,
      TICKET_PRIORITY_VALUES,
      'Prioridade',
      false
    );

  var defaultSla =
    TICKET_SLA[normalized];

  var keys =
    TICKET_SLA_CONFIG_KEYS[
      normalized
    ];

  var responseMinutes =
    getConfigNumber(
      keys.resposta,
      defaultSla.resposta,
      1,
      525600
    );

  var resolutionMinutes =
    getConfigNumber(
      keys.resolucao,
      defaultSla.resolucao,
      1,
      525600
    );

  if (
    responseMinutes >
    resolutionMinutes
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O SLA de resposta não pode ser superior ao SLA de resolução para a prioridade ' +
        normalized
    );
  }

  return {
    resposta:
      Math.round(
        responseMinutes
      ),

    resolucao:
      Math.round(
        resolutionMinutes
      )
  };
}

function calculateConfiguredTicketDeadlines(
  openedAt,
  priority
) {
  var openingDate =
    openedAt instanceof Date
      ? openedAt
      : parseStoredDateTime(
          openedAt
        );

  if (!openingDate) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Data de abertura inválida para calcular o SLA'
    );
  }

  var sla =
    getConfiguredTicketSla(
      priority
    );

  return {
    prazoResposta:
      formatIsoDateTime(
        addMinutes(
          openingDate,
          sla.resposta
        )
      ),

    prazoResolucao:
      formatIsoDateTime(
        addMinutes(
          openingDate,
          sla.resolucao
        )
      ),

    respostaMinutos:
      sla.resposta,

    resolucaoMinutos:
      sla.resolucao
  };
}

// =========================================================
// ALERTAS
// =========================================================

function alertsEnabled() {
  return getConfigBoolean(
    'alertsEnabled',
    true
  );
}

function getAlertEmails() {
  return validateEmailList(
    getConfig(
      'alertEmails',
      ''
    )
  );
}

function getAlertEmailArray() {
  var emails =
    getAlertEmails();

  if (!emails) {
    return [];
  }

  return emails
    .split(',')
    .map(function (email) {
      return email.trim();
    })
    .filter(Boolean);
}

// =========================================================
// TARIFAS
// =========================================================

function getTarifasConfig() {
  var water =
    getConfigNumber(
      'tarifaAgua',
      null,
      0,
      100000
    );

  var electricity =
    getConfigNumber(
      'tarifaElectricidad',
      null,
      0,
      100000
    );

  return {
    agua: water,
    electricidad: electricity,
    elec: electricity
  };
}

// =========================================================
// QUARTOS E CICLO
// =========================================================

function getConfiguredRooms() {
  var rooms =
    getConfigJson(
      'rooms',
      []
    );

  if (
    !Array.isArray(rooms) ||
    !rooms.length
  ) {
    return [];
  }

  return rooms
    .map(function (room) {
      return trimText(
        room,
        20
      ).toUpperCase();
    })
    .filter(Boolean);
}

function getCycleDoneRooms() {
  var rooms =
    getConfigJson(
      'cicloQuartosHechos',
      []
    );

  if (!Array.isArray(rooms)) {
    return [];
  }

  return rooms
    .map(function (room) {
      return trimText(
        room,
        20
      ).toUpperCase();
    })
    .filter(Boolean);
}

// =========================================================
// LINHAS BASE
// =========================================================

function getBaselineConfig(type) {
  var key;

  if (type === 'agua') {
    key = 'baselineAgua';
  } else if (
    type === 'electricidad' ||
    type === 'eletricidade'
  ) {
    key = 'baselineElectricidad';
  } else {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de linha base inválido'
    );
  }

  var value =
    getConfigJson(
      key,
      null
    );

  if (!value) {
    return null;
  }

  var numericValue =
    parseDecimal(
      value.valor,
      null
    );

  var date =
    safeString(
      value.fecha ||
      value.data
    );

  if (
    numericValue === null ||
    !isValidIsoDate(date)
  ) {
    return null;
  }

  return {
    valor: numericValue,
    fecha: date
  };
}

function setBaselineConfig(
  type,
  value,
  date,
  uid
) {
  var key;

  if (type === 'agua') {
    key = 'baselineAgua';
  } else if (
    type === 'electricidad' ||
    type === 'eletricidade'
  ) {
    key = 'baselineElectricidad';
  } else {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de linha base inválido'
    );
  }

  return setConfig(
    key,
    {
      valor: value,
      fecha: date
    },
    uid
  );
}

// =========================================================
// FECHOS MENSAIS
// =========================================================

function getMonthlyClosures() {
  var closures =
    getConfigJson(
      'fechos_mensais',
      []
    );

  return Array.isArray(closures)
    ? closures
    : [];
}

function findMonthlyClosure(
  monthKey
) {
  var key =
    safeString(
      monthKey
    ).trim();

  if (
    !/^\d{4}-\d{2}$/.test(key)
  ) {
    return null;
  }

  var closures =
    getMonthlyClosures();

  for (
    var index = 0;
    index < closures.length;
    index++
  ) {
    if (
      safeString(
        closures[index].mesKey
      ) === key
    ) {
      return closures[index];
    }
  }

  return null;
}

// =========================================================
// GUARDAR FECHO MENSAL
// =========================================================

function saveMonthlyClosure(
  closure,
  uid
) {
  requireAdmin(uid);

  if (
    !closure ||
    typeof closure !== 'object' ||
    Array.isArray(closure)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados do fecho mensal inválidos'
    );
  }

  var monthKey = safeString(
    closure.mesKey
  ).trim();

  if (
    !/^\d{4}-\d{2}$/.test(monthKey)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Mês do fecho inválido (AAAA-MM)'
    );
  }

  var monthParts =
    monthKey.split('-');

  var year =
    Number(monthParts[0]);

  var month =
    Number(monthParts[1]);

  if (
    year < 2000 ||
    year > 2100 ||
    month < 1 ||
    month > 12
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Mês do fecho inválido'
    );
  }

  var now =
    new Date();

  var normalizedClosure =
    Object.assign(
      {},
      cloneObject(closure),
      {
        mesKey: monthKey,

        fechadoPor:
          closure.fechadoPor ||
          safeString(uid),

        fechadoPorId:
          safeString(uid),

        dataFecho:
          closure.dataFecho ||
          formatIsoDateTime(now),

        atualizadoEm:
          formatIsoDateTime(now)
      }
    );

  /*
   * Garantir que os campos numéricos mais importantes
   * não contenham valores inválidos.
   */
  var numericFields = [
    'generalCount',
    'aguaConsumoTotal',
    'elecConsumoTotal',
    'ultimaLeituraAgua',
    'ultimaLeituraElec',
    'piscinaAvgPh',
    'piscinaAvgCloro',
    'aqsAvgRetorno',
    'tempCount',
    'tempConformes',
    'tempDesvios',
    'tempCompliancePct',
    'quartosCount'
  ];

  numericFields.forEach(
    function (field) {
      if (
        normalizedClosure[field] ===
          undefined ||
        normalizedClosure[field] ===
          null ||
        safeString(
          normalizedClosure[field]
        ).trim() === ''
      ) {
        return;
      }

      var numberValue =
        parseDecimal(
          normalizedClosure[field],
          null
        );

      if (numberValue === null) {
        throw apiError(
          API_ERROR_CODES.VALIDATION,
          'Valor inválido no fecho mensal: ' +
            field
        );
      }

      normalizedClosure[field] =
        numberValue;
    }
  );

  normalizedClosure.observacoes =
    trimText(
      normalizedClosure.observacoes,
      1000
    );

  var closures =
    getMonthlyClosures();

  var existingIndex = -1;

  for (
    var index = 0;
    index < closures.length;
    index++
  ) {
    if (
      safeString(
        closures[index].mesKey
      ) === monthKey
    ) {
      existingIndex = index;
      break;
    }
  }

  var previousClosure =
    existingIndex >= 0
      ? cloneObject(
          closures[existingIndex]
        )
      : null;

  if (existingIndex >= 0) {
    closures[existingIndex] =
      normalizedClosure;
  } else {
    closures.push(
      normalizedClosure
    );
  }

  closures.sort(
    function (left, right) {
      return safeString(
        left.mesKey
      ).localeCompare(
        safeString(
          right.mesKey
        )
      );
    }
  );

  setConfig(
    'fechos_mensais',
    closures,
    uid
  );

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      previousClosure
        ? 'updateMonthlyClosure'
        : 'createMonthlyClosure',
      'monthlyClosure',
      monthKey,
      {
        antes: previousClosure,
        depois:
          normalizedClosure
      }
    );
  }

  return {
    ok: true,
    created:
      previousClosure === null,
    updated:
      previousClosure !== null,
    closure:
      normalizedClosure
  };
}

// =========================================================
// ELIMINAR FECHO MENSAL
// =========================================================

function deleteMonthlyClosure(
  monthKey,
  uid
) {
  requireAdmin(uid);

  var key =
    safeString(
      monthKey
    ).trim();

  if (
    !/^\d{4}-\d{2}$/.test(key)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Mês inválido (AAAA-MM)'
    );
  }

  var closures =
    getMonthlyClosures();

  var removed = null;

  var filtered =
    closures.filter(
      function (closure) {
        if (
          safeString(
            closure.mesKey
          ) === key
        ) {
          removed =
            cloneObject(closure);

          return false;
        }

        return true;
      }
    );

  if (!removed) {
    return {
      ok: true,
      deleted: false,
      missing: true,
      mesKey: key
    };
  }

  setConfig(
    'fechos_mensais',
    filtered,
    uid
  );

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'deleteMonthlyClosure',
      'monthlyClosure',
      key,
      {
        antes: removed
      }
    );
  }

  return {
    ok: true,
    deleted: true,
    missing: false,
    mesKey: key
  };
}

// =========================================================
// CONFIGURAÇÃO PÚBLICA PARA O FRONTEND
// =========================================================

var PUBLIC_CONFIG_KEYS = [
  'rooms',
  'cicloQuartosHechos',

  'baselineAgua',
  'baselineElectricidad',

  'tarifaAgua',
  'tarifaElectricidad',

  'ref_phMin',
  'ref_phMax',
  'ref_cloroMin',
  'ref_cloroMax',
  'ref_cloroTotalMax',

  'ref_aqsMin',
  'ref_aqsQuartosMin',

  'ref_phCalMin',
  'ref_phCalMax',
  'ref_cloroCalMin',
  'ref_cloroCalMax',
  'ref_cloroTotalCalMax',

  'ref_phFriaMin',
  'ref_phFriaMax',
  'ref_cloroFriaMin',
  'ref_cloroFriaMax',
  'ref_cloroTotalFriaMax',

  'ticketSlaBaixaResposta',
  'ticketSlaBaixaResolucao',
  'ticketSlaMediaResposta',
  'ticketSlaMediaResolucao',
  'ticketSlaAltaResposta',
  'ticketSlaAltaResolucao',
  'ticketSlaCriticaResposta',
  'ticketSlaCriticaResolucao'
];

var ADMIN_VISIBLE_CONFIG_KEYS =
  PUBLIC_CONFIG_KEYS.concat([
    'alertsEnabled',
    'alertEmails',
    'fechos_mensais'
  ]);

function getVisibleConfigForUser(
  user
) {
  if (!user) {
    return {};
  }

  var source =
    getAllConfig();

  var allowedKeys =
    user.rol === USER_ROLES.ADMIN
      ? ADMIN_VISIBLE_CONFIG_KEYS
      : PUBLIC_CONFIG_KEYS;

  var result = {};

  allowedKeys.forEach(
    function (key) {
      if (
        Object.prototype
          .hasOwnProperty
          .call(source, key)
      ) {
        result[key] =
          source[key];
      }
    }
  );

  return result;
}

// =========================================================
// INICIALIZAÇÃO DE CONFIGURAÇÕES PADRÃO
// =========================================================

function seedDefaultConfig() {
  var existingRows =
    readConfigRows();

  var existingKeys = {};

  existingRows.forEach(
    function (record) {
      existingKeys[
        record.key
      ] = true;
    }
  );

  var created = [];

  Object.keys(
    DEFAULT_CONFIG
  ).forEach(
    function (key) {
      if (existingKeys[key]) {
        return;
      }

      writeConfigValue(
        key,
        DEFAULT_CONFIG[key],
        'system'
      );

      created.push(key);
    }
  );

  invalidateConfigCache();

  return {
    ok: true,
    created: created,
    count: created.length
  };
}

// =========================================================
// VALIDAÇÃO GLOBAL DA CONFIGURAÇÃO
// =========================================================

function validateCompleteConfig() {
  var thresholds =
    getTechnicalThresholds();

  validateTechnicalThresholdRelations(
    thresholds
  );

  TICKET_PRIORITY_VALUES.forEach(
    function (priority) {
      getConfiguredTicketSla(
        priority
      );
    }
  );

  var rooms =
    getConfiguredRooms();

  var cycleDone =
    getCycleDoneRooms();

  var validRooms = {};

  rooms.forEach(
    function (room) {
      validRooms[room] = true;
    }
  );

  var invalidCycleRooms =
    cycleDone.filter(
      function (room) {
        return !validRooms[room];
      }
    );

  return {
    ok: true,
    thresholds: thresholds,
    roomsCount: rooms.length,
    cycleDoneCount:
      cycleDone.length,
    cycleRoomsOutsideConfig:
      invalidCycleRooms,

    tariffs:
      getTarifasConfig(),

    alerts: {
      enabled:
        alertsEnabled(),

      recipients:
        getAlertEmailArray()
          .length
    },

    ticketSla:
      TICKET_PRIORITY_VALUES
        .reduce(
          function (
            output,
            priority
          ) {
            output[priority] =
              getConfiguredTicketSla(
                priority
              );

            return output;
          },
          {}
        )
  };
}

// =========================================================
// DIAGNÓSTICO
// =========================================================

function diagnoseConfig() {
  var result = {
    ok: true,
    checkedAt:
      formatIsoDateTime(
        new Date()
      ),
    errors: [],
    warnings: [],
    details: {}
  };

  try {
    var config =
      getAllConfig(
        {
          fresh: true
        }
      );

    result.details.totalKeys =
      Object.keys(config).length;

    result.details.validation =
      validateCompleteConfig();

    if (
      !result.details
        .validation.roomsCount
    ) {
      result.warnings.push(
        'A lista de quartos ainda não está configurada.'
      );
    }

    if (
      result.details
        .validation.alerts.enabled &&
      result.details
        .validation.alerts
        .recipients === 0
    ) {
      result.warnings.push(
        'Os alertas estão ativos, mas não existem destinatários configurados.'
      );
    }

    if (
      result.details
        .validation
        .cycleRoomsOutsideConfig
        .length
    ) {
      result.warnings.push(
        'O ciclo contém quartos que já não pertencem à lista configurada.'
      );
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// MIGRAÇÃO DA CONFIGURAÇÃO ANTIGA
// =========================================================

function migrateLegacyConfig() {
  var result =
    seedDefaultConfig();

  /*
   * Corrigir automaticamente configurações antigas
   * cujo valor não seja JSON válido.
   */
  var roomsRaw =
    getConfig('rooms', '[]');

  if (
    !Array.isArray(
      safeJsonParse(
        roomsRaw,
        null
      )
    )
  ) {
    setConfig(
      'rooms',
      '[]'
    );

    result.created.push(
      'rooms:reset'
    );
  }

  var cycleRaw =
    getConfig(
      'cicloQuartosHechos',
      '[]'
    );

  if (
    !Array.isArray(
      safeJsonParse(
        cycleRaw,
        null
      )
    )
  ) {
    setConfig(
      'cicloQuartosHechos',
      '[]'
    );

    result.created.push(
      'cicloQuartosHechos:reset'
    );
  }

  var closuresRaw =
    getConfig(
      'fechos_mensais',
      '[]'
    );

  if (
    !Array.isArray(
      safeJsonParse(
        closuresRaw,
        null
      )
    )
  ) {
    setConfig(
      'fechos_mensais',
      '[]'
    );

    result.created.push(
      'fechos_mensais:reset'
    );
  }

  invalidateConfigCache();

  result.count =
    result.created.length;

  return result;
}

// =========================================================
// MARCADOR DE FIM DA PARTE 4
// =========================================================

/*
 * FIM DE 04_ConfigService.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 4/13 está completa.
 */
 /**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 5/13 — Registos operacionais:
 * instalações gerais e quartos
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 * - 04_ConfigService.gs
 */

// =========================================================
// NORMALIZAÇÃO DE QUARTOS
// =========================================================

function normalizeRoomNumber(value) {
  var text = trimText(
    value,
    20
  ).toUpperCase();

  if (!text) {
    return '';
  }

  var numericMatch = text.match(
    /(?:QUARTO|HAB|ROOM|Q\.?)?\s*(\d+)/i
  );

  if (
    numericMatch &&
    numericMatch[1]
  ) {
    var number =
      numericMatch[1];

    if (number.length < 3) {
      number = (
        '000' + number
      ).slice(-3);
    }

    return number;
  }

  return text;
}

function requireRoomNumber(value) {
  var room =
    normalizeRoomNumber(value);

  if (!room) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'É necessário indicar o número do quarto'
    );
  }

  if (room.length > 20) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O número do quarto é demasiado comprido'
    );
  }

  return room;
}

// =========================================================
// VALORES SIM/NÃO
// =========================================================

function normalizeOptionalYesNo(value) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return 'Não';
  }

  return normalizeYesNo(value);
}

// =========================================================
// VALIDAÇÃO COMUM
// =========================================================

function normalizeOperationalDateTime(data) {
  var source = data || {};

  var date = requireIsoDate(
    source.fecha,
    'Data',
    false
  );

  var time = requireTime(
    source.hora || '00:00',
    'Hora',
    false
  );

  return {
    fecha: date,
    hora: time
  };
}

function normalizeOperationalUser(
  uid
) {
  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  return trimText(
    user.nombre ||
      user.nome ||
      user.usuario,
    80
  );
}

// =========================================================
// REGISTO GERAL — VALIDAÇÃO
// =========================================================

function prepareGeneralRecord(
  data,
  uid,
  existingRecord
) {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados do registo geral ausentes'
    );
  }

  var existing =
    existingRecord || {};

  var merged = Object.assign(
    {},
    existing,
    data
  );

  var dateTime =
    normalizeOperationalDateTime(
      merged
    );

  var water = requireNumberRange(
    merged.agua,
    0,
    1000000000,
    'Água (contador)',
    true
  );

  var electricity =
    requireNumberRange(
      merged.electricidad,
      0,
      10000000000,
      'Eletricidade (contador)',
      true
    );

  var returnAqs =
    requireNumberRange(
      merged.retornoAqs,
      -5,
      95,
      'Retorno AQS',
      true
    );

  var roomAqs =
    requireNumberRange(
      merged.aqsQuartos,
      -5,
      95,
      'AQS dos quartos',
      true
    );

  var poolTemperature =
    requireNumberRange(
      merged.tempPiscina,
      -5,
      95,
      'Temperatura da piscina',
      true
    );

  var poolPh =
    requireNumberRange(
      merged.phPiscina,
      0,
      14,
      'pH da piscina',
      true
    );

  var freeChlorine =
    requireNumberRange(
      merged.cloroLibre,
      0,
      20,
      'Cloro livre',
      true
    );

  var totalChlorine =
    requireNumberRange(
      merged.cloroTotal,
      0,
      20,
      'Cloro total',
      true
    );

  var poolState =
    trimText(
      merged.estadoPiscina,
      20
    );

  if (
    poolState &&
    [
      'Clara',
      'Turbia'
    ].indexOf(poolState) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Estado da piscina inválido'
    );
  }

  return {
    fecha: dateTime.fecha,
    hora: dateTime.hora,

    usuario:
      normalizeOperationalUser(uid),

    agua:
      water === null
        ? ''
        : String(water),

    electricidad:
      electricity === null
        ? ''
        : String(electricity),

    retornoAqs:
      returnAqs === null
        ? ''
        : String(returnAqs),

    aqsQuartos:
      roomAqs === null
        ? ''
        : String(roomAqs),

    estadoPiscina:
      poolState,

    lavadoPrefiltro:
      normalizeOptionalYesNo(
        merged.lavadoPrefiltro
      ),

    lavadoFiltroArena:
      normalizeOptionalYesNo(
        merged.lavadoFiltroArena
      ),

    limpiezaSkimmer:
      normalizeOptionalYesNo(
        merged.limpiezaSkimmer
      ),

    tempPiscina:
      poolTemperature === null
        ? ''
        : String(poolTemperature),

    phPiscina:
      poolPh === null
        ? ''
        : String(poolPh),

    cloroLibre:
      freeChlorine === null
        ? ''
        : String(freeChlorine),

    cloroTotal:
      totalChlorine === null
        ? ''
        : String(totalChlorine),

    observacoes:
      trimText(
        merged.observacoes,
        500
      )
  };
}

// =========================================================
// REGISTO DE QUARTO — VALIDAÇÃO
// =========================================================

function prepareRoomRecord(
  data,
  uid,
  existingRecord
) {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados da leitura de quarto ausentes'
    );
  }

  var existing =
    existingRecord || {};

  var merged = Object.assign(
    {},
    existing,
    data
  );

  var dateTime =
    normalizeOperationalDateTime(
      merged
    );

  var roomNumber =
    requireRoomNumber(
      merged.numero
    );

  function optionalMeasurement(
    key,
    minimum,
    maximum,
    label
  ) {
    var value =
      requireNumberRange(
        merged[key],
        minimum,
        maximum,
        label,
        true
      );

    return value === null
      ? ''
      : String(value);
  }

  return {
    fecha: dateTime.fecha,
    hora: dateTime.hora,

    usuario:
      normalizeOperationalUser(uid),

    numero: roomNumber,

    phCaliente:
      optionalMeasurement(
        'phCaliente',
        0,
        14,
        'pH da água quente'
      ),

    cloroCaliente:
      optionalMeasurement(
        'cloroCaliente',
        0,
        20,
        'Cloro livre da água quente'
      ),

    cloroTotalCaliente:
      optionalMeasurement(
        'cloroTotalCaliente',
        0,
        20,
        'Cloro total da água quente'
      ),

    phFria:
      optionalMeasurement(
        'phFria',
        0,
        14,
        'pH da água fria'
      ),

    cloroFria:
      optionalMeasurement(
        'cloroFria',
        0,
        20,
        'Cloro livre da água fria'
      ),

    cloroTotalFria:
      optionalMeasurement(
        'cloroTotalFria',
        0,
        20,
        'Cloro total da água fria'
      )
  };
}

// =========================================================
// COMPATIBILIDADE COM A VALIDAÇÃO ANTIGA
// =========================================================

function validateRecordData(
  type,
  data,
  uid
) {
  if (type === 'general') {
    if (uid) {
      return prepareGeneralRecord(
        data,
        uid,
        null
      );
    }

    normalizeOperationalDateTime(
      data
    );

    return true;
  }

  if (type === 'quarto') {
    if (uid) {
      return prepareRoomRecord(
        data,
        uid,
        null
      );
    }

    normalizeOperationalDateTime(
      data
    );

    requireRoomNumber(
      data.numero
    );

    return true;
  }

  if (type === 'temperatura') {
    /*
     * A validação profunda das temperaturas
     * está implementada em 06_Refrigeration.gs.
     */
    if (
      typeof prepareTemperaturaRecord ===
      'function'
    ) {
      return prepareTemperaturaRecord(
        data,
        uid
      );
    }

    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'O módulo de refrigeração ainda não está carregado'
    );
  }

  throw apiError(
    API_ERROR_CODES.VALIDATION,
    'Tipo de registo inválido'
  );
}

// =========================================================
// SERVIÇO DE CRIAÇÃO
// =========================================================

function createOperationalRecord(
  type,
  data,
  uid,
  options
) {
  requireWriter(uid);

  var prepared;

  if (type === 'general') {
    prepared =
      prepareGeneralRecord(
        data,
        uid,
        null
      );
  } else if (type === 'quarto') {
    prepared =
      prepareRoomRecord(
        data,
        uid,
        null
      );
  } else {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de registo operacional inválido'
    );
  }

  var settings = options || {};

  if (
    settings.id &&
    !prepared.id
  ) {
    prepared.id =
      settings.id;
  } else if (
    data &&
    data.id
  ) {
    prepared.id =
      requireId(
        data.id,
        'ID do registo'
      );
  }

  var result =
    repositoryCreate(
      type,
      prepared,
      {
        idPrefix: type,
        failIfExists:
          settings.failIfExists === true
      }
    );

  if (
    result.created &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'create',
      type,
      result.id,
      {
        depois:
          result.record
      },
      settings.requestId
    );
  }

  if (
    result.created &&
    typeof checkAndSendAlerts ===
      'function'
  ) {
    checkAndSendAlerts(
      type,
      prepared,
      uid
    );
  }

  return {
    ok: true,
    id: result.id,
    created: result.created,
    idempotent:
      result.idempotent,
    record: result.record
  };
}

// =========================================================
// SERVIÇO DE ATUALIZAÇÃO
// =========================================================

function updateOperationalRecord(
  type,
  id,
  data,
  uid,
  options
) {
  requireWriter(uid);

  if (
    type !== 'general' &&
    type !== 'quarto'
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de registo inválido para atualização'
    );
  }

  var existing =
    repositoryRequireById(
      type,
      id,
      {
        fresh: true
      }
    );

  var prepared =
    type === 'general'
      ? prepareGeneralRecord(
          data,
          uid,
          existing
        )
      : prepareRoomRecord(
          data,
          uid,
          existing
        );

  var settings = options || {};

  var result =
    repositoryUpdate(
      type,
      id,
      prepared,
      {
        replace: false,
        expectedVersion:
          settings.expectedVersion
      }
    );

  if (
    result.updated &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'update',
      type,
      id,
      {
        alteracoes:
          result.changes,
        antes:
          result.before,
        depois:
          result.record
      },
      settings.requestId
    );
  }

  if (
    result.updated &&
    typeof checkAndSendAlerts ===
      'function'
  ) {
    checkAndSendAlerts(
      type,
      prepared,
      uid
    );
  }

  return {
    ok: true,
    id: id,
    updated: result.updated,
    unchanged:
      result.unchanged,
    record: result.record
  };
}

// =========================================================
// SERVIÇO DE ELIMINAÇÃO
// =========================================================

function deleteOperationalRecord(
  type,
  id,
  uid,
  options
) {
  requireAdmin(uid);

  if (
    [
      'general',
      'quarto',
      'temperatura'
    ].indexOf(type) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de registo inválido para eliminação'
    );
  }

  var settings = options || {};

  var result =
    repositoryDeletePhysical(
      type,
      id
    );

  if (
    result.deleted &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'delete',
      type,
      id,
      {
        antes: result.record
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    id: id,
    deleted: result.deleted
  };
}

// =========================================================
// IMPORTAÇÃO EM LOTE
// =========================================================
// LISTAGEM DE REGISTOS OPERACIONAIS
// =========================================================

function listOperationalRecords(
  type,
  filters,
  options
) {
  if (
    [
      'general',
      'quarto'
    ].indexOf(type) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de registo inválido'
    );
  }

  var criteria = filters || {};

  return repositoryQuery(
    type,
    function (record) {
      var date =
        safeString(
          record.fecha
        );

      if (
        criteria.desde &&
        date <
          safeString(
            criteria.desde
          )
      ) {
        return false;
      }

      if (
        criteria.hasta &&
        date >
          safeString(
            criteria.hasta
          )
      ) {
        return false;
      }

      if (
        type === 'quarto' &&
        criteria.numero &&
        normalizeRoomNumber(
          record.numero
        ) !==
          normalizeRoomNumber(
            criteria.numero
          )
      ) {
        return false;
      }

      return true;
    },
    options
  );
}

// =========================================================
// CICLO DE QUARTOS
// =========================================================

function getDefaultRoomsList() {
  var rooms = [];

  for (
    var ground = 1;
    ground <= 4;
    ground++
  ) {
    rooms.push(
      ('000' + ground).slice(-3)
    );
  }

  for (
    var floor = 1;
    floor <= 4;
    floor++
  ) {
    for (
      var room = 1;
      room <= 9;
      room++
    ) {
      rooms.push(
        String(floor) +
        ('00' + room).slice(-2)
      );
    }
  }

  return rooms;
}

function getOperationalRoomsList() {
  var configuredRooms =
    getConfiguredRooms();

  var source =
    configuredRooms.length
      ? configuredRooms
      : getDefaultRoomsList();

  var normalized = [];

  source.forEach(function (room) {
    var roomNumber =
      normalizeRoomNumber(room);

    if (
      roomNumber &&
      normalized.indexOf(
        roomNumber
      ) === -1
    ) {
      normalized.push(
        roomNumber
      );
    }
  });

  return normalized;
}

function sortRoomRecordsChronologically(
  records
) {
  return (records || [])
    .slice()
    .sort(
      function (left, right) {
        var leftKey =
          safeString(
            left.fecha
          ) +
          ' ' +
          safeString(
            left.hora || '00:00'
          ) +
          ' ' +
          safeString(
            left.id
          );

        var rightKey =
          safeString(
            right.fecha
          ) +
          ' ' +
          safeString(
            right.hora || '00:00'
          ) +
          ' ' +
          safeString(
            right.id
          );

        return leftKey.localeCompare(
          rightKey
        );
      }
    );
}

function buildRoomCycleSummary(
  index,
  records,
  roomRecordMap,
  roomList,
  isActive
) {
  var sourceRecords =
    records || [];

  var map =
    roomRecordMap || {};

  var configuredRooms =
    roomList || [];

  var uniqueRooms =
    configuredRooms.filter(
      function (room) {
        return Boolean(
          map[room]
        );
      }
    );

  var totalRooms =
    configuredRooms.length;

  var doneCount =
    uniqueRooms.length;

  var completed =
    totalRooms > 0 &&
    doneCount >= totalRooms;

  var startDate = '';
  var endDate = '';

  if (sourceRecords.length) {
    startDate =
      safeString(
        sourceRecords[0].fecha
      );

    endDate =
      safeString(
        sourceRecords[
          sourceRecords.length - 1
        ].fecha
      );
  }

  var representativeRecords =
    uniqueRooms.map(
      function (room) {
        return map[room];
      }
    );

  return {
    index: index,

    label: completed
      ? (
          'Ciclo #' +
          index +
          ' completo (' +
          doneCount +
          '/' +
          totalRooms +
          ')'
        )
      : (
          'Ciclo #' +
          index +
          ' em curso (' +
          doneCount +
          '/' +
          totalRooms +
          ')'
        ),

    fechaInicio:
      startDate || '—',

    fechaFin:
      endDate || '—',

    totalRooms: totalRooms,
    doneCount: doneCount,

    pendingCount:
      Math.max(
        0,
        totalRooms - doneCount
      ),

    progressPct:
      totalRooms > 0
        ? Math.min(
            100,
            Math.round(
              doneCount /
              totalRooms *
              100
            )
          )
        : 0,

    isCompleted: completed,
    isActive: Boolean(isActive),

    uniqueRooms:
      uniqueRooms.slice(),

    pendingRooms:
      configuredRooms.filter(
        function (room) {
          return !map[room];
        }
      ),

    records:
      sourceRecords.slice(),

    representativeRecords:
      representativeRecords,

    roomsMap:
      cloneObject(map)
  };
}

/**
 * Agrupa todo o histórico de quartos em ciclos contínuos.
 *
 * Um ciclo termina apenas quando todos os quartos
 * configurados possuem pelo menos uma leitura.
 *
 * Leituras repetidas do mesmo quarto não aumentam
 * o progresso; a leitura mais recente representa
 * esse quarto dentro do ciclo.
 */
function groupRoomRecordsIntoCycles(
  rawRecords,
  configuredRooms
) {
  var roomList =
    (
      configuredRooms &&
      configuredRooms.length
    )
      ? configuredRooms
      : getOperationalRoomsList();

  roomList = roomList
    .map(normalizeRoomNumber)
    .filter(Boolean);

  var uniqueRoomList = [];

  roomList.forEach(
    function (room) {
      if (
        uniqueRoomList.indexOf(
          room
        ) === -1
      ) {
        uniqueRoomList.push(room);
      }
    }
  );

  roomList = uniqueRoomList;

  var validRooms = {};

  roomList.forEach(
    function (room) {
      validRooms[room] = true;
    }
  );

  var sortedRecords =
    sortRoomRecordsChronologically(
      rawRecords || []
    );

  var completedCycles = [];

  var cycleIndex = 1;
  var cycleRecords = [];
  var cycleRoomsMap = {};

  sortedRecords.forEach(
    function (record) {
      var room =
        normalizeRoomNumber(
          record.numero
        );

      /*
       * Conservamos o registo no histórico do ciclo,
       * mesmo quando o quarto já não pertence à lista.
       * Porém, só os quartos configurados contam
       * para completar o ciclo.
       */
      cycleRecords.push(record);

      if (
        !room ||
        !validRooms[room]
      ) {
        return;
      }

      cycleRoomsMap[room] =
        record;

      var completed =
        roomList.length > 0 &&
        roomList.every(
          function (
            configuredRoom
          ) {
            return Boolean(
              cycleRoomsMap[
                configuredRoom
              ]
            );
          }
        );

      if (!completed) {
        return;
      }

      var completedCycle =
        buildRoomCycleSummary(
          cycleIndex,
          cycleRecords,
          cycleRoomsMap,
          roomList,
          false
        );

      completedCycle.isCompleted =
        true;

      completedCycle.isActive =
        false;

      completedCycles.push(
        completedCycle
      );

      cycleIndex++;
      cycleRecords = [];
      cycleRoomsMap = {};
    }
  );

  /*
   * Existe sempre um ciclo atual.
   * Pode estar vazio se o último registo completou
   * exatamente o ciclo anterior.
   */
  var currentCycle =
    buildRoomCycleSummary(
      cycleIndex,
      cycleRecords,
      cycleRoomsMap,
      roomList,
      true
    );

  currentCycle.isActive = true;
  currentCycle.isCompleted = false;

  currentCycle.label =
    'Ciclo atual em curso (' +
    currentCycle.doneCount +
    '/' +
    currentCycle.totalRooms +
    ')';

  return {
    completedCycles:
      completedCycles,

    currentCycle:
      currentCycle,

    allCycles:
      completedCycles.concat([
        currentCycle
      ]),

    totalConfiguredRooms:
      roomList.length,

    configuredRooms:
      roomList
  };
}

function getRoomCycles(options) {
  var settings = options || {};

  var records =
    repositoryList(
      'quarto',
      {
        fresh:
          Boolean(
            settings.fresh
          )
      }
    );

  if (settings.hasta) {
    var endDate =
      requireIsoDate(
        settings.hasta,
        'Data final',
        false
      );

    records = records.filter(
      function (record) {
        return (
          safeString(
            record.fecha
          ) <= endDate
        );
      }
    );
  }

  return groupRoomRecordsIntoCycles(
    records,
    settings.rooms ||
      getOperationalRoomsList()
  );
}

function getCurrentRoomCycle(
  options
) {
  return getRoomCycles(
    options
  ).currentCycle;
}

function recomputeCurrentRoomCycle(
  uid
) {
  requireAdmin(uid);

  var cycle =
    getCurrentRoomCycle({
      fresh: true
    });

  setConfig(
    'cicloQuartosHechos',
    cycle.uniqueRooms,
    uid
  );

  if (
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'recomputeRoomCycle',
      'quartoCycle',
      String(cycle.index),
      {
        doneCount:
          cycle.doneCount,

        totalRooms:
          cycle.totalRooms,

        rooms:
          cycle.uniqueRooms
      }
    );
  }

  return {
    ok: true,
    cycle: cycle
  };
}

// =========================================================
// AVALIAÇÃO DE CONFORMIDADE — REGISTO GERAL
// =========================================================

function evaluateGeneralRecord(
  record,
  thresholds
) {
  var data = record || {};

  var limits =
    thresholds ||
    getTechnicalThresholds();

  var deviations = [];

  function checkRange(
    field,
    label,
    minimum,
    maximum,
    unit
  ) {
    var value =
      parseDecimal(
        data[field],
        null
      );

    if (value === null) {
      return;
    }

    if (
      minimum !== null &&
      minimum !== undefined &&
      value < minimum
    ) {
      deviations.push({
        field: field,
        label: label,
        value: value,
        unit: unit || '',
        rule: 'min',
        expected: minimum,
        message:
          label +
          ': ' +
          value +
          (unit ? ' ' + unit : '') +
          ' abaixo do mínimo ' +
          minimum +
          (unit ? ' ' + unit : '')
      });

      return;
    }

    if (
      maximum !== null &&
      maximum !== undefined &&
      value > maximum
    ) {
      deviations.push({
        field: field,
        label: label,
        value: value,
        unit: unit || '',
        rule: 'max',
        expected: maximum,
        message:
          label +
          ': ' +
          value +
          (unit ? ' ' + unit : '') +
          ' acima do máximo ' +
          maximum +
          (unit ? ' ' + unit : '')
      });
    }
  }

  checkRange(
    'phPiscina',
    'pH da piscina',
    limits.phMin,
    limits.phMax,
    ''
  );

  checkRange(
    'cloroLibre',
    'Cloro livre',
    limits.cloroMin,
    limits.cloroMax,
    'ppm'
  );

  checkRange(
    'cloroTotal',
    'Cloro total',
    null,
    limits.cloroTotalMax,
    'ppm'
  );

  checkRange(
    'retornoAqs',
    'Retorno AQS',
    limits.aqsMin,
    null,
    '°C'
  );

  checkRange(
    'aqsQuartos',
    'AQS dos quartos',
    limits.aqsQuartosMin,
    null,
    '°C'
  );

  return {
    compliant:
      deviations.length === 0,

    deviationCount:
      deviations.length,

    deviations:
      deviations
  };
}

// =========================================================
// AVALIAÇÃO DE CONFORMIDADE — QUARTOS
// =========================================================

function evaluateRoomRecord(
  record,
  thresholds
) {
  var data = record || {};

  var limits =
    thresholds ||
    getTechnicalThresholds();

  var deviations = [];

  function checkRange(
    field,
    label,
    minimum,
    maximum,
    unit
  ) {
    var value =
      parseDecimal(
        data[field],
        null
      );

    if (value === null) {
      return;
    }

    var outside =
      (
        minimum !== null &&
        minimum !== undefined &&
        value < minimum
      ) ||
      (
        maximum !== null &&
        maximum !== undefined &&
        value > maximum
      );

    if (outside) {
      deviations.push({
        field: field,
        label: label,
        value: value,
        unit: unit || '',
        minimum: minimum,
        maximum: maximum,
        message:
          label +
          ': ' +
          value +
          (unit ? ' ' + unit : '') +
          ' fora do intervalo ' +
          (
            minimum !== null &&
            minimum !== undefined
              ? minimum
              : '—'
          ) +
          '–' +
          (
            maximum !== null &&
            maximum !== undefined
              ? maximum
              : '—'
          ) +
          (unit ? ' ' + unit : '')
      });
    }
  }

  checkRange(
    'phCaliente',
    'pH da água quente',
    limits.phCalMin,
    limits.phCalMax,
    ''
  );

  checkRange(
    'cloroCaliente',
    'Cloro livre da água quente',
    limits.cloroCalMin,
    limits.cloroCalMax,
    'ppm'
  );

  checkRange(
    'cloroTotalCaliente',
    'Cloro total da água quente',
    null,
    limits.cloroTotalCalMax,
    'ppm'
  );

  checkRange(
    'phFria',
    'pH da água fria',
    limits.phFriaMin,
    limits.phFriaMax,
    ''
  );

  checkRange(
    'cloroFria',
    'Cloro livre da água fria',
    limits.cloroFriaMin,
    limits.cloroFriaMax,
    'ppm'
  );

  checkRange(
    'cloroTotalFria',
    'Cloro total da água fria',
    null,
    limits.cloroTotalFriaMax,
    'ppm'
  );

  return {
    compliant:
      deviations.length === 0,

    deviationCount:
      deviations.length,

    deviations:
      deviations
  };
}

// =========================================================
// COMPATIBILIDADE COM ALERTAS ANTIGOS
// =========================================================

function detectOutOfRange(data) {
  return evaluateGeneralRecord(
    data
  ).deviations.map(
    function (deviation) {
      return deviation.message;
    }
  );
}

// =========================================================
// ESTATÍSTICAS OPERACIONAIS
// =========================================================

function getOperationalStats(
  desde,
  hasta
) {
  var start = requireIsoDate(
    desde,
    'Data inicial',
    false
  );

  var end = requireIsoDate(
    hasta,
    'Data final',
    false
  );

  if (start > end) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var generalRecords =
    listOperationalRecords(
      'general',
      {
        desde: start,
        hasta: end
      }
    );

  var roomRecords =
    listOperationalRecords(
      'quarto',
      {
        desde: start,
        hasta: end
      }
    );

  var thresholds =
    getTechnicalThresholds();

  var generalEvaluations =
    generalRecords.map(
      function (record) {
        return evaluateGeneralRecord(
          record,
          thresholds
        );
      }
    );

  var roomEvaluations =
    roomRecords.map(
      function (record) {
        return evaluateRoomRecord(
          record,
          thresholds
        );
      }
    );

  var generalDeviationRecords =
    generalEvaluations.filter(
      function (evaluation) {
        return !evaluation.compliant;
      }
    ).length;

  var roomDeviationRecords =
    roomEvaluations.filter(
      function (evaluation) {
        return !evaluation.compliant;
      }
    ).length;

  var measuredRooms = {};

  roomRecords.forEach(
    function (record) {
      var room =
        normalizeRoomNumber(
          record.numero
        );

      if (room) {
        measuredRooms[room] =
          true;
      }
    }
  );

  return {
    desde: start,
    hasta: end,

    general: {
      total:
        generalRecords.length,

      conformes:
        generalRecords.length -
        generalDeviationRecords,

      comDesvios:
        generalDeviationRecords,

      totalDesvios:
        generalEvaluations.reduce(
          function (
            sum,
            evaluation
          ) {
            return (
              sum +
              evaluation
                .deviationCount
            );
          },
          0
        )
    },

    quartos: {
      totalLeituras:
        roomRecords.length,

      quartosUnicos:
        Object.keys(
          measuredRooms
        ).length,

      conformes:
        roomRecords.length -
        roomDeviationRecords,

      comDesvios:
        roomDeviationRecords,

      totalDesvios:
        roomEvaluations.reduce(
          function (
            sum,
            evaluation
          ) {
            return (
              sum +
              evaluation
                .deviationCount
            );
          },
          0
        )
    }
  };
}

// =========================================================
// CUMPRIMENTO DE REGISTOS GERAIS
// =========================================================

// =========================================================
// CUMPRIMENTO DE REGISTOS GERAIS
// =========================================================

function computeCompliance(
  desde,
  hasta
) {
  var start = requireIsoDate(
    desde,
    'Data inicial',
    false
  );

  var end = requireIsoDate(
    hasta,
    'Data final',
    false
  );

  if (start > end) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var records =
    repositoryList('general');

  var daysWithRecords = {};

  records.forEach(function (record) {
    var date =
      safeString(record.fecha);

    if (
      date >= start &&
      date <= end
    ) {
      daysWithRecords[date] = true;
    }
  });

  var startParts =
    start.split('-');

  var endParts =
    end.split('-');

  var startDate = new Date(
    Number(startParts[0]),
    Number(startParts[1]) - 1,
    Number(startParts[2]),
    12,
    0,
    0
  );

  var endDate = new Date(
    Number(endParts[0]),
    Number(endParts[1]) - 1,
    Number(endParts[2]),
    12,
    0,
    0
  );

  var total = 0;
  var covered = 0;
  var missing = [];

  for (
    var cursor =
      new Date(startDate);
    cursor <= endDate;
    cursor.setDate(
      cursor.getDate() + 1
    )
  ) {
    var dateKey =
      formatServerDate(cursor);

    total++;

    if (daysWithRecords[dateKey]) {
      covered++;
    } else {
      missing.push(dateKey);
    }
  }

  return {
    desde: start,
    hasta: end,
    total: total,
    covered: covered,
    missing: missing,

    pct:
      total > 0
        ? Math.round(
            covered /
            total *
            100
          )
        : 0
  };
}

// =========================================================
// CONSUMOS POR DIFERENÇA DE CONTADORES
// =========================================================

function sortGeneralRecords(
  records
) {
  return (records || [])
    .slice()
    .sort(function (left, right) {
      var leftKey =
        safeString(left.fecha) +
        ' ' +
        safeString(
          left.hora || '00:00'
        );

      var rightKey =
        safeString(right.fecha) +
        ' ' +
        safeString(
          right.hora || '00:00'
        );

      return leftKey.localeCompare(
        rightKey
      );
    });
}

function calculateCounterDeltas(
  records,
  baselines
) {
  var source =
    sortGeneralRecords(records);

  var baselineData =
    baselines || {};

  var waterBaseline =
    baselineData.agua ||
    getBaselineConfig('agua');

  var electricityBaseline =
    baselineData.electricidad ||
    getBaselineConfig(
      'electricidad'
    );

  var previousWater =
    waterBaseline
      ? Number(
          waterBaseline.valor
        )
      : null;

  var previousElectricity =
    electricityBaseline
      ? Number(
          electricityBaseline.valor
        )
      : null;

  var previousWaterDate =
    waterBaseline
      ? waterBaseline.fecha
      : '';

  var previousElectricityDate =
    electricityBaseline
      ? electricityBaseline.fecha
      : '';

  return source.map(
    function (record) {
      var water =
        parseDecimal(
          record.agua,
          null
        );

      var electricity =
        parseDecimal(
          record.electricidad,
          null
        );

      var waterDelta = null;
      var electricityDelta = null;

      var waterReset = false;
      var electricityReset = false;

      if (
        water !== null &&
        previousWater !== null
      ) {
        waterDelta =
          water - previousWater;

        if (waterDelta < 0) {
          waterReset = true;
          waterDelta = null;
        }
      }

      if (
        electricity !== null &&
        previousElectricity !== null
      ) {
        electricityDelta =
          electricity -
          previousElectricity;

        if (
          electricityDelta < 0
        ) {
          electricityReset = true;
          electricityDelta = null;
        }
      }

      var result =
        Object.assign(
          {},
          record,
          {
            deltaAgua:
              waterDelta,

            deltaElectricidad:
              electricityDelta,

            resetAgua:
              waterReset,

            resetElectricidad:
              electricityReset,

            anteriorAgua:
              previousWater,

            anteriorElectricidad:
              previousElectricity,

            fechaAnteriorAgua:
              previousWaterDate,

            fechaAnteriorElectricidad:
              previousElectricityDate
          }
        );

      if (water !== null) {
        previousWater = water;
        previousWaterDate =
          record.fecha;
      }

      if (
        electricity !== null
      ) {
        previousElectricity =
          electricity;

        previousElectricityDate =
          record.fecha;
      }

      return result;
    }
  );
}

function calculateConsumptionStats(
  records,
  desde,
  hasta
) {
  var start = requireIsoDate(
    desde,
    'Data inicial',
    false
  );

  var end = requireIsoDate(
    hasta,
    'Data final',
    false
  );

  if (start > end) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var deltas =
    calculateCounterDeltas(
      records ||
      repositoryList('general')
    );

  var periodRecords =
    deltas.filter(
      function (record) {
        return (
          record.fecha >= start &&
          record.fecha <= end
        );
      }
    );

  var waterTotal = 0;
  var electricityTotal = 0;
  var waterDeltaCount = 0;
  var electricityDeltaCount = 0;
  var waterResets = 0;
  var electricityResets = 0;

  periodRecords.forEach(
    function (record) {
      if (
        record.deltaAgua !== null
      ) {
        waterTotal +=
          Number(
            record.deltaAgua
          );

        waterDeltaCount++;
      }

      if (
        record.deltaElectricidad !==
        null
      ) {
        electricityTotal +=
          Number(
            record.deltaElectricidad
          );

        electricityDeltaCount++;
      }

      if (record.resetAgua) {
        waterResets++;
      }

      if (
        record.resetElectricidad
      ) {
        electricityResets++;
      }
    }
  );

  return {
    desde: start,
    hasta: end,

    aguaTotal:
      Math.round(
        waterTotal * 100
      ) / 100,

    electricidadTotal:
      Math.round(
        electricityTotal * 100
      ) / 100,

    aguaDeltaCount:
      waterDeltaCount,

    electricidadDeltaCount:
      electricityDeltaCount,

    aguaResets:
      waterResets,

    electricidadResets:
      electricityResets,

    records:
      periodRecords
  };
}

// =========================================================
// RESUMO PARA BOOTSTRAP
// =========================================================

function getOperationalBootstrapData() {
  var general =
    repositoryList('general');

  var quartos =
    repositoryList('quarto');

  var cycles =
    groupRoomRecordsIntoCycles(
      quartos,
      getOperationalRoomsList()
    );

  return {
    records: {
      general: general,
      quarto: quartos
    },

    roomCycle: {
      current:
        cycles.currentCycle,

      completedCount:
        cycles.completedCycles
          .length,

      configuredRooms:
        cycles.configuredRooms
    }
  };
}

// =========================================================
// DIAGNÓSTICO DOS REGISTOS OPERACIONAIS
// =========================================================

function diagnoseOperationalRecords() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    general: {},
    quartos: {},
    cycle: {},
    errors: []
  };

  try {
    var general =
      repositoryList(
        'general',
        {
          fresh: true
        }
      );

    var quartos =
      repositoryList(
        'quarto',
        {
          fresh: true
        }
      );

    var invalidGeneral = [];
    var invalidRooms = [];

    general.forEach(
      function (record) {
        try {
          normalizeOperationalDateTime(
            record
          );
        } catch (error) {
          invalidGeneral.push({
            id: record.id,
            error:
              safeString(
                error.message ||
                error
              )
          });
        }
      }
    );

    quartos.forEach(
      function (record) {
        try {
          normalizeOperationalDateTime(
            record
          );

          requireRoomNumber(
            record.numero
          );
        } catch (error) {
          invalidRooms.push({
            id: record.id,
            error:
              safeString(
                error.message ||
                error
              )
          });
        }
      }
    );

    var cycles =
      groupRoomRecordsIntoCycles(
        quartos,
        getOperationalRoomsList()
      );

    result.general = {
      total: general.length,

      invalid:
        invalidGeneral.length,

      invalidRecords:
        invalidGeneral
    };

    result.quartos = {
      total: quartos.length,

      uniqueRooms:
        Object.keys(
          quartos.reduce(
            function (
              output,
              record
            ) {
              var room =
                normalizeRoomNumber(
                  record.numero
                );

              if (room) {
                output[room] = true;
              }

              return output;
            },
            {}
          )
        ).length,

      invalid:
        invalidRooms.length,

      invalidRecords:
        invalidRooms
    };

    result.cycle = {
      completed:
        cycles.completedCycles
          .length,

      currentIndex:
        cycles.currentCycle
          .index,

      currentDone:
        cycles.currentCycle
          .doneCount,

      currentTotal:
        cycles.currentCycle
          .totalRooms,

      currentProgress:
        cycles.currentCycle
          .progressPct
    };

    result.ok =
      invalidGeneral.length === 0 &&
      invalidRooms.length === 0;
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// MARCADOR DE FIM DA PARTE 5
// =========================================================

/*
 * FIM DE 05_OperationalRecords.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 5/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 6/13 — Refrigeração e equipamentos
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 * - 04_ConfigService.gs
 * - 05_OperationalRecords.gs
 */

// =========================================================
// NORMALIZAÇÃO DOS TIPOS DE EQUIPAMENTO
// =========================================================

function normalizeEquipmentType(value) {
  var text = safeString(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    );

  var aliases = {
    frigorifico: 'Frigorifico',
    refrigerador: 'Frigorifico',
    frigorífico: 'Frigorifico',

    congelador: 'Congelador',
    freezer: 'Congelador',

    vinheira: 'Vinheira',
    vinera: 'Vinheira',

    garrafeira: 'Garrafeira',
    adega: 'Adega',
    cave: 'Adega'
  };

  return aliases[text] || '';
}

function isRangeEquipment(equipment) {
  if (!equipment) {
    return false;
  }

  var type =
    normalizeEquipmentType(
      equipment.tipo
    );

  return [
    'Vinheira',
    'Garrafeira',
    'Adega'
  ].indexOf(type) !== -1;
}

function isFreezerEquipment(equipment) {
  return (
    equipment &&
    normalizeEquipmentType(
      equipment.tipo
    ) === 'Congelador'
  );
}

function isPositiveTemperatureEquipment(
  equipment
) {
  if (!equipment) {
    return false;
  }

  return !isFreezerEquipment(
    equipment
  );
}

// =========================================================
// LISTAGEM E LOCALIZAÇÃO DE EQUIPAMENTOS
// =========================================================

function getAllEquipamentosRaw(options) {
  return repositoryList(
    'equipamento',
    options
  );
}

function invalidateEquipCache() {
  invalidateTypeCache(
    'equipamento'
  );
}

function listEquipamentos(options) {
  var settings = options || {};

  var records =
    getAllEquipamentosRaw(
      settings
    );

  if (
    settings.includeInactive !== true
  ) {
    records = records.filter(
      function (equipment) {
        return !isNo(
          equipment.ativo
        );
      }
    );
  }

  return records.map(
    function (equipment) {
      return {
        id: equipment.id,
        nome: equipment.nome,
        tipo:
          normalizeEquipmentType(
            equipment.tipo
          ) ||
          equipment.tipo,

        ubicacao:
          equipment.ubicacao || '',

        min:
          parseDecimal(
            equipment.min,
            null
          ),

        max:
          parseDecimal(
            equipment.max,
            null
          ),

        ativo:
          isNo(equipment.ativo)
            ? 'Não'
            : 'Sim',

        tipoRegisto:
          isRangeEquipment(
            equipment
          )
            ? 'rango'
            : 'simples'
      };
    }
  );
}

function findEquipmentById(
  id,
  options
) {
  var equipmentId =
    safeString(id).trim();

  if (!equipmentId) {
    return null;
  }

  return repositoryFindById(
    'equipamento',
    equipmentId,
    options
  );
}

function findEquipmentByName(
  name,
  options
) {
  var normalizedName =
    safeString(name)
      .trim()
      .toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return repositoryFindOne(
    'equipamento',
    function (equipment) {
      return (
        safeString(
          equipment.nome
        )
          .trim()
          .toLowerCase() ===
        normalizedName
      );
    },
    options
  );
}

function resolveEquipamento(
  data,
  options
) {
  var source = data || {};

  var equipmentId =
    safeString(
      source.equipamentoId ||
      source.id
    ).trim();

  if (equipmentId) {
    var byId =
      findEquipmentById(
        equipmentId,
        options
      );

    if (byId) {
      return byId;
    }
  }

  var equipmentName =
    safeString(
      source.nome ||
      source.equipamento
    ).trim();

  if (equipmentName) {
    return findEquipmentByName(
      equipmentName,
      options
    );
  }

  return null;
}

// =========================================================
// VALIDAÇÃO E PREPARAÇÃO DE EQUIPAMENTOS
// =========================================================

function prepareEquipmentRecord(
  data,
  existingRecord
) {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados do equipamento ausentes'
    );
  }

  var existing =
    existingRecord || {};

  var merged = Object.assign(
    {},
    existing,
    data
  );

  var name = requireText(
    merged.nome,
    'Nome do equipamento',
    2,
    80,
    false
  );

  var type =
    normalizeEquipmentType(
      merged.tipo
    );

  if (!type) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de equipamento inválido'
    );
  }

  var defaults =
    EQUIP_TIPOS[type];

  if (!defaults) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O tipo de equipamento não possui intervalo padrão'
    );
  }

  var minimum =
    requireNumberRange(
      merged.min === undefined ||
      merged.min === null ||
      safeString(
        merged.min
      ).trim() === ''
        ? defaults.min
        : merged.min,
      -80,
      80,
      'Temperatura mínima',
      false
    );

  var maximum =
    requireNumberRange(
      merged.max === undefined ||
      merged.max === null ||
      safeString(
        merged.max
      ).trim() === ''
        ? defaults.max
        : merged.max,
      -80,
      80,
      'Temperatura máxima',
      false
    );

  if (minimum >= maximum) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A temperatura mínima deve ser inferior à máxima'
    );
  }

  if (
    type === 'Congelador' &&
    maximum >= 0
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O congelador deve possuir uma temperatura máxima negativa'
    );
  }

  if (
    type !== 'Congelador' &&
    minimum < 0
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Este tipo de equipamento exige um intervalo de temperatura positivo'
    );
  }

  return {
    nome: name,

    tipo: type,

    ubicacao:
      trimText(
        merged.ubicacao,
        80
      ),

    min: String(minimum),
    max: String(maximum),

    ativo:
      isNo(merged.ativo)
        ? 'Não'
        : 'Sim'
  };
}

// =========================================================
// CRIAR OU ATUALIZAR EQUIPAMENTO
// =========================================================

function saveEquipamento(
  data,
  uid,
  options
) {
  if (uid) {
    requireAdmin(uid);
  }

  var settings = options || {};

  var equipmentId =
    safeString(
      data && data.id
    ).trim();

  var existing = equipmentId
    ? findEquipmentById(
        equipmentId,
        {
          fresh: true
        }
      )
    : null;

  if (
    equipmentId &&
    !existing
  ) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Equipamento não encontrado para atualizar'
    );
  }

  var prepared =
    prepareEquipmentRecord(
      data,
      existing
    );

  var duplicate =
    findEquipmentByName(
      prepared.nome,
      {
        fresh: true
      }
    );

  if (
    duplicate &&
    safeString(duplicate.id) !==
      equipmentId &&
    !isNo(duplicate.ativo)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Já existe um equipamento ativo com esse nome'
    );
  }

  var result;

  if (existing) {
    result = repositoryUpdate(
      'equipamento',
      equipmentId,
      prepared,
      {
        replace: false
      }
    );

    if (
      result.updated &&
      uid &&
      typeof logAudit ===
        'function'
    ) {
      logAudit(
        uid,
        'updateEquipamento',
        'equipamento',
        equipmentId,
        {
          alteracoes:
            result.changes,

          antes:
            result.before,

          depois:
            result.record
        },
        settings.requestId
      );
    }

    return Object.assign(
      {
        ok: true,
        created: false,
        updated:
          result.updated
      },
      result.record
    );
  }

  result = repositoryCreate(
    'equipamento',
    prepared,
    {
      idPrefix: 'eq',
      failIfExists: true
    }
  );

  if (
    uid &&
    typeof logAudit ===
      'function'
  ) {
    logAudit(
      uid,
      'createEquipamento',
      'equipamento',
      result.id,
      {
        depois:
          result.record
      },
      settings.requestId
    );
  }

  return Object.assign(
    {
      ok: true,
      created: true,
      updated: false
    },
    result.record
  );
}

// =========================================================
// ATIVAR OU DESATIVAR EQUIPAMENTO
// =========================================================

function toggleEquipmentActive(
  id,
  active,
  uid,
  options
) {
  requireAdmin(uid);

  var equipment =
    repositoryRequireById(
      'equipamento',
      id,
      {
        fresh: true
      }
    );

  var newActive =
    normalizeYesNo(active);

  var settings = options || {};

  var result =
    repositoryPatch(
      'equipamento',
      equipment.id,
      {
        ativo: newActive
      }
    );

  if (
    result.updated &&
    typeof logAudit ===
      'function'
  ) {
    logAudit(
      uid,
      'toggleEquipamento',
      'equipamento',
      equipment.id,
      {
        nome:
          equipment.nome,

        antes:
          equipment.ativo,

        depois:
          newActive
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    id: equipment.id,
    ativo: newActive,
    updated: result.updated
  };
}

// =========================================================
// ELIMINAR EQUIPAMENTO
// =========================================================

function deleteEquipamento(
  id,
  uid,
  options
) {
  if (uid) {
    requireAdmin(uid);
  }

  var equipmentId =
    requireId(
      id,
      'ID do equipamento'
    );

  var equipment =
    findEquipmentById(
      equipmentId,
      {
        fresh: true
      }
    );

  if (!equipment) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Equipamento não encontrado'
    );
  }

  /*
   * Se já existirem leituras, o equipamento não é
   * eliminado fisicamente. Fica apenas inativo,
   * preservando o histórico de HACCP.
   */
  var hasReadings =
    repositoryCount(
      'temperatura',
      function (record) {
        return (
          safeString(
            record.equipamentoId
          ) === equipmentId
        );
      },
      {
        fresh: true
      }
    ) > 0;

  var settings = options || {};

  if (hasReadings) {
    var disabled =
      repositoryPatch(
        'equipamento',
        equipmentId,
        {
          ativo: 'Não'
        }
      );

    if (
      uid &&
      typeof logAudit ===
        'function'
    ) {
      logAudit(
        uid,
        'archiveEquipamento',
        'equipamento',
        equipmentId,
        {
          motivo:
            'O equipamento possui leituras históricas',

          antes:
            equipment,

          depois:
            disabled.record
        },
        settings.requestId
      );
    }

    return {
      ok: true,
      deleted: false,
      archived: true,
      id: equipmentId
    };
  }

  var result =
    repositoryDeletePhysical(
      'equipamento',
      equipmentId
    );

  if (
    result.deleted &&
    uid &&
    typeof logAudit ===
      'function'
  ) {
    logAudit(
      uid,
      'deleteEquipamento',
      'equipamento',
      equipmentId,
      {
        antes: equipment
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    deleted: result.deleted,
    archived: false,
    id: equipmentId
  };
}

// =========================================================
// INTERPRETAÇÃO DE LEITURAS
// =========================================================

function parseTemperatureRange(
  rawValue
) {
  var text =
    safeString(rawValue)
      .trim()
      .replace(/,/g, '.');

  if (!text) {
    return null;
  }

  var match = text.match(
    /^(-?\d+(?:\.\d+)?)\s*(?:a|até|[-–—/]|\.{2})\s*(-?\d+(?:\.\d+)?)$/i
  );

  if (!match) {
    return null;
  }

  var first =
    Number(match[1]);

  var second =
    Number(match[2]);

  if (
    !isFinite(first) ||
    !isFinite(second)
  ) {
    return null;
  }

  return {
    min: Math.min(
      first,
      second
    ),

    max: Math.max(
      first,
      second
    )
  };
}

function normalizeTemperatureInput(
  data,
  equipment
) {
  var source = data || {};
  var rangeEquipment =
    isRangeEquipment(
      equipment
    );

  if (rangeEquipment) {
    var minimum =
      parseDecimal(
        source.temperaturaMin,
        null
      );

    var maximum =
      parseDecimal(
        source.temperaturaMax,
        null
      );

    if (
      minimum === null ||
      maximum === null
    ) {
      var parsedRange =
        parseTemperatureRange(
          source.temperatura
        );

      if (parsedRange) {
        minimum =
          parsedRange.min;

        maximum =
          parsedRange.max;
      }
    }

    if (
      minimum === null ||
      maximum === null
    ) {
      /*
       * Compatibilidade com leituras antigas simples.
       * Um único valor torna-se mínimo e máximo.
       */
      var single =
        parseDecimal(
          source.temperatura,
          null
        );

      if (single !== null) {
        minimum = single;
        maximum = single;
      }
    }

    minimum = requireNumberRange(
      minimum,
      -80,
      80,
      'Temperatura mínima',
      false
    );

    maximum = requireNumberRange(
      maximum,
      -80,
      80,
      'Temperatura máxima',
      false
    );

    if (minimum > maximum) {
      var temporary = minimum;
      minimum = maximum;
      maximum = temporary;
    }

    if (
      isPositiveTemperatureEquipment(
        equipment
      ) &&
      minimum < 0
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Este equipamento exige temperaturas positivas'
      );
    }

    return {
      tipoRegisto: 'rango',
      temperatura:
        String(minimum) +
        ' a ' +
        String(maximum),

      temperaturaMin:
        String(minimum),

      temperaturaMax:
        String(maximum),

      valueForStatistics:
        (
          minimum +
          maximum
        ) / 2
    };
  }

  var temperature =
    requireNumberRange(
      source.temperatura,
      -80,
      80,
      'Temperatura',
      false
    );

  if (
    isFreezerEquipment(
      equipment
    ) &&
    temperature >= 0
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O congelador exige uma temperatura negativa'
    );
  }

  if (
    isPositiveTemperatureEquipment(
      equipment
    ) &&
    temperature < 0
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Este equipamento exige uma temperatura positiva'
    );
  }

  return {
    tipoRegisto: 'simples',
    temperatura:
      String(temperature),

    temperaturaMin:
      String(temperature),

    temperaturaMax:
      String(temperature),

    valueForStatistics:
      temperature
  };
}
// =========================================================
// CONFORMIDADE DA TEMPERATURA
// =========================================================

function evaluateTemperatureReading(
  reading,
  equipment
) {
  if (!reading || !equipment) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Leitura ou equipamento ausente'
    );
  }

  var minimumAllowed =
    parseDecimal(
      equipment.min,
      null
    );

  var maximumAllowed =
    parseDecimal(
      equipment.max,
      null
    );

  if (
    minimumAllowed === null ||
    maximumAllowed === null
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O equipamento não possui um intervalo de referência válido'
    );
  }

  var measuredMinimum =
    parseDecimal(
      reading.temperaturaMin,
      null
    );

  var measuredMaximum =
    parseDecimal(
      reading.temperaturaMax,
      null
    );

  if (
    measuredMinimum === null ||
    measuredMaximum === null
  ) {
    var parsedRange =
      parseTemperatureRange(
        reading.temperatura
      );

    if (parsedRange) {
      measuredMinimum =
        parsedRange.min;

      measuredMaximum =
        parsedRange.max;
    }
  }

  if (
    measuredMinimum === null ||
    measuredMaximum === null
  ) {
    var singleValue =
      parseDecimal(
        reading.temperatura,
        null
      );

    if (singleValue !== null) {
      measuredMinimum =
        singleValue;

      measuredMaximum =
        singleValue;
    }
  }

  if (
    measuredMinimum === null ||
    measuredMaximum === null
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A leitura de temperatura é inválida'
    );
  }

  var deviations = [];

  if (
    measuredMinimum <
    minimumAllowed
  ) {
    deviations.push({
      field: 'temperaturaMin',
      rule: 'min',
      value: measuredMinimum,
      expected: minimumAllowed,
      message:
        'Temperatura mínima abaixo do limite: ' +
        measuredMinimum +
        ' °C < ' +
        minimumAllowed +
        ' °C'
    });
  }

  if (
    measuredMaximum >
    maximumAllowed
  ) {
    deviations.push({
      field: 'temperaturaMax',
      rule: 'max',
      value: measuredMaximum,
      expected: maximumAllowed,
      message:
        'Temperatura máxima acima do limite: ' +
        measuredMaximum +
        ' °C > ' +
        maximumAllowed +
        ' °C'
    });
  }

  return {
    compliant:
      deviations.length === 0,

    dentroIntervalo:
      deviations.length === 0
        ? 'Sim'
        : 'Não',

    measuredMinimum:
      measuredMinimum,

    measuredMaximum:
      measuredMaximum,

    minimumAllowed:
      minimumAllowed,

    maximumAllowed:
      maximumAllowed,

    deviations:
      deviations
  };
}

// =========================================================
// PREPARAÇÃO DA LEITURA
// =========================================================

function prepareTemperaturaRecord(
  data,
  uid,
  existingRecord
) {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados da leitura de temperatura ausentes'
    );
  }

  var existing =
    existingRecord || {};

  var merged = Object.assign(
    {},
    existing,
    data
  );

  var dateTime =
    normalizeOperationalDateTime(
      merged
    );

  var equipment =
    resolveEquipamento(
      merged,
      {
        fresh: true
      }
    );

  if (!equipment) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Equipamento não encontrado — verifique o nome ou identificador'
    );
  }

  if (isNo(equipment.ativo)) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O equipamento "' +
        safeString(equipment.nome) +
        '" está inativo'
    );
  }

  var normalizedReading =
    normalizeTemperatureInput(
      merged,
      equipment
    );

  var evaluation =
    evaluateTemperatureReading(
      normalizedReading,
      equipment
    );

  var userName = uid
    ? normalizeOperationalUser(uid)
    : trimText(
        merged.usuario,
        80
      );

  return {
    fecha: dateTime.fecha,
    hora: dateTime.hora,

    usuario:
      userName || 'Sistema',

    equipamentoId:
      equipment.id,

    nome:
      trimText(
        equipment.nome,
        80
      ),

    tipo:
      normalizeEquipmentType(
        equipment.tipo
      ) || equipment.tipo,

    ubicacao:
      trimText(
        equipment.ubicacao,
        80
      ),

    temperatura:
      normalizedReading.temperatura,

    temperaturaMin:
      normalizedReading.temperaturaMin,

    temperaturaMax:
      normalizedReading.temperaturaMax,

    tipoRegisto:
      normalizedReading.tipoRegisto,

    dentroIntervalo:
      evaluation.dentroIntervalo,

    observacoes:
      trimText(
        merged.observacoes,
        500
      )
  };
}

// =========================================================
// CRIAR LEITURA DE TEMPERATURA
// =========================================================

function createTemperatureRecord(
  data,
  uid,
  options
) {
  requireWriter(uid);

  var settings = options || {};

  var prepared =
    prepareTemperaturaRecord(
      data,
      uid,
      null
    );

  if (data && data.id) {
    prepared.id = requireId(
      data.id,
      'ID da leitura'
    );
  }

  var result =
    repositoryCreate(
      'temperatura',
      prepared,
      {
        idPrefix: 'temp',
        failIfExists:
          settings.failIfExists === true
      }
    );

  if (
    result.created &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'createTemperature',
      'temperatura',
      result.id,
      {
        equipamentoId:
          prepared.equipamentoId,

        nome:
          prepared.nome,

        temperatura:
          prepared.temperatura,

        dentroIntervalo:
          prepared.dentroIntervalo
      },
      settings.requestId
    );
  }

  if (
    result.created &&
    typeof checkAndSendTempAlerts ===
      'function'
  ) {
    checkAndSendTempAlerts(
      prepared,
      uid
    );
  }

  return {
    ok: true,
    id: result.id,
    created: result.created,
    idempotent:
      result.idempotent,

    dentroIntervalo:
      prepared.dentroIntervalo,

    record: result.record
  };
}

// =========================================================
// ATUALIZAR LEITURA
// Apenas administradores podem alterar HACCP.
// =========================================================

function updateTemperatureRecord(
  id,
  data,
  uid,
  options
) {
  requireAdmin(uid);

  var existing =
    repositoryRequireById(
      'temperatura',
      id,
      {
        fresh: true
      }
    );

  var prepared =
    prepareTemperaturaRecord(
      data,
      uid,
      existing
    );

  var settings = options || {};

  var result =
    repositoryUpdate(
      'temperatura',
      id,
      prepared,
      {
        replace: false,
        expectedVersion:
          settings.expectedVersion
      }
    );

  if (
    result.updated &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'updateTemperature',
      'temperatura',
      id,
      {
        alteracoes:
          result.changes,

        antes:
          result.before,

        depois:
          result.record
      },
      settings.requestId
    );
  }

  if (
    result.updated &&
    typeof checkAndSendTempAlerts ===
      'function'
  ) {
    checkAndSendTempAlerts(
      result.record,
      uid
    );
  }

  return {
    ok: true,
    id: id,
    updated: result.updated,
    unchanged:
      result.unchanged,

    dentroIntervalo:
      result.record
        .dentroIntervalo,

    record: result.record
  };
}

// =========================================================
// ELIMINAR LEITURA
// =========================================================

function deleteTemperatureRecord(
  id,
  uid,
  options
) {
  requireAdmin(uid);

  var settings = options || {};

  var result =
    repositoryDeletePhysical(
      'temperatura',
      id
    );

  if (
    result.deleted &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'deleteTemperature',
      'temperatura',
      id,
      {
        antes: result.record
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    id: id,
    deleted: result.deleted
  };
}

// =========================================================
// IMPORTAÇÃO EM LOTE
// =========================================================

function createTemperatureBatch(
  rows,
  uid,
  options
) {
  requireWriter(uid);

  var source = requireArray(
    rows,
    'Lista de temperaturas',
    BACKEND_RELEASE.MAX_BATCH_SIZE,
    false
  );

  if (!source.length) {
    return {
      ok: true,
      ids: [],
      created: 0,
      skipped: 0
    };
  }

  var preparedRows = [];

  source.forEach(
    function (row, index) {
      try {
        var prepared =
          prepareTemperaturaRecord(
            row,
            uid,
            null
          );

        if (row.id) {
          prepared.id =
            requireId(
              row.id,
              'ID da linha ' +
                (index + 1)
            );
        }

        preparedRows.push(
          prepared
        );
      } catch (error) {
        throw apiError(
          getApiErrorCode(
            error,
            API_ERROR_CODES.VALIDATION
          ),
          'Linha ' +
            (index + 1) +
            ': ' +
            safeString(
              error.message ||
              error
            )
        );
      }
    }
  );

  var result =
    repositoryCreateBatch(
      'temperatura',
      preparedRows,
      {
        idPrefix: 'temp',
        failIfExists: false
      }
    );

  var settings = options || {};

  if (
    result.created > 0 &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'createTemperatureBatch',
      'temperatura',
      '',
      {
        quantidade:
          result.created,

        ignorados:
          result.skipped,

        ids:
          result.ids
      },
      settings.requestId
    );
  }

  if (
    typeof checkAndSendTempAlerts ===
      'function'
  ) {
    result.records.forEach(
      function (record) {
        if (
          record.dentroIntervalo ===
          'Não'
        ) {
          checkAndSendTempAlerts(
            record,
            uid
          );
        }
      }
    );
  }

  return {
    ok: true,
    ids: result.ids,
    created: result.created,
    skipped: result.skipped
  };
}

// =========================================================
// INTERVALO SEMANAL
// =========================================================

function weekRange(offsetWeeks) {
  var now = new Date();

  var day = now.getDay();

  var daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  var offset = Number(
    offsetWeeks || 0
  );

  if (!isFinite(offset)) {
    offset = 0;
  }

  var monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() -
      daysSinceMonday +
      offset * 7,
    12,
    0,
    0
  );

  var sunday = new Date(
    monday.getFullYear(),
    monday.getMonth(),
    monday.getDate() + 6,
    12,
    0,
    0
  );

  return {
    desde:
      formatServerDate(monday),

    hasta:
      formatServerDate(sunday)
  };
}

// =========================================================
// CONTROLO SEMANAL
// =========================================================

function computeTemperaturaWeekly(
  desde,
  hasta
) {
  var range;

  if (!desde && !hasta) {
    range = weekRange(0);
  } else {
    range = {
      desde: requireIsoDate(
        desde,
        'Data inicial',
        false
      ),

      hasta: requireIsoDate(
        hasta,
        'Data final',
        false
      )
    };
  }

  if (
    range.desde >
    range.hasta
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var equipments =
    listEquipamentos({
      includeInactive: false
    });

  var readings =
    repositoryList(
      'temperatura'
    );

  var latestByEquipment = {};
  var weekReadingsByEquipment = {};

  readings.forEach(
    function (record) {
      var equipmentId =
        safeString(
          record.equipamentoId
        );

      if (!equipmentId) {
        return;
      }

      var dateTimeKey =
        safeString(record.fecha) +
        ' ' +
        safeString(
          record.hora || '00:00'
        );

      var currentLatest =
        latestByEquipment[
          equipmentId
        ];

      if (
        !currentLatest ||
        dateTimeKey >
          currentLatest._dateTimeKey
      ) {
        latestByEquipment[
          equipmentId
        ] = Object.assign(
          {},
          record,
          {
            _dateTimeKey:
              dateTimeKey
          }
        );
      }

      var date =
        safeString(
          record.fecha
        );

      if (
        date >= range.desde &&
        date <= range.hasta
      ) {
        if (
          !weekReadingsByEquipment[
            equipmentId
          ]
        ) {
          weekReadingsByEquipment[
            equipmentId
          ] = [];
        }

        weekReadingsByEquipment[
          equipmentId
        ].push(record);
      }
    }
  );

  var items =
    equipments.map(
      function (equipment) {
        var id =
          safeString(
            equipment.id
          );

        var weekReadings =
          weekReadingsByEquipment[
            id
          ] || [];

        var outOfRange =
          weekReadings.filter(
            function (record) {
              return (
                safeString(
                  record.dentroIntervalo
                ) === 'Não'
              );
            }
          );

        var latest =
          latestByEquipment[id]
            ? Object.assign(
                {},
                latestByEquipment[id]
              )
            : null;

        if (latest) {
          delete latest._dateTimeKey;
        }

        return {
          id: equipment.id,
          nome: equipment.nome,
          tipo: equipment.tipo,
          ubicacao:
            equipment.ubicacao,

          min: equipment.min,
          max: equipment.max,

          tipoRegisto:
            equipment.tipoRegisto,

          medidoSemana:
            weekReadings.length > 0,

          leiturasSemana:
            weekReadings.length,

          desviosSemana:
            outOfRange.length,

          conformeSemana:
            weekReadings.length > 0 &&
            outOfRange.length === 0,

          ultima: latest
        };
      }
    );

  var measured = items.filter(
    function (item) {
      return item.medidoSemana;
    }
  ).length;

  var deviations =
    items.reduce(
      function (total, item) {
        return (
          total +
          item.desviosSemana
        );
      },
      0
    );

  return {
    desde: range.desde,
    hasta: range.hasta,

    total: items.length,
    medidos: measured,
    faltam:
      Math.max(
        0,
        items.length -
        measured
      ),

    progressoPct:
      items.length > 0
        ? Math.round(
            measured /
            items.length *
            100
          )
        : 0,

    desvios: deviations,

    conformidadePct:
      measured > 0
        ? Math.round(
            (
              measured -
              items.filter(
                function (item) {
                  return (
                    item.medidoSemana &&
                    !item.conformeSemana
                  );
                }
              ).length
            ) /
            measured *
            100
          )
        : 0,

    items: items
  };
}

// =========================================================
// ESTATÍSTICAS DE REFRIGERAÇÃO
// =========================================================

function getTemperatureStats(
  desde,
  hasta
) {
  var start = requireIsoDate(
    desde,
    'Data inicial',
    false
  );

  var end = requireIsoDate(
    hasta,
    'Data final',
    false
  );

  if (start > end) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var records =
    repositoryQuery(
      'temperatura',
      function (record) {
        var date =
          safeString(
            record.fecha
          );

        return (
          date >= start &&
          date <= end
        );
      }
    );

  var outOfRange =
    records.filter(
      function (record) {
        return (
          safeString(
            record.dentroIntervalo
          ) === 'Não'
        );
      }
    );

  var byEquipment = {};

  records.forEach(
    function (record) {
      var id =
        safeString(
          record.equipamentoId ||
          record.nome
        );

      if (!byEquipment[id]) {
        byEquipment[id] = {
          equipamentoId:
            record.equipamentoId,

          nome:
            record.nome,

          tipo:
            record.tipo,

          ubicacao:
            record.ubicacao,

          total: 0,
          conformes: 0,
          desvios: 0,

          minima: null,
          maxima: null,

          ultimaData: '',
          ultimaHora: '',
          ultimaTemperatura: ''
        };
      }

      var item =
        byEquipment[id];

      item.total++;

      if (
        safeString(
          record.dentroIntervalo
        ) === 'Não'
      ) {
        item.desvios++;
      } else {
        item.conformes++;
      }

      var measuredMin =
        parseDecimal(
          record.temperaturaMin,
          null
        );

      var measuredMax =
        parseDecimal(
          record.temperaturaMax,
          null
        );

      if (
        measuredMin === null ||
        measuredMax === null
      ) {
        var parsedRange =
          parseTemperatureRange(
            record.temperatura
          );

        if (parsedRange) {
          measuredMin =
            parsedRange.min;

          measuredMax =
            parsedRange.max;
        }
      }

      if (
        measuredMin === null ||
        measuredMax === null
      ) {
        var singleValue =
          parseDecimal(
            record.temperatura,
            null
          );

        if (singleValue !== null) {
          measuredMin =
            singleValue;

          measuredMax =
            singleValue;
        }
      }

      if (measuredMin !== null) {
        if (
          item.minima === null ||
          measuredMin < item.minima
        ) {
          item.minima =
            measuredMin;
        }
      }

      if (measuredMax !== null) {
        if (
          item.maxima === null ||
          measuredMax > item.maxima
        ) {
          item.maxima =
            measuredMax;
        }
      }

      var recordDateTime =
        safeString(
          record.fecha
        ) +
        ' ' +
        safeString(
          record.hora || '00:00'
        );

      var currentDateTime =
        safeString(
          item.ultimaData
        ) +
        ' ' +
        safeString(
          item.ultimaHora || '00:00'
        );

      if (
        !item.ultimaData ||
        recordDateTime >
          currentDateTime
      ) {
        item.ultimaData =
          record.fecha;

        item.ultimaHora =
          record.hora;

        item.ultimaTemperatura =
          record.temperatura;
      }
    }
  );

  var equipmentItems =
    Object.keys(
      byEquipment
    ).map(
      function (id) {
        var item =
          byEquipment[id];

        item.conformidadePct =
          item.total > 0
            ? Math.round(
                item.conformes /
                item.total *
                100
              )
            : 0;

        return item;
      }
    );

  return {
    desde: start,
    hasta: end,

    total: records.length,

    conformes:
      records.length -
      outOfRange.length,

    desvios:
      outOfRange.length,

    conformidadePct:
      records.length > 0
        ? Math.round(
            (
              records.length -
              outOfRange.length
            ) /
            records.length *
            100
          )
        : 0,

    equipamentosMedidos:
      equipmentItems.length,

    porEquipamento:
      equipmentItems,

    leiturasForaIntervalo:
      outOfRange
  };
}

// =========================================================
// LISTAGEM DE LEITURAS
// =========================================================

function listTemperatureRecords(
  filters,
  options
) {
  var criteria =
    filters || {};

  return repositoryQuery(
    'temperatura',
    function (record) {
      var date =
        safeString(
          record.fecha
        );

      if (
        criteria.desde &&
        date <
          safeString(
            criteria.desde
          )
      ) {
        return false;
      }

      if (
        criteria.hasta &&
        date >
          safeString(
            criteria.hasta
          )
      ) {
        return false;
      }

      if (
        criteria.equipamentoId &&
        safeString(
          record.equipamentoId
        ) !==
          safeString(
            criteria.equipamentoId
          )
      ) {
        return false;
      }

      if (
        criteria.dentroIntervalo &&
        safeString(
          record.dentroIntervalo
        ) !==
          safeString(
            criteria.dentroIntervalo
          )
      ) {
        return false;
      }

      return true;
    },
    options
  );
}

// =========================================================
// ÚLTIMA LEITURA POR EQUIPAMENTO
// =========================================================

function getLatestTemperatureByEquipment(
  equipmentId
) {
  var id = requireId(
    equipmentId,
    'ID do equipamento'
  );

  var readings =
    repositoryQuery(
      'temperatura',
      function (record) {
        return (
          safeString(
            record.equipamentoId
          ) === id
        );
      }
    );

  if (!readings.length) {
    return null;
  }

  readings.sort(
    function (left, right) {
      var leftKey =
        safeString(
          left.fecha
        ) +
        ' ' +
        safeString(
          left.hora || '00:00'
        );

      var rightKey =
        safeString(
          right.fecha
        ) +
        ' ' +
        safeString(
          right.hora || '00:00'
        );

      return rightKey.localeCompare(
        leftKey
      );
    }
  );

  return readings[0];
}

// =========================================================
// RESUMO PARA BOOTSTRAP
// =========================================================

function getRefrigerationBootstrapData() {
  var equipments =
    listEquipamentos({
      includeInactive: true
    });

  var readings =
    repositoryList(
      'temperatura'
    );

  var weekly =
    computeTemperaturaWeekly();

  return {
    records: readings,
    equipamentos: equipments,
    weekly: weekly
  };
}

// =========================================================
// COMPATIBILIDADE COM A API ANTERIOR
// =========================================================

function validateTemperatureRecord(
  data,
  uid,
  existingRecord
) {
  return prepareTemperaturaRecord(
    data,
    uid,
    existingRecord
  );
}

function saveTemperatureRecord(
  data,
  uid,
  options
) {
  return createTemperatureRecord(
    data,
    uid,
    options
  );
}

function listTemperatureStatus(
  desde,
  hasta
) {
  return computeTemperaturaWeekly(
    desde,
    hasta
  );
}

// =========================================================
// MIGRAÇÃO DE EQUIPAMENTOS ANTIGOS
// =========================================================

function migrateLegacyEquipmentTypes() {
  var equipments =
    getAllEquipamentosRaw({
      fresh: true
    });

  var updated = [];
  var invalid = [];

  equipments.forEach(
    function (equipment) {
      var normalizedType =
        normalizeEquipmentType(
          equipment.tipo
        );

      if (!normalizedType) {
        invalid.push({
          id: equipment.id,
          nome: equipment.nome,
          tipo: equipment.tipo
        });

        return;
      }

      var active =
        isNo(equipment.ativo)
          ? 'Não'
          : 'Sim';

      var needsUpdate =
        normalizedType !==
          equipment.tipo ||
        active !==
          equipment.ativo;

      if (!needsUpdate) {
        return;
      }

      repositoryPatch(
        'equipamento',
        equipment.id,
        {
          tipo: normalizedType,
          ativo: active
        }
      );

      updated.push({
        id: equipment.id,
        nome: equipment.nome,
        tipoAnterior:
          equipment.tipo,
        tipoNovo:
          normalizedType
      });
    }
  );

  invalidateEquipCache();

  return {
    ok: invalid.length === 0,
    updated: updated,
    invalid: invalid
  };
}

// =========================================================
// MIGRAÇÃO DE LEITURAS ANTIGAS
// =========================================================

function migrateLegacyTemperatureRecords() {
  var records =
    repositoryList(
      'temperatura',
      {
        fresh: true
      }
    );

  var migrated = [];
  var invalid = [];

  records.forEach(
    function (record) {
      try {
        var equipment =
          resolveEquipamento(
            record,
            {
              fresh: true
            }
          );

        if (!equipment) {
          invalid.push({
            id: record.id,
            error:
              'Equipamento não encontrado'
          });

          return;
        }

        var normalized =
          normalizeTemperatureInput(
            record,
            equipment
          );

        var evaluation =
          evaluateTemperatureReading(
            normalized,
            equipment
          );

        var patch = {
          equipamentoId:
            equipment.id,

          nome:
            equipment.nome,

          tipo:
            normalizeEquipmentType(
              equipment.tipo
            ) ||
            equipment.tipo,

          ubicacao:
            equipment.ubicacao,

          temperatura:
            normalized.temperatura,

          temperaturaMin:
            normalized.temperaturaMin,

          temperaturaMax:
            normalized.temperaturaMax,

          tipoRegisto:
            normalized.tipoRegisto,

          dentroIntervalo:
            evaluation
              .dentroIntervalo
        };

        var hasChanges =
          objectHasChanges(
            record,
            patch,
            [
              'marcaTiempo'
            ]
          );

        if (!hasChanges) {
          return;
        }

        repositoryPatch(
          'temperatura',
          record.id,
          patch
        );

        migrated.push(
          record.id
        );
      } catch (error) {
        invalid.push({
          id: record.id,
          error:
            safeString(
              error.message ||
              error
            )
        });
      }
    }
  );

  return {
    ok: invalid.length === 0,
    migrated: migrated.length,
    migratedIds: migrated,
    invalid: invalid
  };
}

// =========================================================
// DIAGNÓSTICO
// =========================================================

function diagnoseRefrigeration() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    equipments: {},
    readings: {},
    weekly: {},
    errors: []
  };

  try {
    var equipments =
      listEquipamentos({
        includeInactive: true,
        fresh: true
      });

    var activeEquipments =
      equipments.filter(
        function (equipment) {
          return !isNo(
            equipment.ativo
          );
        }
      );

    var invalidEquipments = [];

    equipments.forEach(
      function (equipment) {
        try {
          prepareEquipmentRecord(
            equipment,
            equipment
          );
        } catch (error) {
          invalidEquipments.push({
            id: equipment.id,
            nome: equipment.nome,
            error:
              safeString(
                error.message ||
                error
              )
          });
        }
      }
    );

    var readings =
      repositoryList(
        'temperatura',
        {
          fresh: true
        }
      );

    var invalidReadings = [];
    var outOfRange = 0;

    readings.forEach(
      function (record) {
        try {
          var equipment =
            resolveEquipamento(
              record,
              {
                fresh: true
              }
            );

          if (!equipment) {
            throw apiError(
              API_ERROR_CODES.NOT_FOUND,
              'Equipamento não encontrado'
            );
          }

          var normalized =
            normalizeTemperatureInput(
              record,
              equipment
            );

          var evaluation =
            evaluateTemperatureReading(
              normalized,
              equipment
            );

          if (!evaluation.compliant) {
            outOfRange++;
          }
        } catch (error) {
          invalidReadings.push({
            id: record.id,
            error:
              safeString(
                error.message ||
                error
              )
          });
        }
      }
    );

    var weekly =
      computeTemperaturaWeekly();

    result.equipments = {
      total:
        equipments.length,

      active:
        activeEquipments.length,

      inactive:
        equipments.length -
        activeEquipments.length,

      invalid:
        invalidEquipments.length,

      invalidItems:
        invalidEquipments
    };

    result.readings = {
      total:
        readings.length,

      invalid:
        invalidReadings.length,

      outOfRange:
        outOfRange,

      invalidItems:
        invalidReadings
    };

    result.weekly = {
      desde:
        weekly.desde,

      hasta:
        weekly.hasta,

      total:
        weekly.total,

      medidos:
        weekly.medidos,

      faltam:
        weekly.faltam,

      progressoPct:
        weekly.progressoPct,

      desvios:
        weekly.desvios,

      conformidadePct:
        weekly.conformidadePct
    };

    result.ok =
      invalidEquipments.length === 0 &&
      invalidReadings.length === 0;
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// MARCADOR DE FIM DA PARTE 6
// =========================================================

/*
 * FIM DE 06_Refrigeration.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 6/13 está completa.

/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 7/13 — Domínio e regras dos tickets
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 * - 04_ConfigService.gs
 * - 05_OperationalRecords.gs
 * - 06_Refrigeration.gs
 */

// =========================================================
// NORMALIZAÇÃO DO ESTADO
// =========================================================

function normalizeTicketStatus(value) {
  var status = safeString(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(/\s+/g, '_');

  var aliases = {
    aberto: TICKET_STATUS.ABERTO,
    open: TICKET_STATUS.ABERTO,

    atribuido:
      TICKET_STATUS.ATRIBUIDO,
    assigned:
      TICKET_STATUS.ATRIBUIDO,

    em_andamento:
      TICKET_STATUS.EM_ANDAMENTO,
    andamento:
      TICKET_STATUS.EM_ANDAMENTO,
    em_processo:
      TICKET_STATUS.EM_ANDAMENTO,
    in_progress:
      TICKET_STATUS.EM_ANDAMENTO,

    pausado:
      TICKET_STATUS.PAUSADO,
    pause:
      TICKET_STATUS.PAUSADO,
    paused:
      TICKET_STATUS.PAUSADO,

    aguardando_material:
      TICKET_STATUS
        .AGUARDANDO_MATERIAL,

    aguardando_materiais:
      TICKET_STATUS
        .AGUARDANDO_MATERIAL,

    waiting_material:
      TICKET_STATUS
        .AGUARDANDO_MATERIAL,

    resolvido:
      TICKET_STATUS.RESOLVIDO,
    resolved:
      TICKET_STATUS.RESOLVIDO,

    finalizado:
      TICKET_STATUS.FINALIZADO,
    fechado:
      TICKET_STATUS.FINALIZADO,
    closed:
      TICKET_STATUS.FINALIZADO
  };

  return aliases[status] || '';
}

function requireTicketStatus(value) {
  var status =
    normalizeTicketStatus(value);

  if (
    TICKET_STATUS_VALUES
      .indexOf(status) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Estado do ticket inválido',
      {
        recebido: value,
        permitidos:
          TICKET_STATUS_VALUES
      }
    );
  }

  return status;
}

// =========================================================
// NORMALIZAÇÃO DA PRIORIDADE
// =========================================================

function normalizeTicketPriority(value) {
  var priority = safeString(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    );

  var aliases = {
    baixa: TICKET_PRIORITY.BAIXA,
    low: TICKET_PRIORITY.BAIXA,

    media: TICKET_PRIORITY.MEDIA,
    medium: TICKET_PRIORITY.MEDIA,

    alta: TICKET_PRIORITY.ALTA,
    high: TICKET_PRIORITY.ALTA,

    critica: TICKET_PRIORITY.CRITICA,
    critical: TICKET_PRIORITY.CRITICA,
    urgente: TICKET_PRIORITY.CRITICA
  };

  return aliases[priority] || '';
}

function requireTicketPriority(value) {
  var priority =
    normalizeTicketPriority(
      value || TICKET_PRIORITY.MEDIA
    );

  if (
    TICKET_PRIORITY_VALUES
      .indexOf(priority) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Prioridade do ticket inválida'
    );
  }

  return priority;
}

// =========================================================
// TIPO DE MANUTENÇÃO
// =========================================================

function normalizeMaintenanceType(value) {
  var type = safeString(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(/\s+/g, '_');

  var aliases = {
    corretivo: 'correctivo',
    correctivo: 'correctivo',
    corrective: 'correctivo',

    preventivo: 'preventivo',
    preventive: 'preventivo',

    inspecao: 'inspecao',
    inspeccao: 'inspecao',
    inspection: 'inspecao',

    melhoria: 'melhoria',
    improvement: 'melhoria',

    estrategico: 'estrategico',
    estrategica: 'estrategico',
    strategic: 'estrategico'
  };

  return aliases[type] || '';
}

function requireMaintenanceType(value) {
  var type =
    normalizeMaintenanceType(
      value || 'correctivo'
    );

  if (
    TICKET_MAINTENANCE_TYPES
      .indexOf(type) === -1
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Tipo de manutenção inválido'
    );
  }

  return type;
}

// =========================================================
// CATEGORIA, TURNO E LOCAL
// =========================================================

function normalizeTicketCategory(value) {
  var input = safeString(value)
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim();

  if (!input) {
    return '';
  }

  var normalizedInput = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  var aliases = {
    'casa banho': 'Casa de Banho',
    'casa de banho': 'Casa de Banho',
    banheiro: 'Casa de Banho',
    wc: 'Casa de Banho',
    sanitario: 'Casa de Banho',
    'instalacao sanitaria': 'Casa de Banho',
    'instalacoes sanitarias': 'Casa de Banho'
  };

  if (aliases[normalizedInput]) {
    return aliases[normalizedInput];
  }

  for (
    var index = 0;
    index < TICKET_CATEGORIAS.length;
    index++
  ) {
    var category = TICKET_CATEGORIAS[index];
    var normalizedCategory = category
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (normalizedInput === normalizedCategory) {
      return category;
    }
  }

  return '';
}

function requireTicketCategory(value) {
  var category =
    normalizeTicketCategory(value);

  if (!category) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Categoria de manutenção inválida'
    );
  }

  return category;
}

function normalizeTicketTurn(value) {
  var input = safeString(value).trim();

  if (!input) {
    return '';
  }

  var normalizedInput = input
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    );

  for (
    var index = 0;
    index <
      TICKET_TURNOS.length;
    index++
  ) {
    var turn =
      TICKET_TURNOS[index];

    if (
      turn
        .toLowerCase()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        ) === normalizedInput
    ) {
      return turn;
    }
  }

  return '';
}

function requireTicketTurn(
  value,
  optional
) {
  var input = safeString(value).trim();

  if (!input && optional) {
    return '';
  }

  var turn =
    normalizeTicketTurn(input);

  if (!turn) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Turno inválido'
    );
  }

  return turn;
}

function normalizeTicketLocation(value) {
  var location = trimText(
    value,
    60
  ).toUpperCase();

  if (!location) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'É necessário indicar o quarto ou local'
    );
  }

  return location;
}

// =========================================================
// ESTADO DO TICKET
// =========================================================

function isTicketArchived(ticket) {
  return Boolean(
    ticket &&
    isYes(ticket.arquivado)
  );
}

function isTicketClosed(ticket) {
  return Boolean(
    ticket &&
    normalizeTicketStatus(
      ticket.situacao
    ) === TICKET_STATUS.FINALIZADO
  );
}

function isTicketResolved(ticket) {
  if (!ticket) {
    return false;
  }

  var status =
    normalizeTicketStatus(
      ticket.situacao
    );

  return (
    status === TICKET_STATUS.RESOLVIDO ||
    status === TICKET_STATUS.FINALIZADO
  );
}

function isTicketActive(ticket) {
  return Boolean(
    ticket &&
    !isTicketArchived(ticket) &&
    !isTicketClosed(ticket)
  );
}

function getTicketVersion(ticket) {
  var version = Number(
    ticket && ticket.versao
      ? ticket.versao
      : 1
  );

  if (
    !isFinite(version) ||
    version < 1
  ) {
    return 1;
  }

  return Math.floor(version);
}

// =========================================================
// DATA DE ABERTURA E DURAÇÕES
// =========================================================

function getTicketOpeningDate(ticket) {
  if (!ticket) {
    return null;
  }

  try {
    return parseLocalDateTime(
      ticket.dataReporte,
      ticket.horaReporte || '00:00'
    );
  } catch (error) {
    return null;
  }
}

function getTicketResolutionDate(ticket) {
  if (!ticket) {
    return null;
  }

  return (
    parseStoredDateTime(
      ticket.resolvidoEm
    ) ||
    parseStoredDateTime(
      ticket.fechadoEm
    ) ||
    parseStoredDateTime(
      ticket.dataFechamento
    )
  );
}

function calculateTicketResponseMinutes(ticket) {
  var openingDate =
    getTicketOpeningDate(ticket);

  var responseDate =
    parseStoredDateTime(
      ticket && ticket.respostaEm
    ) ||
    parseStoredDateTime(
      ticket && ticket.iniciadoEm
    );

  if (
    !openingDate ||
    !responseDate
  ) {
    return null;
  }

  return diffMinutes(
    openingDate,
    responseDate
  );
}

function calculateTicketResolutionMinutes(ticket) {
  var openingDate =
    getTicketOpeningDate(ticket);

  var resolutionDate =
    getTicketResolutionDate(ticket);

  if (
    !openingDate ||
    !resolutionDate
  ) {
    return null;
  }

  var totalMinutes =
    diffMinutes(
      openingDate,
      resolutionDate
    );

  if (totalMinutes === null) {
    return null;
  }

  var pauseMinutes = Number(
    ticket.minutosPausa || 0
  );

  if (
    !isFinite(pauseMinutes) ||
    pauseMinutes < 0
  ) {
    pauseMinutes = 0;
  }

  return Math.max(
    0,
    totalMinutes - pauseMinutes
  );
}

// =========================================================
// SLA E VENCIMENTO
// =========================================================

function ensureTicketDeadlines(ticket) {
  var source =
    Object.assign({}, ticket);

  var openingDate =
    getTicketOpeningDate(source);

  if (!openingDate) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Não foi possível determinar a data de abertura do ticket'
    );
  }

  var priority =
    requireTicketPriority(
      source.prioridade
    );

  var deadlines =
    calculateConfiguredTicketDeadlines(
      openingDate,
      priority
    );

  if (!source.prazoResposta) {
    source.prazoResposta =
      deadlines.prazoResposta;
  }

  if (!source.prazoResolucao) {
    source.prazoResolucao =
      deadlines.prazoResolucao;
  }

  return source;
}

function getTicketSlaState(ticket) {
  var source =
    ensureTicketDeadlines(ticket);

  var now = new Date();

  var responseDeadline =
    parseStoredDateTime(
      source.prazoResposta
    );

  var resolutionDeadline =
    parseStoredDateTime(
      source.prazoResolucao
    );

  var responseDate =
    parseStoredDateTime(
      source.respostaEm
    ) ||
    parseStoredDateTime(
      source.iniciadoEm
    );

  var resolutionDate =
    getTicketResolutionDate(source);

  var responseCompliant =
    responseDate
      ? calculateSlaCompliance(
          source.prazoResposta,
          formatIsoDateTime(
            responseDate
          )
        )
      : (
          responseDeadline &&
          now.getTime() >
            responseDeadline.getTime()
            ? 'Não'
            : ''
        );

  var resolutionCompliant =
    resolutionDate
      ? calculateSlaCompliance(
          source.prazoResolucao,
          formatIsoDateTime(
            resolutionDate
          )
        )
      : (
          resolutionDeadline &&
          now.getTime() >
            resolutionDeadline.getTime()
            ? 'Não'
            : ''
        );

  var responseOverdue =
    !responseDate &&
    responseDeadline &&
    now.getTime() >
      responseDeadline.getTime();

  var resolutionOverdue =
    !resolutionDate &&
    resolutionDeadline &&
    now.getTime() >
      resolutionDeadline.getTime();

  return {
    prazoResposta:
      source.prazoResposta,

    prazoResolucao:
      source.prazoResolucao,

    respostaCumprida:
      responseCompliant,

    resolucaoCumprida:
      resolutionCompliant,

    respostaVencida:
      Boolean(responseOverdue),

    resolucaoVencida:
      Boolean(resolutionOverdue),

    vencido:
      Boolean(
        resolutionOverdue
      ),

    minutosParaResposta:
      responseDeadline
        ? Math.round(
            (
              responseDeadline.getTime() -
              now.getTime()
            ) / 60000
          )
        : null,

    minutosParaResolucao:
      resolutionDeadline
        ? Math.round(
            (
              resolutionDeadline.getTime() -
              now.getTime()
            ) / 60000
          )
        : null
  };
}

// =========================================================
// RESPONSÁVEL
// =========================================================

function resolveTicketResponsible(
  responsibleId,
  optional
) {
  var id = safeString(
    responsibleId
  ).trim();

  if (!id) {
    if (optional) {
      return null;
    }

    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'É necessário indicar o técnico responsável'
    );
  }

  var user = findUserById(
    id,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Técnico responsável não encontrado'
    );
  }

  if (isNo(user.activo)) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O técnico responsável está desativado'
    );
  }

  if (
    user.rol !== USER_ROLES.TECNICO &&
    user.rol !== USER_ROLES.ADMIN
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O responsável deve possuir perfil técnico ou administrativo'
    );
  }

  return user;
}

// =========================================================
// ATIVO OU EQUIPAMENTO AFETADO
// =========================================================

function normalizeTicketAsset(data) {
  var source = data || {};

  var assetId = trimText(
    source.ativoId,
    120
  );

  var assetName = trimText(
    source.ativoNome,
    120
  );

  if (assetId && !assetName) {
    var equipment =
      findEquipmentById(
        assetId,
        {
          fresh: true
        }
      );

    if (equipment) {
      assetName =
        equipment.nome;
    }
  }

  return {
    ativoId: assetId,
    ativoNome: assetName
  };
}

// =========================================================
// CAMPOS TÉCNICOS DA RESOLUÇÃO
// =========================================================

function normalizeTicketResolutionData(
  data
) {
  var source = data || {};

  var materials =
    normalizeTicketMaterials(
      source.materiais || []
    );

  var materialsCost =
    getMaterialsTotal(
      materials
    );

  var estimatedCost =
    requireNumberRange(
      source.custoEstimado,
      0,
      10000000,
      'Custo estimado',
      true
    );

  var actualCost =
    requireNumberRange(
      source.custoReal,
      0,
      10000000,
      'Custo real',
      true
    );

  if (
    actualCost === null &&
    materialsCost > 0
  ) {
    actualCost =
      materialsCost;
  }

  var workMinutes =
    requireIntegerRange(
      source.tempoTrabalhoMinutos,
      0,
      525600,
      'Tempo de trabalho',
      true
    );

  var downtimeMinutes =
    requireIntegerRange(
      source.tempoParagemMinutos,
      0,
      525600,
      'Tempo de paragem',
      true
    );

  var needsFollowUp =
    normalizeYesNo(
      source.necessitaSeguimento
    );

  var followUpDate = '';

  if (
    needsFollowUp === 'Sim'
  ) {
    followUpDate =
      requireIsoDate(
        source.dataSeguimento,
        'Data de seguimento',
        false
      );

    if (
      followUpDate <
      formatServerDate(
        new Date()
      )
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'A data de seguimento não pode estar no passado'
      );
    }
  }

  return {
    diagnostico:
      trimText(
        source.diagnostico,
        1000
      ),

    trabalhoRealizado:
      trimText(
        source.trabalhoRealizado,
        1500
      ),

    causaRaiz:
      trimText(
        source.causaRaiz,
        500
      ),

    materiais:
      safeJsonStringify(
        materials,
        50000
      ),

    materiaisNormalizados:
      materials,

    custoMateriais:
      materialsCost,

    tempoTrabalhoMinutos:
      workMinutes === null
        ? ''
        : String(workMinutes),

    tempoParagemMinutos:
      downtimeMinutes === null
        ? ''
        : String(
            downtimeMinutes
          ),

    custoEstimado:
      estimatedCost === null
        ? ''
        : String(
            roundMoney(
              estimatedCost
            )
          ),

    custoReal:
      actualCost === null
        ? ''
        : String(
            roundMoney(
              actualCost
            )
          ),

    necessitaSeguimento:
      needsFollowUp,

    dataSeguimento:
      followUpDate
  };
}

function requireTicketResolutionData(
  data
) {
  var normalized =
    normalizeTicketResolutionData(
      data
    );

  normalized.diagnostico =
    requireText(
      normalized.diagnostico,
      'Diagnóstico',
      5,
      1000,
      false
    );

  normalized.trabalhoRealizado =
    requireText(
      normalized
        .trabalhoRealizado,
      'Trabalho realizado',
      5,
      1500,
      false
    );

  return normalized;
}

// =========================================================
// COMENTÁRIOS DE RESOLUÇÃO E FECHO
// =========================================================

function requireResolutionComment(
  value
) {
  return requireText(
    value,
    'Comentário de resolução',
    10,
    1000,
    false
  );
}

function requireClosingComment(
  value
) {
  return requireText(
    value,
    'Comentário de fecho',
    10,
    1000,
    false
  );
}

function requirePauseReason(
  value
) {
  return requireText(
    value,
    'Motivo da pausa',
    5,
    500,
    false
  );
}

// =========================================================
// CRIAÇÃO DO MODELO DE TICKET
// =========================================================

function prepareNewTicket(
  data,
  uid
) {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados do ticket ausentes'
    );
  }

  var creator =
    requirePermission(
      uid,
      PERMISSIONS.CREATE_TICKET
    );

  var now = new Date();

  var date = data.dataReporte
    ? requireIsoDate(
        data.dataReporte,
        'Data de reporte',
        false
      )
    : formatServerDate(now);

  var time = data.horaReporte
    ? requireTime(
        data.horaReporte,
        'Hora de reporte',
        false
      )
    : formatServerTime(now);

  var openedAt =
    parseLocalDateTime(
      date,
      time
    );

  var priority =
    requireTicketPriority(
      data.prioridade ||
      TICKET_PRIORITY.MEDIA
    );

  var isStrat =
    safeString(data.tipo).toLowerCase().indexOf('estrat') !== -1 ||
    safeString(data.tipoManutencao).toLowerCase().indexOf('estrat') !== -1 ||
    safeString(data.descricao).indexOf('[ESTRATÉGICO]') !== -1 ||
    safeString(data.descricao).indexOf('⭐') !== -1 ||
    safeString(data.prioridade).toLowerCase().indexOf('estrat') !== -1 ||
    safeString(data.categoria).toLowerCase().indexOf('estrat') !== -1 ||
    Boolean(data.isStrategic);

  var rawType =
    data.tipoManutencao ||
    data.tipo ||
    (isStrat ? 'estrategico' : 'correctivo');

  var maintenanceType =
    requireMaintenanceType(
      isStrat ? 'estrategico' : rawType
    );

  var category =
    requireTicketCategory(
      data.categoria
    );

  var location =
    normalizeTicketLocation(
      data.quarto ||
      data.local
    );

  var description =
    requireText(
      data.descricao,
      'Descrição',
      5,
      1000,
      false
    );

  var turn =
    requireTicketTurn(
      data.turno || '',
      true
    );

  var asset =
    normalizeTicketAsset(
      data
    );

  var deadlines =
    calculateConfiguredTicketDeadlines(
      openedAt,
      priority
    );

  var responsible = null;

  if (data.responsavelId) {
    /*
     * Um técnico pode abrir uma ordem para si próprio.
     * A atribuição a outra pessoa requer administrador.
     */
    if (
      creator.rol !==
        USER_ROLES.ADMIN &&
      safeString(
        data.responsavelId
      ) !==
        safeString(
          creator.id
        )
    ) {
      throw apiError(
        API_ERROR_CODES.FORBIDDEN,
        'Apenas o administrador pode atribuir o ticket a outro técnico'
      );
    }

    responsible =
      resolveTicketResponsible(
        data.responsavelId,
        false
      );
  }

  var initialStatus =
    responsible
      ? TICKET_STATUS.ATRIBUIDO
      : TICKET_STATUS.ABERTO;

  var createdAt =
    formatIsoDateTime(now);

  return {
    numeroTicket:
      createTicketNumber(now),

    versao: '1',

    quarto: location,

    ativoId:
      asset.ativoId,

    ativoNome:
      asset.ativoNome,

    situacao:
      initialStatus,

    prioridade:
      priority,

    tipoManutencao:
      maintenanceType,

    tipo:
      TICKET_MAINTENANCE_TYPE_LABELS[maintenanceType] || (isStrat ? 'Estratégico' : (data.tipo || 'Corretivo')),

    isStrategic:
      isStrat || maintenanceType === 'estrategico',

    categoria:
      category,

    colaborador:
      trimText(
        creator.nombre ||
        creator.nome ||
        creator.usuario,
        80
      ),

    criadoPorId:
      creator.id,

    dataReporte:
      date,

    horaReporte:
      time,

    turno:
      turn,

    semanaISO:
      getSemanaISO(date),

    descricao:
      description,

    observacao:
      trimText(
        data.observacao,
        500
      ),

    responsavelId:
      responsible
        ? responsible.id
        : '',

    responsavelNome:
      responsible
        ? trimText(
            responsible.nombre ||
            responsible.nome ||
            responsible.usuario,
            80
          )
        : '',

    atribuidoEm:
      responsible
        ? createdAt
        : '',

    atribuidoPorId:
      responsible
        ? creator.id
        : '',

    prazoResposta:
      deadlines.prazoResposta,

    prazoResolucao:
      deadlines.prazoResolucao,

    respostaEm: '',

    slaRespostaCumprido: '',
    slaResolucaoCumprido: '',

    iniciadoEm: '',
    pausadoEm: '',
    motivoPausa: '',
    minutosPausa: '0',

    diagnostico: '',
    trabalhoRealizado: '',
    causaRaiz: '',
    materiais: '[]',

    tempoTrabalhoMinutos: '',
    tempoParagemMinutos: '',

    custoEstimado:
      data.custoEstimado ===
        undefined ||
      safeString(
        data.custoEstimado
      ).trim() === ''
        ? ''
        : String(
            requireNumberRange(
              data.custoEstimado,
              0,
              10000000,
              'Custo estimado',
              false
            )
          ),

    custoReal: '',

    necessitaSeguimento: 'Não',
    dataSeguimento: '',

    resolvidoEm: '',
    resolvidoPorId: '',

    dataFechamento: '',
    fechadoEm: '',
    fechadoPorId: '',
    comentarioCierre: '',

    criadoEm:
      createdAt,

    atualizadoEm:
      createdAt,

    atualizadoPorId:
      creator.id,

    arquivado: 'Não',
    arquivadoEm: '',
    arquivadoPorId: '',
    motivoArquivo: ''
  };
}

// =========================================================
// ATUALIZAÇÃO DOS DADOS BÁSICOS
// =========================================================

function prepareTicketBasicUpdate(
  existingTicket,
  data,
  uid
) {
  if (!existingTicket) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Ticket não encontrado'
    );
  }

  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Dados de atualização ausentes'
    );
  }

  var user =
    requirePermission(
      uid,
      PERMISSIONS.UPDATE_TICKET,
      existingTicket
    );

  if (
    isTicketArchived(
      existingTicket
    )
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado e não pode ser modificado'
    );
  }

  if (
    isTicketClosed(
      existingTicket
    )
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está finalizado. Reabra-o antes de modificar os dados.'
    );
  }

  var patch = {
    atualizadoEm:
      formatIsoDateTime(
        new Date()
      ),

    atualizadoPorId:
      user.id
  };

  if (
    data.quarto !== undefined ||
    data.local !== undefined
  ) {
    patch.quarto =
      normalizeTicketLocation(
        data.quarto !== undefined
          ? data.quarto
          : data.local
      );
  }

  if (
    data.categoria !== undefined
  ) {
    patch.categoria =
      requireTicketCategory(
        data.categoria
      );
  }

  if (
    data.tipoManutencao !== undefined ||
    data.tipo !== undefined
  ) {
    var rawPatchType = data.tipoManutencao !== undefined ? data.tipoManutencao : data.tipo;
    patch.tipoManutencao =
      requireMaintenanceType(
        rawPatchType
      );
    patch.tipo =
      TICKET_MAINTENANCE_TYPE_LABELS[patch.tipoManutencao] ||
      patch.tipoManutencao;
    patch.isStrategic =
      patch.tipoManutencao === 'estrategico';
  }

  if (
    data.descricao !== undefined
  ) {
    patch.descricao =
      requireText(
        data.descricao,
        'Descrição',
        5,
        1000,
        false
      );
  }

  if (
    data.observacao !== undefined
  ) {
    patch.observacao =
      trimText(
        data.observacao,
        500
      );
  }

  if (
    data.turno !== undefined
  ) {
    patch.turno =
      requireTicketTurn(
        data.turno,
        true
      );
  }

  if (
    data.ativoId !== undefined ||
    data.ativoNome !== undefined
  ) {
    var asset =
      normalizeTicketAsset(
        Object.assign(
          {},
          existingTicket,
          data
        )
      );

    patch.ativoId =
      asset.ativoId;

    patch.ativoNome =
      asset.ativoNome;
  }

  if (
    data.prioridade !== undefined
  ) {
    /*
     * A prioridade afeta o SLA e só pode ser modificada
     * pelo administrador.
     */
    if (
      user.rol !==
      USER_ROLES.ADMIN
    ) {
      throw apiError(
        API_ERROR_CODES.FORBIDDEN,
        'Apenas o administrador pode alterar a prioridade'
      );
    }

    var newPriority =
      requireTicketPriority(
        data.prioridade
      );

    patch.prioridade =
      newPriority;

    var openingDate =
      getTicketOpeningDate(
        existingTicket
      );

    var deadlines =
      calculateConfiguredTicketDeadlines(
        openingDate,
        newPriority
      );

    patch.prazoResposta =
      deadlines.prazoResposta;

    patch.prazoResolucao =
      deadlines.prazoResolucao;

    patch.slaRespostaCumprido =
      existingTicket.respostaEm
        ? calculateSlaCompliance(
            patch.prazoResposta,
            existingTicket.respostaEm
          )
        : '';

    patch.slaResolucaoCumprido =
      existingTicket.resolvidoEm
        ? calculateSlaCompliance(
            patch.prazoResolucao,
            existingTicket.resolvidoEm
          )
        : '';
  }

  if (
    data.custoEstimado !== undefined
  ) {
    patch.custoEstimado =
      safeString(
        data.custoEstimado
      ).trim() === ''
        ? ''
        : String(
            roundMoney(
              requireNumberRange(
                data.custoEstimado,
                0,
                10000000,
                'Custo estimado',
                false
              )
            )
          );
  }

  return patch;
}

// =========================================================
// NORMALIZAÇÃO DE TICKETS ANTIGOS
// =========================================================

function normalizeLegacyTicket(
  ticket
) {
  var source =
    Object.assign(
      {},
      ticket || {}
    );

  var now =
    new Date();

  var normalizedStatus =
    normalizeTicketStatus(
      source.situacao
    ) ||
    TICKET_STATUS.ABERTO;

  var priority =
    normalizeTicketPriority(
      source.prioridade
    ) ||
    TICKET_PRIORITY.MEDIA;

  var isStrat =
    safeString(source.tipo).toLowerCase().indexOf('estrat') !== -1 ||
    safeString(source.tipoManutencao).toLowerCase().indexOf('estrat') !== -1 ||
    safeString(source.descricao).indexOf('[ESTRATÉGICO]') !== -1 ||
    safeString(source.descricao).indexOf('⭐') !== -1 ||
    safeString(source.prioridade).toLowerCase().indexOf('estrat') !== -1 ||
    safeString(source.categoria).toLowerCase().indexOf('estrat') !== -1 ||
    Boolean(source.isStrategic);

  var maintenanceType =
    normalizeMaintenanceType(
      isStrat ? 'estrategico' : (source.tipoManutencao || source.tipo)
    ) ||
    (isStrat ? 'estrategico' : 'correctivo');

  var date =
    isValidIsoDate(
      source.dataReporte
    )
      ? source.dataReporte
      : formatServerDate(now);

  var time =
    isValidTime(
      safeString(
        source.horaReporte
      ).substring(0, 5)
    )
      ? safeString(
          source.horaReporte
        ).substring(0, 5)
      : '00:00';

  var openingDate =
    parseLocalDateTime(
      date,
      time
    );

  var deadlines =
    calculateConfiguredTicketDeadlines(
      openingDate,
      priority
    );

  var createdAt =
    parseStoredDateTime(
      source.criadoEm
    )
      ? source.criadoEm
      : formatIsoDateTime(
          openingDate
        );

  var normalized =
    Object.assign(
      {},
      source,
      {
        numeroTicket:
          source.numeroTicket ||
          (
            source.id
              ? 'OT-' +
                safeString(
                  source.id
                )
                  .replace(
                    /[^a-zA-Z0-9]/g,
                    ''
                  )
                  .slice(-12)
                  .toUpperCase()
              : createTicketNumber(
                  openingDate
                )
          ),

        versao:
          String(
            getTicketVersion(
              source
            )
          ),

        quarto:
          source.quarto
            ? trimText(
                source.quarto,
                60
              ).toUpperCase()
            : 'SEM LOCAL',

        situacao:
          normalizedStatus,

        prioridade:
          priority,

        tipoManutencao:
          maintenanceType,

        tipo:
          TICKET_MAINTENANCE_TYPE_LABELS[maintenanceType] || (isStrat ? 'Estratégico' : (source.tipo || 'Corretivo')),

        isStrategic:
          isStrat || maintenanceType === 'estrategico',

        categoria:
          normalizeTicketCategory(
            source.categoria
          ) || 'Outros',

        dataReporte:
          date,

        horaReporte:
          time,

        semanaISO:
          source.semanaISO ||
          getSemanaISO(date),

        prazoResposta:
          source.prazoResposta ||
          deadlines.prazoResposta,

        prazoResolucao:
          source.prazoResolucao ||
          deadlines.prazoResolucao,

        minutosPausa:
          String(
            Math.max(
              0,
              Number(
                source.minutosPausa ||
                0
              ) || 0
            )
          ),

        materiais:
          safeJsonStringify(
            normalizeTicketMaterials(
              source.materiais || []
            ),
            50000
          ),

        criadoEm:
          createdAt,

        atualizadoEm:
          source.atualizadoEm ||
          createdAt,

        arquivado:
          isYes(source.arquivado)
            ? 'Sim'
            : 'Não'
      }
    );

  if (
    normalizedStatus ===
      TICKET_STATUS.FINALIZADO
  ) {
    normalized.fechadoEm =
      source.fechadoEm ||
      source.dataFechamento ||
      source.resolvidoEm ||
      createdAt;

    normalized.dataFechamento =
      source.dataFechamento ||
      safeString(
        normalized.fechadoEm
      ).substring(0, 10);
  }

  return normalized;
}

// =========================================================
// VALIDAÇÃO DA INTEGRIDADE DO TICKET
// =========================================================

function validateTicketIntegrity(
  ticket
) {
  var errors = [];
  var warnings = [];

  if (
    !ticket ||
    typeof ticket !== 'object'
  ) {
    return {
      valid: false,
      errors: [
        'Ticket ausente ou inválido'
      ],
      warnings: []
    };
  }

  try {
    requireTicketStatus(
      ticket.situacao
    );
  } catch (error) {
    errors.push(
      safeString(error.message)
    );
  }

  try {
    requireTicketPriority(
      ticket.prioridade
    );
  } catch (error) {
    errors.push(
      safeString(error.message)
    );
  }

  try {
    requireTicketCategory(
      ticket.categoria
    );
  } catch (error) {
    errors.push(
      safeString(error.message)
    );
  }

  try {
    requireMaintenanceType(
      ticket.tipoManutencao
    );
  } catch (error) {
    errors.push(
      safeString(error.message)
    );
  }

  if (
    !safeString(ticket.id).trim()
  ) {
    errors.push(
      'ID do ticket ausente'
    );
  }

  if (
    !safeString(
      ticket.numeroTicket
    ).trim()
  ) {
    warnings.push(
      'Número visível da ordem ausente'
    );
  }

  if (
    !safeString(
      ticket.quarto
    ).trim()
  ) {
    errors.push(
      'Quarto ou local ausente'
    );
  }

  if (
    !safeString(
      ticket.descricao
    ).trim()
  ) {
    errors.push(
      'Descrição ausente'
    );
  }

  if (
    !isValidIsoDate(
      ticket.dataReporte
    )
  ) {
    errors.push(
      'Data de reporte inválida'
    );
  }

  if (
    !isValidTime(
      safeString(
        ticket.horaReporte
      ).substring(0, 5)
    )
  ) {
    errors.push(
      'Hora de reporte inválida'
    );
  }

  var status =
    normalizeTicketStatus(
      ticket.situacao
    );

  if (
    status ===
      TICKET_STATUS.ATRIBUIDO &&
    !safeString(
      ticket.responsavelId
    ).trim()
  ) {
    errors.push(
      'Ticket atribuído sem responsável'
    );
  }

  if (
    [
      TICKET_STATUS.EM_ANDAMENTO,
      TICKET_STATUS.PAUSADO,
      TICKET_STATUS
        .AGUARDANDO_MATERIAL,
      TICKET_STATUS.RESOLVIDO,
      TICKET_STATUS.FINALIZADO
    ].indexOf(status) !== -1 &&
    !safeString(
      ticket.iniciadoEm
    ).trim()
  ) {
    warnings.push(
      'Ticket em execução ou concluído sem data de início'
    );
  }

  if (
    status ===
      TICKET_STATUS.PAUSADO &&
    !safeString(
      ticket.motivoPausa
    ).trim()
  ) {
    errors.push(
      'Ticket pausado sem motivo'
    );
  }

  if (
    status ===
      TICKET_STATUS
        .AGUARDANDO_MATERIAL &&
    !safeString(
      ticket.motivoPausa
    ).trim()
  ) {
    errors.push(
      'Ticket aguardando material sem justificação'
    );
  }

  if (
    [
      TICKET_STATUS.RESOLVIDO,
      TICKET_STATUS.FINALIZADO
    ].indexOf(status) !== -1
  ) {
    if (
      !safeString(
        ticket.diagnostico
      ).trim()
    ) {
      errors.push(
        'Ticket resolvido sem diagnóstico'
      );
    }

    if (
      !safeString(
        ticket.trabalhoRealizado
      ).trim()
    ) {
      errors.push(
        'Ticket resolvido sem trabalho realizado'
      );
    }

    if (
      !safeString(
        ticket.resolvidoEm
      ).trim()
    ) {
      errors.push(
        'Ticket resolvido sem data de resolução'
      );
    }

    if (
      !safeString(
        ticket.resolvidoPorId
      ).trim()
    ) {
      errors.push(
        'Ticket resolvido sem utilizador responsável'
      );
    }
  }

  if (
    status ===
      TICKET_STATUS.FINALIZADO
  ) {
    if (
      safeString(
        ticket.comentarioCierre
      ).trim().length < 10
    ) {
      errors.push(
        'Ticket finalizado sem comentário de fecho válido'
      );
    }

    if (
      !safeString(
        ticket.fechadoEm ||
        ticket.dataFechamento
      ).trim()
    ) {
      errors.push(
        'Ticket finalizado sem data de fecho'
      );
    }

    if (
      !safeString(
        ticket.fechadoPorId
      ).trim()
    ) {
      errors.push(
        'Ticket finalizado sem administrador responsável'
      );
    }
  }

  if (
    isTicketArchived(ticket) &&
    !safeString(
      ticket.arquivadoEm
    ).trim()
  ) {
    errors.push(
      'Ticket arquivado sem data de arquivo'
    );
  }

  if (
    isTicketArchived(ticket) &&
    !safeString(
      ticket.arquivadoPorId
    ).trim()
  ) {
    errors.push(
      'Ticket arquivado sem utilizador responsável'
    );
  }

  var version =
    getTicketVersion(ticket);

  if (
    version < 1
  ) {
    errors.push(
      'Versão do ticket inválida'
    );
  }

  try {
    var materials =
      normalizeTicketMaterials(
        ticket.materiais || []
      );

    var calculatedMaterialsCost =
      getMaterialsTotal(materials);

    var realCost =
      parseDecimal(
        ticket.custoReal,
        null
      );

    if (
      realCost !== null &&
      realCost <
        calculatedMaterialsCost
    ) {
      warnings.push(
        'O custo real é inferior ao custo total dos materiais'
      );
    }
  } catch (error) {
    errors.push(
      'Materiais inválidos: ' +
      safeString(
        error.message ||
        error
      )
    );
  }

  try {
    var slaState =
      getTicketSlaState(ticket);

    if (
      slaState.respostaVencida
    ) {
      warnings.push(
        'SLA de resposta vencido'
      );
    }

    if (
      slaState.resolucaoVencida
    ) {
      warnings.push(
        'SLA de resolução vencido'
      );
    }
  } catch (error) {
    warnings.push(
      'Não foi possível avaliar o SLA: ' +
      safeString(
        error.message ||
        error
      )
    );
  }

  return {
    valid:
      errors.length === 0,

    errors: errors,
    warnings: warnings
  };
}

// =========================================================
// ENRIQUECIMENTO PARA O FRONTEND
// =========================================================

function enrichTicket(ticket) {
  if (!ticket) {
    return null;
  }

  var source =
    normalizeLegacyTicket(
      ticket
    );

  var slaState;

  try {
    slaState =
      getTicketSlaState(source);
  } catch (error) {
    slaState = {
      prazoResposta:
        source.prazoResposta || '',

      prazoResolucao:
        source.prazoResolucao || '',

      respostaCumprida:
        source
          .slaRespostaCumprido || '',

      resolucaoCumprida:
        source
          .slaResolucaoCumprido || '',

      respostaVencida: false,
      resolucaoVencida: false,
      vencido: false,

      minutosParaResposta:
        null,

      minutosParaResolucao:
        null
    };
  }

  var materials =
    normalizeTicketMaterials(
      source.materiais || []
    );

  var responseMinutes =
    calculateTicketResponseMinutes(
      source
    );

  var resolutionMinutes =
    calculateTicketResolutionMinutes(
      source
    );

  var responsible = null;

  if (source.responsavelId) {
    responsible =
      findUserById(
        source.responsavelId
      );
  }

  return Object.assign(
    {},
    source,
    {
      statusLabel:
        TICKET_STATUS_LABELS[
          source.situacao
        ] || source.situacao,

      prioridadeLabel:
        TICKET_PRIORITY_LABELS[
          source.prioridade
        ] || source.prioridade,

      tipoManutencaoLabel:
        TICKET_MAINTENANCE_TYPE_LABELS[
          source.tipoManutencao
        ] ||
        source.tipoManutencao,

      versao:
        getTicketVersion(source),

      arquivado:
        isTicketArchived(source)
          ? 'Sim'
          : 'Não',

      ativo:
        isTicketActive(source),

      fechado:
        isTicketClosed(source),

      resolvido:
        isTicketResolved(source),

      vencido:
        slaState.vencido,

      respostaVencida:
        slaState.respostaVencida,

      resolucaoVencida:
        slaState.resolucaoVencida,

      minutosParaResposta:
        slaState.minutosParaResposta,

      minutosParaResolucao:
        slaState.minutosParaResolucao,

      tempoRespostaMinutos:
        responseMinutes,

      tempoResolucaoMinutos:
        resolutionMinutes,

      slaRespostaCumprido:
        source
          .slaRespostaCumprido ||
        slaState.respostaCumprida,

      slaResolucaoCumprido:
        source
          .slaResolucaoCumprido ||
        slaState.resolucaoCumprida,

      responsavelNome:
        source.responsavelNome ||
        (
          responsible
            ? (
                responsible.nombre ||
                responsible.usuario
              )
            : ''
        ),

      materiaisDetalhe:
        materials,

      custoMateriais:
        getMaterialsTotal(
          materials
        ),

      integridade:
        validateTicketIntegrity(
          source
        )
    }
  );
}

// =========================================================
// FILTROS DE TICKETS
// =========================================================

function ticketMatchesFilters(
  ticket,
  filters
) {
  var source =
    enrichTicket(ticket);

  var criteria =
    filters || {};

  if (
    criteria.includeArchived !== true &&
    isTicketArchived(source)
  ) {
    return false;
  }

  if (
    criteria.onlyArchived === true &&
    !isTicketArchived(source)
  ) {
    return false;
  }

  if (
    criteria.situacao &&
    criteria.situacao !== 'all' &&
    source.situacao !==
      normalizeTicketStatus(
        criteria.situacao
      )
  ) {
    return false;
  }

  if (
    criteria.prioridade &&
    criteria.prioridade !== 'all' &&
    source.prioridade !==
      normalizeTicketPriority(
        criteria.prioridade
      )
  ) {
    return false;
  }

  if (
    criteria.categoria &&
    criteria.categoria !== 'all' &&
    source.categoria !==
      normalizeTicketCategory(
        criteria.categoria
      )
  ) {
    return false;
  }

  if (
    criteria.tipoManutencao &&
    criteria.tipoManutencao !== 'all' &&
    source.tipoManutencao !==
      normalizeMaintenanceType(
        criteria.tipoManutencao
      )
  ) {
    return false;
  }

  if (
    criteria.responsavelId &&
    safeString(
      source.responsavelId
    ) !==
      safeString(
        criteria.responsavelId
      )
  ) {
    return false;
  }

  if (
    criteria.quarto &&
    safeString(
      source.quarto
    )
      .toLowerCase()
      .indexOf(
        safeString(
          criteria.quarto
        ).toLowerCase()
      ) === -1
  ) {
    return false;
  }

  if (
    criteria.desde &&
    source.dataReporte <
      safeString(criteria.desde)
  ) {
    return false;
  }

  if (
    criteria.hasta &&
    source.dataReporte >
      safeString(criteria.hasta)
  ) {
    return false;
  }

  if (
    criteria.vencido === true &&
    !source.vencido
  ) {
    return false;
  }

  if (
    criteria.vencido === false &&
    source.vencido
  ) {
    return false;
  }

  if (
    criteria.semResponsavel === true &&
    safeString(
      source.responsavelId
    ).trim()
  ) {
    return false;
  }

  var query =
    safeString(
      criteria.search ||
      criteria.query
    )
      .trim()
      .toLowerCase();

  if (query) {
    var searchableText = [
      source.id,
      source.numeroTicket,
      source.quarto,
      source.ativoNome,
      source.categoria,
      source.descricao,
      source.observacao,
      source.colaborador,
      source.responsavelNome,
      source.diagnostico,
      source.trabalhoRealizado
    ].join(' ').toLowerCase();

    if (
      searchableText.indexOf(
        query
      ) === -1
    ) {
      return false;
    }
  }

  return true;
}

// =========================================================
// ORDENAÇÃO DOS TICKETS
// =========================================================

function getTicketPriorityWeight(
  priority
) {
  var weights = {
    critica: 4,
    alta: 3,
    media: 2,
    baixa: 1
  };

  return (
    weights[
      normalizeTicketPriority(
        priority
      )
    ] || 0
  );
}

function sortTickets(
  tickets,
  order
) {
  var sortOrder =
    safeString(
      order || 'priority_desc'
    );

  return (tickets || [])
    .slice()
    .sort(
      function (left, right) {
        if (
          sortOrder ===
          'date_asc'
        ) {
          return (
            safeString(
              left.dataReporte
            ) +
            safeString(
              left.horaReporte
            )
          ).localeCompare(
            safeString(
              right.dataReporte
            ) +
            safeString(
              right.horaReporte
            )
          );
        }

        if (
          sortOrder ===
          'date_desc'
        ) {
          return (
            safeString(
              right.dataReporte
            ) +
            safeString(
              right.horaReporte
            )
          ).localeCompare(
            safeString(
              left.dataReporte
            ) +
            safeString(
              left.horaReporte
            )
          );
        }

        var priorityDifference =
          getTicketPriorityWeight(
            right.prioridade
          ) -
          getTicketPriorityWeight(
            left.prioridade
          );

        if (
          priorityDifference !== 0
        ) {
          return priorityDifference;
        }

        if (
          left.vencido !==
          right.vencido
        ) {
          return left.vencido
            ? -1
            : 1;
        }

        return (
          safeString(
            right.dataReporte
          ) +
          safeString(
            right.horaReporte
          )
        ).localeCompare(
          safeString(
            left.dataReporte
          ) +
          safeString(
            left.horaReporte
          )
        );
      }
    );
}

// =========================================================
// OPÇÕES PARA O FRONTEND
// =========================================================

function getTicketDomainOptions() {
  return {
    status:
      TICKET_STATUS,

    statusLabels:
      TICKET_STATUS_LABELS,

    transitions:
      TICKET_TRANSITIONS,

    priorities:
      TICKET_PRIORITY,

    priorityLabels:
      TICKET_PRIORITY_LABELS,

    maintenanceTypes:
      TICKET_MAINTENANCE_TYPES,

    maintenanceTypeLabels:
      TICKET_MAINTENANCE_TYPE_LABELS,

    categories:
      TICKET_CATEGORIAS,

    turns:
      TICKET_TURNOS,

    sla:
      TICKET_PRIORITY_VALUES
        .reduce(
          function (
            output,
            priority
          ) {
            output[priority] =
              getConfiguredTicketSla(
                priority
              );

            return output;
          },
          {}
        )
  };
}

// =========================================================
// DIAGNÓSTICO DO DOMÍNIO
// =========================================================

function diagnoseTicketDomain() {
  var tickets =
    repositoryList(
      'ticket',
      {
        fresh: true
      }
    );

  var invalid = [];
  var warnings = [];
  var byStatus = {};
  var byPriority = {};

  tickets.forEach(
    function (ticket) {
      var normalized =
        normalizeLegacyTicket(
          ticket
        );

      var validation =
        validateTicketIntegrity(
          normalized
        );

      if (!validation.valid) {
        invalid.push({
          id: ticket.id,
          numeroTicket:
            normalized.numeroTicket,
          errors:
            validation.errors
        });
      }

      if (
        validation.warnings.length
      ) {
        warnings.push({
          id: ticket.id,
          numeroTicket:
            normalized.numeroTicket,
          warnings:
            validation.warnings
        });
      }

      byStatus[
        normalized.situacao
      ] =
        (
          byStatus[
            normalized.situacao
          ] || 0
        ) + 1;

      byPriority[
        normalized.prioridade
      ] =
        (
          byPriority[
            normalized.prioridade
          ] || 0
        ) + 1;
    }
  );

  return {
    ok:
      invalid.length === 0,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    total:
      tickets.length,

    invalid:
      invalid,

    warnings:
      warnings,

    byStatus:
      byStatus,

    byPriority:
      byPriority
  };
}

// =========================================================
// MARCADOR DE FIM DA PARTE 7
// =========================================================

/*
 * FIM DE 07_TicketDomain.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 7/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 8/13 — Serviço de ordens de trabalho
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 * - 04_ConfigService.gs
 * - 05_OperationalRecords.gs
 * - 06_Refrigeration.gs
 * - 07_TicketDomain.gs
 */

// =========================================================
// CONSULTA DE TICKETS
// =========================================================

function findTicketById(
  id,
  options
) {
  var ticket =
    repositoryFindById(
      'ticket',
      id,
      options
    );

  return ticket
    ? normalizeLegacyTicket(ticket)
    : null;
}

function requireTicketById(
  id,
  options
) {
  var ticket =
    findTicketById(
      id,
      options
    );

  if (!ticket) {
    throw apiError(
      API_ERROR_CODES.NOT_FOUND,
      'Ticket não encontrado',
      {
        id: id
      }
    );
  }

  return ticket;
}

function listTickets(
  filters,
  options
) {
  var criteria =
    filters || {};

  var settings =
    options || {};

  var tickets =
    repositoryList(
      'ticket',
      {
        fresh:
          Boolean(settings.fresh)
      }
    )
      .map(normalizeLegacyTicket)
      .filter(function (ticket) {
        return ticketMatchesFilters(
          ticket,
          criteria
        );
      })
      .map(enrichTicket);

  return sortTickets(
    tickets,
    criteria.order ||
      settings.order ||
      'priority_desc'
  );
}

function getTicket(
  id,
  options
) {
  var ticket =
    requireTicketById(
      id,
      options
    );

  return enrichTicket(ticket);
}

// =========================================================
// CONTROLO DE VERSÃO
// =========================================================

function getExpectedTicketVersion(
  data,
  options
) {
  var source = data || {};
  var settings = options || {};

  var value =
    settings.expectedVersion !==
      undefined
      ? settings.expectedVersion
      : source.expectedVersion !==
          undefined
        ? source.expectedVersion
        : source.versao;

  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return null;
  }

  return requireIntegerRange(
    value,
    1,
    100000000,
    'Versão do ticket',
    false
  );
}

// =========================================================
// AUDITORIA DO TICKET
// =========================================================

function auditTicketAction(
  uid,
  action,
  ticketId,
  details,
  requestId
) {
  if (
    typeof logAudit !==
    'function'
  ) {
    return;
  }

  logAudit(
    uid,
    action,
    'ticket',
    ticketId,
    details || {},
    requestId
  );
}

// =========================================================
// MATERIAIS DO TICKET
// =========================================================

function listTicketMaterials(
  ticketId
) {
  var id = requireId(
    ticketId,
    'ID do ticket'
  );

  return repositoryQuery(
    'ticketMaterial',
    function (record) {
      return (
        safeString(
          record.ticketId
        ) === id
      );
    }
  );
}

function deleteTicketMaterialRows(
  ticketId
) {
  var records =
    listTicketMaterials(
      ticketId
    );

  /*
   * Eliminar de baixo para cima evita alterar
   * os índices das linhas ainda por remover.
   */
  records
    .slice()
    .sort(function (left, right) {
      return Number(right._row || 0) -
        Number(left._row || 0);
    })
    .forEach(function (record) {
      repositoryDeletePhysical(
        'ticketMaterial',
        record.id,
        {
          ignoreMissing: true
        }
      );
    });

  return records.length;
}

function replaceTicketMaterials(
  ticketId,
  materials,
  uid
) {
  var id = requireId(
    ticketId,
    'ID do ticket'
  );

  var normalized =
    normalizeTicketMaterials(
      materials || []
    );

  deleteTicketMaterialRows(id);

  if (!normalized.length) {
    return {
      deleted: true,
      created: 0,
      records: []
    };
  }

  var timestamp =
    formatIsoDateTime(
      new Date()
    );

  var rows = normalized.map(
    function (material) {
      return {
        ticketId: id,
        codigo:
          material.codigo,

        descricao:
          material.descricao,

        quantidade:
          String(
            material.quantidade
          ),

        unidade:
          material.unidade,

        custoUnitario:
          String(
            material.custoUnitario
          ),

        custoTotal:
          String(
            material.custoTotal
          ),

        registadoEm:
          timestamp,

        registadoPorId:
          uid
      };
    }
  );

  var result =
    repositoryCreateBatch(
      'ticketMaterial',
      rows,
      {
        idPrefix:
          'ticket_material'
      }
    );

  return {
    deleted: true,
    created:
      result.created,
    records:
      result.records
  };
}

// =========================================================
// CRIAR TICKET
// =========================================================

function createTicket(
  data,
  uid,
  options
) {
  requirePermission(
    uid,
    PERMISSIONS.CREATE_TICKET
  );

  var settings =
    options || {};

  var prepared =
    prepareNewTicket(
      data,
      uid
    );

  if (data && data.id) {
    prepared.id = requireId(
      data.id,
      'ID do ticket'
    );
  }

  var result =
    repositoryCreate(
      'ticket',
      prepared,
      {
        idPrefix: 'ticket',
        failIfExists:
          settings.failIfExists ===
          true
      }
    );

  if (result.created) {
    auditTicketAction(
      uid,
      'createTicket',
      result.id,
      {
        numeroTicket:
          prepared.numeroTicket,

        quarto:
          prepared.quarto,

        categoria:
          prepared.categoria,

        prioridade:
          prepared.prioridade,

        situacao:
          prepared.situacao,

        responsavelId:
          prepared.responsavelId
      },
      settings.requestId
    );

    if (
      typeof sendNewTicketAlert ===
      'function'
    ) {
      sendNewTicketAlert(
        Object.assign(
          {},
          prepared,
          {
            id: result.id
          }
        ),
        uid
      );
    }
  }

  return {
    ok: true,
    id: result.id,
    created:
      result.created,
    idempotent:
      result.idempotent,
    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// CRIAR TICKETS EM LOTE (BATCH)
// =========================================================

function createTicketBatch(
  rows,
  uid,
  options
) {
  requirePermission(
    uid,
    PERMISSIONS.CREATE_TICKET
  );

  var source = requireArray(
    rows,
    'Lista de tickets',
    BACKEND_RELEASE.MAX_BATCH_SIZE,
    false
  );

  if (!source.length) {
    return {
      ok: true,
      ids: [],
      created: 0,
      skipped: 0
    };
  }

  var preparedRows = [];

  source.forEach(function (row, index) {
    try {
      var prepared = prepareNewTicket(
        row,
        uid
      );

      if (row && row.id) {
        prepared.id = requireId(
          row.id,
          'ID da linha ' + (index + 1)
        );
      }

      preparedRows.push(prepared);
    } catch (error) {
      throw apiError(
        getApiErrorCode(
          error,
          API_ERROR_CODES.VALIDATION
        ),
        'Linha ' +
          (index + 1) +
          ': ' +
          safeString(
            error.message || error
          )
      );
    }
  });

  var settings = options || {};

  var result = repositoryCreateBatch(
    'ticket',
    preparedRows,
    {
      idPrefix: 'ticket',
      failIfExists: false
    }
  );

  if (
    result.created > 0 &&
    typeof logAudit === 'function'
  ) {
    logAudit(
      uid,
      'createBatch',
      'ticket',
      '',
      {
        quantidade: result.created,
        ignorados: result.skipped,
        ids: result.ids
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    ids: result.ids,
    created: result.created,
    skipped: result.skipped
  };
}

// =========================================================
// ATUALIZAR DADOS BÁSICOS
// =========================================================

function updateTicketBasic(
  id,
  data,
  uid,
  options
) {
  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var patch =
    prepareTicketBasicUpdate(
      ticket,
      data,
      uid
    );

  var settings =
    options || {};

  var expectedVersion =
    getExpectedTicketVersion(
      data,
      settings
    );

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      patch,
      {
        expectedVersion:
          expectedVersion
      }
    );

  if (result.updated) {
    auditTicketAction(
      uid,
      'updateTicket',
      ticket.id,
      {
        numeroTicket:
          ticket.numeroTicket,

        alteracoes:
          result.changes
      },
      settings.requestId
    );
  }

  return {
    ok: true,
    id: ticket.id,
    updated:
      result.updated,
    unchanged:
      result.unchanged,
    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// ATRIBUIR RESPONSÁVEL
// =========================================================

function assignTicket(
  id,
  responsibleId,
  uid,
  options
) {
  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var actor =
    requirePermission(
      uid,
      PERMISSIONS.ASSIGN_TICKET,
      ticket
    );

  if (
    isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado'
    );
  }

  if (
    isTicketClosed(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está finalizado'
    );
  }

  var responsible =
    resolveTicketResponsible(
      responsibleId,
      false
    );

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  var nextStatus =
    currentStatus ===
      TICKET_STATUS.ABERTO
      ? TICKET_STATUS.ATRIBUIDO
      : currentStatus;

  if (
    currentStatus !== nextStatus
  ) {
    requireTicketTransition(
      currentStatus,
      nextStatus
    );
  }

  var now =
    formatIsoDateTime(
      new Date()
    );

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        responsavelId:
          responsible.id,

        responsavelNome:
          trimText(
            responsible.nombre ||
            responsible.nome ||
            responsible.usuario,
            80
          ),

        atribuidoEm: now,
        atribuidoPorId:
          actor.id,

        situacao:
          nextStatus,

        atualizadoEm: now,
        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'assignTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      responsavelAnterior:
        ticket.responsavelId,

      responsavelNovo:
        responsible.id,

      responsavelNome:
        responsible.nombre ||
        responsible.usuario,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        nextStatus
    },
    settings.requestId
  );

  if (
    typeof sendTicketAssignedAlert ===
    'function'
  ) {
    sendTicketAssignedAlert(
      result.record,
      responsible
    );
  }

  return {
    ok: true,
    id: ticket.id,
    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// INICIAR TICKET
// =========================================================

function startTicket(
  id,
  uid,
  options
) {
  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var actor =
    requirePermission(
      uid,
      PERMISSIONS.START_TICKET,
      ticket
    );

  if (
    isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado'
    );
  }

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  requireTicketTransition(
    currentStatus,
    TICKET_STATUS.EM_ANDAMENTO
  );

  var now =
    formatIsoDateTime(
      new Date()
    );

  var patch = {
    situacao:
      TICKET_STATUS.EM_ANDAMENTO,

    iniciadoEm:
      ticket.iniciadoEm || now,

    respostaEm:
      ticket.respostaEm || now,

    slaRespostaCumprido:
      calculateSlaCompliance(
        ticket.prazoResposta,
        ticket.respostaEm || now
      ),

    pausadoEm: '',
    motivoPausa: '',

    atualizadoEm: now,
    atualizadoPorId:
      actor.id
  };

  /*
   * Se o ticket ainda não estava atribuído,
   * o técnico que o inicia passa a ser responsável.
   */
  if (!ticket.responsavelId) {
    patch.responsavelId =
      actor.id;

    patch.responsavelNome =
      trimText(
        actor.nombre ||
        actor.nome ||
        actor.usuario,
        80
      );

    patch.atribuidoEm =
      now;

    patch.atribuidoPorId =
      actor.id;
  }

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      patch,
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'startTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        TICKET_STATUS
          .EM_ANDAMENTO,

      responsavelId:
        result.record
          .responsavelId,

      slaRespostaCumprido:
        result.record
          .slaRespostaCumprido
    },
    settings.requestId
  );

  return {
    ok: true,
    id: ticket.id,
    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// PAUSAR TICKET
// =========================================================

function pauseTicket(
  id,
  reason,
  waitingMaterial,
  uid,
  options
) {
  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var actor =
    requirePermission(
      uid,
      PERMISSIONS.PAUSE_TICKET,
      ticket
    );

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  var nextStatus =
    waitingMaterial
      ? TICKET_STATUS
          .AGUARDANDO_MATERIAL
      : TICKET_STATUS.PAUSADO;

  requireTicketTransition(
    currentStatus,
    nextStatus
  );

  var pauseReason =
    requirePauseReason(reason);

  var now =
    formatIsoDateTime(
      new Date()
    );

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        situacao:
          nextStatus,

        pausadoEm: now,

        motivoPausa:
          pauseReason,

        atualizadoEm: now,

        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    waitingMaterial
      ? 'waitTicketMaterial'
      : 'pauseTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        nextStatus,

      motivo:
        pauseReason
    },
    settings.requestId
  );

  return {
    ok: true,
    id: ticket.id,
    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// REANUDAR TICKET
// =========================================================

function resumeTicket(
  id,
  uid,
  options
) {
  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var actor =
    requirePermission(
      uid,
      PERMISSIONS.START_TICKET,
      ticket
    );

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  if (
    currentStatus !==
      TICKET_STATUS.PAUSADO &&
    currentStatus !==
      TICKET_STATUS
        .AGUARDANDO_MATERIAL
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Apenas tickets pausados ou aguardando material podem ser retomados'
    );
  }

  requireTicketTransition(
    currentStatus,
    TICKET_STATUS.EM_ANDAMENTO
  );

  var nowDate =
    new Date();

  var now =
    formatIsoDateTime(
      nowDate
    );

  var accumulatedPause =
    Number(
      ticket.minutosPausa || 0
    );

  if (
    !isFinite(accumulatedPause) ||
    accumulatedPause < 0
  ) {
    accumulatedPause = 0;
  }

  var currentPauseMinutes =
    ticket.pausadoEm
      ? diffMinutes(
          ticket.pausadoEm,
          now
        )
      : 0;

  if (
    currentPauseMinutes === null ||
    !isFinite(
      currentPauseMinutes
    )
  ) {
    currentPauseMinutes = 0;
  }

  var totalPauseMinutes =
    accumulatedPause +
    currentPauseMinutes;

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        situacao:
          TICKET_STATUS
            .EM_ANDAMENTO,

        minutosPausa:
          String(
            totalPauseMinutes
          ),

        pausadoEm: '',
        motivoPausa: '',

        atualizadoEm: now,
        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'resumeTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        TICKET_STATUS
          .EM_ANDAMENTO,

      minutosPausaAdicionados:
        currentPauseMinutes,

      minutosPausaTotal:
        totalPauseMinutes
    },
    settings.requestId
  );

  return {
    ok: true,
    id: ticket.id,

    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// RESOLVER TICKET
// =========================================================

function resolveTicket(
  id,
  data,
  uid,
  options
) {
  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var actor =
    requirePermission(
      uid,
      PERMISSIONS.RESOLVE_TICKET,
      ticket
    );

  if (
    isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado'
    );
  }

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  if (
    currentStatus !==
      TICKET_STATUS.EM_ANDAMENTO
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Apenas tickets em andamento podem ser resolvidos'
    );
  }

  requireTicketTransition(
    currentStatus,
    TICKET_STATUS.RESOLVIDO
  );

  var source = data || {};

  var resolution =
    requireTicketResolutionData(
      source
    );

  var resolutionComment =
    requireResolutionComment(
      source.comentarioResolucao ||
      source.comentarioCierre ||
      source.comentario
    );

  var now =
    formatIsoDateTime(
      new Date()
    );

  var materials =
    resolution
      .materiaisNormalizados;

  var patch = {
    situacao:
      TICKET_STATUS.RESOLVIDO,

    diagnostico:
      resolution.diagnostico,

    trabalhoRealizado:
      resolution
        .trabalhoRealizado,

    causaRaiz:
      resolution.causaRaiz,

    materiais:
      resolution.materiais,

    tempoTrabalhoMinutos:
      resolution
        .tempoTrabalhoMinutos,

    tempoParagemMinutos:
      resolution
        .tempoParagemMinutos,

    custoEstimado:
      resolution.custoEstimado ||
      ticket.custoEstimado ||
      '',

    custoReal:
      resolution.custoReal,

    necessitaSeguimento:
      resolution
        .necessitaSeguimento,

    dataSeguimento:
      resolution.dataSeguimento,

    /*
     * Mantém-se no campo antigo para compatibilidade
     * com o frontend atual.
     */
    comentarioCierre:
      resolutionComment,

    resolvidoEm: now,
    resolvidoPorId:
      actor.id,

    slaResolucaoCumprido:
      calculateSlaCompliance(
        ticket.prazoResolucao,
        now
      ),

    atualizadoEm: now,
    atualizadoPorId:
      actor.id
  };

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      patch,
      {
        expectedVersion:
          getExpectedTicketVersion(
            source,
            settings
          )
      }
    );

  replaceTicketMaterials(
    ticket.id,
    materials,
    uid
  );

  auditTicketAction(
    uid,
    'resolveTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        TICKET_STATUS.RESOLVIDO,

      diagnostico:
        resolution.diagnostico,

      trabalhoRealizado:
        resolution
          .trabalhoRealizado,

      materiais:
        materials,

      custoReal:
        resolution.custoReal,

      slaResolucaoCumprido:
        result.record
          .slaResolucaoCumprido
    },
    settings.requestId
  );

  if (
    typeof sendTicketResolvedAlert ===
    'function'
  ) {
    sendTicketResolvedAlert(
      result.record,
      uid
    );
  }

  return {
    ok: true,
    id: ticket.id,

    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// FECHAR TICKET
// Apenas administradores.
// =========================================================

function closeTicket(
  id,
  closingComment,
  uid,
  options
) {
  var actor =
    requireAdmin(uid);

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  if (
    isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado'
    );
  }

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  if (
    currentStatus !==
      TICKET_STATUS.RESOLVIDO
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Apenas tickets resolvidos podem ser finalizados'
    );
  }

  requireTicketTransition(
    currentStatus,
    TICKET_STATUS.FINALIZADO
  );

  var comment =
    requireClosingComment(
      closingComment
    );

  var integrity =
    validateTicketIntegrity(
      Object.assign(
        {},
        ticket,
        {
          situacao:
            TICKET_STATUS.RESOLVIDO
        }
      )
    );

  if (!integrity.valid) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O ticket não possui os dados técnicos necessários para o fecho',
      {
        errors:
          integrity.errors
      }
    );
  }

  var nowDate =
    new Date();

  var now =
    formatIsoDateTime(
      nowDate
    );

  var date =
    formatServerDate(
      nowDate
    );

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        situacao:
          TICKET_STATUS.FINALIZADO,

        comentarioCierre:
          comment,

        dataFechamento:
          date,

        fechadoEm:
          now,

        fechadoPorId:
          actor.id,

        slaResolucaoCumprido:
          ticket
            .slaResolucaoCumprido ||
          calculateSlaCompliance(
            ticket.prazoResolucao,
            ticket.resolvidoEm ||
            now
          ),

        atualizadoEm:
          now,

        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'closeTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        TICKET_STATUS.FINALIZADO,

      comentario:
        comment,

      fechadoPorId:
        actor.id
    },
    settings.requestId
  );

  if (
    typeof sendTicketClosedAlert ===
    'function'
  ) {
    sendTicketClosedAlert(
      result.record,
      uid
    );
  }

  return {
    ok: true,
    id: ticket.id,

    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// REABRIR TICKET
// Apenas administradores.
// =========================================================

function reopenTicket(
  id,
  reason,
  uid,
  options
) {
  var actor =
    requireAdmin(uid);

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  if (
    isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado. Restaure-o antes de reabrir.'
    );
  }

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  if (
    currentStatus !==
      TICKET_STATUS.RESOLVIDO &&
    currentStatus !==
      TICKET_STATUS.FINALIZADO
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Apenas tickets resolvidos ou finalizados podem ser reabertos'
    );
  }

  var reopenReason =
    requireText(
      reason,
      'Motivo da reabertura',
      10,
      1000,
      false
    );

  var now =
    formatIsoDateTime(
      new Date()
    );

  var nextStatus =
    ticket.responsavelId
      ? TICKET_STATUS
          .EM_ANDAMENTO
      : TICKET_STATUS.ABERTO;

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        situacao:
          nextStatus,

        resolvidoEm: '',
        resolvidoPorId: '',

        dataFechamento: '',
        fechadoEm: '',
        fechadoPorId: '',

        comentarioCierre:
          'REABERTO: ' +
          reopenReason,

        slaResolucaoCumprido:
          '',

        atualizadoEm:
          now,

        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'reopenTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estadoAnterior:
        currentStatus,

      estadoNovo:
        nextStatus,

      motivo:
        reopenReason
    },
    settings.requestId
  );

  return {
    ok: true,
    id: ticket.id,

    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// ARQUIVAR TICKET — ELIMINAÇÃO LÓGICA
// =========================================================

function archiveTicket(
  id,
  reason,
  uid,
  options
) {
  var actor =
    requirePermission(
      uid,
      PERMISSIONS.ARCHIVE_TICKET
    );

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  if (
    isTicketArchived(ticket)
  ) {
    return {
      ok: true,
      id: ticket.id,
      archived: false,
      unchanged: true,

      ticket:
        enrichTicket(ticket)
    };
  }

  var archiveReason =
    requireText(
      reason,
      'Motivo do arquivo',
      5,
      500,
      false
    );

  var now =
    formatIsoDateTime(
      new Date()
    );

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        arquivado: 'Sim',

        arquivadoEm:
          now,

        arquivadoPorId:
          actor.id,

        motivoArquivo:
          archiveReason,

        atualizadoEm:
          now,

        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'archiveTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      estado:
        ticket.situacao,

      motivo:
        archiveReason
    },
    settings.requestId
  );

  return {
    ok: true,
    id: ticket.id,
    archived: true,

    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// RESTAURAR TICKET ARQUIVADO
// =========================================================

function restoreArchivedTicket(
  id,
  uid,
  options
) {
  var actor =
    requireAdmin(uid);

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  if (
    !isTicketArchived(ticket)
  ) {
    return {
      ok: true,
      restored: false,
      unchanged: true,

      ticket:
        enrichTicket(ticket)
    };
  }

  var now =
    formatIsoDateTime(
      new Date()
    );

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        arquivado: 'Não',
        arquivadoEm: '',
        arquivadoPorId: '',
        motivoArquivo: '',

        atualizadoEm: now,
        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'restoreArchivedTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket
    },
    settings.requestId
  );

  return {
    ok: true,
    restored: true,

    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// ELIMINAÇÃO FÍSICA EXCECIONAL
// =========================================================

function deleteTicketPhysical(
  id,
  confirmation,
  uid,
  options
) {
  requirePermission(
    uid,
    PERMISSIONS.DELETE_TICKET
  );

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  if (
    !isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket deve ser arquivado antes da eliminação definitiva'
    );
  }

  var expectedConfirmation =
    'ELIMINAR ' +
    safeString(
      ticket.numeroTicket
    );

  if (
    safeString(
      confirmation
    ).trim() !==
    expectedConfirmation
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Confirmação inválida. Escreva: ' +
        expectedConfirmation
    );
  }

  var settings =
    options || {};

  var materials =
    listTicketMaterials(
      ticket.id
    );

  /*
   * A auditoria é registada antes da eliminação.
   */
  auditTicketAction(
    uid,
    'deleteTicketPhysical',
    ticket.id,
    {
      ticket:
        ticket,

      materiais:
        materials
    },
    settings.requestId
  );

  deleteTicketMaterialRows(
    ticket.id
  );

  var result =
    repositoryDeletePhysical(
      'ticket',
      ticket.id
    );

  return {
    ok: true,
    id: ticket.id,
    deleted:
      result.deleted
  };
}

// =========================================================
// COMPATIBILIDADE COM O FRONTEND ATUAL
// =========================================================

function prepareTicketRecord(
  data,
  uid,
  existingRecord
) {
  if (!existingRecord) {
    return prepareNewTicket(
      data,
      uid
    );
  }

  var patch =
    prepareTicketBasicUpdate(
      existingRecord,
      data,
      uid
    );

  /*
   * Compatibilidade temporária:
   * o frontend antigo tenta alterar diretamente o estado.
   * Apenas estados não finais são aceites por esta função.
   */
  if (
    data &&
    data.situacao !== undefined
  ) {
    var requestedStatus =
      requireTicketStatus(
        data.situacao
      );

    var currentStatus =
      requireTicketStatus(
        existingRecord.situacao
      );

    if (
      requestedStatus ===
        TICKET_STATUS.RESOLVIDO ||
      requestedStatus ===
        TICKET_STATUS.FINALIZADO
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Utilize as operações específicas de resolução e fecho do ticket'
      );
    }

    if (
      requestedStatus !==
      currentStatus
    ) {
      requireTicketTransition(
        currentStatus,
        requestedStatus
      );

      patch.situacao =
        requestedStatus;
    }
  }

  return Object.assign(
    {},
    existingRecord,
    patch
  );
}

function saveTicket(
  data,
  uid,
  options
) {
  return createTicket(
    data,
    uid,
    options
  );
}
// =========================================================
// COMPATIBILIDAD: ACTUALIZAR TICKET
// =========================================================

function updateTicket(
  id,
  data,
  uid,
  options
) {
  var source = data || {};
  var settings = options || {};

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var requestedStatus =
    source.situacao
      ? normalizeTicketStatus(
          source.situacao
        )
      : '';

  var currentStatus =
    normalizeTicketStatus(
      ticket.situacao
    );

  /*
   * Si no se solicita un cambio de estado, solamente
   * se actualizan los datos básicos.
   */
  if (
    !requestedStatus ||
    requestedStatus === currentStatus
  ) {
    return updateTicketBasic(
      id,
      source,
      uid,
      settings
    );
  }

  // Asignar sin comenzar la intervención.
  if (
    requestedStatus ===
      TICKET_STATUS.ATRIBUIDO
  ) {
    if (!source.responsavelId) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'É necessário indicar o técnico responsável'
      );
    }

    return assignTicket(
      id,
      source.responsavelId,
      uid,
      settings
    );
  }

  // Comenzar o reanudar la intervención.
  if (
    requestedStatus ===
      TICKET_STATUS.EM_ANDAMENTO
  ) {
    if (
      currentStatus ===
        TICKET_STATUS.PAUSADO ||
      currentStatus ===
        TICKET_STATUS
          .AGUARDANDO_MATERIAL
    ) {
      return resumeTicket(
        id,
        uid,
        settings
      );
    }

    return startTicket(
      id,
      uid,
      settings
    );
  }

  // Pausar.
  if (
    requestedStatus ===
      TICKET_STATUS.PAUSADO
  ) {
    return pauseTicket(
      id,
      source.motivoPausa ||
        source.comentario ||
        source.observacao,
      false,
      uid,
      settings
    );
  }

  // Esperar material.
  if (
    requestedStatus ===
      TICKET_STATUS
        .AGUARDANDO_MATERIAL
  ) {
    return pauseTicket(
      id,
      source.motivoPausa ||
        source.comentario ||
        source.observacao,
      true,
      uid,
      settings
    );
  }

  /*
   * Resolver requiere diagnóstico, trabajo realizado
   * y comentario de resolución.
   */
  if (
    requestedStatus ===
      TICKET_STATUS.RESOLVIDO
  ) {
    return resolveTicket(
      id,
      source,
      uid,
      settings
    );
  }

  /*
   * Compatibilidad con el frontend antiguo:
   *
   * Antes solo existía "finalizado". Para no permitir
   * cierres sin información técnica:
   *
   * 1. Si está en andamento, primero se resuelve.
   * 2. Después, solo un administrador puede cerrarlo.
   * 3. El comentario mínimo sigue siendo obligatorio.
   */
  if (
    requestedStatus ===
      TICKET_STATUS.FINALIZADO
  ) {
    requireAdmin(uid);

    var closingComment =
      source.comentarioCierre ||
      source.comentario ||
      source.observacao;

    if (
      currentStatus ===
      TICKET_STATUS.EM_ANDAMENTO
    ) {
      var resolutionData =
        Object.assign(
          {},
          source,
          {
            comentarioResolucao:
              closingComment
          }
        );

      var resolvedResult =
        resolveTicket(
          id,
          resolutionData,
          uid,
          settings
        );

      return closeTicket(
        id,
        closingComment,
        uid,
        {
          requestId:
            settings.requestId,

          expectedVersion:
            resolvedResult.ticket
              .versao
        }
      );
    }

    if (
      currentStatus ===
      TICKET_STATUS.RESOLVIDO
    ) {
      return closeTicket(
        id,
        closingComment,
        uid,
        settings
      );
    }

    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket deve estar em andamento ou resolvido antes de ser finalizado'
    );
  }

  /*
   * Volver a abierto solo se acepta desde atribuído y
   * requiere administrador, porque elimina la asignación.
   */
  if (
    requestedStatus ===
      TICKET_STATUS.ABERTO &&
    currentStatus ===
      TICKET_STATUS.ATRIBUIDO
  ) {
    var actor = requireAdmin(uid);
    var now = formatIsoDateTime(
      new Date()
    );

    var result =
      repositoryPatch(
        'ticket',
        ticket.id,
        {
          situacao:
            TICKET_STATUS.ABERTO,

          responsavelId: '',
          responsavelNome: '',
          atribuidoEm: '',
          atribuidoPorId: '',

          atualizadoEm: now,
          atualizadoPorId:
            actor.id
        },
        {
          expectedVersion:
            getExpectedTicketVersion(
              source,
              settings
            )
        }
      );

    auditTicketAction(
      uid,
      'unassignTicket',
      ticket.id,
      {
        numeroTicket:
          ticket.numeroTicket,

        estadoAnterior:
          currentStatus,

        estadoNovo:
          TICKET_STATUS.ABERTO,

        responsavelAnterior:
          ticket.responsavelId
      },
      settings.requestId
    );

    return {
      ok: true,
      id: ticket.id,
      ticket:
        enrichTicket(
          result.record
        )
    };
  }

  throw apiError(
    API_ERROR_CODES.CONFLICT,
    'A alteração de estado solicitada não é permitida',
    {
      estadoAtual:
        currentStatus,

      estadoSolicitado:
        requestedStatus,

      estadosPermitidos:
        TICKET_TRANSITIONS[
          currentStatus
        ] || []
    }
  );
}

// =========================================================
// COMPATIBILIDAD: ELIMINAR TICKET
// =========================================================

function deleteTicket(
  id,
  uid,
  options
) {
  /*
   * La antigua operación "deleteTicket" se convierte
   * en archivo lógico para preservar el historial.
   *
   * La eliminación física requiere:
   * - ticket previamente archivado;
   * - confirmación explícita;
   * - operación deleteTicketPhysical.
   */
  requireAdmin(uid);

  var settings = options || {};

  return archiveTicket(
    id,
    settings.reason ||
      settings.motivo ||
      'Arquivado pelo administrador',
    uid,
    settings
  );
}

// =========================================================
// DESATRIBUIR TICKET
// =========================================================

function unassignTicket(
  id,
  reason,
  uid,
  options
) {
  var actor =
    requireAdmin(uid);

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  if (
    isTicketArchived(ticket)
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'O ticket está arquivado'
    );
  }

  var currentStatus =
    requireTicketStatus(
      ticket.situacao
    );

  if (
    currentStatus !==
      TICKET_STATUS.ATRIBUIDO &&
    currentStatus !==
      TICKET_STATUS.ABERTO
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Não é possível retirar o responsável depois do início da intervenção'
    );
  }

  var justification =
    requireText(
      reason,
      'Motivo da desatribuição',
      5,
      500,
      false
    );

  var now =
    formatIsoDateTime(
      new Date()
    );

  var settings =
    options || {};

  var result =
    repositoryPatch(
      'ticket',
      ticket.id,
      {
        situacao:
          TICKET_STATUS.ABERTO,

        responsavelId: '',
        responsavelNome: '',
        atribuidoEm: '',
        atribuidoPorId: '',

        atualizadoEm: now,
        atualizadoPorId:
          actor.id
      },
      {
        expectedVersion:
          getExpectedTicketVersion(
            settings,
            settings
          )
      }
    );

  auditTicketAction(
    uid,
    'unassignTicket',
    ticket.id,
    {
      numeroTicket:
        ticket.numeroTicket,

      responsavelAnterior:
        ticket.responsavelId,

      motivo:
        justification
    },
    settings.requestId
  );

  return {
    ok: true,
    id: ticket.id,
    ticket:
      enrichTicket(
        result.record
      )
  };
}

// =========================================================
// ESTADÍSTICAS DE TICKETS
// =========================================================

function getTicketStats(
  tickets,
  desde,
  hasta,
  options
) {
  var source =
    Array.isArray(tickets)
      ? tickets
      : repositoryList('ticket');

  var settings = options || {};

  var start = desde
    ? requireIsoDate(
        desde,
        'Data inicial',
        false
      )
    : '';

  var end = hasta
    ? requireIsoDate(
        hasta,
        'Data final',
        false
      )
    : '';

  if (
    start &&
    end &&
    start > end
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var filtered = source
    .map(normalizeLegacyTicket)
    .filter(
      function (ticket) {
        if (
          settings.includeArchived !== true &&
          isTicketArchived(ticket)
        ) {
          return false;
        }

        var date =
          safeString(
            ticket.dataReporte
          );

        if (
          start &&
          date < start
        ) {
          return false;
        }

        if (
          end &&
          date > end
        ) {
          return false;
        }

        return true;
      }
    )
    .map(enrichTicket);

  var byStatus = {};
  var byPriority = {};
  var byCategory = {};
  var byLocation = {};
  var byResponsible = {};
  var byMaintenanceType = {};

  var openCount = 0;
  var assignedCount = 0;
  var inProgressCount = 0;
  var pausedCount = 0;
  var waitingMaterialCount = 0;
  var resolvedCount = 0;
  var closedCount = 0;
  var overdueCount = 0;
  var criticalOpenCount = 0;
  var withoutResponsibleCount = 0;

  var responseTimes = [];
  var resolutionTimes = [];

  var responseSlaEvaluated = 0;
  var responseSlaCompliant = 0;
  var resolutionSlaEvaluated = 0;
  var resolutionSlaCompliant = 0;

  var estimatedCost = 0;
  var actualCost = 0;
  var materialsCost = 0;

  filtered.forEach(
    function (ticket) {
      var status =
        ticket.situacao;

      var priority =
        ticket.prioridade;

      var category =
        ticket.categoria ||
        'Sem categoria';

      var location =
        ticket.quarto ||
        'Sem local';

      var responsible =
        ticket.responsavelNome ||
        'Sem responsável';

      var maintenanceType =
        ticket.tipoManutencao ||
        'correctivo';

      byStatus[status] =
        (
          byStatus[status] || 0
        ) + 1;

      byPriority[priority] =
        (
          byPriority[priority] || 0
        ) + 1;

      byCategory[category] =
        (
          byCategory[category] || 0
        ) + 1;

      byLocation[location] =
        (
          byLocation[location] || 0
        ) + 1;

      byResponsible[responsible] =
        (
          byResponsible[
            responsible
          ] || 0
        ) + 1;

      byMaintenanceType[
        maintenanceType
      ] =
        (
          byMaintenanceType[
            maintenanceType
          ] || 0
        ) + 1;

      if (
        status ===
        TICKET_STATUS.ABERTO
      ) {
        openCount++;
      } else if (
        status ===
        TICKET_STATUS.ATRIBUIDO
      ) {
        assignedCount++;
      } else if (
        status ===
        TICKET_STATUS.EM_ANDAMENTO
      ) {
        inProgressCount++;
      } else if (
        status ===
        TICKET_STATUS.PAUSADO
      ) {
        pausedCount++;
      } else if (
        status ===
        TICKET_STATUS
          .AGUARDANDO_MATERIAL
      ) {
        waitingMaterialCount++;
      } else if (
        status ===
        TICKET_STATUS.RESOLVIDO
      ) {
        resolvedCount++;
      } else if (
        status ===
        TICKET_STATUS.FINALIZADO
      ) {
        closedCount++;
      }

      if (ticket.vencido) {
        overdueCount++;
      }

      if (
        priority ===
          TICKET_PRIORITY.CRITICA &&
        !ticket.resolvido
      ) {
        criticalOpenCount++;
      }

      if (
        !ticket.responsavelId &&
        !ticket.resolvido
      ) {
        withoutResponsibleCount++;
      }

      if (
        ticket.tempoRespostaMinutos !==
          null &&
        ticket.tempoRespostaMinutos !==
          undefined
      ) {
        responseTimes.push(
          Number(
            ticket
              .tempoRespostaMinutos
          )
        );
      }

      if (
        ticket.tempoResolucaoMinutos !==
          null &&
        ticket.tempoResolucaoMinutos !==
          undefined
      ) {
        resolutionTimes.push(
          Number(
            ticket
              .tempoResolucaoMinutos
          )
        );
      }

      if (
        ticket.slaRespostaCumprido
      ) {
        responseSlaEvaluated++;

        if (
          ticket.slaRespostaCumprido ===
          'Sim'
        ) {
          responseSlaCompliant++;
        }
      }

      if (
        ticket.slaResolucaoCumprido
      ) {
        resolutionSlaEvaluated++;

        if (
          ticket
            .slaResolucaoCumprido ===
          'Sim'
        ) {
          resolutionSlaCompliant++;
        }
      }

      estimatedCost +=
        parseDecimal(
          ticket.custoEstimado,
          0
        ) || 0;

      actualCost +=
        parseDecimal(
          ticket.custoReal,
          0
        ) || 0;

      materialsCost +=
        Number(
          ticket.custoMateriais || 0
        );
    }
  );

  function average(values) {
    if (!values.length) {
      return null;
    }

    return Math.round(
      values.reduce(
        function (total, value) {
          return total + value;
        },
        0
      ) /
      values.length
    );
  }

  var total =
    filtered.length;

  var completed =
    resolvedCount +
    closedCount;

  return {
    desde: start,
    hasta: end,

    total: total,

    // Compatibilidad con nombres del backend anterior.
    abiertos: openCount,
    enProceso: inProgressCount,
    pausados: pausedCount,
    finalizados: closedCount,

    aberto: openCount,
    atribuido: assignedCount,
    emAndamento: inProgressCount,
    pausado: pausedCount,
    aguardandoMaterial:
      waitingMaterialCount,
    resolvido: resolvedCount,
    finalizado: closedCount,

    ativos:
      total -
      resolvedCount -
      closedCount,

    concluidos:
      completed,

    vencidos:
      overdueCount,

    criticosAbertos:
      criticalOpenCount,

    semResponsavel:
      withoutResponsibleCount,

    cumprimento:
      total > 0
        ? Math.round(
            completed /
            total *
            100
          )
        : 0,

    tempoMedioRespostaMinutos:
      average(responseTimes),

    mttrMinutos:
      average(resolutionTimes),

    slaRespostaPct:
      responseSlaEvaluated > 0
        ? Math.round(
            responseSlaCompliant /
            responseSlaEvaluated *
            100
          )
        : null,

    slaResolucaoPct:
      resolutionSlaEvaluated > 0
        ? Math.round(
            resolutionSlaCompliant /
            resolutionSlaEvaluated *
            100
          )
        : null,

    custos: {
      estimado:
        roundMoney(
          estimatedCost
        ),

      real:
        roundMoney(
          actualCost
        ),

      materiais:
        roundMoney(
          materialsCost
        )
    },

    porEstado:
      byStatus,

    porPrioridade:
      byPriority,

    porCategoria:
      byCategory,

    porQuarto:
      byLocation,

    porResponsavel:
      byResponsible,

    porTipoManutencao:
      byMaintenanceType
  };
}

// =========================================================
// RESUMEN OPERATIVO DE MANTENIMIENTO
// =========================================================

function getMaintenanceDashboard(
  options
) {
  var settings = options || {};

  var tickets = listTickets(
    {
      includeArchived: false,
      order: 'priority_desc'
    },
    {
      fresh:
        Boolean(
          settings.fresh
        )
    }
  );

  var stats = getTicketStats(
    tickets,
    settings.desde || '',
    settings.hasta || '',
    {
      includeArchived: false
    }
  );

  var urgent = tickets.filter(
    function (ticket) {
      return (
        !ticket.resolvido &&
        (
          ticket.prioridade ===
            TICKET_PRIORITY.CRITICA ||
          ticket.vencido
        )
      );
    }
  );

  var awaitingValidation =
    tickets.filter(
      function (ticket) {
        return (
          ticket.situacao ===
          TICKET_STATUS.RESOLVIDO
        );
      }
    );

  var withoutResponsible =
    tickets.filter(
      function (ticket) {
        return (
          !ticket.resolvido &&
          !ticket.responsavelId
        );
      }
    );

  return {
    generatedAt:
      formatIsoDateTime(
        new Date()
      ),

    stats: stats,

    urgent:
      urgent.slice(0, 20),

    awaitingValidation:
      awaitingValidation
        .slice(0, 20),

    withoutResponsible:
      withoutResponsible
        .slice(0, 20)
  };
}

// =========================================================
// HISTÓRICO DE UM TICKET
// =========================================================

function getTicketHistory(
  id,
  uid,
  options
) {
  requirePermission(
    uid,
    PERMISSIONS.READ
  );

  var ticket =
    requireTicketById(
      id,
      {
        fresh: true
      }
    );

  var settings =
    options || {};

  var history = [];

  /*
   * A função listAuditRecords será implementada
   * em 09_AuditService.gs.
   */
  if (
    typeof listAuditRecords ===
    'function'
  ) {
    history = listAuditRecords(
      {
        tipo: 'ticket',
        registroId: ticket.id,
        desde:
          settings.desde || '',
        hasta:
          settings.hasta || '',
        limit:
          settings.limit || 500
      }
    );
  }

  return {
    ok: true,

    ticket:
      enrichTicket(ticket),

    materials:
      listTicketMaterials(
        ticket.id
      ),

    history:
      history
  };
}

// =========================================================
// TICKETS ATRIBUÍDOS A UM UTILIZADOR
// =========================================================

function listTicketsAssignedToUser(
  userId,
  options
) {
  var id = requireId(
    userId,
    'ID do utilizador'
  );

  var settings =
    options || {};

  var filters = {
    responsavelId: id,

    includeArchived:
      settings.includeArchived ===
      true,

    order:
      settings.order ||
      'priority_desc'
  };

  if (settings.situacao) {
    filters.situacao =
      settings.situacao;
  }

  if (settings.prioridade) {
    filters.prioridade =
      settings.prioridade;
  }

  if (settings.vencido !== undefined) {
    filters.vencido =
      settings.vencido;
  }

  return listTickets(
    filters,
    {
      fresh:
        Boolean(settings.fresh)
    }
  );
}

// =========================================================
// TICKETS DO UTILIZADOR AUTENTICADO
// =========================================================

function listMyTickets(
  uid,
  options
) {
  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  return listTicketsAssignedToUser(
    user.id,
    options
  );
}

// =========================================================
// TICKETS VENCIDOS
// =========================================================

function listOverdueTickets(
  options
) {
  var settings =
    options || {};

  return listTickets(
    {
      vencido: true,

      includeArchived:
        settings.includeArchived ===
        true,

      prioridade:
        settings.prioridade ||
        'all',

      responsavelId:
        settings.responsavelId ||
        '',

      order:
        'priority_desc'
    },
    {
      fresh:
        Boolean(settings.fresh)
    }
  );
}

// =========================================================
// TICKETS CRÍTICOS EM ABERTO
// =========================================================

function listOpenCriticalTickets(
  options
) {
  var settings =
    options || {};

  return listTickets(
    {
      prioridade:
        TICKET_PRIORITY.CRITICA,

      includeArchived: false,

      order:
        'priority_desc'
    },
    {
      fresh:
        Boolean(settings.fresh)
    }
  ).filter(function (ticket) {
    return !ticket.resolvido;
  });
}

// =========================================================
// TICKETS PENDENTES DE VALIDAÇÃO
// =========================================================

function listTicketsAwaitingClosure(
  options
) {
  var settings =
    options || {};

  return listTickets(
    {
      situacao:
        TICKET_STATUS.RESOLVIDO,

      includeArchived: false,

      order:
        settings.order ||
        'date_asc'
    },
    {
      fresh:
        Boolean(settings.fresh)
    }
  );
}

// =========================================================
// REINCIDÊNCIAS POR LOCAL OU ATIVO
// =========================================================

function getTicketRecurrences(
  desde,
  hasta,
  options
) {
  var settings =
    options || {};

  var start = desde
    ? requireIsoDate(
        desde,
        'Data inicial',
        false
      )
    : '';

  var end = hasta
    ? requireIsoDate(
        hasta,
        'Data final',
        false
      )
    : '';

  if (
    start &&
    end &&
    start > end
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var tickets = listTickets(
    {
      desde: start,
      hasta: end,

      includeArchived:
        settings.includeArchived ===
        true,

      order: 'date_desc'
    },
    {
      fresh:
        Boolean(settings.fresh)
    }
  );

  var groups = {};

  tickets.forEach(function (ticket) {
    var key;

    if (ticket.ativoId) {
      key =
        'asset:' +
        safeString(
          ticket.ativoId
        );
    } else {
      key =
        'location:' +
        safeString(
          ticket.quarto
        ).toUpperCase();
    }

    if (!groups[key]) {
      groups[key] = {
        key: key,

        ativoId:
          ticket.ativoId || '',

        ativoNome:
          ticket.ativoNome || '',

        quarto:
          ticket.quarto || '',

        total: 0,

        abertos: 0,
        resolvidos: 0,

        categorias: {},
        tickets: []
      };
    }

    var group =
      groups[key];

    group.total++;

    if (ticket.resolvido) {
      group.resolvidos++;
    } else {
      group.abertos++;
    }

    group.categorias[
      ticket.categoria
    ] =
      (
        group.categorias[
          ticket.categoria
        ] || 0
      ) + 1;

    group.tickets.push({
      id: ticket.id,
      numeroTicket:
        ticket.numeroTicket,

      dataReporte:
        ticket.dataReporte,

      categoria:
        ticket.categoria,

      prioridade:
        ticket.prioridade,

      situacao:
        ticket.situacao
    });
  });

  var minimumOccurrences =
    Number(
      settings.minimumOccurrences ||
      2
    );

  if (
    !isFinite(minimumOccurrences) ||
    minimumOccurrences < 2
  ) {
    minimumOccurrences = 2;
  }

  return Object.keys(groups)
    .map(function (key) {
      return groups[key];
    })
    .filter(function (group) {
      return (
        group.total >=
        minimumOccurrences
      );
    })
    .sort(function (left, right) {
      return (
        right.total -
        left.total
      );
    });
}

// =========================================================
// CARGA DE TRABALHO POR TÉCNICO
// =========================================================

function getTechnicianWorkload(
  options
) {
  var settings =
    options || {};

  var users =
    getAllUsersRaw({
      fresh:
        Boolean(settings.fresh)
    }).filter(function (user) {
      return (
        !isNo(user.activo) &&
        (
          user.rol ===
            USER_ROLES.TECNICO ||
          user.rol ===
            USER_ROLES.ADMIN
        )
      );
    });

  var activeTickets =
    listTickets(
      {
        includeArchived: false,
        order:
          'priority_desc'
      },
      {
        fresh:
          Boolean(settings.fresh)
      }
    ).filter(function (ticket) {
      return !ticket.resolvido;
    });

  return users.map(function (user) {
    var assigned =
      activeTickets.filter(
        function (ticket) {
          return (
            safeString(
              ticket.responsavelId
            ) ===
            safeString(user.id)
          );
        }
      );

    var critical =
      assigned.filter(
        function (ticket) {
          return (
            ticket.prioridade ===
            TICKET_PRIORITY.CRITICA
          );
        }
      ).length;

    var overdue =
      assigned.filter(
        function (ticket) {
          return ticket.vencido;
        }
      ).length;

    var inProgress =
      assigned.filter(
        function (ticket) {
          return (
            ticket.situacao ===
            TICKET_STATUS
              .EM_ANDAMENTO
          );
        }
      ).length;

    return {
      userId: user.id,

      nome:
        user.nombre ||
        user.usuario,

      totalAssigned:
        assigned.length,

      critical:
        critical,

      overdue:
        overdue,

      inProgress:
        inProgress,

      tickets:
        assigned
    };
  }).sort(function (left, right) {
    if (
      left.critical !==
      right.critical
    ) {
      return (
        right.critical -
        left.critical
      );
    }

    if (
      left.overdue !==
      right.overdue
    ) {
      return (
        right.overdue -
        left.overdue
      );
    }

    return (
      right.totalAssigned -
      left.totalAssigned
    );
  });
}

// =========================================================
// MIGRAÇÃO DOS TICKETS ANTIGOS
// =========================================================

function migrateLegacyTickets(
  options
) {
  var settings =
    options || {};

  var tickets =
    repositoryList(
      'ticket',
      {
        fresh: true
      }
    );

  var migrated = [];
  var unchanged = [];
  var invalid = [];

  tickets.forEach(function (ticket) {
    try {
      var normalized =
        normalizeLegacyTicket(
          ticket
        );

      var patch = {};

      TICKET_FIELDS.forEach(
        function (field) {
          if (
            field.key === 'id'
          ) {
            return;
          }

          var currentValue =
            ticket[field.key];

          var normalizedValue =
            normalized[field.key];

          if (
            safeJsonStringify(
              currentValue
            ) !==
            safeJsonStringify(
              normalizedValue
            )
          ) {
            patch[field.key] =
              normalizedValue;
          }
        }
      );

      if (
        !Object.keys(patch).length
      ) {
        unchanged.push(
          ticket.id
        );

        return;
      }

      var result =
        repositoryPatch(
          'ticket',
          ticket.id,
          patch,
          {
            allowNoChanges: true
          }
        );

      migrated.push({
        id: ticket.id,

        numeroTicket:
          result.record
            .numeroTicket,

        fields:
          Object.keys(patch)
      });

      if (
        settings.audit === true
      ) {
        auditTicketAction(
          settings.uid ||
            'system',
          'migrateLegacyTicket',
          ticket.id,
          {
            campos:
              Object.keys(patch)
          },
          settings.requestId
        );
      }
    } catch (error) {
      invalid.push({
        id: ticket.id,

        error:
          safeString(
            error.message ||
            error
          )
      });
    }
  });

  invalidateTypeCache(
    'ticket'
  );

  return {
    ok:
      invalid.length === 0,

    total:
      tickets.length,

    migrated:
      migrated.length,

    unchanged:
      unchanged.length,

    invalid:
      invalid,

    migratedItems:
      migrated
  };
}

// =========================================================
// SINCRONIZAÇÃO DA FOLHA DE MATERIAIS
// =========================================================

function synchronizeTicketMaterials(
  options
) {
  var settings =
    options || {};

  var tickets =
    repositoryList(
      'ticket',
      {
        fresh: true
      }
    );

  var synchronized = [];
  var invalid = [];

  tickets.forEach(function (ticket) {
    try {
      var materials =
        normalizeTicketMaterials(
          ticket.materiais || []
        );

      var currentRows =
        listTicketMaterials(
          ticket.id
        );

      var currentComparable =
        currentRows.map(
          function (row) {
            return {
              codigo:
                row.codigo || '',

              descricao:
                row.descricao || '',

              quantidade:
                Number(
                  row.quantidade || 0
                ),

              unidade:
                row.unidade || 'un',

              custoUnitario:
                Number(
                  row.custoUnitario ||
                  0
                ),

              custoTotal:
                Number(
                  row.custoTotal || 0
                )
            };
          }
        );

      if (
        safeJsonStringify(
          currentComparable
        ) ===
        safeJsonStringify(
          materials
        )
      ) {
        return;
      }

      replaceTicketMaterials(
        ticket.id,
        materials,
        settings.uid ||
          'system'
      );

      synchronized.push(
        ticket.id
      );
    } catch (error) {
      invalid.push({
        id: ticket.id,

        error:
          safeString(
            error.message ||
            error
          )
      });
    }
  });

  return {
    ok:
      invalid.length === 0,

    synchronized:
      synchronized.length,

    synchronizedIds:
      synchronized,

    invalid:
      invalid
  };
}

// =========================================================
// DIAGNÓSTICO DO SERVIÇO DE TICKETS
// =========================================================

function diagnoseTicketService() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    total: 0,
    active: 0,
    archived: 0,
    overdue: 0,
    invalid: [],
    orphanMaterials: [],
    duplicateNumbers: [],
    stats: {},
    errors: []
  };

  try {
    var rawTickets =
      repositoryList(
        'ticket',
        {
          fresh: true
        }
      );

    var tickets =
      rawTickets.map(
        normalizeLegacyTicket
      );

    result.total =
      tickets.length;

    result.active =
      tickets.filter(
        function (ticket) {
          return !isTicketArchived(
            ticket
          );
        }
      ).length;

    result.archived =
      tickets.length -
      result.active;

    var numberMap = {};

    tickets.forEach(
      function (ticket) {
        var validation =
          validateTicketIntegrity(
            ticket
          );

        if (!validation.valid) {
          result.invalid.push({
            id: ticket.id,

            numeroTicket:
              ticket.numeroTicket,

            errors:
              validation.errors,

            warnings:
              validation.warnings
          });
        }

        var enriched =
          enrichTicket(ticket);

        if (enriched.vencido) {
          result.overdue++;
        }

        var number =
          safeString(
            ticket.numeroTicket
          );

        if (number) {
          if (!numberMap[number]) {
            numberMap[number] = [];
          }

          numberMap[number].push(
            ticket.id
          );
        }
      }
    );

    Object.keys(numberMap)
      .forEach(function (number) {
        if (
          numberMap[number]
            .length > 1
        ) {
          result
            .duplicateNumbers
            .push({
              numeroTicket:
                number,

              ids:
                numberMap[number]
            });
        }
      });

    var ticketIds = {};

    tickets.forEach(
      function (ticket) {
        ticketIds[ticket.id] =
          true;
      }
    );

    var materialRows =
      repositoryList(
        'ticketMaterial',
        {
          fresh: true
        }
      );

    materialRows.forEach(
      function (material) {
        if (
          !ticketIds[
            material.ticketId
          ]
        ) {
          result
            .orphanMaterials
            .push({
              id: material.id,

              ticketId:
                material.ticketId
            });
        }
      }
    );

    result.stats =
      getTicketStats(
        tickets,
        '',
        '',
        {
          includeArchived: true
        }
      );

    result.ok =
      result.invalid.length === 0 &&
      result
        .orphanMaterials
        .length === 0 &&
      result
        .duplicateNumbers
        .length === 0;
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// MARCADOR DE FIM DA PARTE 8
// =========================================================

/*
 * FIM DE 08_TicketService.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 8/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 9/13 — Auditoria e histórico
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 */

// =========================================================
// CONSTANTES DA AUDITORIA
// =========================================================

var AUDIT_DEFAULT_LIMIT = 500;
var AUDIT_MAX_LIMIT = 5000;
var AUDIT_DEFAULT_RETENTION_DAYS = 730;

// =========================================================
// UTILIZADOR DA AUDITORIA
// =========================================================

function resolveAuditUser(uid) {
  var userId =
    safeString(uid).trim();

  if (
    !userId ||
    userId === 'system'
  ) {
    return {
      id: userId || 'system',
      nome: 'Sistema'
    };
  }

  var user = findUserById(
    userId
  );

  if (!user) {
    return {
      id: userId,
      nome: userId
    };
  }

  return {
    id: user.id,

    nome:
      trimText(
        user.nombre ||
        user.nome ||
        user.usuario ||
        user.id,
        80
      )
  };
}

// =========================================================
// NORMALIZAÇÃO DOS DETALHES
// =========================================================

function normalizeAuditDetails(
  details
) {
  if (
    details === undefined ||
    details === null ||
    details === ''
  ) {
    return '';
  }

  if (typeof details === 'string') {
    var parsed =
      safeJsonParse(
        details,
        null
      );

    if (parsed !== null) {
      return safeJsonStringify(
        parsed,
        BACKEND_RELEASE
          .MAX_AUDIT_DETAIL_LENGTH
      );
    }

    return trimText(
      details,
      BACKEND_RELEASE
        .MAX_AUDIT_DETAIL_LENGTH
    );
  }

  return safeJsonStringify(
    details,
    BACKEND_RELEASE
      .MAX_AUDIT_DETAIL_LENGTH
  );
}

function parseAuditDetails(value) {
  var text =
    safeString(value).trim();

  if (!text) {
    return null;
  }

  return safeJsonParse(
    text,
    text
  );
}

// =========================================================
// REGISTAR AUDITORIA
// =========================================================

function logAudit(
  uid,
  action,
  type,
  id,
  details,
  requestId
) {
  try {
    var auditUser =
      resolveAuditUser(uid);

    var normalizedAction =
      trimText(
        action || 'unknown',
        80
      );

    var normalizedType =
      trimText(
        type || 'unknown',
        80
      );

    var normalizedRecordId =
      trimText(
        id,
        120
      );

    var normalizedRequestId =
      trimText(
        requestId,
        120
      ) || createRequestId();

    var record = {
      timestamp:
        formatIsoDateTime(
          new Date()
        ),

      usuario:
        auditUser.nome,

      usuarioId:
        auditUser.id,

      acao:
        normalizedAction,

      tipo:
        normalizedType,

      registroId:
        normalizedRecordId,

      detalhes:
        normalizeAuditDetails(
          details
        ),

      requestId:
        normalizedRequestId
    };

    var result =
      repositoryCreate(
        'audit',
        record,
        {
          idPrefix: 'audit',
          failIfExists: false,
          skipExistenceCheck: true
        }
      );

    return {
      ok: true,
      id: result.id,
      requestId:
        normalizedRequestId
    };
  } catch (error) {
    /*
     * A auditoria não deve interromper a operação principal,
     * mas o erro fica disponível no registo de execução.
     */
    try {
      console.error(
        'Falha ao registar auditoria:',
        error &&
        error.message
          ? error.message
          : error
      );
    } catch (consoleError) {}

    return {
      ok: false,
      error:
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}

// =========================================================
// AUDITORIA OBRIGATÓRIA
// =========================================================

/**
 * Use esta função nas operações em que uma falha de
 * auditoria deve cancelar a operação.
 */
function logAuditRequired(
  uid,
  action,
  type,
  id,
  details,
  requestId
) {
  var result = logAudit(
    uid,
    action,
    type,
    id,
    details,
    requestId
  );

  if (!result.ok) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Não foi possível registar a auditoria da operação'
    );
  }

  return result;
}

// =========================================================
// NORMALIZAÇÃO DE UM REGISTO DE AUDITORIA
// =========================================================

function normalizeAuditRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,

    timestamp:
      safeString(
        record.timestamp
      ),

    usuario:
      safeString(
        record.usuario
      ),

    usuarioId:
      safeString(
        record.usuarioId
      ),

    acao:
      safeString(
        record.acao
      ),

    tipo:
      safeString(
        record.tipo
      ),

    registroId:
      safeString(
        record.registroId
      ),

    detalhes:
      parseAuditDetails(
        record.detalhes
      ),

    detalhesRaw:
      safeString(
        record.detalhes
      ),

    requestId:
      safeString(
        record.requestId
      )
  };
}

// =========================================================
// FILTROS DE AUDITORIA
// =========================================================

function normalizeAuditFilters(filters) {
  var source =
    filters || {};

  var limit = Number(
    source.limit ||
    AUDIT_DEFAULT_LIMIT
  );

  if (
    !isFinite(limit) ||
    limit < 1
  ) {
    limit =
      AUDIT_DEFAULT_LIMIT;
  }

  limit = Math.min(
    Math.floor(limit),
    AUDIT_MAX_LIMIT
  );

  var desde = '';

  if (source.desde) {
    desde = requireIsoDate(
      source.desde,
      'Data inicial',
      false
    );
  }

  var hasta = '';

  if (source.hasta) {
    hasta = requireIsoDate(
      source.hasta,
      'Data final',
      false
    );
  }

  if (
    desde &&
    hasta &&
    desde > hasta
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  return {
    tipo:
      trimText(
        source.tipo,
        80
      ),

    registroId:
      trimText(
        source.registroId ||
        source.id,
        120
      ),

    usuarioId:
      trimText(
        source.usuarioId,
        120
      ),

    acao:
      trimText(
        source.acao,
        80
      ),

    requestId:
      trimText(
        source.requestId,
        120
      ),

    search:
      trimText(
        source.search ||
        source.query,
        200
      ).toLowerCase(),

    desde: desde,
    hasta: hasta,
    limit: limit,

    order:
      source.order === 'asc'
        ? 'asc'
        : 'desc'
  };
}

// =========================================================
// LISTAGEM DA AUDITORIA
// =========================================================

function listAuditRecords(
  filters,
  options
) {
  var criteria =
    normalizeAuditFilters(
      filters
    );

  var settings =
    options || {};

  var records =
    repositoryList(
      'audit',
      {
        fresh:
          Boolean(
            settings.fresh
          ),

        cacheTtl:
          settings.cacheTtl ||
          15
      }
    )
      .map(normalizeAuditRecord)
      .filter(function (record) {
        if (
          criteria.tipo &&
          record.tipo !==
            criteria.tipo
        ) {
          return false;
        }

        if (
          criteria.registroId &&
          record.registroId !==
            criteria.registroId
        ) {
          return false;
        }

        if (
          criteria.usuarioId &&
          record.usuarioId !==
            criteria.usuarioId
        ) {
          return false;
        }

        if (
          criteria.acao &&
          record.acao !==
            criteria.acao
        ) {
          return false;
        }

        if (
          criteria.requestId &&
          record.requestId !==
            criteria.requestId
        ) {
          return false;
        }

        var recordDate =
          safeString(
            record.timestamp
          ).substring(0, 10);

        if (
          criteria.desde &&
          recordDate <
            criteria.desde
        ) {
          return false;
        }

        if (
          criteria.hasta &&
          recordDate >
            criteria.hasta
        ) {
          return false;
        }

        if (criteria.search) {
          var searchable = [
            record.usuario,
            record.usuarioId,
            record.acao,
            record.tipo,
            record.registroId,
            record.detalhesRaw,
            record.requestId
          ].join(' ')
            .toLowerCase();

          if (
            searchable.indexOf(
              criteria.search
            ) === -1
          ) {
            return false;
          }
        }

        return true;
      });

  records.sort(
    function (left, right) {
      var comparison =
        safeString(
          left.timestamp
        ).localeCompare(
          safeString(
            right.timestamp
          )
        );

      return criteria.order ===
        'asc'
        ? comparison
        : -comparison;
    }
  );

  return records.slice(
    0,
    criteria.limit
  );
}

// =========================================================
// HISTÓRICO DE UM REGISTO
// =========================================================

function getRecordAuditHistory(
  type,
  recordId,
  options
) {
  var normalizedType =
    requireText(
      type,
      'Tipo',
      1,
      80,
      false
    );

  var normalizedId =
    requireId(
      recordId,
      'ID do registo'
    );

  var settings =
    options || {};

  return listAuditRecords(
    {
      tipo:
        normalizedType,

      registroId:
        normalizedId,

      desde:
        settings.desde || '',

      hasta:
        settings.hasta || '',

      limit:
        settings.limit ||
        AUDIT_DEFAULT_LIMIT,

      order:
        settings.order ||
        'asc'
    },
    {
      fresh:
        Boolean(
          settings.fresh
        )
    }
  );
}

function getTicketAuditHistory(
  ticketId,
  options
) {
  return getRecordAuditHistory(
    'ticket',
    ticketId,
    options
  );
}

// =========================================================
// CONSULTA POR REQUEST ID
// =========================================================

function getAuditByRequestId(
  requestId
) {
  var id = requireText(
    requestId,
    'Request ID',
    1,
    120,
    false
  );

  return listAuditRecords(
    {
      requestId: id,
      limit:
        AUDIT_MAX_LIMIT,
      order: 'asc'
    },
    {
      fresh: true
    }
  );
}

// =========================================================
// RESUMO DA AUDITORIA
// =========================================================

function getAuditStats(
  desde,
  hasta
) {
  var filters = {
    limit: AUDIT_MAX_LIMIT
  };

  if (desde) {
    filters.desde = desde;
  }

  if (hasta) {
    filters.hasta = hasta;
  }

  var records =
    listAuditRecords(
      filters,
      {
        fresh: true
      }
    );

  var byAction = {};
  var byType = {};
  var byUser = {};

  records.forEach(
    function (record) {
      byAction[record.acao] =
        (
          byAction[
            record.acao
          ] || 0
        ) + 1;

      byType[record.tipo] =
        (
          byType[
            record.tipo
          ] || 0
        ) + 1;

      var userKey =
        record.usuario ||
        record.usuarioId ||
        'Sistema';

      byUser[userKey] =
        (
          byUser[userKey] || 0
        ) + 1;
    }
  );

  return {
    desde: desde || '',
    hasta: hasta || '',
    total: records.length,
    porAcao: byAction,
    porTipo: byType,
    porUtilizador: byUser
  };
}

// =========================================================
// EXPORTAÇÃO DA AUDITORIA
// =========================================================

function exportAuditRows(
  filters
) {
  return listAuditRecords(
    Object.assign(
      {},
      filters || {},
      {
        limit:
          AUDIT_MAX_LIMIT,
        order: 'asc'
      }
    ),
    {
      fresh: true
    }
  ).map(function (record) {
    return {
      id: record.id,
      dataHora:
        record.timestamp,
      utilizador:
        record.usuario,
      utilizadorId:
        record.usuarioId,
      acao: record.acao,
      tipo: record.tipo,
      registroId:
        record.registroId,
      detalhes:
        record.detalhesRaw,
      requestId:
        record.requestId
    };
  });
}

// =========================================================
// RETENÇÃO DA AUDITORIA
// =========================================================

/**
 * Remove fisicamente apenas auditorias mais antigas que o
 * período configurado. Deve ser chamada por trigger manual.
 *
 * Por segurança:
 * - mínimo de retenção: 365 dias;
 * - padrão: 730 dias;
 * - não é exposta diretamente ao frontend.
 */
function purgeOldAuditRecords(
  retentionDays
) {
  var days = Number(
    retentionDays ||
    AUDIT_DEFAULT_RETENTION_DAYS
  );

  if (
    !isFinite(days) ||
    days < 365
  ) {
    throw new Error(
      'A retenção mínima da auditoria é de 365 dias'
    );
  }

  var cutoff = new Date(
    Date.now() -
    days * 86400000
  );

  var records =
    repositoryList(
      'audit',
      {
        fresh: true
      }
    );

  var removable =
    records.filter(
      function (record) {
        var date =
          parseStoredDateTime(
            record.timestamp
          );

        return (
          date &&
          date.getTime() <
            cutoff.getTime()
        );
      }
    );

  /*
   * Eliminar pelas linhas mais recentes primeiro evita
   * alterações de índice durante o processo.
   */
  removable
    .slice()
    .sort(function (left, right) {
      return (
        Number(right._row || 0) -
        Number(left._row || 0)
      );
    })
    .forEach(function (record) {
      repositoryDeletePhysical(
        'audit',
        record.id,
        {
          ignoreMissing: true
        }
      );
    });

  invalidateTypeCache('audit');

  return {
    ok: true,
    retentionDays: days,
    deleted:
      removable.length,
    cutoff:
      formatIsoDateTime(
        cutoff
      )
  };
}

// =========================================================
// DIAGNÓSTICO DA AUDITORIA
// =========================================================

// =========================================================
// DIAGNÓSTICO DA AUDITORIA
// =========================================================

function diagnoseAudit() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    total: 0,
    invalid: [],
    duplicatedIds: [],
    duplicatedRequestEntries: [],
    errors: []
  };

  try {
    var records =
      repositoryList(
        'audit',
        {
          fresh: true
        }
      );

    result.total =
      records.length;

    var idMap = {};
    var requestEntryMap = {};

    records.forEach(
      function (record) {
        var validationErrors = [];

        var recordId =
          safeString(
            record.id
          ).trim();

        var timestamp =
          safeString(
            record.timestamp
          ).trim();

        var action =
          safeString(
            record.acao
          ).trim();

        var type =
          safeString(
            record.tipo
          ).trim();

        var auditedRecordId =
          safeString(
            record.registroId
          ).trim();

        var requestId =
          safeString(
            record.requestId
          ).trim();

        if (!recordId) {
          validationErrors.push(
            'ID ausente'
          );
        }

        if (
          !parseStoredDateTime(
            timestamp
          )
        ) {
          validationErrors.push(
            'Data/hora inválida'
          );
        }

        if (!action) {
          validationErrors.push(
            'Ação ausente'
          );
        }

        if (!type) {
          validationErrors.push(
            'Tipo ausente'
          );
        }

        if (
          validationErrors.length
        ) {
          result.invalid.push({
            id: recordId || '—',
            row:
              record._row || null,

            errors:
              validationErrors
          });
        }

        if (recordId) {
          if (!idMap[recordId]) {
            idMap[recordId] = [];
          }

          idMap[recordId].push({
            row:
              record._row || null,

            timestamp:
              timestamp
          });
        }

        /*
         * Uma mesma request pode gerar várias entradas válidas,
         * por exemplo: atualizar ticket + atualizar materiais.
         *
         * Só consideramos potencialmente duplicada uma entrada
         * quando requestId, ação, tipo e ID do registo coincidem.
         */
        if (requestId) {
          var requestEntryKey = [
            requestId,
            action,
            type,
            auditedRecordId
          ].join('|');

          if (
            !requestEntryMap[
              requestEntryKey
            ]
          ) {
            requestEntryMap[
              requestEntryKey
            ] = [];
          }

          requestEntryMap[
            requestEntryKey
          ].push({
            id: recordId,
            row:
              record._row || null,

            timestamp:
              timestamp
          });
        }
      }
    );

    Object.keys(idMap)
      .forEach(
        function (id) {
          if (
            idMap[id].length > 1
          ) {
            result
              .duplicatedIds
              .push({
                id: id,
                occurrences:
                  idMap[id]
              });
          }
        }
      );

    Object.keys(
      requestEntryMap
    ).forEach(
      function (key) {
        if (
          requestEntryMap[key]
            .length > 1
        ) {
          var keyParts =
            key.split('|');

          result
            .duplicatedRequestEntries
            .push({
              requestId:
                keyParts[0],

              acao:
                keyParts[1],

              tipo:
                keyParts[2],

              registroId:
                keyParts[3],

              occurrences:
                requestEntryMap[key]
            });
        }
      }
    );

    result.ok =
      result.invalid.length === 0 &&
      result
        .duplicatedIds
        .length === 0;
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// VERIFICAÇÃO DE COBERTURA DA AUDITORIA
// =========================================================

function diagnoseAuditCoverage() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    ticketsWithoutCreateAudit: [],
    ticketsWithoutRecentAudit: [],
    usersWithoutCreateAudit: [],
    errors: []
  };

  try {
    var auditRecords =
      listAuditRecords(
        {
          limit:
            AUDIT_MAX_LIMIT,

          order: 'asc'
        },
        {
          fresh: true
        }
      );

    var auditByRecord = {};

    auditRecords.forEach(
      function (audit) {
        var key = [
          audit.tipo,
          audit.registroId
        ].join('|');

        if (!auditByRecord[key]) {
          auditByRecord[key] = [];
        }

        auditByRecord[key].push(
          audit
        );
      }
    );

    var tickets =
      repositoryList(
        'ticket',
        {
          fresh: true
        }
      );

    tickets.forEach(
      function (ticket) {
        var key =
          'ticket|' +
          safeString(
            ticket.id
          );

        var history =
          auditByRecord[key] ||
          [];

        var hasCreateAudit =
          history.some(
            function (audit) {
              return [
                'createTicket',
                'create',
                'migrateLegacyTicket'
              ].indexOf(
                audit.acao
              ) !== -1;
            }
          );

        if (!hasCreateAudit) {
          result
            .ticketsWithoutCreateAudit
            .push({
              id: ticket.id,

              numeroTicket:
                ticket.numeroTicket ||
                ''
            });
        }

        if (
          safeString(
            ticket.atualizadoEm
          ).trim() &&
          history.length === 0
        ) {
          result
            .ticketsWithoutRecentAudit
            .push({
              id: ticket.id,

              atualizadoEm:
                ticket.atualizadoEm
            });
        }
      }
    );

    var users =
      getAllUsersRaw({
        fresh: true
      });

    users.forEach(
      function (user) {
        /*
         * O administrador inicial pode ter sido criado antes
         * da instalação do módulo de auditoria.
         */
        if (
          normalizeUsername(
            user.usuario
          ) === 'admin'
        ) {
          return;
        }

        var key =
          'user|' +
          safeString(user.id);

        var history =
          auditByRecord[key] ||
          [];

        var hasCreateAudit =
          history.some(
            function (audit) {
              return (
                audit.acao ===
                'createUser'
              );
            }
          );

        if (!hasCreateAudit) {
          result
            .usersWithoutCreateAudit
            .push({
              id: user.id,
              usuario:
                user.usuario
            });
        }
      }
    );

    result.ok =
      result
        .ticketsWithoutCreateAudit
        .length === 0 &&
      result
        .ticketsWithoutRecentAudit
        .length === 0 &&
      result
        .usersWithoutCreateAudit
        .length === 0;
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error && error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// CRIAÇÃO DE AUDITORIA PARA REGISTOS LEGADOS
// =========================================================

/**
 * Cria uma entrada inicial para tickets antigos sem
 * histórico. Não modifica nem elimina auditorias existentes.
 *
 * Esta função deve ser executada durante a migração,
 * preferencialmente pela Parte 13.
 */
function backfillLegacyTicketAudit(
  actorUid
) {
  var tickets =
    repositoryList(
      'ticket',
      {
        fresh: true
      }
    );

  var auditRecords =
    repositoryList(
      'audit',
      {
        fresh: true
      }
    );

  var auditedTickets = {};

  auditRecords.forEach(
    function (record) {
      if (
        safeString(
          record.tipo
        ) === 'ticket' &&
        safeString(
          record.registroId
        )
      ) {
        auditedTickets[
          safeString(
            record.registroId
          )
        ] = true;
      }
    }
  );

  var created = [];
  var failures = [];

  tickets.forEach(
    function (ticket) {
      if (
        auditedTickets[
          ticket.id
        ]
      ) {
        return;
      }

      try {
        var normalized =
          typeof normalizeLegacyTicket ===
            'function'
            ? normalizeLegacyTicket(
                ticket
              )
            : ticket;

        var auditResult =
          logAudit(
            actorUid || 'system',
            'legacyRecordImported',
            'ticket',
            ticket.id,
            {
              numeroTicket:
                normalized
                  .numeroTicket ||
                '',

              situacao:
                normalized
                  .situacao ||
                '',

              prioridade:
                normalized
                  .prioridade ||
                '',

              dataReporte:
                normalized
                  .dataReporte ||
                '',

              origem:
                'Migração automática'
            },
            createRequestId()
          );

        if (auditResult.ok) {
          created.push(
            ticket.id
          );
        } else {
          failures.push({
            id: ticket.id,
            error:
              auditResult.error
          });
        }
      } catch (error) {
        failures.push({
          id: ticket.id,

          error:
            safeString(
              error.message ||
              error
            )
        });
      }
    }
  );

  invalidateTypeCache(
    'audit'
  );

  return {
    ok:
      failures.length === 0,

    created:
      created.length,

    createdIds:
      created,

    failed:
      failures.length,

    failures:
      failures
  };
}

// =========================================================
// PROTEÇÃO CONTRA ALTERAÇÃO DA AUDITORIA
// =========================================================

function updateAuditRecord() {
  throw apiError(
    API_ERROR_CODES.FORBIDDEN,
    'Os registos de auditoria são imutáveis'
  );
}

function deleteAuditRecord() {
  throw apiError(
    API_ERROR_CODES.FORBIDDEN,
    'Os registos de auditoria não podem ser eliminados pela API'
  );
}

// =========================================================
// RESUMO PARA O BOOTSTRAP ADMINISTRATIVO
// =========================================================

function getAuditBootstrapSummary(
  user
) {
  if (
    !user ||
    user.rol !== USER_ROLES.ADMIN
  ) {
    return null;
  }

  var today =
    formatServerDate(
      new Date()
    );

  var recent =
    listAuditRecords(
      {
        desde: today,
        hasta: today,
        limit: 20,
        order: 'desc'
      },
      {
        fresh: false
      }
    );

  return {
    todayCount:
      getAuditStats(
        today,
        today
      ).total,

    recent:
      recent
  };
}

// =========================================================
// MARCADOR DE FIM DA PARTE 9
// =========================================================

/*
 * FIM DE 09_AuditService.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 9/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 10/13 — Alertas e notificações
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 * - 04_ConfigService.gs
 * - 05_OperationalRecords.gs
 * - 06_Refrigeration.gs
 * - 07_TicketDomain.gs
 * - 08_TicketService.gs
 * - 09_AuditService.gs
 */

// =========================================================
// CONFIGURAÇÃO
// =========================================================

var ALERT_CACHE_MAX_SECONDS = 21600;
var TICKET_SLA_WARNING_MINUTES = 30;
var MAX_ALERT_ITEMS_PER_EMAIL = 30;

function getAlertRecipients() {
  if (!alertsEnabled()) {
    return [];
  }

  return getAlertEmailArray();
}

function hasAlertRecipients() {
  return (
    getAlertRecipients().length > 0
  );
}

// =========================================================
// CONTROLO DE DUPLICADOS
// =========================================================

function buildAlertCacheKey(
  type,
  identifier,
  period
) {
  var raw = [
    type || 'alert',
    identifier || 'general',
    period || formatServerDate(
      new Date()
    )
  ].join('|');

  return (
    'alert_' +
    sha256Hex(raw).substring(0, 32)
  );
}

function wasAlertSent(cacheKey) {
  try {
    return Boolean(
      CacheService
        .getScriptCache()
        .get(cacheKey)
    );
  } catch (error) {
    return false;
  }
}

function markAlertSent(
  cacheKey,
  ttlSeconds
) {
  try {
    var ttl = Number(
      ttlSeconds ||
      ALERT_CACHE_MAX_SECONDS
    );

    ttl = Math.max(
      60,
      Math.min(
        ttl,
        ALERT_CACHE_MAX_SECONDS
      )
    );

    CacheService
      .getScriptCache()
      .put(
        cacheKey,
        '1',
        ttl
      );

    return true;
  } catch (error) {
    return false;
  }
}

// =========================================================
// ENVIO CENTRALIZADO
// =========================================================

function sendSystemEmail(
  subject,
  body,
  options
) {
  var settings = options || {};

  if (!alertsEnabled()) {
    return {
      ok: false,
      skipped: true,
      reason: 'alerts_disabled'
    };
  }

  var recipients =
    settings.recipients ||
    getAlertRecipients();

  if (typeof recipients === 'string') {
    recipients = recipients
      .split(/[;,]/)
      .map(function (email) {
        return email.trim();
      })
      .filter(Boolean);
  }

  if (
    !Array.isArray(recipients) ||
    !recipients.length
  ) {
    return {
      ok: false,
      skipped: true,
      reason: 'no_recipients'
    };
  }

  var normalizedSubject =
    requireText(
      subject,
      'Assunto',
      1,
      200,
      false
    );

  var normalizedBody =
    requireText(
      body,
      'Mensagem',
      1,
      20000,
      false
    );

  var cacheKey =
    settings.cacheKey || '';

  if (
    cacheKey &&
    wasAlertSent(cacheKey)
  ) {
    return {
      ok: false,
      skipped: true,
      reason: 'duplicate'
    };
  }

  try {
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: normalizedSubject,
      body: normalizedBody,
      name:
        BACKEND_RELEASE.NAME,

      replyTo:
        settings.replyTo || undefined
    });

    if (cacheKey) {
      markAlertSent(
        cacheKey,
        settings.ttlSeconds
      );
    }

    return {
      ok: true,
      skipped: false,
      recipients: recipients.length
    };
  } catch (error) {
    try {
      console.error(
        'Erro ao enviar email:',
        error &&
        error.message
          ? error.message
          : error
      );
    } catch (consoleError) {}

    return {
      ok: false,
      skipped: false,
      reason: 'send_error',
      error: safeString(
        error &&
        error.message
          ? error.message
          : error
      )
    };
  }
}

// =========================================================
// ALERTAS DE REGISTOS GERAIS
// =========================================================

function checkAndSendAlerts(
  type,
  data,
  uid
) {
  if (
    type !== 'general' ||
    !data
  ) {
    return {
      ok: false,
      skipped: true,
      reason: 'not_applicable'
    };
  }

  var evaluation =
    evaluateGeneralRecord(data);

  if (evaluation.compliant) {
    return {
      ok: true,
      skipped: true,
      reason: 'compliant'
    };
  }

  var user = uid
    ? findUserById(uid)
    : null;

  var date =
    safeString(
      data.fecha
    ) ||
    formatServerDate(new Date());

  var cacheKey =
    buildAlertCacheKey(
      'general_range',
      date,
      date
    );

  var lines =
    evaluation.deviations
      .slice(
        0,
        MAX_ALERT_ITEMS_PER_EMAIL
      )
      .map(function (deviation) {
        return '• ' +
          deviation.message;
      });

  var message = [
    'Foi registada uma leitura geral com valores fora dos limites configurados.',
    '',
    'Data/Hora: ' +
      date +
      ' ' +
      safeString(data.hora),
    'Registado por: ' +
      (
        user
          ? user.nombre ||
            user.usuario
          : safeString(
              data.usuario
            ) || '—'
      ),
    '',
    'DESVIOS:',
    lines.join('\n'),
    '',
    'Verifique a instalação e registe as medidas corretivas necessárias.',
    '',
    '— Registo Técnico · Moon and Sun'
  ].join('\n');

  return sendSystemEmail(
    '⚠ Registo Técnico — valores fora do intervalo (' +
      date +
      ')',
    message,
    {
      cacheKey: cacheKey,
      ttlSeconds:
        ALERT_CACHE_MAX_SECONDS
    }
  );
}

// =========================================================
// ALERTAS DE REFRIGERAÇÃO
// =========================================================

function checkAndSendTempAlerts(
  record,
  uid
) {
  if (
    !record ||
    safeString(
      record.dentroIntervalo
    ) !== 'Não'
  ) {
    return {
      ok: true,
      skipped: true,
      reason: 'compliant'
    };
  }

  var equipment =
    resolveEquipamento(record);

  var user = uid
    ? findUserById(uid)
    : null;

  var date =
    safeString(
      record.fecha
    ) ||
    formatServerDate(new Date());

  var equipmentId =
    safeString(
      record.equipamentoId ||
      record.nome
    );

  var cacheKey =
    buildAlertCacheKey(
      'temperature_range',
      equipmentId,
      date
    );

  var message = [
    'Foi registada uma temperatura fora do intervalo de referência.',
    '',
    'Equipamento: ' +
      safeString(
        record.nome
      ),
    'Tipo: ' +
      safeString(
        record.tipo
      ),
    'Localização: ' +
      safeString(
        record.ubicacao
      ),
    'Leitura: ' +
      safeString(
        record.temperatura
      ) +
      ' °C',
    'Intervalo permitido: ' +
      (
        equipment
          ? equipment.min +
            ' a ' +
            equipment.max
          : 'não disponível'
      ) +
      ' °C',
    'Data/Hora: ' +
      date +
      ' ' +
      safeString(
        record.hora
      ),
    'Registado por: ' +
      (
        user
          ? user.nombre ||
            user.usuario
          : safeString(
              record.usuario
            ) || '—'
      ),
    '',
    'Inspecione o equipamento e tome as medidas necessárias.',
    '',
    '— Registo Técnico · Moon and Sun'
  ].join('\n');

  return sendSystemEmail(
    '🧊 Temperatura fora do intervalo — ' +
      safeString(
        record.nome
      ),
    message,
    {
      cacheKey: cacheKey,
      ttlSeconds:
        ALERT_CACHE_MAX_SECONDS
    }
  );
}

// =========================================================
// FORMATAÇÃO DE TICKETS PARA EMAIL
// =========================================================

function buildTicketEmailSummary(ticket) {
  var source =
    enrichTicket(ticket);

  return [
    'Ordem: ' +
      safeString(
        source.numeroTicket
      ),
    'Local: ' +
      safeString(
        source.quarto
      ),
    'Categoria: ' +
      safeString(
        source.categoria
      ),
    'Prioridade: ' +
      safeString(
        source.prioridadeLabel
      ),
    'Estado: ' +
      safeString(
        source.statusLabel
      ),
    'Responsável: ' +
      (
        source.responsavelNome ||
        'Não atribuído'
      ),
    'Descrição: ' +
      safeString(
        source.descricao
      ),
    'Prazo de resolução: ' +
      safeString(
        source.prazoResolucao
      )
  ].join('\n');
}

// =========================================================
// NOVO TICKET
// =========================================================

function sendNewTicketAlert(
  ticket,
  uid
) {
  var source =
    enrichTicket(ticket);

  /*
   * Por defeito, apenas tickets de prioridade alta
   * ou crítica geram email imediato.
   */
  if (
    source.prioridade !==
      TICKET_PRIORITY.ALTA &&
    source.prioridade !==
      TICKET_PRIORITY.CRITICA
  ) {
    return {
      ok: true,
      skipped: true,
      reason: 'priority_not_immediate'
    };
  }

  var cacheKey =
    buildAlertCacheKey(
      'ticket_created',
      source.id,
      source.versao
    );

  return sendSystemEmail(
    (
      source.prioridade ===
        TICKET_PRIORITY.CRITICA
        ? '🚨'
        : '⚠'
    ) +
    ' Nova ordem de manutenção ' +
    source.prioridadeLabel +
    ' — ' +
    source.numeroTicket,
    [
      'Foi criada uma nova ordem de manutenção.',
      '',
      buildTicketEmailSummary(
        source
      ),
      '',
      'Aberto por: ' +
        safeString(
          source.colaborador
        ),
      '',
      '— Registo Técnico · Moon and Sun'
    ].join('\n'),
    {
      cacheKey: cacheKey
    }
  );
}

// =========================================================
// TICKET ATRIBUÍDO
// =========================================================

function sendTicketAssignedAlert(
  ticket,
  responsible
) {
  var source =
    enrichTicket(ticket);

  var cacheKey =
    buildAlertCacheKey(
      'ticket_assigned',
      source.id,
      source.versao
    );

  return sendSystemEmail(
    '🔧 Ordem atribuída — ' +
      source.numeroTicket,
    [
      'Uma ordem de manutenção foi atribuída.',
      '',
      buildTicketEmailSummary(
        source
      ),
      '',
      'Técnico responsável: ' +
        safeString(
          responsible &&
          (
            responsible.nombre ||
            responsible.usuario
          )
        ),
      '',
      '— Registo Técnico · Moon and Sun'
    ].join('\n'),
    {
      cacheKey: cacheKey
    }
  );
}

// =========================================================
// TICKET RESOLVIDO E FECHADO
// =========================================================

function sendTicketResolvedAlert(
  ticket,
  uid
) {
  var source =
    enrichTicket(ticket);

  var cacheKey =
    buildAlertCacheKey(
      'ticket_resolved',
      source.id,
      source.versao
    );

  return sendSystemEmail(
    '✅ Ordem resolvida — ' +
      source.numeroTicket,
    [
      'Uma ordem de manutenção foi marcada como resolvida e aguarda validação.',
      '',
      buildTicketEmailSummary(
        source
      ),
      '',
      'Diagnóstico: ' +
        safeString(
          source.diagnostico
        ),
      'Trabalho realizado: ' +
        safeString(
          source.trabalhoRealizado
        ),
      'Custo real: ' +
        (
          source.custoReal ||
          '0'
        ) +
        ' €',
      '',
      '— Registo Técnico · Moon and Sun'
    ].join('\n'),
    {
      cacheKey: cacheKey
    }
  );
}

function sendTicketClosedAlert(
  ticket,
  uid
) {
  var source =
    enrichTicket(ticket);

  var cacheKey =
    buildAlertCacheKey(
      'ticket_closed',
      source.id,
      source.versao
    );

  return sendSystemEmail(
    '🏁 Ordem finalizada — ' +
      source.numeroTicket,
    [
      'Uma ordem de manutenção foi validada e finalizada.',
      '',
      buildTicketEmailSummary(
        source
      ),
      '',
      'Comentário de fecho: ' +
        safeString(
          source.comentarioCierre
        ),
      'Fechado em: ' +
        safeString(
          source.fechadoEm
        ),
      '',
      '— Registo Técnico · Moon and Sun'
    ].join('\n'),
    {
      cacheKey: cacheKey
    }
  );
}

// =========================================================
// ALERTAS DE SLA
// =========================================================

function checkTicketSlaAlerts() {
  if (!alertsEnabled()) {
    return {
      ok: true,
      skipped: true,
      reason: 'alerts_disabled'
    };
  }

  var tickets = listTickets(
    {
      includeArchived: false,
      order: 'priority_desc'
    },
    {
      fresh: true
    }
  ).filter(function (ticket) {
    return !ticket.resolvido;
  });

  var warned = [];
  var overdue = [];

  tickets.forEach(function (ticket) {
    if (
      ticket.resolucaoVencida
    ) {
      overdue.push(ticket);
      return;
    }

    if (
      ticket.minutosParaResolucao !==
        null &&
      ticket.minutosParaResolucao >= 0 &&
      ticket.minutosParaResolucao <=
        TICKET_SLA_WARNING_MINUTES
    ) {
      warned.push(ticket);
    }
  });

  var results = [];

  overdue
    .slice(
      0,
      MAX_ALERT_ITEMS_PER_EMAIL
    )
    .forEach(function (ticket) {
      results.push(
        sendSystemEmail(
          '🚨 SLA vencido — ' +
            ticket.numeroTicket,
          [
            'A ordem ultrapassou o prazo de resolução.',
            '',
            buildTicketEmailSummary(
              ticket
            ),
            '',
            'Ação necessária: rever prioridade, responsável e plano de intervenção.',
            '',
            '— Registo Técnico · Moon and Sun'
          ].join('\n'),
          {
            cacheKey:
              buildAlertCacheKey(
                'ticket_overdue',
                ticket.id,
                formatServerDate(
                  new Date()
                )
              )
          }
        )
      );
    });

  warned
    .slice(
      0,
      MAX_ALERT_ITEMS_PER_EMAIL
    )
    .forEach(function (ticket) {
      results.push(
        sendSystemEmail(
          '⏳ SLA próximo do limite — ' +
            ticket.numeroTicket,
          [
            'A ordem está próxima do prazo máximo de resolução.',
            '',
            buildTicketEmailSummary(
              ticket
            ),
            '',
            'Tempo restante aproximado: ' +
              ticket.minutosParaResolucao +
              ' minutos.',
            '',
            '— Registo Técnico · Moon and Sun'
          ].join('\n'),
          {
            cacheKey:
              buildAlertCacheKey(
                'ticket_sla_warning',
                ticket.id,
                safeString(
                  ticket.prazoResolucao
                )
              )
          }
        )
      );
    });

  return {
    ok: true,
    checked: tickets.length,
    overdue: overdue.length,
    warnings: warned.length,
    emailsAttempted:
      results.length
  };
}

// =========================================================
// LEMBRETE DIÁRIO DE LEITURA
// =========================================================

// =========================================================
// LEMBRETE DIÁRIO DE LEITURA
// =========================================================

function dailyReminder() {
  try {
    if (!alertsEnabled()) {
      return {
        ok: true,
        skipped: true,
        reason: 'alerts_disabled'
      };
    }

    var today =
      formatServerDate(
        new Date()
      );

    var hasGeneralRecord =
      repositoryCount(
        'general',
        function (record) {
          return (
            safeString(
              record.fecha
            ) === today
          );
        },
        {
          fresh: true
        }
      ) > 0;

    if (hasGeneralRecord) {
      return {
        ok: true,
        skipped: true,
        reason:
          'record_already_exists'
      };
    }

    return sendSystemEmail(
      '⏰ Registo Técnico — leitura diária em falta',
      [
        'Ainda não foi registada a leitura geral de hoje (' +
          today +
          ').',
        '',
        'Registe os consumos, AQS e parâmetros da piscina assim que possível.',
        '',
        '— Registo Técnico · Moon and Sun'
      ].join('\n'),
      {
        cacheKey:
          buildAlertCacheKey(
            'daily_general_reminder',
            'general',
            today
          ),

        ttlSeconds:
          ALERT_CACHE_MAX_SECONDS
      }
    );
  } catch (error) {
    return {
      ok: false,

      error:
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}

// =========================================================
// LEMBRETE SEMANAL DE REFRIGERAÇÃO
// =========================================================

function weeklyRefrigerationReminder() {
  try {
    if (!alertsEnabled()) {
      return {
        ok: true,
        skipped: true,
        reason: 'alerts_disabled'
      };
    }

    var status =
      computeTemperaturaWeekly();

    if (
      !status.total ||
      status.faltam === 0
    ) {
      return {
        ok: true,
        skipped: true,
        reason:
          status.total
            ? 'all_equipment_measured'
            : 'no_active_equipment',

        status: status
      };
    }

    var missing =
      status.items.filter(
        function (item) {
          return !item.medidoSemana;
        }
      );

    var missingLines =
      missing
        .slice(
          0,
          MAX_ALERT_ITEMS_PER_EMAIL
        )
        .map(function (item) {
          return (
            '• ' +
            safeString(item.nome) +
            (
              item.ubicacao
                ? ' — ' +
                  safeString(
                    item.ubicacao
                  )
                : ''
            )
          );
        });

    if (
      missing.length >
      MAX_ALERT_ITEMS_PER_EMAIL
    ) {
      missingLines.push(
        '• +' +
          (
            missing.length -
            MAX_ALERT_ITEMS_PER_EMAIL
          ) +
          ' equipamento(s)'
      );
    }

    var period =
      status.desde +
      '_' +
      status.hasta;

    return sendSystemEmail(
      '🧊 Refrigeração — medições semanais pendentes',
      [
        'Existem equipamentos sem medição no ciclo semanal.',
        '',
        'Período: ' +
          status.desde +
          ' a ' +
          status.hasta,
        'Medidos: ' +
          status.medidos +
          '/' +
          status.total,
        'Pendentes: ' +
          status.faltam,
        '',
        'EQUIPAMENTOS PENDENTES:',
        missingLines.join('\n'),
        '',
        'Registe as temperaturas antes do encerramento do ciclo HACCP.',
        '',
        '— Registo Técnico · Moon and Sun'
      ].join('\n'),
      {
        cacheKey:
          buildAlertCacheKey(
            'weekly_refrigeration',
            'missing',
            period
          ),

        ttlSeconds:
          ALERT_CACHE_MAX_SECONDS
      }
    );
  } catch (error) {
    return {
      ok: false,

      error:
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}

// =========================================================
// ALERTA DE SEGUIMENTO DE TICKETS
// =========================================================

function checkTicketFollowUpAlerts() {
  try {
    if (!alertsEnabled()) {
      return {
        ok: true,
        skipped: true,
        reason: 'alerts_disabled'
      };
    }

    var today =
      formatServerDate(
        new Date()
      );

    var tickets =
      listTickets(
        {
          includeArchived: false,
          order: 'date_asc'
        },
        {
          fresh: true
        }
      ).filter(
        function (ticket) {
          return (
            ticket
              .necessitaSeguimento ===
              'Sim' &&
            ticket.dataSeguimento &&
            ticket.dataSeguimento <=
              today
          );
        }
      );

    if (!tickets.length) {
      return {
        ok: true,
        skipped: true,
        reason:
          'no_follow_up_due',
        due: 0
      };
    }

    var lines =
      tickets
        .slice(
          0,
          MAX_ALERT_ITEMS_PER_EMAIL
        )
        .map(function (ticket) {
          return [
            '• ',
            ticket.numeroTicket,
            ' — ',
            ticket.quarto,
            ' — seguimento: ',
            ticket.dataSeguimento,
            ' — ',
            ticket.statusLabel
          ].join('');
        });

    if (
      tickets.length >
      MAX_ALERT_ITEMS_PER_EMAIL
    ) {
      lines.push(
        '• +' +
          (
            tickets.length -
            MAX_ALERT_ITEMS_PER_EMAIL
          ) +
          ' ordem(ns)'
      );
    }

    var result =
      sendSystemEmail(
        '🔎 Manutenção — seguimentos pendentes',
        [
          'Existem ordens que atingiram a data de seguimento.',
          '',
          lines.join('\n'),
          '',
          'Confirme o resultado da intervenção e atualize cada ordem.',
          '',
          '— Registo Técnico · Moon and Sun'
        ].join('\n'),
        {
          cacheKey:
            buildAlertCacheKey(
              'ticket_follow_up',
              'all',
              today
            ),

          ttlSeconds:
            ALERT_CACHE_MAX_SECONDS
        }
      );

    result.due =
      tickets.length;

    return result;
  } catch (error) {
    return {
      ok: false,

      error:
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}

// =========================================================
// RESUMO SEMANAL POR EMAIL
// =========================================================

function weeklySummary() {
  try {
    if (!alertsEnabled()) {
      return {
        ok: true,
        skipped: true,
        reason: 'alerts_disabled'
      };
    }

    var today =
      new Date();

    var currentDay =
      today.getDay();

    var daysSinceMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    var monday =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() -
          daysSinceMonday -
          7,
        12,
        0,
        0
      );

    var sunday =
      new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6,
        12,
        0,
        0
      );

    var desde =
      formatServerDate(monday);

    var hasta =
      formatServerDate(sunday);

    var compliance =
      computeCompliance(
        desde,
        hasta
      );

    var operational =
      getOperationalStats(
        desde,
        hasta
      );

    var refrigeration =
      getTemperatureStats(
        desde,
        hasta
      );

    var refrigerationWeek =
      computeTemperaturaWeekly(
        desde,
        hasta
      );

    var ticketStats =
      getTicketStats(
        repositoryList(
          'ticket'
        ),
        desde,
        hasta,
        {
          includeArchived: false
        }
      );

    var pendingTickets =
      listTickets(
        {
          includeArchived: false,
          order:
            'priority_desc'
        }
      ).filter(
        function (ticket) {
          return !ticket.resolvido;
        }
      );

    var overdueTickets =
      pendingTickets.filter(
        function (ticket) {
          return ticket.vencido;
        }
      );

    var criticalTickets =
      pendingTickets.filter(
        function (ticket) {
          return (
            ticket.prioridade ===
            TICKET_PRIORITY.CRITICA
          );
        }
      );

    var lines = [
      'RESUMO SEMANAL — Registo Técnico · Moon and Sun',
      'Período: ' +
        desde +
        ' a ' +
        hasta,
      '',
      '📋 CUMPRIMENTO OPERACIONAL',
      '• Dias com leitura geral: ' +
        compliance.covered +
        '/' +
        compliance.total +
        ' (' +
        compliance.pct +
        '%)',
      '• Registos gerais: ' +
        operational.general.total,
      '• Registos gerais com desvios: ' +
        operational.general
          .comDesvios,
      '• Leituras de quartos: ' +
        operational.quartos
          .totalLeituras,
      '• Quartos únicos medidos: ' +
        operational.quartos
          .quartosUnicos,
      '• Leituras de quartos com desvios: ' +
        operational.quartos
          .comDesvios,
      '',
      '🧊 REFRIGERAÇÃO',
      '• Leituras: ' +
        refrigeration.total,
      '• Conformes: ' +
        refrigeration.conformes,
      '• Desvios: ' +
        refrigeration.desvios,
      '• Conformidade: ' +
        refrigeration
          .conformidadePct +
        '%',
      '• Equipamentos medidos na semana: ' +
        refrigerationWeek.medidos +
        '/' +
        refrigerationWeek.total,
      '',
      '🛠 MANUTENÇÃO',
      '• Tickets criados no período: ' +
        ticketStats.total,
      '• Abertos: ' +
        ticketStats.aberto,
      '• Atribuídos: ' +
        ticketStats.atribuido,
      '• Em andamento: ' +
        ticketStats.emAndamento,
      '• Aguardando material: ' +
        ticketStats
          .aguardandoMaterial,
      '• Resolvidos: ' +
        ticketStats.resolvido,
      '• Finalizados: ' +
        ticketStats.finalizado,
      '• Tickets ativos atualmente: ' +
        pendingTickets.length,
      '• Tickets críticos ativos: ' +
        criticalTickets.length,
      '• Tickets vencidos: ' +
        overdueTickets.length,
      '• MTTR: ' +
        (
          ticketStats.mttrMinutos !==
          null
            ? ticketStats
                .mttrMinutos +
              ' min'
            : 'sem dados'
        ),
      '• Cumprimento SLA de resolução: ' +
        (
          ticketStats
            .slaResolucaoPct !==
          null
            ? ticketStats
                .slaResolucaoPct +
              '%'
            : 'sem dados'
        ),
      ''
    ];

    if (
      compliance.missing.length
    ) {
      lines.push(
        '⚠ DIAS SEM REGISTO:'
      );

      compliance.missing
        .slice(
          0,
          MAX_ALERT_ITEMS_PER_EMAIL
        )
        .forEach(
          function (date) {
            lines.push(
              '• ' + date
            );
          }
        );

      lines.push('');
    }

    if (criticalTickets.length) {
      lines.push(
        '🚨 TICKETS CRÍTICOS ATIVOS:'
      );

      criticalTickets
        .slice(0, 10)
        .forEach(
          function (ticket) {
            lines.push(
              '• ' +
                ticket.numeroTicket +
                ' — ' +
                ticket.quarto +
                ' — ' +
                ticket.statusLabel
            );
          }
        );

      lines.push('');
    }

    if (overdueTickets.length) {
      lines.push(
        '⏰ TICKETS VENCIDOS:'
      );

      overdueTickets
        .slice(0, 10)
        .forEach(
          function (ticket) {
            lines.push(
              '• ' +
                ticket.numeroTicket +
                ' — ' +
                ticket.quarto +
                ' — ' +
                ticket.prioridadeLabel
            );
          }
        );

      lines.push('');
    }

    lines.push(
      'Abra a aplicação para consultar os detalhes e relatórios completos.'
    );

    lines.push(
      '— Registo Técnico · Moon and Sun'
    );

    var period =
      desde + '_' + hasta;

    return sendSystemEmail(
      '📈 Registo Técnico — resumo semanal',
      lines.join('\n'),
      {
        cacheKey:
          buildAlertCacheKey(
            'weekly_summary',
            'all',
            period
          ),

        ttlSeconds:
          ALERT_CACHE_MAX_SECONDS
      }
    );
  } catch (error) {
    return {
      ok: false,

      error:
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}

// =========================================================
// VERIFICAÇÃO AGREGADA DE ALERTAS
// =========================================================

function runScheduledAlertChecks() {
  var results = {
    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    ticketSla: null,
    ticketFollowUp: null,
    refrigeration: null,

    ok: true,
    errors: []
  };

  try {
    results.ticketSla =
      checkTicketSlaAlerts();

    if (
      results.ticketSla &&
      results.ticketSla.ok === false &&
      !results.ticketSla.skipped
    ) {
      results.ok = false;
    }
  } catch (error) {
    results.ok = false;

    results.errors.push(
      'SLA: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    results.ticketFollowUp =
      checkTicketFollowUpAlerts();

    if (
      results.ticketFollowUp &&
      results.ticketFollowUp
        .ok === false &&
      !results.ticketFollowUp
        .skipped
    ) {
      results.ok = false;
    }
  } catch (error) {
    results.ok = false;

    results.errors.push(
      'Seguimento: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    /*
     * Esta função não gera emails duplicados, pois utiliza
     * uma chave por semana.
     */
    results.refrigeration =
      weeklyRefrigerationReminder();

    if (
      results.refrigeration &&
      results.refrigeration
        .ok === false &&
      !results.refrigeration
        .skipped
    ) {
      results.ok = false;
    }
  } catch (error) {
    results.ok = false;

    results.errors.push(
      'Refrigeração: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  return results;
}

// =========================================================
// GESTÃO DOS TRIGGERS
// =========================================================

var ALERT_TRIGGER_HANDLERS = [
  'dailyReminder',
  'weeklySummary',
  'runScheduledAlertChecks'
];

function deleteAlertTriggers() {
  var deleted = [];

  ScriptApp
    .getProjectTriggers()
    .forEach(function (trigger) {
      var handler =
        trigger.getHandlerFunction();

      if (
        ALERT_TRIGGER_HANDLERS
          .indexOf(handler) !== -1
      ) {
        ScriptApp.deleteTrigger(
          trigger
        );

        deleted.push(handler);
      }
    });

  return deleted;
}

function setupComplianceTriggers() {
  var deleted =
    deleteAlertTriggers();

  ScriptApp
    .newTrigger(
      'dailyReminder'
    )
    .timeBased()
    .everyDays(1)
    .atHour(10)
    .create();

  ScriptApp
    .newTrigger(
      'weeklySummary'
    )
    .timeBased()
    .onWeekDay(
      ScriptApp.WeekDay.MONDAY
    )
    .atHour(8)
    .create();

  /*
   * Verifica SLA e seguimentos a cada hora.
   */
  ScriptApp
    .newTrigger(
      'runScheduledAlertChecks'
    )
    .timeBased()
    .everyHours(1)
    .create();

  return {
    ok: true,

    deleted:
      deleted,

    created: [
      {
        handler:
          'dailyReminder',
        schedule:
          'diário às 10h'
      },
      {
        handler:
          'weeklySummary',
        schedule:
          'segunda-feira às 08h'
      },
      {
        handler:
          'runScheduledAlertChecks',
        schedule:
          'a cada hora'
      }
    ]
  };
}

// Compatibilidade com o nome antigo.
function setupAlertTriggers() {
  return setupComplianceTriggers();
}

// =========================================================
// TESTE MANUAL DE EMAIL
// =========================================================

function sendTestAlertEmail() {
  var timestamp =
    formatIsoDateTime(
      new Date()
    );

  return sendSystemEmail(
    '🧪 Registo Técnico — teste de alertas',
    [
      'Este é um email de teste do serviço de alertas.',
      '',
      'Data/Hora: ' +
        timestamp,
      'Backend: v' +
        BACKEND_RELEASE.VERSION,
      '',
      'Se recebeu esta mensagem, o serviço de email está operacional.',
      '',
      '— Registo Técnico · Moon and Sun'
    ].join('\n'),
    {
      cacheKey:
        buildAlertCacheKey(
          'test_alert',
          'manual',
          timestamp
        ),

      ttlSeconds: 60
    }
  );
}

// =========================================================
// DIAGNÓSTICO DEL SERVICIO DE ALERTAS
// =========================================================

function diagnoseAlerts() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    enabled: false,
    recipients: [],
    triggers: [],
    quota: null,

    pendingChecks: {
      overdueTickets: 0,
      slaWarnings: 0,
      followUps: 0,
      refrigerationMissing: 0
    },

    warnings: [],
    errors: []
  };

  try {
    result.enabled =
      alertsEnabled();

    result.recipients =
      getAlertRecipients();

    if (
      result.enabled &&
      !result.recipients.length
    ) {
      result.warnings.push(
        'Os alertas estão ativos, mas não existem emails destinatários.'
      );
    }

    if (!result.enabled) {
      result.warnings.push(
        'O serviço de alertas está desativado na configuração.'
      );
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Configuração: ' +
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    );
  }

  try {
    var triggers =
      ScriptApp.getProjectTriggers();

    result.triggers =
      triggers.map(
        function (trigger) {
          var eventType = '';

          try {
            eventType =
              safeString(
                trigger.getEventType()
              );
          } catch (eventTypeError) {
            eventType = '';
          }

          return {
            handler:
              trigger
                .getHandlerFunction(),

            eventType:
              eventType,

            sourceId:
              typeof trigger
                .getTriggerSourceId ===
                'function'
                ? safeString(
                    trigger
                      .getTriggerSourceId()
                  )
                : ''
          };
        }
      );

    ALERT_TRIGGER_HANDLERS
      .forEach(
        function (handler) {
          var exists =
            result.triggers.some(
              function (trigger) {
                return (
                  trigger.handler ===
                  handler
                );
              }
            );

          if (!exists) {
            result.warnings.push(
              'Trigger ausente: ' +
                handler
            );
          }
        }
      );

    ALERT_TRIGGER_HANDLERS
      .forEach(
        function (handler) {
          var occurrences =
            result.triggers.filter(
              function (trigger) {
                return (
                  trigger.handler ===
                  handler
                );
              }
            ).length;

          if (occurrences > 1) {
            result.warnings.push(
              'Existem ' +
                occurrences +
                ' triggers duplicados para ' +
                handler +
                '.'
            );
          }
        }
      );
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Triggers: ' +
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    );
  }

  try {
    result.quota =
      MailApp
        .getRemainingDailyQuota();

    if (
      result.quota !== null &&
      result.quota < 10
    ) {
      result.warnings.push(
        'A quota diária de emails está próxima do limite: ' +
          result.quota +
          ' destinatário(s) disponível(is).'
      );
    }
  } catch (error) {
    result.warnings.push(
      'Não foi possível consultar a quota diária de emails.'
    );
  }

  try {
    var activeTickets =
      listTickets(
        {
          includeArchived: false,
          order:
            'priority_desc'
        },
        {
          fresh: true
        }
      ).filter(
        function (ticket) {
          return !ticket.resolvido;
        }
      );

    result.pendingChecks
      .overdueTickets =
      activeTickets.filter(
        function (ticket) {
          return Boolean(
            ticket
              .resolucaoVencida
          );
        }
      ).length;

    result.pendingChecks
      .slaWarnings =
      activeTickets.filter(
        function (ticket) {
          return (
            !ticket
              .resolucaoVencida &&
            ticket
              .minutosParaResolucao !==
              null &&
            ticket
              .minutosParaResolucao >=
              0 &&
            ticket
              .minutosParaResolucao <=
              TICKET_SLA_WARNING_MINUTES
          );
        }
      ).length;

    var today =
      formatServerDate(
        new Date()
      );

    result.pendingChecks
      .followUps =
      listTickets(
        {
          includeArchived: false,
          order: 'date_asc'
        },
        {
          fresh: false
        }
      ).filter(
        function (ticket) {
          return (
            ticket
              .necessitaSeguimento ===
              'Sim' &&
            ticket.dataSeguimento &&
            ticket.dataSeguimento <=
              today
          );
        }
      ).length;
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Tickets: ' +
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    );
  }

  try {
    var refrigeration =
      computeTemperaturaWeekly();

    result.pendingChecks
      .refrigerationMissing =
      refrigeration.faltam;

    if (
      refrigeration.total > 0 &&
      refrigeration.faltam > 0
    ) {
      result.warnings.push(
        'Existem ' +
          refrigeration.faltam +
          ' equipamento(s) sem medição na semana atual.'
      );
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Refrigeração: ' +
        safeString(
          error &&
          error.message
            ? error.message
            : error
        )
    );
  }

  if (result.errors.length) {
    result.ok = false;
  }

  return result;
}

// =========================================================
// LIMPEZA MANUAL DE MARCADORES DE DUPLICAÇÃO
// =========================================================

/**
 * O CacheService não permite listar todas as chaves.
 * Esta função elimina apenas uma chave conhecida, útil
 * durante testes ou reenvios administrativos.
 */
function clearAlertMarker(
  type,
  identifier,
  period
) {
  var key =
    buildAlertCacheKey(
      type,
      identifier,
      period
    );

  var removed =
    cacheRemove(key);

  return {
    ok: removed,
    key: key
  };
}

// =========================================================
// ESTADO RESUMIDO PARA ADMINISTRAÇÃO
// =========================================================

function getAlertServiceStatus() {
  var diagnosis =
    diagnoseAlerts();

  return {
    ok: diagnosis.ok,

    enabled:
      diagnosis.enabled,

    recipientsCount:
      diagnosis
        .recipients
        .length,

    remainingDailyQuota:
      diagnosis.quota,

    configuredTriggers:
      diagnosis
        .triggers
        .filter(
          function (trigger) {
            return (
              ALERT_TRIGGER_HANDLERS
                .indexOf(
                  trigger.handler
                ) !== -1
            );
          }
        )
        .length,

    expectedTriggers:
      ALERT_TRIGGER_HANDLERS
        .length,

    pendingChecks:
      diagnosis
        .pendingChecks,

    warnings:
      diagnosis.warnings,

    errors:
      diagnosis.errors
  };
}

// =========================================================
// MARCADOR DE FIM DA PARTE 10
// =========================================================

/*
 * FIM DE 10_AlertService.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 10/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 11/13 — Relatórios, cumprimento,
 * resumo executivo, fecho mensal e bootstrap
 *
 * Dependências:
 * - 01_Core.gs
 * - 02_SheetsRepository.gs
 * - 03_UsersAuth.gs
 * - 04_ConfigService.gs
 * - 05_OperationalRecords.gs
 * - 06_Refrigeration.gs
 * - 07_TicketDomain.gs
 * - 08_TicketService.gs
 * - 09_AuditService.gs
 * - 10_AlertService.gs
 */

// =========================================================
// INTERVALOS DE DATAS
// =========================================================

function getMonthRange(monthKey) {
  var key =
    safeString(monthKey).trim();

  if (
    !/^\d{4}-\d{2}$/.test(key)
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Mês inválido (AAAA-MM)'
    );
  }

  var parts = key.split('-');
  var year = Number(parts[0]);
  var month = Number(parts[1]);

  if (
    year < 2000 ||
    year > 2100 ||
    month < 1 ||
    month > 12
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Mês inválido'
    );
  }

  var firstDay = new Date(
    year,
    month - 1,
    1,
    12,
    0,
    0
  );

  var lastDay = new Date(
    year,
    month,
    0,
    12,
    0,
    0
  );

  return {
    monthKey: key,
    desde:
      formatServerDate(firstDay),
    hasta:
      formatServerDate(lastDay),
    year: year,
    month: month,
    days:
      lastDay.getDate()
  };
}

function getCurrentMonthRange() {
  var now = new Date();

  var monthKey =
    now.getFullYear() +
    '-' +
    (
      '0' +
      (now.getMonth() + 1)
    ).slice(-2);

  return getMonthRange(monthKey);
}

function getPreviousMonthRange() {
  var now = new Date();

  var previous = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
    12,
    0,
    0
  );

  var monthKey =
    previous.getFullYear() +
    '-' +
    (
      '0' +
      (previous.getMonth() + 1)
    ).slice(-2);

  return getMonthRange(monthKey);
}

function getNextMonthKey(monthKey) {
  var range =
    getMonthRange(monthKey);

  var next = new Date(
    range.year,
    range.month,
    1,
    12,
    0,
    0
  );

  return (
    next.getFullYear() +
    '-' +
    (
      '0' +
      (next.getMonth() + 1)
    ).slice(-2)
  );
}

function getCurrentWeekRange() {
  return weekRange(0);
}

function validateReportRange(
  desde,
  hasta
) {
  var start = requireIsoDate(
    desde,
    'Data inicial',
    false
  );

  var end = requireIsoDate(
    hasta,
    'Data final',
    false
  );

  if (start > end) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'A data inicial não pode ser posterior à data final'
    );
  }

  var startDate =
    parseLocalDateTime(
      start,
      '00:00'
    );

  var endDate =
    parseLocalDateTime(
      end,
      '23:59'
    );

  var days =
    Math.round(
      (
        endDate.getTime() -
        startDate.getTime()
      ) / 86400000
    ) + 1;

  if (days > 3660) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'O intervalo máximo permitido é de 10 anos'
    );
  }

  return {
    desde: start,
    hasta: end,
    days: days
  };
}

// =========================================================
// UTILITÁRIOS ESTATÍSTICOS
// =========================================================

function averageNumericField(
  records,
  field
) {
  var values = (records || [])
    .map(function (record) {
      return parseDecimal(
        record[field],
        null
      );
    })
    .filter(function (value) {
      return value !== null;
    });

  if (!values.length) {
    return null;
  }

  return (
    values.reduce(
      function (total, value) {
        return total + value;
      },
      0
    ) / values.length
  );
}

function minimumNumericField(
  records,
  field
) {
  var values = (records || [])
    .map(function (record) {
      return parseDecimal(
        record[field],
        null
      );
    })
    .filter(function (value) {
      return value !== null;
    });

  return values.length
    ? Math.min.apply(null, values)
    : null;
}

function maximumNumericField(
  records,
  field
) {
  var values = (records || [])
    .map(function (record) {
      return parseDecimal(
        record[field],
        null
      );
    })
    .filter(function (value) {
      return value !== null;
    });

  return values.length
    ? Math.max.apply(null, values)
    : null;
}

function roundReportNumber(
  value,
  decimals
) {
  if (
    value === null ||
    value === undefined ||
    !isFinite(Number(value))
  ) {
    return null;
  }

  var precision =
    Number(decimals || 0);

  var factor =
    Math.pow(10, precision);

  return (
    Math.round(
      Number(value) * factor
    ) / factor
  );
}

function filterRecordsByRange(
  records,
  desde,
  hasta
) {
  return (records || []).filter(
    function (record) {
      var date =
        safeString(record.fecha);

      return (
        date >= desde &&
        date <= hasta
      );
    }
  );
}

function getLastNumericReading(
  records,
  field
) {
  var sorted = (records || [])
    .slice()
    .sort(function (left, right) {
      var leftKey =
        safeString(left.fecha) +
        ' ' +
        safeString(
          left.hora || '00:00'
        );

      var rightKey =
        safeString(right.fecha) +
        ' ' +
        safeString(
          right.hora || '00:00'
        );

      return rightKey.localeCompare(
        leftKey
      );
    });

  for (
    var index = 0;
    index < sorted.length;
    index++
  ) {
    var value =
      parseDecimal(
        sorted[index][field],
        null
      );

    if (value !== null) {
      return {
        value: value,
        fecha:
          sorted[index].fecha,
        hora:
          sorted[index].hora,
        recordId:
          sorted[index].id
      };
    }
  }

  return null;
}

// =========================================================
// RESUMO DO PERÍODO
// =========================================================

function buildPeriodSummary(
  desde,
  hasta,
  options
) {
  var range =
    validateReportRange(
      desde,
      hasta
    );

  var settings =
    options || {};

  var generalAll =
    repositoryList(
      'general',
      {
        fresh:
          Boolean(settings.fresh)
      }
    );

  var roomAll =
    repositoryList(
      'quarto',
      {
        fresh:
          Boolean(settings.fresh)
      }
    );

  var temperatureAll =
    repositoryList(
      'temperatura',
      {
        fresh:
          Boolean(settings.fresh)
      }
    );

  var ticketAll =
    repositoryList(
      'ticket',
      {
        fresh:
          Boolean(settings.fresh)
      }
    );

  var general =
    filterRecordsByRange(
      generalAll,
      range.desde,
      range.hasta
    );

  var rooms =
    filterRecordsByRange(
      roomAll,
      range.desde,
      range.hasta
    );

  var temperatures =
    filterRecordsByRange(
      temperatureAll,
      range.desde,
      range.hasta
    );

  var operationalStats =
    getOperationalStats(
      range.desde,
      range.hasta
    );

  var consumption =
    calculateConsumptionStats(
      generalAll,
      range.desde,
      range.hasta
    );

  var compliance =
    computeCompliance(
      range.desde,
      range.hasta
    );

  var temperatureStats =
    getTemperatureStats(
      range.desde,
      range.hasta
    );

  var ticketStats =
    getTicketStats(
      ticketAll,
      range.desde,
      range.hasta,
      {
        includeArchived:
          Boolean(
            settings.includeArchived
          )
      }
    );

  var thresholds =
    getTechnicalThresholds();

  var currentCycle =
    getCurrentRoomCycle({
      hasta: range.hasta,
      fresh:
        Boolean(settings.fresh)
    });

  var tariffs =
    getTarifasConfig();

  var waterCost =
    tariffs.agua !== null
      ? roundMoney(
          consumption.aguaTotal *
          tariffs.agua
        )
      : null;

  var electricityCost =
    tariffs.electricidad !== null
      ? roundMoney(
          consumption
            .electricidadTotal *
          tariffs.electricidad
        )
      : null;

  var totalCost =
    waterCost !== null ||
    electricityCost !== null
      ? roundMoney(
          (waterCost || 0) +
          (electricityCost || 0)
        )
      : null;

  return {
    desde: range.desde,
    hasta: range.hasta,
    days: range.days,

    generatedAt:
      formatIsoDateTime(
        new Date()
      ),

    records: {
      general:
        general.length,

      quartos:
        rooms.length,

      temperaturas:
        temperatures.length,

      tickets:
        ticketStats.total
    },

    compliance:
      compliance,

    operational:
      operationalStats,

    consumption: {
      agua:
        consumption.aguaTotal,

      eletricidade:
        consumption
          .electricidadTotal,

      aguaDeltaCount:
        consumption
          .aguaDeltaCount,

      eletricidadeDeltaCount:
        consumption
          .electricidadDeltaCount,

      aguaResets:
        consumption
          .aguaResets,

      eletricidadeResets:
        consumption
          .electricidadResets
    },

    costs: {
      water:
        waterCost,

      electricity:
        electricityCost,

      total:
        totalCost,

      tariffs:
        tariffs
    },

    piscina: {
      phMedio:
        roundReportNumber(
          averageNumericField(
            general,
            'phPiscina'
          ),
          2
        ),

      phMinimo:
        minimumNumericField(
          general,
          'phPiscina'
        ),

      phMaximo:
        maximumNumericField(
          general,
          'phPiscina'
        ),

      cloroLivreMedio:
        roundReportNumber(
          averageNumericField(
            general,
            'cloroLibre'
          ),
          2
        ),

      cloroTotalMedio:
        roundReportNumber(
          averageNumericField(
            general,
            'cloroTotal'
          ),
          2
        ),

      temperaturaMedia:
        roundReportNumber(
          averageNumericField(
            general,
            'tempPiscina'
          ),
          1
        )
    },

    aqs: {
      retornoMedio:
        roundReportNumber(
          averageNumericField(
            general,
            'retornoAqs'
          ),
          1
        ),

      retornoMinimo:
        minimumNumericField(
          general,
          'retornoAqs'
        ),

      quartosMedio:
        roundReportNumber(
          averageNumericField(
            general,
            'aqsQuartos'
          ),
          1
        ),

      quartosMinimo:
        minimumNumericField(
          general,
          'aqsQuartos'
        )
    },

    refrigeration:
      temperatureStats,

    maintenance:
      ticketStats,

    roomCycle:
      currentCycle,

    thresholds:
      thresholds
  };
}

// =========================================================
// RESUMO MENSAL
// =========================================================

function calculateMonthSummary(
  monthKey,
  options
) {
  var range =
    getMonthRange(
      monthKey
    );

  var settings =
    options || {};

  var summary =
    buildPeriodSummary(
      range.desde,
      range.hasta,
      settings
    );

  var generalRecords =
    filterRecordsByRange(
      repositoryList(
        'general',
        {
          fresh:
            Boolean(settings.fresh)
        }
      ),
      range.desde,
      range.hasta
    );

  var lastWater =
    getLastNumericReading(
      generalRecords,
      'agua'
    );

  var lastElectricity =
    getLastNumericReading(
      generalRecords,
      'electricidad'
    );

  return {
    mesKey:
      range.monthKey,

    mesLabel:
      range.monthKey,

    dataInicio:
      range.desde,

    dataFim:
      range.hasta,

    generalCount:
      summary.records.general,

    quartosCount:
      summary.records.quartos,

    aguaConsumoTotal:
      summary.consumption.agua,

    elecConsumoTotal:
      summary.consumption
        .eletricidade,

    ultimaLeituraAgua:
      lastWater
        ? lastWater.value
        : null,

    ultimaLeituraElec:
      lastElectricity
        ? lastElectricity.value
        : null,

    piscinaAvgPh:
      summary.piscina.phMedio,

    piscinaAvgCloro:
      summary.piscina
        .cloroLivreMedio,

    aqsAvgRetorno:
      summary.aqs
        .retornoMedio,

    tempCount:
      summary.refrigeration.total,

    tempConformes:
      summary.refrigeration
        .conformes,

    tempDesvios:
      summary.refrigeration
        .desvios,

    tempCompliancePct:
      summary.refrigeration
        .conformidadePct,

    ticketCount:
      summary.maintenance.total,

    ticketClosedCount:
      summary.maintenance
        .finalizado,

    ticketResolvedCount:
      summary.maintenance
        .resolvido,

    ticketOverdueCount:
      summary.maintenance
        .vencidos,

    ticketMttrMinutes:
      summary.maintenance
        .mttrMinutos,

    compliancePct:
      summary.compliance.pct,

    custoAgua:
      summary.costs.water,

    custoEletricidade:
      summary.costs.electricity,

    custoTotal:
      summary.costs.total,

    roomCycleProgress:
      summary.roomCycle
        .progressPct,

    generatedAt:
      summary.generatedAt
  };
}

// =========================================================
// FECHO MENSAL
// =========================================================

function executeMonthlyClosure(
  monthKey,
  observations,
  uid,
  options
) {
  requireAdmin(uid);

  var range =
    getMonthRange(monthKey);

  var settings =
    options || {};

  var currentMonth =
    getCurrentMonthRange();

  if (
    range.monthKey >
    currentMonth.monthKey
  ) {
    throw apiError(
      API_ERROR_CODES.VALIDATION,
      'Não é possível fechar um mês futuro'
    );
  }

  var existing =
    findMonthlyClosure(
      range.monthKey
    );

  if (
    existing &&
    settings.allowUpdate !== true
  ) {
    throw apiError(
      API_ERROR_CODES.CONFLICT,
      'Este mês já foi fechado. Confirme explicitamente a atualização do fecho.',
      {
        closure: existing
      }
    );
  }

  var summary =
    calculateMonthSummary(
      range.monthKey,
      {
        fresh: true
      }
    );

  var user =
    findUserById(
      uid,
      {
        fresh: true
      }
    );

  var closure = Object.assign(
    {},
    summary,
    {
      fechadoPor:
        user
          ? (
              user.nombre ||
              user.usuario
            )
          : uid,

      fechadoPorId: uid,

      dataFecho:
        formatIsoDateTime(
          new Date()
        ),

      observacoes:
        trimText(
          observations,
          1000
        )
    }
  );

  var saved =
    saveMonthlyClosure(
      closure,
      uid
    );

  /*
   * A leitura final do contador passa a ser a linha
   * base do mês seguinte. O contador físico não é
   * alterado: apenas o consumo mensal reinicia em zero.
   */
  var nextMonthKey =
    getNextMonthKey(
      range.monthKey
    );

  var nextMonthStart =
    nextMonthKey + '-01';

  if (
    summary.ultimaLeituraAgua !==
    null
  ) {
    setBaselineConfig(
      'agua',
      summary.ultimaLeituraAgua,
      nextMonthStart,
      uid
    );
  }

  if (
    summary.ultimaLeituraElec !==
    null
  ) {
    setBaselineConfig(
      'electricidad',
      summary.ultimaLeituraElec,
      nextMonthStart,
      uid
    );
  }

  invalidateAllCoreCaches();

  logAudit(
    uid,
    existing
      ? 'updateMonthlyClosure'
      : 'executeMonthlyClosure',
    'monthlyClosure',
    range.monthKey,
    {
      summary: summary,

      nextMonth:
        nextMonthKey,

      waterBaseline:
        summary
          .ultimaLeituraAgua,

      electricityBaseline:
        summary
          .ultimaLeituraElec,

      observations:
        closure.observacoes
    },
    settings.requestId
  );

  return {
    ok: true,

    created:
      saved.created,

    updated:
      saved.updated,

    closure:
      saved.closure,

    nextPeriod: {
      monthKey:
        nextMonthKey,

      startDate:
        nextMonthStart,

      baselineAgua:
        summary
          .ultimaLeituraAgua,

      baselineElectricidad:
        summary
          .ultimaLeituraElec
    }
  };
}

// Compatibilidade com o nome utilizado no frontend atual.
function executeFechoMensal(
  monthKey,
  observations,
  uid,
  options
) {
  return executeMonthlyClosure(
    monthKey,
    observations,
    uid,
    options
  );
}

// =========================================================
// DADOS PARA RELATÓRIO OFICIAL
// =========================================================

function buildOfficialReportData(
  desde,
  hasta,
  options
) {
  var range =
    validateReportRange(
      desde,
      hasta
    );

  var settings =
    options || {};

  var summary =
    buildPeriodSummary(
      range.desde,
      range.hasta,
      {
        fresh:
          Boolean(
            settings.fresh
          ),

        includeArchived:
          Boolean(
            settings.includeArchived
          )
      }
    );

  var general =
    filterRecordsByRange(
      repositoryList(
        'general'
      ),
      range.desde,
      range.hasta
    );

  var rooms =
    filterRecordsByRange(
      repositoryList(
        'quarto'
      ),
      range.desde,
      range.hasta
    );

  var temperatures =
    filterRecordsByRange(
      repositoryList(
        'temperatura'
      ),
      range.desde,
      range.hasta
    );

  var tickets =
    listTickets(
      {
        desde: range.desde,
        hasta: range.hasta,

        includeArchived:
          Boolean(
            settings.includeArchived
          ),

        order: 'date_asc'
      }
    );

  return {
    title:
      'Relatório Oficial de Controlo Técnico',

    application:
      BACKEND_RELEASE.NAME,

    backendVersion:
      BACKEND_RELEASE.VERSION,

    generatedAt:
      formatIsoDateTime(
        new Date()
      ),

    desde:
      range.desde,

    hasta:
      range.hasta,

    summary:
      summary,

    records: {
      general: general,
      quartos: rooms,
      temperaturas:
        temperatures,
      tickets: tickets
    }
  };
}

// =========================================================
// RESUMO EXECUTIVO
// =========================================================

function calculateExecutiveHealthScore(
  summary
) {
  var source =
    summary || {};

  var compliance =
    Number(
      source.compliance
        ? source.compliance.pct
        : 0
    );

  var refrigeration =
    Number(
      source.refrigeration
        ? source.refrigeration
            .conformidadePct
        : 0
    );

  var roomCycle =
    Number(
      source.roomCycle
        ? source.roomCycle
            .progressPct
        : 0
    );

  var maintenanceTotal =
    Number(
      source.maintenance
        ? source.maintenance.total
        : 0
    );

  var maintenanceOverdue =
    Number(
      source.maintenance
        ? source.maintenance.vencidos
        : 0
    );

  var maintenanceScore =
    maintenanceTotal > 0
      ? Math.max(
          0,
          100 -
          (
            maintenanceOverdue /
            maintenanceTotal *
            100
          )
        )
      : 100;

  var operationalTotal =
    Number(
      source.operational &&
      source.operational.general
        ? source.operational.general
            .total
        : 0
    );

  var operationalDeviations =
    Number(
      source.operational &&
      source.operational.general
        ? source.operational.general
            .comDesvios
        : 0
    );

  var operationalScore =
    operationalTotal > 0
      ? Math.max(
          0,
          (
            operationalTotal -
            operationalDeviations
          ) /
          operationalTotal *
          100
        )
      : 0;

  return Math.round(
    compliance * 0.20 +
    refrigeration * 0.20 +
    roomCycle * 0.15 +
    maintenanceScore * 0.20 +
    operationalScore * 0.25
  );
}

function buildExecutiveSummary(
  desde,
  hasta,
  options
) {
  var summary =
    buildPeriodSummary(
      desde,
      hasta,
      options
    );

  var healthScore =
    calculateExecutiveHealthScore(
      summary
    );

  var status;

  if (healthScore >= 90) {
    status = 'excelente';
  } else if (
    healthScore >= 80
  ) {
    status = 'conforme';
  } else if (
    healthScore >= 65
  ) {
    status = 'atencao';
  } else {
    status = 'critico';
  }

  var actions = [];

  if (
    summary.maintenance
      .criticosAbertos > 0
  ) {
    actions.push({
      priority: 'critica',
      area: 'manutencao',
      message:
        'Existem ' +
        summary.maintenance
          .criticosAbertos +
        ' ticket(s) crítico(s) ativo(s).'
    });
  }

  if (
    summary.maintenance
      .vencidos > 0
  ) {
    actions.push({
      priority: 'alta',
      area: 'manutencao',
      message:
        'Existem ' +
        summary.maintenance
          .vencidos +
        ' ticket(s) com SLA vencido.'
    });
  }

  if (
    summary.refrigeration
      .desvios > 0
  ) {
    actions.push({
      priority: 'alta',
      area: 'refrigeracao',
      message:
        'Foram detetadas ' +
        summary.refrigeration
          .desvios +
        ' leitura(s) fora do intervalo.'
    });
  }

  if (
    summary.compliance.pct < 90
  ) {
    actions.push({
      priority: 'media',
      area: 'cumprimento',
      message:
        'O cumprimento dos registos está em ' +
        summary.compliance.pct +
        '%.'
    });
  }

  return {
    desde:
      summary.desde,

    hasta:
      summary.hasta,

    generatedAt:
      summary.generatedAt,

    healthScore:
      healthScore,

    status:
      status,

    actions:
      actions,

    operational:
      summary.operational,

    compliance:
      summary.compliance,

    consumption:
      summary.consumption,

    costs:
      summary.costs,

    refrigeration:
      summary.refrigeration,

    maintenance:
      summary.maintenance,

    roomCycle:
      summary.roomCycle
  };
}

// =========================================================
// HISTÓRICO MENSAL EXECUTIVO
// =========================================================

function buildExecutiveMonthlyHistory(
  monthsBack,
  anchorMonth
) {
  var count =
    requireIntegerRange(
      monthsBack || 6,
      1,
      36,
      'Quantidade de meses',
      false
    );

  var anchor =
    anchorMonth
      ? getMonthRange(
          anchorMonth
        )
      : getCurrentMonthRange();

  var results = [];

  for (
    var offset =
      count - 1;
    offset >= 0;
    offset--
  ) {
    var date = new Date(
      anchor.year,
      anchor.month - 1 -
        offset,
      1,
      12,
      0,
      0
    );

    var monthKey =
      date.getFullYear() +
      '-' +
      (
        '0' +
        (
          date.getMonth() + 1
        )
      ).slice(-2);

    var monthSummary =
      calculateMonthSummary(
        monthKey
      );

    results.push(
      monthSummary
    );
  }

  return results;
}

// =========================================================
// BOOTSTRAP DA APLICAÇÃO
// =========================================================

function buildBootstrapPayload(user) {
  var sessionUser =
    user || null;

  var operational =
    getOperationalBootstrapData();

  var refrigeration =
    getRefrigerationBootstrapData();

  var tickets =
    listTickets(
      {
        includeArchived: false,
        order:
          'priority_desc'
      }
    );

  var payload = {
    config:
      sessionUser
        ? getVisibleConfigForUser(
            sessionUser
          )
        : {},

    records: {
      general:
        operational.records
          .general,

      quarto:
        operational.records
          .quarto,

      temperatura:
        refrigeration.records,

      ticket:
        tickets
    },

    equipamentos:
      refrigeration
        .equipamentos,

    roomCycle:
      operational.roomCycle,

    temperatureWeekly:
      refrigeration.weekly,

    tickets:
      tickets,

    ticketOptions:
      getTicketDomainOptions(),

    backend: {
      version:
        BACKEND_RELEASE.VERSION,

      build:
        BACKEND_RELEASE.BUILD_ID,

      channel:
        BACKEND_RELEASE.CHANNEL,

      minAppVersion:
        BACKEND_RELEASE
          .MIN_APP_VERSION
    }
  };

  if (sessionUser) {
    payload.permissions =
      getUserPermissions(
        sessionUser
      );

    payload.user =
      buildPublicSessionUser(
        sessionUser
      );

    payload.audit =
      getAuditBootstrapSummary(
        sessionUser
      );
  }

  return payload;
}

// =========================================================
// BACKUP DIÁRIO
// =========================================================

function getBackupFolder() {
  var folderName =
    'Registo Técnico — Backups';

  var folders =
    DriveApp
      .getFoldersByName(
        folderName
      );

  return folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(
        folderName
      );
}

function dailyBackup() {
  var spreadsheet =
    getApplicationSpreadsheet();

  var folder =
    getBackupFolder();

  var timestamp =
    Utilities.formatDate(
      new Date(),
      getTimeZone(),
      'yyyy-MM-dd HH-mm'
    );

  var file =
    DriveApp.getFileById(
      spreadsheet.getId()
    );

  var copy = file.makeCopy(
    'BACKUP ' +
      spreadsheet.getName() +
      ' ' +
      timestamp,
    folder
  );

  var retentionDays = 30;

  var cutoff =
    Date.now() -
    retentionDays *
    86400000;

  var files =
    folder.getFiles();

  var deleted = 0;

  while (files.hasNext()) {
    var backup =
      files.next();

    if (
      backup.getId() ===
      copy.getId()
    ) {
      continue;
    }

    if (
      backup
        .getDateCreated()
        .getTime() < cutoff
    ) {
      backup.setTrashed(true);
      deleted++;
    }
  }

  logAudit(
    'system',
    'dailyBackup',
    'system',
    spreadsheet.getId(),
    {
      backupId:
        copy.getId(),

      deletedOldCopies:
        deleted,

      retentionDays:
        retentionDays
    }
  );

  return {
    ok: true,

    backupId:
      copy.getId(),

    backupName:
      copy.getName(),

    deletedOldCopies:
      deleted
  };
}

function setupDailyBackup() {
  ScriptApp
    .getProjectTriggers()
    .forEach(
      function (trigger) {
        if (
          trigger
            .getHandlerFunction() ===
          'dailyBackup'
        ) {
          ScriptApp
            .deleteTrigger(
              trigger
            );
        }
      }
    );

  ScriptApp
    .newTrigger(
      'dailyBackup'
    )
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();

  return {
    ok: true,
    handler:
      'dailyBackup',
    schedule:
      'diário às 03h'
  };
}

// =========================================================
// DIAGNÓSTICO
// =========================================================

function diagnoseReportsCompliance() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    currentMonth: null,
    previousMonth: null,
    bootstrap: null,
    backupTrigger: false,
    errors: []
  };

  try {
    var current =
      getCurrentMonthRange();

    result.currentMonth =
      calculateMonthSummary(
        current.monthKey
      );
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Mês atual: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    var previous =
      getPreviousMonthRange();

    result.previousMonth =
      calculateMonthSummary(
        previous.monthKey
      );
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Mês anterior: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    var admin =
      getAllUsersRaw()
        .filter(
          function (user) {
            return (
              user.rol ===
                USER_ROLES.ADMIN &&
              !isNo(
                user.activo
              )
            );
          }
        )[0] || null;

    var bootstrap =
      buildBootstrapPayload(
        admin
      );

    result.bootstrap = {
      general:
        bootstrap.records
          .general.length,

      quartos:
        bootstrap.records
          .quarto.length,

      temperaturas:
        bootstrap.records
          .temperatura.length,

      tickets:
        bootstrap.records
          .ticket.length,

      equipamentos:
        bootstrap
          .equipamentos.length
    };
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Bootstrap: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    result.backupTrigger =
      ScriptApp
        .getProjectTriggers()
        .some(
          function (trigger) {
            return (
              trigger
                .getHandlerFunction() ===
              'dailyBackup'
            );
          }
        );
  } catch (error) {
    result.errors.push(
      'Trigger de backup: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  return result;
}

// =========================================================
// MARCADOR DE FIM DA PARTE 11
// =========================================================

/*
 * FIM DE 11_ReportsCompliance.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 11/13 está completa.
 */
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 12/13 — Rotas HTTP
 *
 * Dependências:
 * - Partes 01 a 11
 */

// =========================================================
// LEITURA DOS PEDIDOS
// =========================================================
function buildPublicSessionUser(user) {
  if (!user) return null;
  return {
    id: user.id || '',
    nome: user.nome || user.nombre || '',
    nombre: user.nombre || user.nome || '',
    usuario: user.usuario || user.username || '',
    rol: user.rol || user.role || 'tecnico',
    ativo: user.ativo !== undefined ? user.ativo : true
  };
}

function publicUser(user) {
  return buildPublicSessionUser(user);
}
function getPostBodyText(e) {
  if (!e || !e.postData) {
    throw apiError(
      API_ERROR_CODES.BAD_REQUEST,
      'Corpo do pedido ausente'
    );
  }

  var raw = '';

  if (
    e.postData.contents !== undefined &&
    e.postData.contents !== null
  ) {
    raw = safeString(
      e.postData.contents
    );
  }

  if (
    !raw &&
    typeof e.postData.getDataAsString === 'function'
  ) {
    raw = safeString(
      e.postData.getDataAsString('UTF-8')
    );
  }

  raw = raw.trim();

  if (!raw) {
    throw apiError(
      API_ERROR_CODES.BAD_REQUEST,
      'Corpo do pedido vazio'
    );
  }

  return raw;
}

function buildFastLoginResponse(loginResult) {
  if (
    !loginResult ||
    !loginResult.token ||
    !loginResult.user
  ) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Resultado de autenticação inválido'
    );
  }

  return {
    user: loginResult.user,
    token: loginResult.token,
    expiresInMs: loginResult.expiresInMs
  };
}

function canSkipRepositoryExistenceCheck(type, settings, generatedByServer) {
  return Boolean(
    type === 'audit' &&
    generatedByServer === true &&
    settings &&
    settings.skipExistenceCheck === true
  );
}
function parsePostBody(e) {
  var raw = getPostBodyText(e);
  var body;

  try {
    body = JSON.parse(raw);

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      throw new Error('Objeto JSON inválido');
    }
  } catch (error) {
    throw apiError(
      API_ERROR_CODES.BAD_REQUEST,
      'Pedido JSON inválido'
    );
  }

  var parameters =
    e && e.parameter
      ? e.parameter
      : {};

  // El frontend puede enviar estos campos por query string.
  if (!body.action && parameters.action) {
    body.action = parameters.action;
  }

  if (!body.token && parameters.token) {
    body.token = parameters.token;
  }

  if (!body.type && parameters.type) {
    body.type = parameters.type;
  }

  // Compatibilidad si el lote llega serializado como parámetro.
  if (!body.rows && parameters.rows) {
    body.rows = parseQueryJson(parameters.rows, []);
  }

  return body;
}
function parseQueryJson(
  value,
  defaultValue
) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return defaultValue;
  }

  var parsed =
    safeJsonParse(
      value,
      null
    );

  return parsed === null
    ? defaultValue
    : parsed;
}

function queryToBody(e) {
  var parameters =
    e && e.parameter
      ? e.parameter
      : {};

  var body = {};

  Object.keys(parameters).forEach(function (key) {
    body[key] = parameters[key];
  });

  if (parameters.data) {
    body.data = parseQueryJson(parameters.data, {});
  }

  if (parameters.filters) {
    body.filters = parseQueryJson(parameters.filters, {});
  }

  if (parameters.rows) {
    body.rows = parseQueryJson(parameters.rows, []);
  }

  if (parameters.options) {
    body.options = parseQueryJson(parameters.options, {});
  }

  return body;
}

function requireAction(body) {
  var action = trimText(
    body && body.action,
    80
  );

  if (!action) {
    throw apiError(
      API_ERROR_CODES.BAD_REQUEST,
      'Ação ausente'
    );
  }

  return action;
}

function isWriteAction(action) {
  return (
    WRITE_ACTIONS.indexOf(action) !== -1 ||
    [
      API_ACTIONS.LOGOUT,

      'updateUserRole',
      'updateUserProfile',
      'toggleEquipmentActive',

      'waitTicketMaterial',
      'unassignTicket',
      'restoreArchivedTicket',
      'deleteTicketPhysical',

      'executeMonthlyClosure',
      'saveMonthlyClosure',
      'deleteMonthlyClosure',

      'setConfigBatch',
      'deleteConfig',

      'recomputeRoomCycle',
      'setupAlertTriggers',
      'setupDailyBackup',
      'sendTestAlertEmail',
      'clearLoginLock'
    ].indexOf(action) !== -1
  );
}

function parseBooleanParameter(
  value,
  defaultValue
) {
  if (
    value === undefined ||
    value === null ||
    safeString(value).trim() === ''
  ) {
    return Boolean(defaultValue);
  }

  return isYes(value);
}

function getRequestOptions(
  body,
  context
) {
  var source =
    body && body.options &&
    typeof body.options === 'object'
      ? body.options
      : {};

  return Object.assign(
    {},
    source,
    {
      requestId:
        context.requestId,

      expectedVersion:
        body.expectedVersion !==
          undefined
          ? body.expectedVersion
          : source.expectedVersion,

      fresh:
        parseBooleanParameter(
          body.fresh !== undefined
            ? body.fresh
            : source.fresh,
          false
        )
    }
  );
}

// =========================================================
// CONFIGURAÇÃO VISÍVEL
// =========================================================

function canReadConfigKey(
  user,
  key
) {
  var allowed =
    user.rol === USER_ROLES.ADMIN
      ? ADMIN_VISIBLE_CONFIG_KEYS
      : PUBLIC_CONFIG_KEYS;

  return allowed.indexOf(key) !== -1;
}

function getAuthorizedConfig(
  key,
  uid
) {
  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  var configKey =
    validateConfigKey(key);

  if (
    !canReadConfigKey(
      user,
      configKey
    )
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'Não tem permissão para consultar esta configuração'
    );
  }

  return getConfig(configKey);
}

// =========================================================
// ROTAS PÚBLICAS
// =========================================================

function routePublicRequest(
  action,
  e,
  body,
  context
) {
  if (action === API_ACTIONS.HEALTH) {
    return successOut({
      status: 'ok',

      backend: {
        version:
          BACKEND_RELEASE.VERSION,

        build:
          BACKEND_RELEASE.BUILD_ID,

        channel:
          BACKEND_RELEASE.CHANNEL
      },

      time:
        formatIsoDateTime(
          new Date()
        )
    });
  }

  if (action === API_ACTIONS.VERSION) {
    return successOut({
      name:
        BACKEND_RELEASE.NAME,

      version:
        BACKEND_RELEASE.VERSION,

      build:
        BACKEND_RELEASE.BUILD_ID,

      channel:
        BACKEND_RELEASE.CHANNEL,

      minAppVersion:
        BACKEND_RELEASE
          .MIN_APP_VERSION
    });
  }

  if (
    action ===
    API_ACTIONS.SEED_STATUS
  ) {
    return successOut(
      getSeedStatus()
    );
  }

  if (action === API_ACTIONS.LOGIN) {
    var login = loginUser(
      body.usuario,
      safeString(body.pin)
    );
return successOut(
      buildFastLoginResponse(
        login
      )
    );
  }
  return null;
}

// =========================================================
// ROTAS PROTEGIDAS DE LEITURA
// =========================================================

function routeReadRequest(
  action,
  e,
  body,
  context
) {
  var uid = requireAuth(
    e,
    body,
    false
  );

  var user = findUserById(
    uid,
    {
      fresh: true
    }
  );

  if (!user) {
    throw apiError(
      API_ERROR_CODES.AUTH,
      'Utilizador não encontrado'
    );
  }

  var options =
    getRequestOptions(
      body,
      context
    );

  if (
    action ===
    API_ACTIONS.BOOTSTRAP
  ) {
    return successOut(
      buildBootstrapPayload(user)
    );
  }

  if (action === API_ACTIONS.ME) {
    return successOut(
      getCurrentSession(
        e,
        body
      )
    );
  }

  if (action === API_ACTIONS.LIST) {
    var type =
      safeString(body.type);

    var allowedTypes = [
      'general',
      'quarto',
      'temperatura',
      'ticket'
    ];

    if (
      allowedTypes.indexOf(type) ===
      -1
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de registo inválido'
      );
    }

    if (type === 'ticket') {
      return successOut({
        records: listTickets(
          body.filters || {},
          options
        )
      });
    }

    if (type === 'temperatura') {
      return successOut({
        records:
          listTemperatureRecords(
            body.filters || {},
            options
          )
      });
    }

    return successOut({
      records:
        listOperationalRecords(
          type,
          body.filters || {},
          options
        )
    });
  }

  if (
    action ===
    API_ACTIONS.GET_CONFIG
  ) {
    return successOut({
      value:
        getAuthorizedConfig(
          body.key,
          uid
        )
    });
  }

  if (
    action ===
    API_ACTIONS.GET_CONFIG_ALL
  ) {
    return successOut({
      config:
        getVisibleConfigForUser(
          user
        )
    });
  }

  if (
    action ===
    API_ACTIONS.LIST_EQUIPAMENTOS
  ) {
    return successOut({
      equipamentos:
        listEquipamentos({
          includeInactive:
            user.rol ===
              USER_ROLES.ADMIN,

          fresh:
            options.fresh
        })
    });
  }

  if (
    action ===
    API_ACTIONS.TEMPERATURA_STATUS
  ) {
    return successOut({
      status:
        body.desde &&
        body.hasta
          ? computeTemperaturaWeekly(
              body.desde,
              body.hasta
            )
          : computeTemperaturaWeekly()
    });
  }

  if (
    action ===
    API_ACTIONS.LIST_USERS
  ) {
    requireAdmin(uid);

    return successOut({
      users: listUsers()
    });
  }

  if (
    action ===
    API_ACTIONS.LIST_TICKETS
  ) {
    return successOut({
      tickets: listTickets(
        body.filters || {},
        options
      )
    });
  }

  if (
    action ===
    API_ACTIONS.GET_TICKET
  ) {
    return successOut({
      ticket: getTicket(
        body.id,
        options
      )
    });
  }

  if (
    action ===
    API_ACTIONS.TICKET_STATS
  ) {
    return successOut({
      stats: getTicketStats(
        repositoryList('ticket'),
        body.desde || '',
        body.hasta || '',
        {
          includeArchived:
            parseBooleanParameter(
              body.includeArchived,
              false
            )
        }
      )
    });
  }

  if (
    action ===
    API_ACTIONS.TICKET_HISTORY
  ) {
    return successOut(
      getTicketHistory(
        body.id,
        uid,
        options
      )
    );
  }

  if (action === 'maintenanceDashboard') {
    return successOut({
      dashboard:
        getMaintenanceDashboard(
          options
        )
    });
  }

  if (action === 'myTickets') {
    return successOut({
      tickets:
        listMyTickets(
          uid,
          body.filters || {}
        )
    });
  }

  if (action === 'ticketWorkload') {
    return successOut({
      workload:
        getTechnicianWorkload(
          options
        )
    });
  }

  if (action === 'ticketRecurrences') {
    return successOut({
      recurrences:
        getTicketRecurrences(
          body.desde || '',
          body.hasta || '',
          options
        )
    });
  }

  if (action === 'operationalStats') {
    return successOut({
      stats:
        getOperationalStats(
          body.desde,
          body.hasta
        )
    });
  }

  if (action === 'temperatureStats') {
    return successOut({
      stats:
        getTemperatureStats(
          body.desde,
          body.hasta
        )
    });
  }

  if (action === 'executiveSummary') {
    return successOut({
      summary:
        buildExecutiveSummary(
          body.desde,
          body.hasta,
          options
        )
    });
  }

  if (action === 'officialReportData') {
    return successOut({
      report:
        buildOfficialReportData(
          body.desde,
          body.hasta,
          options
        )
    });
  }

  if (action === 'monthlyHistory') {
    return successOut({
      months:
        buildExecutiveMonthlyHistory(
          body.months || 6,
          body.anchorMonth || ''
        )
    });
  }

  if (action === 'monthlyClosures') {
    return successOut({
      closures:
        getMonthlyClosures()
    });
  }

  if (action === 'auditList') {
    requireAdmin(uid);

    return successOut({
      records:
        listAuditRecords(
          body.filters || {},
          options
        )
    });
  }

  if (action === 'auditStats') {
    requireAdmin(uid);

    return successOut({
      stats:
        getAuditStats(
          body.desde || '',
          body.hasta || ''
        )
    });
  }

  throw apiError(
    API_ERROR_CODES.NOT_FOUND,
    'Ação de leitura desconhecida: ' +
      action
  );
}

// =========================================================
// REGISTOS OPERACIONAIS — ESCRITA
// =========================================================

function routeOperationalWrite(
  action,
  body,
  uid,
  options
) {
  var type = safeString(body.type);

  if (action === API_ACTIONS.SAVE) {
    if (type === 'temperatura') {
      return createTemperatureRecord(
        body.data,
        uid,
        options
      );
    }

    if (
      type !== 'general' &&
      type !== 'quarto'
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de registo inválido para criação'
      );
    }

    return createOperationalRecord(
      type,
      body.data,
      uid,
      options
    );
  }

  if (action === API_ACTIONS.SAVE_BATCH) {
    if (type === 'temperatura') {
      return createTemperatureBatch(
        body.rows,
        uid,
        options
      );
    }

    if (type === 'ticket') {
      return createTicketBatch(
        body.rows,
        uid,
        options
      );
    }

    if (
      type !== 'general' &&
      type !== 'quarto'
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de registo inválido para importação'
      );
    }

    return createOperationalBatch(
      type,
      body.rows,
      uid,
      options
    );
  }

  if (action === API_ACTIONS.UPDATE) {
    if (type === 'temperatura') {
      return updateTemperatureRecord(
        body.id,
        body.data,
        uid,
        options
      );
    }

    if (
      type !== 'general' &&
      type !== 'quarto'
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de registo inválido para atualização'
      );
    }

    return updateOperationalRecord(
      type,
      body.id,
      body.data,
      uid,
      options
    );
  }

  if (action === API_ACTIONS.DELETE) {
    if (
      [
        'general',
        'quarto',
        'temperatura'
      ].indexOf(type) === -1
    ) {
      throw apiError(
        API_ERROR_CODES.VALIDATION,
        'Tipo de registo inválido para eliminação'
      );
    }

    if (type === 'temperatura') {
      return deleteTemperatureRecord(
        body.id,
        uid,
        options
      );
    }

    return deleteOperationalRecord(
      type,
      body.id,
      uid,
      options
    );
  }

  return null;
}

// =========================================================
// UTILIZADORES — ESCRITA
// =========================================================

function routeUserWrite(
  action,
  body,
  uid,
  options
) {
  if (
    action ===
    API_ACTIONS.CREATE_USER
  ) {
    requireAdmin(uid);

    return {
      ok: true,

      user: createUser(
        body.nombre ||
          (
            body.data &&
            body.data.nombre
          ),

        body.usuario ||
          (
            body.data &&
            body.data.usuario
          ),

        body.pin ||
          (
            body.data &&
            body.data.pin
          ),

        body.rol ||
          (
            body.data &&
            body.data.rol
          ),

        uid
      )
    };
  }

  if (
    action ===
    API_ACTIONS.DELETE_USER
  ) {
    return deleteUser(
      body.id,
      uid
    );
  }

  if (
    action ===
    API_ACTIONS.TOGGLE_USER_ACTIVE
  ) {
    return toggleUserActive(
      body.id,
      body.active,
      uid
    );
  }

  if (
    action ===
    API_ACTIONS.ADMIN_SET_PIN
  ) {
    return adminSetPin(
      body.id,
      body.newPin,
      uid
    );
  }

  if (
    action ===
    API_ACTIONS.CHANGE_OWN_PIN
  ) {
    return changeOwnPin(
      uid,
      body.oldPin,
      body.newPin
    );
  }

  if (action === 'updateUserRole') {
    return updateUserRole(
      body.id,
      body.rol ||
        (
          body.data &&
          body.data.rol
        ),
      uid
    );
  }

  if (
    action ===
    'updateUserProfile'
  ) {
    return updateUserProfile(
      body.id,
      body.data,
      uid
    );
  }

  return null;
}

// =========================================================
// EQUIPAMENTOS — ESCRITA
// =========================================================

function routeEquipmentWrite(
  action,
  body,
  uid,
  options
) {
  if (
    action ===
    API_ACTIONS.SAVE_EQUIPAMENTO
  ) {
    return saveEquipamento(
      body.data,
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.DELETE_EQUIPAMENTO
  ) {
    return deleteEquipamento(
      body.id,
      uid,
      options
    );
  }

  if (
    action ===
    'toggleEquipmentActive'
  ) {
    return toggleEquipmentActive(
      body.id,
      body.active,
      uid,
      options
    );
  }

  return null;
}

// =========================================================
// CONFIGURAÇÃO — ESCRITA
// =========================================================

function routeConfigWrite(
  action,
  body,
  uid,
  options
) {
  if (
    action ===
    API_ACTIONS.SET_CONFIG
  ) {
    return {
      ok: true,

      config: setConfigAuthorized(
        body.key,
        body.value,
        uid
      )
    };
  }

  if (action === 'setConfigBatch') {
    return setConfigBatch(
      body.values ||
        body.config ||
        body.data,
      uid
    );
  }

  if (action === 'deleteConfig') {
    return deleteConfig(
      body.key,
      uid
    );
  }

  return null;
}

// =========================================================
// TICKETS — ESCRITA
// =========================================================

function routeTicketWrite(
  action,
  body,
  uid,
  options
) {
  if (
    action ===
    API_ACTIONS.SAVE_BATCH &&
    body &&
    body.type === 'ticket'
  ) {
    return createTicketBatch(
      body.rows,
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.SAVE_TICKET
  ) {
    return createTicket(
      body.data,
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.UPDATE_TICKET
  ) {
    return updateTicket(
      body.id,
      body.data || {},
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.ASSIGN_TICKET
  ) {
    return assignTicket(
      body.id,
      body.responsavelId ||
        body.responsibleId ||
        (
          body.data &&
          (
            body.data.responsavelId ||
            body.data.responsibleId
          )
        ),
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.START_TICKET
  ) {
    return startTicket(
      body.id,
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.PAUSE_TICKET
  ) {
    return pauseTicket(
      body.id,

      body.motivo ||
        body.reason ||
        (
          body.data &&
          (
            body.data.motivo ||
            body.data.reason ||
            body.data.motivoPausa
          )
        ),

      false,
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.RESUME_TICKET
  ) {
    return resumeTicket(
      body.id,
      uid,
      options
    );
  }

  if (
    action ===
    'waitTicketMaterial'
  ) {
    return pauseTicket(
      body.id,

      body.motivo ||
        body.reason ||
        (
          body.data &&
          (
            body.data.motivo ||
            body.data.reason ||
            body.data.motivoPausa
          )
        ),

      true,
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.RESOLVE_TICKET
  ) {
    return resolveTicket(
      body.id,
      body.data || {},
      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.CLOSE_TICKET
  ) {
    return closeTicket(
      body.id,

      body.comentarioCierre ||
        body.comentario ||
        (
          body.data &&
          (
            body.data.comentarioCierre ||
            body.data.comentario
          )
        ),

      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.REOPEN_TICKET
  ) {
    return reopenTicket(
      body.id,

      body.motivo ||
        body.reason ||
        (
          body.data &&
          (
            body.data.motivo ||
            body.data.reason
          )
        ),

      uid,
      options
    );
  }

  if (
    action ===
    API_ACTIONS.ARCHIVE_TICKET
  ) {
    return archiveTicket(
      body.id,

      body.motivo ||
        body.reason ||
        (
          body.data &&
          (
            body.data.motivo ||
            body.data.reason
          )
        ),

      uid,
      options
    );
  }

  if (
    action ===
    'restoreArchivedTicket'
  ) {
    return restoreArchivedTicket(
      body.id,
      uid,
      options
    );
  }

  if (
    action ===
    'unassignTicket'
  ) {
    return unassignTicket(
      body.id,

      body.motivo ||
        body.reason ||
        (
          body.data &&
          (
            body.data.motivo ||
            body.data.reason
          )
        ),

      uid,
      options
    );
  }

  /*
   * Compatibilidade:
   * deleteTicket converte-se em arquivo lógico.
   */
  if (
    action ===
    API_ACTIONS.DELETE_TICKET
  ) {
    return deleteTicket(
      body.id,
      uid,
      Object.assign(
        {},
        options,
        {
          reason:
            body.motivo ||
            body.reason ||
            'Arquivado pelo administrador'
        }
      )
    );
  }

  if (
    action ===
    'deleteTicketPhysical'
  ) {
    return deleteTicketPhysical(
      body.id,
      body.confirmation ||
        body.confirmacao,
      uid,
      options
    );
  }

  return null;
}

// =========================================================
// FECHOS MENSAIS — ESCRITA
// =========================================================

function routeMonthlyClosureWrite(
  action,
  body,
  uid,
  options
) {
  if (
    action ===
    'executeMonthlyClosure'
  ) {
    return executeMonthlyClosure(
      body.monthKey ||
        body.mesKey,

      body.observacoes ||
        body.observations ||
        '',

      uid,

      Object.assign(
        {},
        options,
        {
          allowUpdate:
            parseBooleanParameter(
              body.allowUpdate,
              false
            )
        }
      )
    );
  }

  if (
    action ===
    'saveMonthlyClosure'
  ) {
    return saveMonthlyClosure(
      body.closure ||
        body.data,
      uid
    );
  }

  if (
    action ===
    'deleteMonthlyClosure'
  ) {
    return deleteMonthlyClosure(
      body.monthKey ||
        body.mesKey,
      uid
    );
  }

  return null;
}

// =========================================================
// OUTRAS OPERAÇÕES ADMINISTRATIVAS
// =========================================================

function routeAdministrativeWrite(
  action,
  body,
  uid,
  options
) {
  if (
    action ===
    'recomputeRoomCycle'
  ) {
    return recomputeCurrentRoomCycle(
      uid
    );
  }

  if (
    action ===
    'setupAlertTriggers'
  ) {
    requireAdmin(uid);

    return setupComplianceTriggers();
  }

  if (
    action ===
    'setupDailyBackup'
  ) {
    requireAdmin(uid);

    return setupDailyBackup();
  }

  if (
    action ===
    'sendTestAlertEmail'
  ) {
    requireAdmin(uid);

    return sendTestAlertEmail();
  }

  if (
    action ===
    'clearLoginLock'
  ) {
    return clearLoginLock(
      body.usuario,
      uid
    );
  }

  return null;
}

// =========================================================
// ROTA PROTEGIDA DE ESCRITA
// =========================================================

function routeWriteRequest(
  action,
  e,
  body,
  context
) {
  var uid = requireAuth(
    e,
    body,
    false
  );

  var options =
    getRequestOptions(
      body,
      context
    );

  if (
    action === API_ACTIONS.LOGOUT
  ) {
    return logoutUser(uid);
  }

  var result =
    routeOperationalWrite(
      action,
      body,
      uid,
      options
    );

  if (result !== null) {
    return result;
  }

  result = routeUserWrite(
    action,
    body,
    uid,
    options
  );

  if (result !== null) {
    return result;
  }

  result = routeEquipmentWrite(
    action,
    body,
    uid,
    options
  );

  if (result !== null) {
    return result;
  }

  result = routeConfigWrite(
    action,
    body,
    uid,
    options
  );

  if (result !== null) {
    return result;
  }

  result = routeTicketWrite(
    action,
    body,
    uid,
    options
  );

  if (result !== null) {
    return result;
  }

  result =
    routeMonthlyClosureWrite(
      action,
      body,
      uid,
      options
    );

  if (result !== null) {
    return result;
  }

  result =
    routeAdministrativeWrite(
      action,
      body,
      uid,
      options
    );

  if (result !== null) {
    return result;
  }

  throw apiError(
    API_ERROR_CODES.NOT_FOUND,
    'Ação de escrita desconhecida: ' +
      action
  );
}

// =========================================================
// CONVERSÃO DA RESPOSTA DE SERVIÇO
// =========================================================

function serviceResultOut(result) {
  if (
    result === undefined ||
    result === null
  ) {
    return successOut({});
  }

  /*
   * Os serviços devolvem objetos simples. Removemos o
   * atributo ok antes de passá-los para successOut(),
   * que já o adiciona de forma consistente.
   */
  if (
    typeof result === 'object' &&
    !Array.isArray(result)
  ) {
    var response = {};

    Object.keys(result)
      .forEach(function (key) {
        if (key !== 'ok') {
          response[key] =
            result[key];
        }
      });

    return successOut(response);
  }

  return successOut({
    result: result
  });
}

// =========================================================
// DESPACHO DE PEDIDOS
// =========================================================

function dispatchRequest(
  method,
  e,
  body
) {
  var action =
    requireAction(body);

  var context =
    buildRequestContext(
      e,
      body
    );

  var publicResponse =
    routePublicRequest(
      action,
      e,
      body,
      context
    );

  if (publicResponse !== null) {
    return publicResponse;
  }

  /*
   * GET é exclusivamente de leitura. Isso evita que links,
   * crawlers ou pedidos repetidos executem modificações.
   */
  if (
    method === 'GET' &&
    isWriteAction(action)
  ) {
    throw apiError(
      API_ERROR_CODES.FORBIDDEN,
      'As operações de escrita exigem um pedido POST'
    );
  }

  if (
    method === 'POST' &&
    isWriteAction(action)
  ) {
    var writeResult =
      withScriptLock(
        function () {
          return routeWriteRequest(
            action,
            e,
            body,
            context
          );
        },
        20000
      );

    return serviceResultOut(
      writeResult
    );
  }

  return routeReadRequest(
    action,
    e,
    body,
    context
  );
}

// =========================================================
// PEDIDOS GET
// =========================================================

function doGet(e) {
  try {
    var body =
      queryToBody(e);

    return dispatchRequest(
      'GET',
      e,
      body
    );
  } catch (error) {
    return errorOut(
      error,
      API_ERROR_CODES.SERVER_ERROR
    );
  }
}

// =========================================================
// PEDIDOS POST
// =========================================================

function doPost(e) {
  try {
    var body =
      parsePostBody(e);

    return dispatchRequest(
      'POST',
      e,
      body
    );
  } catch (error) {
    return errorOut(
      error,
      API_ERROR_CODES.SERVER_ERROR
    );
  }
}

// =========================================================
// TESTE DE ROTA INTERNA
// =========================================================

/**
 * Converte a resposta TextOutput em objeto para testes.
 */
function parseTextOutputForTest(
  output
) {
  if (
    !output ||
    typeof output.getContent !==
      'function'
  ) {
    return null;
  }

  return safeJsonParse(
    output.getContent(),
    null
  );
}

/**
 * Cria um evento GET simulado.
 */
function createMockGetEvent(
  parameters
) {
  return {
    parameter:
      parameters || {},

    parameters:
      parameters || {},

    queryString: ''
  };
}

/**
 * Cria um evento POST simulado.
 */
function createMockPostEvent(
  body
) {
  var serialized =
    JSON.stringify(
      body || {}
    );

  return {
    parameter: {},

    postData: {
      type:
        'application/json',

      length:
        serialized.length,

      contents:
        serialized,

      getDataAsString:
        function () {
          return serialized;
        }
    }
  };
}

/**
 * Executa testes públicos sem modificar dados.
 *
 * Pode ser executado manualmente no editor do
 * Google Apps Script antes de publicar.
 */
function testPublicHttpRoutes() {
  var healthOutput = doGet(
    createMockGetEvent({
      action:
        API_ACTIONS.HEALTH
    })
  );

  var versionOutput = doGet(
    createMockGetEvent({
      action:
        API_ACTIONS.VERSION
    })
  );

  var seedOutput = doGet(
    createMockGetEvent({
      action:
        API_ACTIONS.SEED_STATUS
    })
  );

  var health =
    parseTextOutputForTest(
      healthOutput
    );

  var version =
    parseTextOutputForTest(
      versionOutput
    );

  var seed =
    parseTextOutputForTest(
      seedOutput
    );

  var result = {
    ok:
      Boolean(
        health &&
        health.ok &&
        version &&
        version.ok &&
        seed &&
        seed.ok
      ),

    health: health,
    version: version,
    seedStatus: seed
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

/**
 * Verifica que uma escrita por GET seja recusada.
 */
function testGetWriteProtection() {
  var output = doGet(
    createMockGetEvent({
      action:
        API_ACTIONS.SAVE_TICKET
    })
  );

  var response =
    parseTextOutputForTest(
      output
    );

  var result = {
    ok:
      Boolean(
        response &&
        response.ok === false &&
        response.code ===
          API_ERROR_CODES.FORBIDDEN
      ),

    response:
      response
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

/**
 * Verifica o comportamento de um POST sem token.
 */
function testProtectedPostWithoutToken() {
  var event =
    createMockPostEvent({
      action:
        API_ACTIONS.SAVE_TICKET,

      appVersion:
        BACKEND_RELEASE
          .MIN_APP_VERSION,

      data: {
        quarto: 'TESTE',
        categoria: 'Outros',
        descricao:
          'Pedido de teste sem autenticação'
      }
    });

  var output =
    doPost(event);

  var response =
    parseTextOutputForTest(
      output
    );

  var result = {
    ok:
      Boolean(
        response &&
        response.ok === false &&
        response.code ===
          API_ERROR_CODES.AUTH
      ),

    response:
      response
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

/**
 * Verifica uma ação desconhecida.
 */
function testUnknownHttpAction() {
  var output = doGet(
    createMockGetEvent({
      action:
        'action_that_does_not_exist'
    })
  );

  var response =
    parseTextOutputForTest(
      output
    );

  var result = {
    ok:
      Boolean(
        response &&
        response.ok === false &&
        response.code ===
          API_ERROR_CODES.NOT_FOUND
      ),

    response:
      response
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

/**
 * Executa o conjunto de testes básicos das rotas.
 */
function testHttpRoutes() {
  var tests = {
    publicRoutes:
      testPublicHttpRoutes(),

    getWriteProtection:
      testGetWriteProtection(),

    protectedPostWithoutToken:
      testProtectedPostWithoutToken(),

    unknownAction:
      testUnknownHttpAction()
  };

  var success =
    Object.keys(tests)
      .every(function (key) {
        return Boolean(
          tests[key] &&
          tests[key].ok
        );
      });

  var result = {
    ok: success,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    tests: tests
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

// =========================================================
// DIAGNÓSTICO DAS ROTAS
// =========================================================

function diagnoseHttpRoutes() {
  var readActions = [
    API_ACTIONS.HEALTH,
    API_ACTIONS.VERSION,
    API_ACTIONS.SEED_STATUS,
    API_ACTIONS.BOOTSTRAP,
    API_ACTIONS.ME,
    API_ACTIONS.LIST,
    API_ACTIONS.GET_CONFIG,
    API_ACTIONS.GET_CONFIG_ALL,
    API_ACTIONS.LIST_EQUIPAMENTOS,
    API_ACTIONS.TEMPERATURA_STATUS,
    API_ACTIONS.LIST_USERS,
    API_ACTIONS.LIST_TICKETS,
    API_ACTIONS.GET_TICKET,
    API_ACTIONS.TICKET_STATS,
    API_ACTIONS.TICKET_HISTORY,

    'maintenanceDashboard',
    'myTickets',
    'ticketWorkload',
    'ticketRecurrences',
    'operationalStats',
    'temperatureStats',
    'executiveSummary',
    'officialReportData',
    'monthlyHistory',
    'monthlyClosures',
    'auditList',
    'auditStats'
  ];

  var extraWriteActions = [
    API_ACTIONS.LOGOUT,

    'updateUserRole',
    'updateUserProfile',
    'toggleEquipmentActive',

    'waitTicketMaterial',
    'unassignTicket',
    'restoreArchivedTicket',
    'deleteTicketPhysical',

    'executeMonthlyClosure',
    'saveMonthlyClosure',
    'deleteMonthlyClosure',

    'setConfigBatch',
    'deleteConfig',

    'recomputeRoomCycle',
    'setupAlertTriggers',
    'setupDailyBackup',
    'sendTestAlertEmail',
    'clearLoginLock'
  ];

  var duplicatedWriteActions = [];
  var actionOccurrences = {};

  WRITE_ACTIONS
    .concat(extraWriteActions)
    .forEach(function (action) {
      actionOccurrences[action] =
        (
          actionOccurrences[action] ||
          0
        ) + 1;
    });

  Object.keys(
    actionOccurrences
  ).forEach(function (action) {
    if (
      actionOccurrences[action] >
      1
    ) {
      duplicatedWriteActions.push(
        action
      );
    }
  });

  var readWriteConflicts =
    readActions.filter(
      function (action) {
        return isWriteAction(
          action
        );
      }
    );

  return {
    ok:
      duplicatedWriteActions
        .length === 0 &&
      readWriteConflicts
        .length === 0,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    readActions:
      readActions.length,

    writeActions:
      WRITE_ACTIONS.length +
      extraWriteActions.length,

    duplicatedWriteActions:
      duplicatedWriteActions,

    readWriteConflicts:
      readWriteConflicts,

    publicActions: [
      API_ACTIONS.HEALTH,
      API_ACTIONS.VERSION,
      API_ACTIONS.SEED_STATUS,
      API_ACTIONS.LOGIN
    ]
  };
}

// =========================================================
// MARCADOR DE FIM DA PARTE 12
// =========================================================

/*
 * FIM DE 12_HttpRoutes.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 12/13 está completa.
 */
/*Verificación obligatoria
Confirma también que isWriteAction() incluya LOGOUT:

function isWriteAction(action) {
  return (
    WRITE_ACTIONS.indexOf(action) !== -1 ||
    [
      API_ACTIONS.LOGOUT,
      'updateUserRole',
      'updateUserProfile',
      'toggleEquipmentActive',
      'unassignTicket',
      'restoreArchivedTicket',
      'deleteTicketPhysical',
      'executeMonthlyClosure',
      'saveMonthlyClosure',
      'deleteMonthlyClosure',
      'setConfigBatch',
      'deleteConfig'
    ].indexOf(action) !== -1
  );
}
/**
 * REGISTO TÉCNICO — Moon and Sun
 * Backend Google Apps Script
 *
 * PARTE 13/13 — Instalação, migração,
 * diagnóstico e testes
 *
 * Dependências:
 * - Partes 01 a 12
 */

// =========================================================
// CONSTANTES DE INSTALAÇÃO
// =========================================================

var INSTALLATION_PROPERTY =
  'REGISTO_TECNICO_BACKEND_VERSION';

var INSTALLATION_DATE_PROPERTY =
  'REGISTO_TECNICO_INSTALLED_AT';

var LAST_MIGRATION_PROPERTY =
  'REGISTO_TECNICO_LAST_MIGRATION';

var SETUP_LOCK_TIMEOUT_MS =
  30000;

var MANAGED_TRIGGER_HANDLERS = [
  'dailyReminder',
  'weeklySummary',
  'runScheduledAlertChecks',
  'dailyBackup'
];

// =========================================================
// ESTADO DA INSTALAÇÃO
// =========================================================

function getInstallationProperties() {
  var properties =
    PropertiesService
      .getScriptProperties();

  return {
    version:
      properties.getProperty(
        INSTALLATION_PROPERTY
      ) || '',

    installedAt:
      properties.getProperty(
        INSTALLATION_DATE_PROPERTY
      ) || '',

    lastMigration:
      properties.getProperty(
        LAST_MIGRATION_PROPERTY
      ) || ''
  };
}

function setInstallationProperties(
  migrationDetails
) {
  var properties =
    PropertiesService
      .getScriptProperties();

  var now =
    formatIsoDateTime(
      new Date()
    );

  var current =
    getInstallationProperties();

  properties.setProperty(
    INSTALLATION_PROPERTY,
    BACKEND_RELEASE.VERSION
  );

  if (!current.installedAt) {
    properties.setProperty(
      INSTALLATION_DATE_PROPERTY,
      now
    );
  }

  properties.setProperty(
    LAST_MIGRATION_PROPERTY,
    safeJsonStringify(
      {
        version:
          BACKEND_RELEASE.VERSION,

        timestamp: now,

        details:
          migrationDetails || {}
      },
      20000
    )
  );

  return getInstallationProperties();
}

// =========================================================
// RESULTADOS DE TAREFAS
// =========================================================

function createSetupResult() {
  return {
    ok: true,

    version:
      BACKEND_RELEASE.VERSION,

    startedAt:
      formatIsoDateTime(
        new Date()
      ),

    finishedAt: '',

    steps: [],
    warnings: [],
    errors: []
  };
}

function addSetupStep(
  result,
  name,
  operation
) {
  var startedAt =
    new Date();

  var step = {
    name: name,
    ok: true,

    startedAt:
      formatIsoDateTime(
        startedAt
      ),

    finishedAt: '',
    durationMs: 0,
    result: null,
    error: ''
  };

  try {
    step.result =
      operation();
  } catch (error) {
    step.ok = false;

    step.error =
      safeString(
        error &&
        error.message
          ? error.message
          : error
      );

    result.ok = false;

    result.errors.push(
      name +
      ': ' +
      step.error
    );
  }

  var finishedAt =
    new Date();

  step.finishedAt =
    formatIsoDateTime(
      finishedAt
    );

  step.durationMs =
    finishedAt.getTime() -
    startedAt.getTime();

  result.steps.push(step);

  return step;
}

// =========================================================
// CRIAÇÃO E VALIDAÇÃO DAS FOLHAS
// =========================================================

function ensureApplicationSheets() {
  var definitions = [
    {
      type: 'general',
      fields: GENERAL_FIELDS
    },
    {
      type: 'quarto',
      fields: QUARTO_FIELDS
    },
    {
      type: 'temperatura',
      fields: TEMPERATURA_FIELDS
    },
    {
      type: 'equipamento',
      fields: EQUIPAMENTO_FIELDS
    },
    {
      type: 'ticket',
      fields: TICKET_FIELDS
    },
    {
      type: 'user',
      fields: USER_FIELDS
    },
    {
      type: 'audit',
      fields: AUDIT_FIELDS
    },
    {
      type: 'ticketMaterial',
      fields:
        TICKET_MATERIAL_FIELDS
    }
  ];

  var result = {
    ok: true,
    sheets: []
  };

  definitions.forEach(
    function (definition) {
      try {
        var sheet =
          getOrCreateSheet(
            definition.type
          );

        invalidateColumnsCache(
          sheet.getName()
        );

        var columns =
          ensureColumns(
            sheet,
            definition.fields
          );

        result.sheets.push({
          type:
            definition.type,

          name:
            sheet.getName(),

          ok: true,

          columns:
            Object.keys(
              columns
            ).length,

          rows:
            Math.max(
              0,
              sheet.getLastRow() - 1
            )
        });
      } catch (error) {
        result.ok = false;

        result.sheets.push({
          type:
            definition.type,

          ok: false,

          error:
            safeString(
              error.message ||
              error
            )
        });
      }
    }
  );

  try {
    var configSheet =
      getConfigSheet();

    invalidateColumnsCache(
      configSheet.getName()
    );

    var configColumns =
      ensureConfigColumns(
        configSheet
      );

    result.sheets.push({
      type: 'config',
      name:
        configSheet.getName(),

      ok: true,

      columns:
        Object.keys(
          configColumns
        ).length,

      rows:
        Math.max(
          0,
          configSheet
            .getLastRow() - 1
        )
    });
  } catch (error) {
    result.ok = false;

    result.sheets.push({
      type: 'config',
      ok: false,

      error:
        safeString(
          error.message ||
          error
        )
    });
  }

  return result;
}

// =========================================================
// UTILIZADOR ADMINISTRADOR INICIAL
// =========================================================

function ensureInitialAdministrator() {
  getOrCreateUsersSheet();

  var administrators =
    getAllUsersRaw({
      fresh: true
    }).filter(
      function (user) {
        return (
          user.rol ===
            USER_ROLES.ADMIN &&
          !isNo(user.activo)
        );
      }
    );

  if (!administrators.length) {
    throw apiError(
      API_ERROR_CODES.SERVER_ERROR,
      'Não existe nenhum administrador ativo'
    );
  }

  return {
    ok: true,

    activeAdministrators:
      administrators.length,

    users:
      administrators.map(
        function (user) {
          return user.usuario;
        }
      )
  };
}

// =========================================================
// CÓPIA DE SEGURANÇA PRÉ-MIGRAÇÃO
// =========================================================

function createMigrationBackup() {
  var spreadsheet =
    getApplicationSpreadsheet();

  var folder =
    getBackupFolder();

  var timestamp =
    Utilities.formatDate(
      new Date(),
      getTimeZone(),
      'yyyy-MM-dd HH-mm-ss'
    );

  var file =
    DriveApp.getFileById(
      spreadsheet.getId()
    );

  var copy = file.makeCopy(
    'PRE-MIGRATION v' +
      BACKEND_RELEASE.VERSION +
      ' ' +
      spreadsheet.getName() +
      ' ' +
      timestamp,
    folder
  );

  return {
    ok: true,
    id: copy.getId(),
    name: copy.getName(),
    url: copy.getUrl()
  };
}

// =========================================================
// MIGRAÇÃO DOS DADOS
// =========================================================

function migrateApplicationData(
  options
) {
  var settings =
    options || {};

  var result = {
    ok: true,

    startedAt:
      formatIsoDateTime(
        new Date()
      ),

    finishedAt: '',

    config: null,
    equipment: null,
    temperature: null,
    tickets: null,
    materials: null,
    audit: null,

    errors: []
  };

  function runMigration(
    name,
    operation
  ) {
    try {
      result[name] =
        operation();

      if (
        result[name] &&
        result[name].ok === false
      ) {
        result.ok = false;
      }
    } catch (error) {
      result.ok = false;

      result[name] = {
        ok: false,

        error:
          safeString(
            error.message ||
            error
          )
      };

      result.errors.push(
        name +
        ': ' +
        safeString(
          error.message ||
          error
        )
      );
    }
  }

  runMigration(
    'config',
    function () {
      return migrateLegacyConfig();
    }
  );

  runMigration(
    'equipment',
    function () {
      return migrateLegacyEquipmentTypes();
    }
  );

  runMigration(
    'temperature',
    function () {
      return migrateLegacyTemperatureRecords();
    }
  );

  runMigration(
    'tickets',
    function () {
      return migrateLegacyTickets({
        audit:
          settings.audit === true,

        uid:
          settings.uid ||
          'system',

        requestId:
          settings.requestId ||
          createRequestId()
      });
    }
  );

  runMigration(
    'materials',
    function () {
      return synchronizeTicketMaterials({
        uid:
          settings.uid ||
          'system'
      });
    }
  );

  runMigration(
    'audit',
    function () {
      return backfillLegacyTicketAudit(
        settings.uid ||
        'system'
      );
    }
  );

  invalidateAllCoreCaches();

  result.finishedAt =
    formatIsoDateTime(
      new Date()
    );

  return result;
}

// =========================================================
// GESTÃO CENTRAL DOS TRIGGERS
// =========================================================

function removeManagedTriggers() {
  var removed = [];

  ScriptApp
    .getProjectTriggers()
    .forEach(function (trigger) {
      var handler =
        trigger.getHandlerFunction();

      if (
        MANAGED_TRIGGER_HANDLERS
          .indexOf(handler) !== -1
      ) {
        ScriptApp.deleteTrigger(
          trigger
        );

        removed.push(handler);
      }
    });

  return {
    ok: true,
    removed: removed
  };
}

function setupAllApplicationTriggers() {
  var removal =
    removeManagedTriggers();

  ScriptApp
    .newTrigger(
      'dailyReminder'
    )
    .timeBased()
    .everyDays(1)
    .atHour(10)
    .create();

  ScriptApp
    .newTrigger(
      'weeklySummary'
    )
    .timeBased()
    .onWeekDay(
      ScriptApp.WeekDay.MONDAY
    )
    .atHour(8)
    .create();

  ScriptApp
    .newTrigger(
      'runScheduledAlertChecks'
    )
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp
    .newTrigger(
      'dailyBackup'
    )
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();

  return {
    ok: true,

    removed:
      removal.removed,

    created: [
      'dailyReminder',
      'weeklySummary',
      'runScheduledAlertChecks',
      'dailyBackup'
    ]
  };
}

// =========================================================
// LIMPEZA DE CACHÉS
// =========================================================

function clearAllApplicationCaches() {
  invalidateAllCoreCaches();

  var additionalKeys = [
    CONFIG_CACHE_KEY,
    'tickets_list',
    'ticket_stats',
    'ticket_dashboard',
    'equip_raw',
    'users_raw',
    'audit_list'
  ];

  cacheRemoveMany(
    additionalKeys
  );

  return {
    ok: true,
    clearedAt:
      formatIsoDateTime(
        new Date()
      )
  };
}

// =========================================================
// INSTALAÇÃO COMPLETA
// =========================================================

/**
 * Executar manualmente uma vez no editor do Apps Script.
 *
 * Opções:
 *
 * {
 *   createBackup: true,
 *   migrate: true,
 *   configureTriggers: true,
 *   runTests: true
 * }
 */
function setupApplicationV6(
  options
) {
  var settings =
    Object.assign(
      {
        createBackup: true,
        migrate: true,
        configureTriggers: true,
        runTests: true
      },
      options || {}
    );

  return withScriptLock(
    function () {
      var result =
        createSetupResult();

      if (settings.createBackup) {
        addSetupStep(
          result,
          'backup',
          function () {
            return createMigrationBackup();
          }
        );
      }

      addSetupStep(
        result,
        'clearCachesBeforeSetup',
        function () {
          return clearAllApplicationCaches();
        }
      );

      addSetupStep(
        result,
        'ensureSheets',
        function () {
          return ensureApplicationSheets();
        }
      );

      addSetupStep(
        result,
        'ensureAdministrator',
        function () {
          return ensureInitialAdministrator();
        }
      );

      addSetupStep(
        result,
        'seedConfig',
        function () {
          return seedDefaultConfig();
        }
      );

      if (settings.migrate) {
        addSetupStep(
          result,
          'migration',
          function () {
            return migrateApplicationData({
              uid: 'system',
              audit: false,
              requestId:
                createRequestId()
            });
          }
        );
      }

      addSetupStep(
        result,
        'validateConfig',
        function () {
          return validateCompleteConfig();
        }
      );

      if (
        settings.configureTriggers
      ) {
        addSetupStep(
          result,
          'triggers',
          function () {
            return setupAllApplicationTriggers();
          }
        );
      }

      addSetupStep(
        result,
        'clearCachesAfterSetup',
        function () {
          return clearAllApplicationCaches();
        }
      );

      if (settings.runTests) {
        addSetupStep(
          result,
          'tests',
          function () {
            return runBackendSmokeTests();
          }
        );
      }

      var installation =
        setInstallationProperties(
          {
            ok: result.ok,

            steps:
              result.steps.map(
                function (step) {
                  return {
                    name:
                      step.name,
                    ok:
                      step.ok
                  };
                }
              )
          }
        );

      result.installation =
        installation;

      result.finishedAt =
        formatIsoDateTime(
          new Date()
        );

      try {
        logAudit(
          'system',
          'setupApplication',
          'system',
          BACKEND_RELEASE.VERSION,
          {
            ok: result.ok,
            steps:
              result.steps.length,
            errors:
              result.errors
          }
        );
      } catch (auditError) {}

      Logger.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      return result;
    },
    SETUP_LOCK_TIMEOUT_MS
  );
}

// Alias fácil para execução manual.
function installBackend() {
  return setupApplicationV6({
    createBackup: true,
    migrate: true,
    configureTriggers: true,
    runTests: true
  });
}

// =========================================================
// DIAGNÓSTICO GLOBAL
// =========================================================

// =========================================================
// DIAGNÓSTICO GLOBAL
// =========================================================

function runAllDiagnostics() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    version:
      BACKEND_RELEASE.VERSION,

    installation:
      getInstallationProperties(),

    modules: {},
    errors: []
  };

  var diagnostics = [
    {
      name: 'repository',
      fn: diagnoseRepository
    },
    {
      name: 'authentication',
      fn: diagnoseAuthentication
    },
    {
      name: 'config',
      fn: diagnoseConfig
    },
    {
      name: 'operational',
      fn: diagnoseOperationalRecords
    },
    {
      name: 'refrigeration',
      fn: diagnoseRefrigeration
    },
    {
      name: 'ticketDomain',
      fn: diagnoseTicketDomain
    },
    {
      name: 'ticketService',
      fn: diagnoseTicketService
    },
    {
      name: 'audit',
      fn: diagnoseAudit
    },
    {
      name: 'auditCoverage',
      fn: diagnoseAuditCoverage
    },
    {
      name: 'alerts',
      fn: diagnoseAlerts
    },
    {
      name: 'reports',
      fn: diagnoseReportsCompliance
    },
    {
      name: 'httpRoutes',
      fn: diagnoseHttpRoutes
    }
  ];

  diagnostics.forEach(
    function (diagnostic) {
      try {
        var moduleResult =
          diagnostic.fn();

        result.modules[
          diagnostic.name
        ] = moduleResult;

        if (
          moduleResult &&
          moduleResult.ok === false
        ) {
          result.ok = false;
        }
      } catch (error) {
        result.ok = false;

        var message =
          safeString(
            error &&
            error.message
              ? error.message
              : error
          );

        result.modules[
          diagnostic.name
        ] = {
          ok: false,
          error: message
        };

        result.errors.push(
          diagnostic.name +
          ': ' +
          message
        );
      }
    }
  );

  return result;
}

// =========================================================
// UTILITÁRIOS DE TESTE
// =========================================================

function createTestResult(
  name
) {
  return {
    name: name,
    ok: true,
    assertions: [],
    errors: []
  };
}

function assertTest(
  result,
  condition,
  message,
  details
) {
  var assertion = {
    ok: Boolean(condition),
    message: message || '',
    details:
      details === undefined
        ? null
        : details
  };

  result.assertions.push(
    assertion
  );

  if (!condition) {
    result.ok = false;

    result.errors.push(
      message ||
      'A asserção falhou'
    );
  }

  return Boolean(condition);
}

function runTestCase(
  name,
  operation
) {
  var result =
    createTestResult(name);

  try {
    operation(result);
  } catch (error) {
    result.ok = false;

    result.errors.push(
      safeString(
        error &&
        error.message
          ? error.message
          : error
      )
    );
  }

  return result;
}

// =========================================================
// TESTES DO NÚCLEO
// =========================================================

function testCoreUtilities() {
  return runTestCase(
    'coreUtilities',
    function (result) {
      assertTest(
        result,
        isValidIsoDate(
          '2026-03-15'
        ),
        'Deve aceitar uma data ISO válida'
      );

      assertTest(
        result,
        !isValidIsoDate(
          '2026-02-31'
        ),
        'Deve rejeitar uma data inexistente'
      );

      assertTest(
        result,
        isValidTime('23:59'),
        'Deve aceitar uma hora válida'
      );

      assertTest(
        result,
        !isValidTime('25:00'),
        'Deve rejeitar uma hora inválida'
      );

      assertTest(
        result,
        compareSemver(
          '3.3.0',
          '3.2.9'
        ) === 1,
        'A comparação semântica deve reconhecer a versão superior'
      );

      assertTest(
        result,
        compareSemver(
          '3.3.0',
          '3.3.0'
        ) === 0,
        'Versões iguais devem produzir zero'
      );

      assertTest(
        result,
        normalizeYesNo('Sim') ===
          'Sim',
        'Deve normalizar Sim'
      );

      assertTest(
        result,
        normalizeYesNo('Não') ===
          'Não',
        'Deve normalizar Não'
      );

      assertTest(
        result,
        parseDecimal(
          '12,50',
          null
        ) === 12.5,
        'Deve converter números com vírgula'
      );
    }
  );
}

// =========================================================
// TESTES DO DOMÍNIO DE TICKETS
// =========================================================

function testTicketDomainRules() {
  return runTestCase(
    'ticketDomainRules',
    function (result) {
      assertTest(
        result,
        normalizeTicketStatus(
          'Em Andamento'
        ) ===
          TICKET_STATUS
            .EM_ANDAMENTO,
        'Deve normalizar o estado Em Andamento'
      );

      assertTest(
        result,
        normalizeTicketPriority(
          'Crítica'
        ) ===
          TICKET_PRIORITY.CRITICA,
        'Deve normalizar a prioridade crítica'
      );

      assertTest(
        result,
        normalizeMaintenanceType(
          'Corretivo'
        ) === 'correctivo',
        'Deve normalizar o tipo corretivo'
      );

      assertTest(
        result,
        canTransitionTicket(
          TICKET_STATUS.ABERTO,
          TICKET_STATUS
            .EM_ANDAMENTO
        ),
        'Um ticket aberto deve poder entrar em andamento'
      );

      assertTest(
        result,
        !canTransitionTicket(
          TICKET_STATUS.FINALIZADO,
          TICKET_STATUS.ABERTO
        ),
        'Um ticket finalizado não deve transitar diretamente para aberto'
      );

      var deadlines =
        calculateConfiguredTicketDeadlines(
          new Date(
            2026,
            2,
            1,
            8,
            0,
            0
          ),
          TICKET_PRIORITY.CRITICA
        );

      assertTest(
        result,
        Boolean(
          deadlines.prazoResposta
        ),
        'Deve calcular o prazo de resposta'
      );

      assertTest(
        result,
        Boolean(
          deadlines.prazoResolucao
        ),
        'Deve calcular o prazo de resolução'
      );

      var materials =
        normalizeTicketMaterials([
          {
            codigo: 'MAT-1',
            descricao:
              'Filtro de teste',
            quantidade: 2,
            unidade: 'un',
            custoUnitario: 5
          }
        ]);

      assertTest(
        result,
        materials.length === 1,
        'Deve normalizar um material'
      );

      assertTest(
        result,
        getMaterialsTotal(
          materials
        ) === 10,
        'Deve calcular o custo total dos materiais'
      );
    }
  );
}

// =========================================================
// TESTES DE AUTENTICAÇÃO
// =========================================================

function testAuthenticationUtilities() {
  return runTestCase(
    'authenticationUtilities',
    function (result) {
      var stored =
        makePinStore('4826');

      assertTest(
        result,
        stored.indexOf('v2$') === 0,
        'O PIN deve ser guardado no formato v2'
      );

      assertTest(
        result,
        verifyPin(
          stored,
          '4826'
        ).ok,
        'O PIN correto deve ser aceite'
      );

      assertTest(
        result,
        !verifyPin(
          stored,
          '4827'
        ).ok,
        'O PIN incorreto deve ser recusado'
      );

      assertTest(
        result,
        constantTimeEqual(
          'abc',
          'abc'
        ),
        'Valores iguais devem ser reconhecidos'
      );

      assertTest(
        result,
        !constantTimeEqual(
          'abc',
          'abd'
        ),
        'Valores diferentes devem ser recusados'
      );

      var users =
        getAllUsersRaw({
          fresh: true
        });

      assertTest(
        result,
        users.length > 0,
        'Deve existir pelo menos um utilizador'
      );

      assertTest(
        result,
        countActiveAdministrators() >
          0,
        'Deve existir pelo menos um administrador ativo'
      );
    }
  );
}

// =========================================================
// TESTES DO REPOSITÓRIO SEM ALTERAR DADOS
// =========================================================

function testRepositoryReadOperations() {
  return runTestCase(
    'repositoryReadOperations',
    function (result) {
      var types = [
        'general',
        'quarto',
        'temperatura',
        'ticket',
        'equipamento',
        'user',
        'audit',
        'ticketMaterial'
      ];

      types.forEach(
        function (type) {
          var records =
            repositoryList(
              type,
              {
                fresh: true
              }
            );

          assertTest(
            result,
            Array.isArray(records),
            'A listagem de ' +
              type +
              ' deve devolver uma lista'
          );
        }
      );

      var diagnosis =
        diagnoseRepository();

      assertTest(
        result,
        Boolean(
          diagnosis &&
          diagnosis.sheets
        ),
        'O diagnóstico do repositório deve devolver as folhas'
      );
    }
  );
}

// =========================================================
// TESTES DAS ROTAS HTTP
// =========================================================

function testHttpLayer() {
  return runTestCase(
    'httpLayer',
    function (result) {
      var publicRoutes =
        testPublicHttpRoutes();

      var getProtection =
        testGetWriteProtection();

      var noToken =
        testProtectedPostWithoutToken();

      var unknownAction =
        testUnknownHttpAction();

      assertTest(
        result,
        publicRoutes.ok,
        'As rotas públicas devem funcionar',
        publicRoutes
      );

      assertTest(
        result,
        getProtection.ok,
        'A escrita por GET deve ser bloqueada',
        getProtection
      );

      assertTest(
        result,
        noToken.ok,
        'A escrita sem token deve ser bloqueada',
        noToken
      );

      assertTest(
        result,
        unknownAction.ok,
        'Uma ação desconhecida deve devolver NOT_FOUND',
        unknownAction
      );
    }
  );
}

// =========================================================
// SMOKE TESTS DO BACKEND
// =========================================================

/**
 * Estes testes não criam, atualizam nem eliminam
 * registos operacionais.
 */
function runBackendSmokeTests() {
  var tests = [
    testCoreUtilities(),
    testTicketDomainRules(),
    testAuthenticationUtilities(),
    testRepositoryReadOperations(),
    testHttpLayer()
  ];

  var failed =
    tests.filter(
      function (test) {
        return !test.ok;
      }
    );

  var result = {
    ok: failed.length === 0,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    total:
      tests.length,

    passed:
      tests.length -
      failed.length,

    failed:
      failed.length,

    tests: tests
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

// =========================================================
// VALIDAÇÃO FINAL ANTES DE PUBLICAR
// =========================================================

function validateBeforeDeployment() {
  var diagnostics =
    runAllDiagnostics();

  var tests =
    runBackendSmokeTests();

  var installation =
    getInstallationProperties();

  var warnings = [];

  if (
    installation.version !==
    BACKEND_RELEASE.VERSION
  ) {
    warnings.push(
      'A versão instalada (' +
        (
          installation.version ||
          'não definida'
        ) +
        ') é diferente da versão do código (' +
        BACKEND_RELEASE.VERSION +
        ').'
    );
  }

  var admin =
    findUserByUsername(
      'admin',
      {
        fresh: true
      }
    );

  if (
    admin &&
    isYes(
      admin.deveAlterarPin
    )
  ) {
    warnings.push(
      'O administrador inicial ainda deve alterar o PIN.'
    );
  }

  var alertStatus =
    getAlertServiceStatus();

  if (
    alertStatus.enabled &&
    alertStatus
      .recipientsCount === 0
  ) {
    warnings.push(
      'Os alertas estão ativos sem destinatários.'
    );
  }

  var result = {
    ok:
      diagnostics.ok &&
      tests.ok,

    readyForDeployment:
      diagnostics.ok &&
      tests.ok,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    version:
      BACKEND_RELEASE.VERSION,

    installation:
      installation,

    diagnostics:
      diagnostics,

    tests:
      tests,

    warnings:
      warnings
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

// =========================================================
// ESTADO RESUMIDO DA INSTALAÇÃO
// =========================================================

function getBackendStatus() {
  var installation =
    getInstallationProperties();

  var spreadsheet =
    getApplicationSpreadsheet();

  var triggerHandlers =
    ScriptApp
      .getProjectTriggers()
      .map(
        function (trigger) {
          return trigger
            .getHandlerFunction();
        }
      );

  var missingTriggers =
    MANAGED_TRIGGER_HANDLERS
      .filter(
        function (handler) {
          return (
            triggerHandlers
              .indexOf(handler) ===
            -1
          );
        }
      );

  return {
    ok:
      installation.version ===
        BACKEND_RELEASE.VERSION &&
      missingTriggers.length === 0,

    application:
      BACKEND_RELEASE.NAME,

    codeVersion:
      BACKEND_RELEASE.VERSION,

    installedVersion:
      installation.version,

    installedAt:
      installation.installedAt,

    lastMigration:
      safeJsonParse(
        installation
          .lastMigration,
        installation
          .lastMigration
      ),

    spreadsheet: {
      id:
        spreadsheet.getId(),

      name:
        spreadsheet.getName()
    },

    triggers: {
      configured:
        triggerHandlers,

      missing:
        missingTriggers
    },

    serverTime:
      formatIsoDateTime(
        new Date()
      )
  };
}

// =========================================================
// REPARAÇÃO DE TRIGGERS
// =========================================================

function repairApplicationTriggers() {
  var before =
    ScriptApp
      .getProjectTriggers()
      .map(
        function (trigger) {
          return trigger
            .getHandlerFunction();
        }
      );

  var setup =
    setupAllApplicationTriggers();

  var after =
    ScriptApp
      .getProjectTriggers()
      .map(
        function (trigger) {
          return trigger
            .getHandlerFunction();
        }
      );

  return {
    ok: true,
    before: before,
    setup: setup,
    after: after
  };
}

// =========================================================
// REPARAÇÃO DAS COLUNAS
// =========================================================

function repairApplicationColumns() {
  clearAllApplicationCaches();

  var sheets =
    ensureApplicationSheets();

  clearAllApplicationCaches();

  return {
    ok: sheets.ok,
    sheets: sheets.sheets
  };
}

// =========================================================
// REPARAÇÃO DE DADOS DERIVADOS
// =========================================================

function repairDerivedData() {
  var result = {
    ok: true,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    tickets: null,
    materials: null,
    roomCycle: null,
    errors: []
  };

  try {
    result.tickets =
      migrateLegacyTickets({
        uid: 'system',
        audit: false
      });

    if (
      result.tickets &&
      result.tickets.ok === false
    ) {
      result.ok = false;
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Tickets: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    result.materials =
      synchronizeTicketMaterials({
        uid: 'system'
      });

    if (
      result.materials &&
      result.materials.ok ===
        false
    ) {
      result.ok = false;
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Materiais: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    var cycle =
      getCurrentRoomCycle({
        fresh: true
      });

    setConfig(
      'cicloQuartosHechos',
      cycle.uniqueRooms
    );

    result.roomCycle = {
      index:
        cycle.index,

      done:
        cycle.doneCount,

      total:
        cycle.totalRooms
    };
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Ciclo de quartos: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  clearAllApplicationCaches();

  return result;
}

// =========================================================
// DESINSTALAÇÃO DE TRIGGERS
// Não elimina folhas nem dados.
// =========================================================

function disableApplicationAutomation() {
  var result =
    removeManagedTriggers();

  logAudit(
    'system',
    'disableAutomation',
    'system',
    BACKEND_RELEASE.VERSION,
    {
      removed:
        result.removed
    }
  );

  return result;
}

// =========================================================
// CHECKLIST FINAL
// =========================================================

function getDeploymentChecklist() {
  var validation =
    validateBeforeDeployment();

  var installation =
    getInstallationProperties();

  var backendStatus =
    getBackendStatus();

  var configDiagnosis =
    diagnoseConfig();

  var alertStatus =
    getAlertServiceStatus();

  var authenticationDiagnosis =
    diagnoseAuthentication();

  var checklist = [
    {
      item:
        'Versão do backend instalada',
      ok:
        installation.version ===
        BACKEND_RELEASE.VERSION,

      detail:
        installation.version ||
        'Versão não registada'
    },

    {
      item:
        'Diagnósticos sem erros críticos',
      ok:
        validation.diagnostics.ok,

      detail:
        validation.diagnostics.ok
          ? 'Todos os módulos responderam'
          : 'Existem módulos com erros'
    },

    {
      item:
        'Smoke tests aprovados',
      ok:
        validation.tests.ok,

      detail:
        validation.tests.passed +
        '/' +
        validation.tests.total +
        ' testes aprovados'
    },

    {
      item:
        'Administrador ativo',
      ok:
        authenticationDiagnosis
          .activeAdmins > 0,

      detail:
        authenticationDiagnosis
          .activeAdmins +
        ' administrador(es) ativo(s)'
    },

    {
      item:
        'Triggers automáticos configurados',
      ok:
        backendStatus
          .triggers
          .missing.length === 0,

      detail:
        backendStatus
          .triggers
          .missing.length
          ? (
              'Em falta: ' +
              backendStatus
                .triggers
                .missing
                .join(', ')
            )
          : 'Todos configurados'
    },

    {
      item:
        'Configuração técnica válida',
      ok:
        configDiagnosis.ok,

      detail:
        configDiagnosis.ok
          ? 'Limites e SLA válidos'
          : configDiagnosis
              .errors
              .join('; ')
    },

    {
      item:
        'Serviço de alertas configurado',
      ok:
        !alertStatus.enabled ||
        alertStatus
          .recipientsCount > 0,

      detail:
        alertStatus.enabled
          ? (
              alertStatus
                .recipientsCount +
              ' destinatário(s)'
            )
          : 'Alertas desativados'
    },

    {
      item:
        'Auditoria operacional',
      ok:
        validation
          .diagnostics
          .modules
          .audit
          ? validation
              .diagnostics
              .modules
              .audit
              .ok
          : false,

      detail:
        validation
          .diagnostics
          .modules
          .audit
          ? (
              validation
                .diagnostics
                .modules
                .audit
                .total +
              ' registo(s)'
            )
          : 'Sem diagnóstico'
    },

    {
      item:
        'Repositório de dados operacional',
      ok:
        validation
          .diagnostics
          .modules
          .repository
          ? validation
              .diagnostics
              .modules
              .repository
              .ok
          : false,

      detail:
        validation
          .diagnostics
          .modules
          .repository
          ? 'Folhas verificadas'
          : 'Sem diagnóstico'
    },

    {
      item:
        'Rotas HTTP validadas',
      ok:
        validation
          .diagnostics
          .modules
          .httpRoutes
          ? validation
              .diagnostics
              .modules
              .httpRoutes
              .ok
          : false,

      detail:
        validation
          .diagnostics
          .modules
          .httpRoutes
          ? 'Leitura e escrita separadas'
          : 'Sem diagnóstico'
    }
  ];

  var failedItems =
    checklist.filter(
      function (item) {
        return !item.ok;
      }
    );

  return {
    ready:
      validation
        .readyForDeployment &&
      failedItems.length === 0,

    checkedAt:
      formatIsoDateTime(
        new Date()
      ),

    version:
      BACKEND_RELEASE.VERSION,

    checklist:
      checklist,

    passed:
      checklist.length -
      failedItems.length,

    failed:
      failedItems.length,

    failedItems:
      failedItems,

    warnings:
      validation.warnings || []
  };
}

// =========================================================
// RESUMO FINAL DE INSTALAÇÃO
// =========================================================

function printInstallationSummary() {
  var status =
    getBackendStatus();

  var checklist =
    getDeploymentChecklist();

  var summary = {
    application:
      BACKEND_RELEASE.NAME,

    version:
      BACKEND_RELEASE.VERSION,

    installedVersion:
      status.installedVersion,

    installedAt:
      status.installedAt,

    ready:
      checklist.ready,

    checklistPassed:
      checklist.passed,

    checklistFailed:
      checklist.failed,

    missingTriggers:
      status
        .triggers
        .missing,

    warnings:
      checklist.warnings,

    failedItems:
      checklist
        .failedItems
        .map(
          function (item) {
            return {
              item:
                item.item,

              detail:
                item.detail
            };
          }
        ),

    serverTime:
      formatIsoDateTime(
        new Date()
      )
  };

  Logger.log(
    JSON.stringify(
      summary,
      null,
      2
    )
  );

  return summary;
}

// =========================================================
// TESTE FINAL V6
// =========================================================

function testV60() {
  var result = {
    ok: true,

    time:
      formatIsoDateTime(
        new Date()
      ),

    version:
      BACKEND_RELEASE.VERSION,

    status: null,
    diagnostics: null,
    tests: null,
    checklist: null,
    errors: []
  };

  try {
    result.status =
      getBackendStatus();
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Estado: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    result.diagnostics =
      runAllDiagnostics();

    if (
      !result.diagnostics.ok
    ) {
      result.ok = false;
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Diagnósticos: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    result.tests =
      runBackendSmokeTests();

    if (!result.tests.ok) {
      result.ok = false;
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Testes: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  try {
    result.checklist =
      getDeploymentChecklist();

    if (
      !result.checklist.ready
    ) {
      result.ok = false;
    }
  } catch (error) {
    result.ok = false;

    result.errors.push(
      'Checklist: ' +
        safeString(
          error.message ||
          error
        )
    );
  }

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

// =========================================================
// INSTALAÇÃO RÁPIDA SEM MIGRAÇÃO
// =========================================================

/**
 * Útil apenas para uma folha nova e vazia.
 *
 * Para instalações existentes, utilize installBackend().
 */
function installFreshBackend() {
  return setupApplicationV6({
    createBackup: false,
    migrate: false,
    configureTriggers: true,
    runTests: true
  });
}

// =========================================================
// MIGRAÇÃO MANUAL COM BACKUP
// =========================================================

function runMigrationWithBackup() {
  return withScriptLock(
    function () {
      var backup =
        createMigrationBackup();

      var migration =
        migrateApplicationData({
          uid: 'system',
          audit: false,
          requestId:
            createRequestId()
        });

      var columns =
        repairApplicationColumns();

      var audit =
        backfillLegacyTicketAudit(
          'system'
        );

      var materials =
        synchronizeTicketMaterials({
          uid: 'system'
        });

      clearAllApplicationCaches();

      var result = {
        ok:
          migration.ok &&
          columns.ok &&
          audit.ok &&
          materials.ok,

        backup:
          backup,

        migration:
          migration,

        columns:
          columns,

        audit:
          audit,

        materials:
          materials,

        finishedAt:
          formatIsoDateTime(
            new Date()
          )
      };

      setInstallationProperties(
        result
      );

      Logger.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      return result;
    },
    SETUP_LOCK_TIMEOUT_MS
  );
}

// =========================================================
// RECUPERAÇÃO APÓS FALHA DE MIGRAÇÃO
// =========================================================

/**
 * Não restaura automaticamente a cópia do Drive.
 * Repara colunas, configuração, dados derivados e triggers.
 */
function repairBackendInstallation() {
  return withScriptLock(
    function () {
      var result = {
        ok: true,

        startedAt:
          formatIsoDateTime(
            new Date()
          ),

        columns: null,
        config: null,
        derivedData: null,
        triggers: null,
        tests: null,
        errors: []
      };

      function repairStep(
        name,
        operation
      ) {
        try {
          result[name] =
            operation();

          if (
            result[name] &&
            result[name].ok === false
          ) {
            result.ok = false;
          }
        } catch (error) {
          result.ok = false;

          result.errors.push(
            name +
            ': ' +
            safeString(
              error.message ||
              error
            )
          );
        }
      }

      repairStep(
        'columns',
        repairApplicationColumns
      );

      repairStep(
        'config',
        migrateLegacyConfig
      );

      repairStep(
        'derivedData',
        repairDerivedData
      );

      repairStep(
        'triggers',
        repairApplicationTriggers
      );

      clearAllApplicationCaches();

      repairStep(
        'tests',
        runBackendSmokeTests
      );

      result.finishedAt =
        formatIsoDateTime(
          new Date()
        );

      Logger.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      return result;
    },
    SETUP_LOCK_TIMEOUT_MS
  );
}

// =========================================================
// MARCADOR DE FIM DA PARTE 13
// =========================================================

/*
 * FIM DE 13_SetupMigrationTests.gs
 *
 * Se este comentário aparece no final do arquivo,
 * a Parte 13/13 está completa.
 *
 * O backend está dividido nos seguintes arquivos:
 *
 * 01_Core.gs
 * 02_SheetsRepository.gs
 * 03_UsersAuth.gs
 * 04_ConfigService.gs
 * 05_OperationalRecords.gs
 * 06_Refrigeration.gs
 * 07_TicketDomain.gs
 * 08_TicketService.gs
 * 09_AuditService.gs
 * 10_AlertService.gs
 * 11_ReportsCompliance.gs
 * 12_HttpRoutes.gs
 * 13_SetupMigrationTests.gs
 */