/* Runtime configuration shared by the standalone HTML entry points. */
(function (root) {
  const defaultApiUrl =
    'https://script.google.com/macros/s/AKfycbwFJmArbS54ZdgVN_oW7p-kaoUn6URWg86MBwnKppU1Xhaf7ZbTqdp8mG1ulW4dquszFw/exec';

  function validateApiUrl(value) {
    let url;
    try {
      url = new URL(String(value || '').trim());
    } catch {
      throw new Error('API_URL inválido: URL malformado.');
    }
    if (
      !(url.protocol === 'https:' &&
        url.hostname === 'script.google.com' &&
        /^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)) &&
      !(['localhost', '127.0.0.1'].includes(url.hostname) &&
        ['http:', 'https:'].includes(url.protocol))
    ) {
      throw new Error('API_URL inválido: use a URL /macros/s/<deployment-id>/exec.');
    }
    return url.toString();
  }

  function getActiveApiUrl() {
    try {
      if (typeof localStorage !== 'undefined') {
        const custom = localStorage.getItem('registo_tecnico_api_url') || localStorage.getItem('bitacora_api_url');
        if (custom) return validateApiUrl(custom);
      }
    } catch (e) {}
    return validateApiUrl(defaultApiUrl);
  }

  root.AppConfig = {
    get apiUrl() {
      return getActiveApiUrl();
    },
    defaultApiUrl,
    setCustomApiUrl(newUrl) {
      if (!newUrl || !String(newUrl).trim()) {
        try {
          localStorage.removeItem('registo_tecnico_api_url');
          localStorage.removeItem('bitacora_api_url');
        } catch (e) {}
        return validateApiUrl(defaultApiUrl);
      }
      const validated = validateApiUrl(newUrl);
      try {
        localStorage.setItem('registo_tecnico_api_url', validated);
      } catch (e) {}
      return validated;
    },
    resetApiUrl() {
      try {
        localStorage.removeItem('registo_tecnico_api_url');
        localStorage.removeItem('bitacora_api_url');
      } catch (e) {}
      return validateApiUrl(defaultApiUrl);
    }
  };
})(window);
