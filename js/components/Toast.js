// ============================================
// Toast - Safe notification system
// ============================================

class Toast {
  constructor(containerId = 'toastContainer') {
    this.containerId = containerId;
    this.container = null;
    this.currentToast = null;
    this.timer = null;

    if (typeof document !== 'undefined') {
      this.container = document.getElementById(
        this.containerId
      );

      if (!this.container) {
        this.createContainer();
      }
    }
  }

  createContainer() {
    if (typeof document === 'undefined') {
      return null;
    }

    const existing = document.getElementById(
      this.containerId
    );

    if (existing) {
      this.container = existing;
      return existing;
    }

    const container = document.createElement('div');

    container.id = this.containerId;
    container.className = 'toast-container';
    container.setAttribute(
      'aria-live',
      'polite'
    );
    container.setAttribute(
      'aria-atomic',
      'true'
    );

    Object.assign(container.style, {
      position: 'fixed',
      left: '50%',
      bottom: '96px',
      transform: 'translateX(-50%)',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      width: 'min(88vw, 520px)',
      pointerEvents: 'none'
    });

    document.body.appendChild(container);
    this.container = container;

    return container;
  }

  show(message, options = {}) {
    if (typeof document === 'undefined') {
      return null;
    }

    if (!this.container) {
      this.createContainer();
    }

    const {
      duration = 3500,
      type = 'info',
      dismissible = true,
      loading = false
    } = options;

    this.hide({ immediate: true });

    const toastElement = document.createElement('div');

    toastElement.className =
      `toast toast-${type}`;

    toastElement.setAttribute(
      'role',
      type === 'error' ? 'alert' : 'status'
    );

    Object.assign(toastElement.style, {
      background: this.getBackgroundColor(type),
      color: '#fff',
      padding: '11px 18px',
      borderRadius: '30px',
      fontSize: '13.5px',
      fontWeight: '600',
      whiteSpace: 'pre-line',
      maxWidth: '100%',
      textAlign: 'center',
      boxShadow:
        '0 10px 24px -8px rgba(0,0,0,0.4)',
      opacity: '0',
      transform: 'translateY(20px)',
      transition:
        'opacity 0.25s ease, transform 0.25s ease',
      pointerEvents: dismissible
        ? 'auto'
        : 'none',
      cursor: dismissible
        ? 'pointer'
        : 'default'
    });

    const content = document.createElement('span');

    content.style.display = 'inline-flex';
    content.style.alignItems = 'center';
    content.style.justifyContent = 'center';
    content.style.gap = '7px';

    if (loading) {
      const spinner = document.createElement('span');

      spinner.className = 'spinner';
      spinner.style.display = 'inline-block';
      spinner.setAttribute('aria-hidden', 'true');

      content.appendChild(spinner);
    } else {
      const icon = document.createElement('span');

      icon.textContent = this.getIcon(type);
      icon.setAttribute('aria-hidden', 'true');

      content.appendChild(icon);
    }

    const text = document.createElement('span');

    // Seguro: no interpreta HTML.
    text.textContent = String(message ?? '');

    content.appendChild(text);
    toastElement.appendChild(content);

    if (dismissible) {
      toastElement.tabIndex = 0;
      toastElement.title = 'Clique para fechar';

      toastElement.addEventListener(
        'click',
        () => this.hide()
      );

      toastElement.addEventListener(
        'keydown',
        event => {
          if (
            event.key === 'Enter' ||
            event.key === ' ' ||
            event.key === 'Escape'
          ) {
            event.preventDefault();
            this.hide();
          }
        }
      );
    }

    this.container.appendChild(toastElement);
    this.currentToast = toastElement;

    requestAnimationFrame(() => {
      toastElement.style.opacity = '1';
      toastElement.style.transform =
        'translateY(0)';
    });

    if (duration > 0) {
      this.timer = setTimeout(
        () => this.hide(),
        duration
      );
    }

    return toastElement;
  }

  hide(options = {}) {
    const { immediate = false } = options;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (!this.currentToast) {
      return;
    }

    const toastElement = this.currentToast;
    this.currentToast = null;

    if (immediate) {
      toastElement.remove();
      return;
    }

    toastElement.style.opacity = '0';
    toastElement.style.transform =
      'translateY(20px)';

    setTimeout(() => {
      toastElement.remove();
    }, 250);
  }

  info(message, duration) {
    return this.show(message, {
      type: 'info',
      duration
    });
  }

  success(message, duration) {
    return this.show(message, {
      type: 'success',
      duration
    });
  }

  warning(message, duration) {
    return this.show(message, {
      type: 'warning',
      duration
    });
  }

  error(message, duration) {
    return this.show(message, {
      type: 'error',
      duration
    });
  }

  loading(message = 'A processar...') {
    return this.show(message, {
      type: 'info',
      duration: 0,
      dismissible: false,
      loading: true
    });
  }

  getBackgroundColor(type) {
    const colors = {
      info: 'var(--petrol-900, #0e3341)',
      success: 'var(--ok-500, #3ea472)',
      warning: 'var(--amber-500, #e0a12b)',
      error: 'var(--coral-500, #e0602b)'
    };

    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '❌'
    };

    return icons[type] || icons.info;
  }
}

const toast = new Toast();

// Compatibilidad temporal con BaseView y código antiguo.
if (typeof window !== 'undefined') {
  window.Toast = Toast;
  window.toast = toast;
}

export { Toast, toast };
export default toast;
