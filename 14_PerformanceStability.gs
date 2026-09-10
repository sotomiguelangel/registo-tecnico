/**
 * REGISTO TÉCNICO — Moon and Sun
 *
 * PARTE 14 — Correcciones de rendimiento y estabilidad.
 *
 * IMPORTANTE:
 * Las funciones que ya existen en otros archivos no deben
 * duplicarse aquí. Este archivo contiene funciones auxiliares
 * nuevas utilizadas por los cambios indicados debajo.
 */

// =========================================================
// VERSIÓN DEL PARCHE
// =========================================================

var PERFORMANCE_FIX_RELEASE = Object.freeze({
  VERSION: '1.0.0',
  DATE: '2026-03-01'
});

// =========================================================
// LECTURA SEGURA DEL CUERPO POST
// =========================================================

/**
 * Obtiene el contenido de una petición POST real de
 * Google Apps Script y también funciona con eventos
 * simulados utilizados en las pruebas.
 */
function getPostBodyText(e) {
  if (!e || !e.postData) {
    throw apiError(
      API_ERROR_CODES.BAD_REQUEST,
      'Corpo do pedido ausente'
    );
  }

  var raw = '';

  /*
   * En una petición web real de Apps Script se utiliza
   * normalmente e.postData.contents.
   */
  if (
    e.postData.contents !== undefined &&
    e.postData.contents !== null
  ) {
    raw = safeString(
      e.postData.contents
    );
  }

  /*
   * Compatibilidad con los eventos simulados existentes.
   */
  if (
    !raw &&
    typeof e.postData.getDataAsString ===
      'function'
  ) {
    raw = safeString(
      e.postData.getDataAsString(
        'UTF-8'
      )
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

// =========================================================
// RESPUESTA RÁPIDA DEL LOGIN
// =========================================================

/**
 * Construye exclusivamente la respuesta de autenticación.
 *
 * El bootstrap no se ejecuta durante el login porque puede
 * cargar miles de registros desde Google Sheets.
 */
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
    expiresInMs:
      loginResult.expiresInMs
  };
}

// =========================================================
// OPCIONES RÁPIDAS PARA LA AUDITORÍA
// =========================================================

/**
 * Indica si es seguro omitir la búsqueda previa del ID.
 *
 * Por ahora solamente se permite para auditoría porque
 * sus IDs son generados por el servidor con UUID.
 */
function canSkipRepositoryExistenceCheck(
  type,
  settings,
  generatedByServer
) {
  return Boolean(
    type === 'audit' &&
    generatedByServer === true &&
    settings &&
    settings.skipExistenceCheck === true
  );
}

// =========================================================
// MEDICIÓN DEL HASH DEL PIN
// =========================================================

/**
 * Ejecutar manualmente desde el editor para medir cuánto
 * tarda el hash utilizado por la autenticación.
 */
function benchmarkLoginPinHash() {
  var startedAt =
    new Date().getTime();

  derivePinHash(
    '4826',
    '0123456789abcdef0123456789abcdef',
    PIN_HASH_ITERATIONS
  );

  var durationMs =
    new Date().getTime() -
    startedAt;

  var result = {
    ok: true,
    iterations:
      PIN_HASH_ITERATIONS,
    durationMs:
      durationMs,
    checkedAt:
      formatIsoDateTime(
        new Date()
      )
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
// DIAGNÓSTICO DEL PARCHE
// =========================================================

function diagnosePerformanceFix() {
  var result = {
    ok: true,
    version:
      PERFORMANCE_FIX_RELEASE.VERSION,
    date:
      PERFORMANCE_FIX_RELEASE.DATE,
    checks: {
      postBodyHelper:
        typeof getPostBodyText ===
        'function',
      fastLoginResponse:
        typeof buildFastLoginResponse ===
        'function',
      repositoryHelper:
        typeof canSkipRepositoryExistenceCheck ===
        'function',
      hashBenchmark:
        typeof benchmarkLoginPinHash ===
        'function'
    }
  };

  result.ok =
    Object.keys(
      result.checks
    ).every(function (key) {
      return Boolean(
        result.checks[key]
      );
    });

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}
