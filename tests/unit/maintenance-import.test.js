import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const indicadoresHtml = fs.readFileSync(new URL('../../indicadores.html', import.meta.url), 'utf8');

describe('Maintenance category import compatibility', () => {
    test('accepts maintenance-category header aliases', () => {
        for (const source of [indexHtml]) {
            assert.match(source, /categoriademanutencao:'categoria'/);
            assert.match(source, /categoriamanutencao:'categoria'/);
        }
    });

    test('normalizes Casa de Banho variants to the canonical category', () => {
        for (const source of [indexHtml, indicadoresHtml]) {
            assert.match(
                source,
                /norm\.includes\('casa de banho'\).*return 'Casa de Banho'/s
            );
            assert.match(source, /normalizedCategory === norm/);
        }
    });

    test('keeps unknown categories on the closed fallback', () => {
        assert.match(indexHtml, /return 'Equipamento';\s*return 'Outros';/);
    });

    test('uses bounded import batches and an extended request timeout', () => {
        assert.match(indexHtml, /const IMPORT_BATCH_SIZE = 20;/);
        assert.match(indexHtml, /const IMPORT_REQUEST_TIMEOUT_MS = 60 \* 1000;/);
        assert.match(indexHtml, /slice\(i, i \+ IMPORT_BATCH_SIZE\)/);
        assert.match(indexHtml, /saveBatch'\, type: importType, rows: chunk \}, IMPORT_REQUEST_TIMEOUT_MS\)/);
    });

    test('persists stable progress and does not fall back after a timed-out batch', () => {
        assert.match(indexHtml, /const IMPORT_PROGRESS_KEY = 'bitacora_import_progress_v2'/);
        assert.match(indexHtml, /const generatedId = r\.importId;/);
        assert.match(indexHtml, /writeImportProgress\(importType, completedIds\)/);
        assert.match(indexHtml, /Não fazer fallback para saveTicket/);
        assert.doesNotMatch(indexHtml, /for\(const item of chunk\)\{\s*await apiPost\(\{ action: 'saveTicket'/);
    });
});
