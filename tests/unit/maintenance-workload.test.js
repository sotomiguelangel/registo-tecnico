import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../js/maintenance-workload.js', import.meta.url), 'utf8');
const sandbox = { globalThis: {} };
vm.runInNewContext(source, sandbox);
const workload = sandbox.globalThis.MaintenanceWorkload;
const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const indicadoresHtml = fs.readFileSync(new URL('../../indicadores.html', import.meta.url), 'utf8');

describe('Monthly maintenance workload projection', () => {
    test('counts ISO, Portuguese and nested ticket dates by month', () => {
        const model = workload.buildMonthlyWorkloadForecast([
            { id: 'iso', dataReporte: '2026-02-14' },
            { id: 'pt', fecha: '28/02/2026' },
            { id: 'nested', data: { dataReporte: '2026/02/05' } },
            { id: 'invalid', dataReporte: 'unknown' },
            { id: 'future', dataReporte: '2026-07-01' }
        ], new Date(2026, 5, 15));

        assert.equal(model.hasData, true);
        assert.equal(model.periods.find(period => period.key === '2026-02').count, 3);
        assert.equal(model.periods.find(period => period.key === '2026-06').count, 0);
        assert.equal(model.periods.at(-1).key, '2026-09');
    });

    test('estimates an incomplete current month from elapsed-day volume', () => {
        const model = workload.buildMonthlyWorkloadForecast([
            { dataReporte: '2026-06-01' },
            { dataReporte: '2026-06-12' }
        ], new Date(2026, 5, 15));

        assert.equal(model.currentActual, 2);
        assert.equal(model.currentProjection, 4);
        assert.equal(model.isCurrentMonthIncomplete, true);
        assert.equal(model.periods.find(period => period.isCurrent).forecast, 4);
        assert.equal(model.periods.filter(period => period.isProjection).length, 3);
    });

    test('does not fabricate a projection when no recent dated tickets exist', () => {
        const model = workload.buildMonthlyWorkloadForecast([], new Date(2026, 5, 15));
        assert.equal(model.hasData, false);
        assert.equal(model.currentProjection, null);
        assert.ok(model.periods.every(period => period.forecast === null));
    });

    test('rejects malformed ticket collections and reference dates explicitly', () => {
        assert.throws(() => workload.buildMonthlyWorkloadForecast(null), /deve ser um array/);
        assert.throws(() => workload.buildMonthlyWorkloadForecast([], 'not-a-date'), /data de referência.*inválida/);
    });

    test('exposes the workload section and safe comparison rendering in both pages', () => {
        for (const html of [indexHtml, indicadoresHtml]) {
            assert.match(html, /js\/maintenance-workload\.js/);
            assert.match(html, /data-maint-tab="workload"/);
            assert.match(html, /renderMaintenanceD3WorkloadProjection\(host, controlsWrap, footerWrap, tickets\)/);
            assert.match(html, /controlsWrap\.closest\('\.maint-kpi-board'\)/);
            assert.match(html, /e\.stopPropagation\(\)/);
            assert.match(html, /Não foi possível renderizar este gráfico/);
        }
    });
});
