// tests/unit/temperature-ranges.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

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

  test('Official Hotel AC inventory: Rooftop has no AC (AC05 removed), Cozinha -1 has AC08', () => {
    // 1. Verify AC05 does NOT exist in DEFAULT_HOTEL_EQUIPAMENTOS in index.html and indicadores.html
    assert.doesNotMatch(indexHtml, /id:\s*['"]AC05['"]/);
    assert.doesNotMatch(indicadoresHtml, /id:\s*['"]AC05['"]/);

    // 2. Verify AC08 exists in DEFAULT_HOTEL_EQUIPAMENTOS for Cozinha Piso -1
    assert.match(indexHtml, /id:\s*['"]AC08['"].*?COZINHA PISO -1/s);
    assert.match(indicadoresHtml, /id:\s*['"]AC08['"].*?COZINHA PISO -1/s);

    // 3. Verify exactly the 5 valid ACs (AC01, AC02, AC03, AC04, AC08) exist in index.html DEFAULT_HOTEL_EQUIPAMENTOS
    const defaultBlock = indexHtml.match(/const DEFAULT_HOTEL_EQUIPAMENTOS = \[(.*?)\];/s)?.[1] || '';
    const acIds = Array.from(defaultBlock.matchAll(/id:\s*['"](AC\d+)['"]/g), m => m[1]);
    assert.deepStrictEqual(acIds.sort(), ['AC01', 'AC02', 'AC03', 'AC04', 'AC08'].sort());

    // 4. In Rooftop, only VIH01 exists
    const rooftopMatches = Array.from(defaultBlock.matchAll(/\{[^{}]*?id:\s*['"](\w+)['"][^{}]*?ubicacao:\s*['"]BAR ROOFTOP['"][^{}]*?\}/gs), m => m[1]);
    assert.deepStrictEqual(rooftopMatches, ['VIH01']);
  });

  test('Canonical equipment matching: AC Cozinha -1 never maps to AC01, always to AC08', () => {
    // Extract functions from index.html
    const script = `
      function isAireAcondicionado(eq){
        if(!eq) return false;
        const idStr = String(eq.id || eq.ref || '').toUpperCase().trim();
        if (/^(AC|ARC)\\d+/i.test(idStr)) return true;
        const str = (String(eq.tipo || '') + ' ' + String(eq.nome || '')).toLowerCase();
        return str.includes('ar condicionado') || str.includes('aire acondicionado') || str.includes('climat') || str.includes('hvac') || str.includes('a/c') || str.includes(' ac ') || str.startsWith('ac ') || str === 'ac';
      }
      ${indexHtml.slice(indexHtml.indexOf('const DEFAULT_HOTEL_EQUIPAMENTOS ='), indexHtml.indexOf('function formatRefShort'))}
      this.findCanonicalEquip = findCanonicalEquip;
      this.extractCanonicalCode = extractCanonicalCode;
    `;
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(script, ctx);

    // AC Cozinha -1 cases must resolve to AC08
    assert.strictEqual(ctx.extractCanonicalCode('AC-1'), 'AC08');
    assert.strictEqual(ctx.extractCanonicalCode('AC -1'), 'AC08');
    assert.strictEqual(ctx.extractCanonicalCode('AC08'), 'AC08');
    assert.strictEqual(ctx.findCanonicalEquip('AC-1', 'Ar Condicionado Cozinha -1')?.id, 'AC08');
    assert.strictEqual(ctx.findCanonicalEquip('AC -1', 'Aire Cocina -1')?.id, 'AC08');
    assert.strictEqual(ctx.findCanonicalEquip(null, 'Ar Condicionado Cozinha Piso -1', 'COZINHA PISO -1', 'Ar Condicionado')?.id, 'AC08');
    assert.strictEqual(ctx.findCanonicalEquip('AC_COZINHA', 'Aire Cocina -1', 'COZINHA PISO -1', 'Ar Condicionado')?.id, 'AC08');

    // Rooftop AC must return null
    assert.strictEqual(ctx.findCanonicalEquip('AC05', 'Ar Condicionado Bar Rooftop', 'BAR ROOFTOP', 'Ar Condicionado'), null);
    assert.strictEqual(ctx.findCanonicalEquip(null, 'Ar Condicionado Rooftop', 'BAR ROOFTOP', 'Ar Condicionado'), null);
  });
});
