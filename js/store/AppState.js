// ============================================
// Centralized Application State
// ============================================

const DEFAULT_STATE = Object.freeze({
  user: null,
  isAuthenticated: false,
  isViewer: false,

  currentView: 'ejecutivo',
  previousView: null,

  records: {
    general: [],
    quarto: [],
    temperatura: [],
    tickets: []
  },

  recordsMeta: {
    general: { lastFetch: 0, loading: false, error: null },
    quarto: { lastFetch: 0, loading: false, error: null },
    temperatura: { lastFetch: 0, loading: false, error: null },
    tickets: { lastFetch: 0, loading: false, error: null }
  },

  config: {},
  roomsList: [],
  equipamentos: [],

  isLoading: false,
  isSyncing: false,
  syncQueue: [],
  syncErrors: [],

  cycleDone: [],
  selectedCycle: 'current',

  lastRender: {},

  versionState: 'ok',
  latestVersion: null
});

function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  return cloneValue(DEFAULT_STATE);
}

class AppState {
  constructor(initialState = {}) {
    this._state = {
      ...createInitialState(),
      ...cloneValue(initialState)
    };

    this._listeners = new Set();
    this._history = [];
    this._maxHistory = 50;

    this._setupDebugListener();
  }

  get state() {
    return this._state;
  }

  get(selector) {
    if (typeof selector === 'function') {
      return selector(this._state);
    }

    if (typeof selector !== 'string' || !selector.trim()) {
      return undefined;
    }

    return selector
      .split('.')
      .reduce((object, key) => object?.[key], this._state);
  }

  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('O listener do estado deve ser uma função.');
    }

    this._listeners.add(callback);

    return () => {
      this._listeners.delete(callback);
    };
  }

  setState(updater) {
    const previousState = this._state;

    const partialState = typeof updater === 'function'
      ? updater(previousState)
      : updater;

    if (
      !partialState ||
      typeof partialState !== 'object' ||
      Array.isArray(partialState)
    ) {
      throw new TypeError(
        'setState deve receber um objeto ou uma função que devolva um objeto.'
      );
    }

    this._state = {
      ...previousState,
      ...partialState
    };

    this._notify(this._state, previousState);
    return this._state;
  }

  batch(updates) {
    if (
      !updates ||
      typeof updates !== 'object' ||
      Array.isArray(updates)
    ) {
      throw new TypeError('batch deve receber um objeto.');
    }

    const previousState = this._state;
    const nextState = cloneValue(previousState);

    Object.entries(updates).forEach(([path, value]) => {
      this._deepSet(nextState, path, value);
    });

    this._state = nextState;
    this._notify(this._state, previousState);

    return this._state;
  }

  reset(options = {}) {
    const previousState = this._state;
    const preserve = Array.isArray(options.preserve)
      ? options.preserve
      : [];

    const nextState = createInitialState();

    preserve.forEach(path => {
      const value = this.get(path);

      if (value !== undefined) {
        this._deepSet(nextState, path, cloneValue(value));
      }
    });

    this._state = nextState;
    this._notify(this._state, previousState);

    return this._state;
  }

  setUser(user) {
    const normalizedUser = user
      ? {
          ...user,
          nome: user.nome || user.nombre || user.usuario || '',
          nombre: user.nombre || user.nome || user.usuario || ''
        }
      : null;

    return this.setState({
      user: normalizedUser,
      isAuthenticated: Boolean(normalizedUser),
      isViewer: normalizedUser?.rol === 'visualizador'
    });
  }

  clearSession() {
    return this.setState({
      user: null,
      isAuthenticated: false,
      isViewer: false
    });
  }

  hasPermission(permission) {
    const user = this._state.user;

    // Cierre seguro: si no hay sesión, no existe permiso.
    if (!this._state.isAuthenticated || !user) {
      return false;
    }

    switch (permission) {
      case 'read':
        return true;

      case 'edit':
        return user.rol === 'admin' || user.rol === 'tecnico';

      case 'admin':
      case 'delete':
      case 'close-ticket':
        return user.rol === 'admin';

      default:
        return false;
    }
  }

  setRecords(type, records) {
    if (!Object.prototype.hasOwnProperty.call(this._state.records, type)) {
      throw new Error(`Tipo de registo desconhecido: ${type}`);
    }

    return this.batch({
      [`records.${type}`]: Array.isArray(records) ? records : [],
      [`recordsMeta.${type}.lastFetch`]: Date.now(),
      [`recordsMeta.${type}.loading`]: false,
      [`recordsMeta.${type}.error`]: null
    });
  }

  setRecordsLoading(type, loading) {
    return this.batch({
      [`recordsMeta.${type}.loading`]: Boolean(loading)
    });
  }

  setRecordsError(type, error) {
    return this.batch({
      [`recordsMeta.${type}.loading`]: false,
      [`recordsMeta.${type}.error`]:
        error?.message || String(error || '')
    });
  }

  _deepSet(object, path, value) {
    const keys = String(path).split('.').filter(Boolean);

    if (!keys.length) {
      return;
    }

    const lastKey = keys.pop();
    let current = object;

    keys.forEach(key => {
      if (
        !current[key] ||
        typeof current[key] !== 'object' ||
        Array.isArray(current[key])
      ) {
        current[key] = {};
      }

      current = current[key];
    });

    current[lastKey] = value;
  }

  _notify(currentState, previousState) {
    const changes = this._diff(previousState, currentState);

    if (Object.keys(changes).length === 0) {
      return;
    }

    this._listeners.forEach(callback => {
      try {
        callback(currentState, previousState, changes);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });

    this._history.push({
      state: cloneValue(currentState),
      timestamp: Date.now()
    });

    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }
  }

  _diff(previousState, currentState) {
    const changes = {};
    const keys = new Set([
      ...Object.keys(previousState || {}),
      ...Object.keys(currentState || {})
    ]);

    keys.forEach(key => {
      if (previousState?.[key] !== currentState?.[key]) {
        changes[key] = {
          from: previousState?.[key],
          to: currentState?.[key]
        };
      }
    });

    return changes;
  }

  _setupDebugListener() {
    if (
      typeof window !== 'undefined' &&
      window.__DEBUG_APP_STATE__ === true
    ) {
      this.subscribe((current, previous, changes) => {
        console.debug('[AppState Change]', changes);
      });
    }
  }
}

const appState = new AppState();

// Compatibilidad temporal con módulos antiguos que usan globals.
if (typeof window !== 'undefined') {
  window.AppState = AppState;
  window.appState = appState;
}

export { AppState, appState, DEFAULT_STATE };
export default appState;
