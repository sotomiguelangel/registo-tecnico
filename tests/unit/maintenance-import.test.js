import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const indicadoresHtml = fs.readFileSync(new URL('../../indicadores.html', import.meta.url), 'utf8');
const categoriesSource = fs.readFileSync(new URL('../../js/maintenance-categories.js', import.meta.url), 'utf8');
const sandbox = { globalThis: {} };
vm.runInNewContext(categoriesSource, sandbox);
const categories = sandbox.globalThis.MaintenanceCategories;

describe('Maintenance category import compatibility', () => {
    test('accepts maintenance-category header aliases', () => {
          for (const source of [indexHtml]) {
              assert.match(source, /categoriademanutencao:'categoria'/);
              assert.match(source, /categoriamanutencao:'categoria'/);
          }
      });

      test('uses one shared normalizer in both pages', () => {
          assert.match(indexHtml, /js\/maintenance-categories\.js/);
          assert.match(indicadoresHtml, /js\/maintenance-categories\.js/);
          assert.match(indexHtml, /MaintenanceCategories\.canonicalize/);
          assert.match(indicadoresHtml, /MaintenanceCategories\.canonicalize/);
      });

      test('normalizes BOM, Unicode spaces, accents, and Portuguese bathroom variants', () => {
          for (const value of [
              '\uFEFF Casa\u00A0de\u202fBanho ',
              'casa banho',
              'BANHEIRO',
              'wc',
              'instalação sanitária'
          ]) {
              assert.equal(categories.canonicalize(value, { strict: true }), 'Casa de Banho');
          }
      });

      test('rejects truly unknown categories in strict import mode', () => {
          assert.equal(categories.canonicalize('Categoria inventada', { strict: true }), null);
          assert.equal(categories.canonicalize('', { strict: true }), 'Outros');
      });

      test('keeps unknown categories on the non-strict display fallback', () => {
          assert.equal(categories.canonicalize('Categoria inventada'), 'Outros');
          assert.match(indexHtml, /categoria de manutenção desconhecida/);
      });

    test('uses bounded import batches and an extended request timeout', () => {
        assert.match(indexHtml, /const IMPORT_BATCH_SIZE = 20;/);
        assert.match(indexHtml, /const IMPORT_REQUEST_TIMEOUT_MS = 60 \* 1000;/);
        assert.match(indexHtml, /slice\(i, i \+ IMPORT_BATCH_SIZE\)/);
        assert.match(indexHtml, /saveBatch'\, type: importType, rows: chunk \}, IMPORT_REQUEST_TIMEOUT_MS\)/);
        assert.match(indexHtml, /apiPost\(\{ action: 'saveTicket', data: item \}, IMPORT_REQUEST_TIMEOUT_MS\)/);
    });

    test('persists stable progress and does not fall back after a timed-out batch', () => {
        assert.match(indexHtml, /const IMPORT_PROGRESS_KEY = 'bitacora_import_progress_v2'/);
        assert.match(indexHtml, /const generatedId = r\.importId;/);
        assert.match(indexHtml, /writeImportProgress\(importType, completedIds\)/);
        assert.match(indexHtml, /Não fazer fallback para saveTicket/);
        assert.doesNotMatch(indexHtml, /for\(const item of chunk\)\{\s*await apiPost\(\{ action: 'saveTicket'/);
    });

    test('sends action in both POST JSON and query string for deployed API compatibility', () => {
        assert.match(indexHtml, /const action = typeof payload\.action === 'string' \? payload\.action\.trim\(\) : ''/);
        assert.match(indexHtml, /if\(!action\)\{\s*throw new Error\('Ação ausente no pedido\.'/);
        assert.match(indexHtml, /payload\.action = action/);
        assert.match(indexHtml, /requestUrl\.searchParams\.set\('action', action\)/);
        assert.match(indexHtml, /body: JSON\.stringify\(payload\)/);
    });

    test('keeps timeout and resumable progress guarantees on the batch request', () => {
        assert.match(indexHtml, /safeFetch\(requestUrl\.toString\(\), \{/);
        assert.match(indexHtml, /saveBatch'\, type: importType, rows: chunk \}, IMPORT_REQUEST_TIMEOUT_MS\)/);
        assert.match(indexHtml, /Só confirmar localmente depois da resposta do servidor/);
        assert.match(indexHtml, /clearImportProgress\(\)/);
    });

    test('does not block ticket preview on remote lookups', () => {
        assert.match(indexHtml, /if\(importType !== 'ticket'\)/);
        assert.doesNotMatch(indexHtml, /remoteConflictCheckFailed/);
    });
});
