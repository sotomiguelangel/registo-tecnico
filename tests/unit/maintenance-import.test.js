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
});
