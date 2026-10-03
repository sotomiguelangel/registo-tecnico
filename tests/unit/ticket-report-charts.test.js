import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../js/ticket-report-charts.js', import.meta.url), 'utf8');
let writtenReport = '';
const reportWindow = {
    document: {
        open() {},
        write(markup) { writtenReport = markup; },
        close() {}
    }
};
const sandbox = {
    globalThis: {},
    window: { open() { return reportWindow; } }
};
vm.runInNewContext(source, sandbox);
const reportCharts = sandbox.globalThis.TicketReportCharts;
const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const indicadoresHtml = fs.readFileSync(new URL('../../indicadores.html', import.meta.url), 'utf8');

describe('Ticket report charts and printing', () => {
    test('renders category status, monthly workload forecast, and top-area charts', () => {
        const html = reportCharts.render([
            { dataReporte: '2026-05-12', categoria: 'Elétrico', quarto: 'Quarto 101', situacao: 'finalizado' },
            { dataReporte: '2026-05-15', categoria: 'Elétrico', quarto: 'Quarto 101', situacao: 'aberto' },
            { dataReporte: '2026-06-03', categoria: 'Canalização', quarto: 'Roof <A>', situacao: 'em_andamento' }
        ]);

        assert.match(html, /Pedidos por categoria e estado/);
        assert.match(html, /Comparativo por categoria entre os dois últimos meses/);
        assert.match(html, /Comparação de pedidos por categoria entre/);
        assert.match(html, /Volume mensal e projeção de carga/);
        assert.match(html, /Áreas com maior volume de pedidos/);
        assert.match(html, /aria-label="Volume mensal de pedidos e projeção de três meses"/);
        assert.match(html, /Roof &lt;A&gt;/);
        assert.match(html, /Projeção linear com base nos últimos seis meses/);
    });

    test('returns no chart markup for an empty report and rejects invalid input', () => {
        assert.equal(reportCharts.render([]), '');
        assert.throws(() => reportCharts.render(null), /devem ser fornecidos como array/);
        const oneMonth = reportCharts.render([
            { dataReporte: '2026-06-03', categoria: 'Canalização', quarto: '301', situacao: 'aberto' }
        ]);
        assert.match(oneMonth, /pelo menos dois meses/);
    });

    test('creates a printable standalone report with charts and ticket details', () => {
        writtenReport = '';
        reportCharts.printableReport([
            { dataReporte: '2026-05-12', categoria: 'Elétrico', quarto: 'Quarto 101', situacao: 'finalizado', descricao: 'Troca <segura>' },
            { dataReporte: '2026-06-03', categoria: 'Canalização', quarto: 'Quarto 202', situacao: 'aberto', descricao: 'Verificar fuga' }
        ], { title: 'Pedidos de Manutenção', period: 'Maio-Junho' });

        assert.match(writtenReport, /Pedidos de Manutenção/);
        assert.match(writtenReport, /Período: Maio-Junho/);
        assert.match(writtenReport, /Pedidos por categoria e estado/);
        assert.match(writtenReport, /Comparativo por categoria entre os dois últimos meses/);
        assert.match(writtenReport, /Volume mensal e projeção de carga/);
        assert.match(writtenReport, /Áreas com maior volume de pedidos/);
        assert.match(writtenReport, /Troca &lt;segura&gt;/);
    });

    test('embeds charts in the ticket report and binds both print controls', () => {
        assert.match(indexHtml, /js\/ticket-report-charts\.js/);
        assert.match(indexHtml, /\$\{TicketReportCharts\.render\(filtered\)\}/);
        assert.match(indexHtml, /class="report-actions">\s*<button type="button" class="btn-print" onclick="imprimirReporteTickets\(\)">Imprimir PDF/);
        assert.match(indicadoresHtml, /id="printButton" type="button"[^>]*onclick="window\.print\(\)"/);
        assert.doesNotMatch(indicadoresHtml, /addClick\('printButton'/);
        assert.match(indicadoresHtml, /js\/ticket-report-charts\.js/);
        assert.match(indicadoresHtml, /id="btnPrintTicketReportIndicadores"/);
        assert.match(indicadoresHtml, /TicketReportCharts\.printableReport\(reportTickets/);
    });
});
