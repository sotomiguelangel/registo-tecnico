// tests/unit/temperature-report-table.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

describe('Temperature Report Detail Table and Print Layout', () => {
  test('places Equipamento, Temperatura, and Estado prominently at the front of repTempDetailTableBox', () => {
    // Check table headers in repTempDetailTableBox
    assert.match(indexHtml, /id="repTempDetailTableBox"/);
    assert.match(indexHtml, /<th>Data<\/th>\s*<th[^>]*>Hora<\/th>\s*<th[^>]*>Equipamento<\/th>\s*<th[^>]*>Temperatura<\/th>\s*<th[^>]*>Estado<\/th>/);
    // Check row renderer contains tempDisplay with unit and color
    assert.match(indexHtml, /tempDisplay = sTemp\.toLowerCase\(\)\.includes\('°c'\)/);
  });

  test('places Temperatura upfront in consolidated refrigeration detail table repTpDetailTableBox', () => {
    assert.match(indexHtml, /id="repTpDetailTableBox"/);
    assert.match(indexHtml, /<th>Data<\/th>\s*<th[^>]*>Hora<\/th>\s*<th[^>]*>Equipamento<\/th>\s*<th[^>]*>Temperatura<\/th>\s*<th[^>]*>Intervalo<\/th>\s*<th[^>]*>Estado<\/th>/);
  });

  test('places Temperatura prominently in buildOfficialReport refrigeration section', () => {
    assert.match(indexHtml, /<th>Data<\/th><th>Hora<\/th><th>Equipamento<\/th><th>Temperatura \(°C\)<\/th><th>Intervalo<\/th>/);
  });

  test('configures print media rules to prevent column cut-off and repeat headers', () => {
    assert.match(indexHtml, /table\.report\s*\{[^}]*font-size:\s*8\.5pt/);
    assert.match(indexHtml, /table\.report\s+thead\s*\{[^}]*display:\s*table-header-group/);
  });
});
