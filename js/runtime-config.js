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

  const configured = root.__APP_CONFIG__ && root.__APP_CONFIG__.API_URL;
  let stored = null;
  try { stored = root.localStorage && root.localStorage.getItem('bitacora_api_url'); } catch (_) {}
  root.AppConfig = Object.freeze({
    apiUrl: validateApiUrl(configured || stored || defaultApiUrl),
    defaultApiUrl
  });
})(window);
