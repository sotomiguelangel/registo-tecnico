// ============================================
// BaseView - Base class for all views
// ============================================

import appState from '../store/AppState.js';

function setSafeMessage(container, glyph, message) {
  container.replaceChildren();

  const wrapper = document.createElement('div');
  wrapper.className = 'empty';

  const icon = document.createElement('span');
  icon.className = 'glyph';
  icon.textContent = glyph;

  const paragraph = document.createElement('p');
  paragraph.textContent = String(message || '');

  wrapper.append(icon, paragraph);
  container.appendChild(wrapper);

  return wrapper;
}

class BaseView {
  constructor(viewName) {
    if (!viewName || typeof viewName !== 'string') {
      throw new TypeError('BaseView necessita de um nome de vista.');
    }

    this.viewName = viewName;
    this.element = null;
    this.isActive = false;
    this.data = {};
    this.isLoading = false;
    this.lastUpdate = 0;
    this.refreshInterval = 5 * 60 * 1000;

    this.render = this.render.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  getElement() {
    if (typeof document === 'undefined') {
      return null;
    }

    if (!this.element || !document.contains(this.element)) {
      this.element = document.getElementById(
        `view-${this.viewName}`
      );
    }

    return this.element;
  }

  getIsActive() {
    return this.isActive;
  }

  async init() {
    // Override in subclasses.
  }

  async onShow() {
    this.isActive = true;

    const staleness = Date.now() - this.lastUpdate;

    if (staleness > this.refreshInterval) {
      try {
        await this.refresh();
      } catch (error) {
        this.showError(
          error?.message || 'Não foi possível atualizar os dados.'
        );
      }
    }
  }

  onHide() {
    this.isActive = false;
  }

  async render() {
    // Override in subclasses.
  }

  async refresh() {
    // Override in subclasses.
  }

  showLoading(message = 'A carregar...') {
    const element = this.getElement();

    if (!element) {
      return;
    }

    this.isLoading = true;
    setSafeMessage(element, '◌', message);
  }

  showError(message = 'Ocorreu um erro.') {
    const element = this.getElement();

    if (!element) {
      return;
    }

    this.isLoading = false;

    const wrapper = setSafeMessage(
      element,
      '⚠',
      message
    );

    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'primary';
    retryButton.textContent = 'Tentar novamente';

    retryButton.addEventListener('click', async () => {
      retryButton.disabled = true;

      try {
        await this.refresh();
      } finally {
        retryButton.disabled = false;
      }
    });

    wrapper.appendChild(retryButton);
  }

  showEmpty(message = 'Sem dados') {
    const element = this.getElement();

    if (!element) {
      return;
    }

    this.isLoading = false;
    setSafeMessage(element, '◌', message);
  }

  setLoadingButton(buttonId, loading) {
    if (typeof document === 'undefined') {
      return;
    }

    const button = document.getElementById(buttonId);

    if (!button) {
      return;
    }

    button.disabled = Boolean(loading);
    button.classList.toggle('loading', Boolean(loading));
    button.setAttribute(
      'aria-busy',
      loading ? 'true' : 'false'
    );
  }

  showToast(message, isError = false) {
    const toastService =
      typeof window !== 'undefined'
        ? window.toast
        : null;

    if (!toastService) {
      if (isError) {
        console.error(message);
      } else {
        console.log(message);
      }

      return;
    }

    if (typeof toastService.show === 'function') {
      toastService.show(message, {
        type: isError ? 'error' : 'success'
      });

      return;
    }

    const method = isError ? 'error' : 'success';

    if (typeof toastService[method] === 'function') {
      toastService[method](message);
    }
  }

  t(key) {
    const translations = {
      loading: 'A carregar...',
      error: 'Erro',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Eliminar',
      edit: 'Editar',
      noData: 'Sem dados para mostrar',
      success: 'Operação realizada com sucesso'
    };

    return translations[key] || key;
  }

  formatDate(dateStr) {
    const formatter =
      typeof window !== 'undefined'
        ? window.Formatters
        : null;

    return formatter?.date
      ? formatter.date(dateStr)
      : dateStr;
  }

  formatDateTime(dateStr, timeStr) {
    const formatter =
      typeof window !== 'undefined'
        ? window.Formatters
        : null;

    return formatter?.dateTime
      ? formatter.dateTime(dateStr, timeStr)
      : `${dateStr || ''} ${timeStr || ''}`.trim();
  }

  formatNumber(value, decimals = 2) {
    const formatter =
      typeof window !== 'undefined'
        ? window.Formatters
        : null;

    if (formatter?.number) {
      return formatter.number(value, decimals);
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number.toFixed(decimals)
      : '—';
  }

  hasPermission(permission) {
    return appState.hasPermission(permission);
  }

  assertPermission(permission) {
    if (!this.hasPermission(permission)) {
      const error = new Error(
        'Não tem permissão para realizar esta operação.'
      );

      error.code = 'FORBIDDEN';
      throw error;
    }
  }

  markUpdated() {
    this.lastUpdate = Date.now();
  }
}

if (typeof window !== 'undefined') {
  window.BaseView = BaseView;
}

export { BaseView };
export default BaseView;
