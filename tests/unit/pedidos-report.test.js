import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('Pedidos Workload PDF Report & Print Button', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf8');

  test('index.html contains print report button in pedidos workload section', () => {
    assert.match(indexHtml, /id="btnPrintPedidosWorkloadReport"/);
    assert.match(indexHtml, /🖨️ Imprimir Relatório PDF/);
  });

  test('index.html contains print report button in workload KPI controls', () => {
    assert.match(indexHtml, /id="maintWorkloadPrintReportBtnIndex"/);
    assert.match(indexHtml, /🖨️ Relatório PDF/);
  });

  test('index.html defines workload calculation, SVG chart generator, and report builder functions', () => {
    assert.match(indexHtml, /function calculateMaintenanceWorkloadData\(tickets, horizon, workloadType, simCapacity\)/);
    assert.match(indexHtml, /function renderPedidosWorkloadChartSVG\(calcData/);
    assert.match(indexHtml, /function buildPedidosWorkloadReportHTML\(d\)/);
    assert.match(indexHtml, /function generatePedidosWorkloadReport\(triggerBtn, customTickets\)/);
    assert.match(indexHtml, /function printPedidosWorkloadReport\(triggerBtnOrTickets\)/);
  });

  test('report template contains all statistical elements, SVG graphic, monthly table, and distributions', () => {
    assert.match(indexHtml, /Relatório de Pedidos de Manutenção · Volume & Projeção de Cargas/);
    assert.match(indexHtml, /1\. Elementos Estatísticos & Capacidade da Equipa/);
    assert.match(indexHtml, /Volume Médio Mensal/);
    assert.match(indexHtml, /Pico Histórico de Carga/);
    assert.match(indexHtml, /Projeção Próximo Mês/);
    assert.match(indexHtml, /Capacidade Sustentável/);
    assert.match(indexHtml, /Previsão & Demanda/);
    assert.match(indexHtml, /2\. Gráfico de Volume de Pedidos por Mês & Projeção Preditiva/);
    assert.match(indexHtml, /3\. Tabela Detalhada de Histórico & Projeções Mês a Mês/);
    assert.match(indexHtml, /4\. Estrutura Operacional & Tipologia de Intervenções/);
    assert.match(indexHtml, /O Técnico Responsável/);
    assert.match(indexHtml, /Direção Técnica & Gestão de Operações/);
  });

  test('official report preview provides print, new window, and close controls', () => {
    assert.match(indexHtml, /id="btnOffDoPrintPedidos"/);
    assert.match(indexHtml, /id="btnOffNewWinPedidos"/);
    assert.match(indexHtml, /id="btnOffClosePedidos"/);
    assert.match(indexHtml, /previewing-official/);
  });

  const indicadoresHtml = fs.readFileSync('indicadores.html', 'utf8');

  test('indicadores.html contains print report button in workload KPI controls', () => {
    assert.match(indicadoresHtml, /id="maintWorkloadPrintReportBtn"/);
    assert.match(indicadoresHtml, /🖨️ Relatório PDF/);
  });

  test('indicadores.html defines workload calculation, SVG chart generator, and report builder functions', () => {
    assert.match(indicadoresHtml, /function calculateMaintenanceWorkloadData\(tickets, horizon, workloadType, simCapacity\)/);
    assert.match(indicadoresHtml, /function renderPedidosWorkloadChartSVG\(calcData/);
    assert.match(indicadoresHtml, /function renderCategoriesChartSVG\(catList/);
    assert.match(indicadoresHtml, /function renderComparisonChartSVG\(compData/);
    assert.match(indicadoresHtml, /function renderTimelineProjectionChartSVG\(timelineData/);
    assert.match(indicadoresHtml, /function renderClassificationMatrixSVG\(calcData/);
    assert.match(indicadoresHtml, /function renderTopLocationsChartSVG\(topRooms/);
    assert.match(indicadoresHtml, /function buildPedidosWorkloadReportHTML\(d\)/);
    assert.match(indicadoresHtml, /async function generatePedidosWorkloadReport\(triggerBtn, customTickets\)/);
    assert.match(indicadoresHtml, /function printPedidosWorkloadReport\(triggerBtnOrTickets\)/);
    assert.match(indicadoresHtml, /id="officialReport"/);
  });

  test('indicadores.html report template frames all 5 pages with all charts and tables', () => {
    assert.match(indicadoresHtml, /id="reportPage1"/);
    assert.match(indicadoresHtml, /id="reportPage2"/);
    assert.match(indicadoresHtml, /id="reportPage3"/);
    assert.match(indicadoresHtml, /id="reportPage4"/);
    assert.match(indicadoresHtml, /id="reportPage5"/);
    assert.match(indicadoresHtml, /2\. Distribuição por 15 Categorias Técnicas/);
    assert.match(indicadoresHtml, /3\. Análise Comparativa entre Meses/);
    assert.match(indicadoresHtml, /4\. Tendência & Dinâmica Temporal/);
    assert.match(indicadoresHtml, /5\. Top Locais & Áreas com Maior Demanda/);
  });

  test('both html files have completely valid JavaScript syntax with no unescaped script tags', () => {
    const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
    for (const [filename, content] of [['index.html', indexHtml], ['indicadores.html', indicadoresHtml]]) {
      let match;
      while ((match = scriptRegex.exec(content)) !== null) {
        const src = match[1];
        if (!src.trim()) continue;
        assert.doesNotThrow(() => {
          new Function(src);
        }, `Syntax error in script tag in ${filename}`);
      }
    }
  });
});
