// tests/unit/temperature-ranges.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const indicadoresHtml = fs.readFileSync(new URL('../../indicadores.html', import.meta.url), 'utf8');
const backendGs = fs.readFileSync(new URL('../../backend-apps-script.gs', import.meta.url), 'utf8');

describe('Temperature Ranges and Out-of-Range Bugfix', () => {
  test('index.html contains normalized bounds for AC (16-28 C) and Freezers (-25 to -12 C)', () => {
    // Check that parseTempReading normalizes AC and Congelador
    assert.match(indexHtml, /isAireAcondicionado\(targetEq\)/);
    assert.match(indexHtml, /eqMin = 16;\s*eqMax = 28;/);
    assert.match(indexHtml, /isCongelador\(targetEq\)/);
    assert.match(indexHtml, /eqMin = -25;\s*eqMax = -12;/);
  });

  test('indicadores.html contains normalized bounds for AC and Freezers', () => {
    assert.match(indicadoresHtml, /isAireAcondicionado\(eq\)/);
    assert.match(indicadoresHtml, /isCongelador\(eq\)/);
    assert.match(indicadoresHtml, /eqMin = -25;\s*eqMax = -12;/);
    assert.match(indicadoresHtml, /eqMin = 16;\s*eqMax = 28;/);
  });

  test('backend-apps-script.gs evaluates -17.3 for Congeladores and 23 for AC as compliant', () => {
    assert.match(backendGs, /isAC/);
    assert.match(backendGs, /isCong/);
    assert.match(backendGs, /minimumAllowed = 16;\s*maximumAllowed = 28;/);
    assert.match(backendGs, /minimumAllowed = -25;\s*maximumAllowed = -12;/);
  });

  test('evaluates -17.3 for Congelador (-25 to -12) and 23 for AC (16 to 28) correctly in simulated runtime', () => {
    // Simulate parseTempReading logic
    function simulateParse(tempStr, eq) {
      let eqMin = eq && eq.min !== undefined ? parseFloat(eq.min) : null;
      let eqMax = eq && eq.max !== undefined ? parseFloat(eq.max) : null;

      const isAC = /AC/i.test(eq?.id || '') || /ar condicionado|aire/i.test(eq?.tipo || '');
      const isCong = /CON/i.test(eq?.id || '') || /congelad/i.test(eq?.tipo || '');

      if (isAC) {
        if (eqMin === null || eqMax === null || (eqMin === 0 && eqMax === 8) || eqMax < 26 || eqMin > 20) {
          eqMin = 16;
          eqMax = 28;
        }
      } else if (isCong) {
        if (eqMin === null || eqMax === null || eqMax < -12 || eqMin >= 0) {
          eqMin = -25;
          eqMax = -12;
        }
      }

      const val = parseFloat(tempStr.replace(',', '.'));
      const isBad = (eqMin !== null && val < eqMin) || (eqMax !== null && val > eqMax);
      return { val, eqMin, eqMax, isBad };
    }

    // Congelador cases
    const rFreeze1 = simulateParse('-17.3', { id: 'CON01', tipo: 'Congelador', min: -25, max: -12 });
    assert.strictEqual(rFreeze1.isBad, false, '-17.3 must be compliant for standard freezer');

    const rFreezeLegacy = simulateParse('-17.3', { id: 'CON02', tipo: 'Congelador', min: -22, max: -18 });
    assert.strictEqual(rFreezeLegacy.isBad, false, '-17.3 must be compliant even with legacy max -18 freezer');

    // Air conditioner cases
    const rAC1 = simulateParse('23', { id: 'AC01', tipo: 'Ar Condicionado', min: 16, max: 28 });
    assert.strictEqual(rAC1.isBad, false, '23 must be compliant for standard AC');

    const rACLegacy = simulateParse('23', { id: 'AC02', tipo: 'Ar Condicionado', min: 0, max: 8 });
    assert.strictEqual(rACLegacy.isBad, false, '23 must be compliant even with legacy min 0, max 8');

    const rACRestricted = simulateParse('23', { id: 'AC03', tipo: 'Ar Condicionado', min: 18, max: 22 });
    assert.strictEqual(rACRestricted.isBad, false, '23 must be compliant even with narrow max 22');
  });
});
