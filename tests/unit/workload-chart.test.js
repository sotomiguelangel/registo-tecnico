import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('Workload Volume & Projection Chart', () => {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    const indicadoresHtml = fs.readFileSync('indicadores.html', 'utf8');

    test('defines renderMaintenanceD3WorkloadVolume in both html files', () => {
        assert.match(indexHtml, /function renderMaintenanceD3WorkloadVolume\(host, controlsWrap, footerWrap, tickets\)/);
        assert.match(indicadoresHtml, /function renderMaintenanceD3WorkloadVolume\(host, controlsWrap, footerWrap, tickets\)/);
    });

    test('includes workload tab button in both html files', () => {
        assert.match(indexHtml, /data-maint-tab="workload"/);
        assert.match(indicadoresHtml, /data-maint-tab="workload"/);
        assert.match(indexHtml, /Volume de Pedidos & Cargas/);
        assert.match(indicadoresHtml, /Volume de Pedidos & Cargas/);
    });

    test('wires renderPedidosWorkloadSection to pedidosScatterSection in index.html', () => {
        assert.match(indexHtml, /function renderPedidosWorkloadSection\(tickets\)/);
        assert.match(indexHtml, /renderPedidosWorkloadSection\(tickets\)/);
        assert.match(indexHtml, /id="pedidosScatterSection"/);
    });

    test('safely clamps maintenance tooltips with showMaintTooltipSafely in both pages', () => {
        assert.match(indexHtml, /function showMaintTooltipSafely\(tooltip, event, htmlContent\)/);
        assert.match(indicadoresHtml, /function showMaintTooltipSafely\(tooltip, event, htmlContent\)/);
        assert.match(indexHtml, /function hideMaintTooltipSafely\(tooltip\)/);
        assert.match(indicadoresHtml, /function hideMaintTooltipSafely\(tooltip\)/);
    });

    test('handles workload tab in renderActiveMaintKpiChart for both pages', () => {
        assert.match(indexHtml, /else if\s*\(currentMaintKpiTab === 'workload'\)\s*\{\s*renderMaintenanceD3WorkloadVolume/);
        assert.match(indicadoresHtml, /else if\s*\(currentMaintKpiTab === 'workload'\)\s*\{\s*renderMaintenanceD3WorkloadVolume/);
    });
});
