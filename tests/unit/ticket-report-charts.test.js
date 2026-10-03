import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../js/ticket-report-charts.js', import.meta.url), 'utf8');
const printEvents = new Map();
let printCalls = 0;
const elements = [];
const makeElement = tagName => ({
    tagName,
    id: '',
    textContent: '',
    innerHTML: '',
    parentNode: null,
    remove() {
        if (this.parentNode) {
            this.parentNode.children = this.parentNode.children.filter(item => item !== this);
            this.parentNode = null;
        }
    }
});
const bodyClasses = new Set();
const body = {
    children: [],
    classList: {
        add(value) { bodyClasses.add(value); },
        remove(value) { bodyClasses.delete(value); }
    },
    appendChild(element) {
        element.parentNode = this;
        this.children.push(element);
        elements.push(element);
        return element;
    }
};
const head = {
    children: [],
    appendChild(element) {
        element.parentNode = this;
        this.children.push(element);
        elements.push(element);
        return element;
    }
};
const document = {
    body,
    head,
    createElement: makeElement,
    getElementById(id) { return elements.find(element => element.id === id) || null; }
};
const window = {
    focus() {},
    print() { printCalls++; },
    addEventListener(type, callback) { printEvents.set(type, callback); },
    removeEventListener(type) { printEvents.delete(type); },
    matchMedia() { return { addListener() {}, removeListener() {} }; }
};
const sandbox = { globalThis: {}, document, window };
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

    test('prints the report in the current window and restores Indicators after print', () => {
        printCalls = 0;
        bodyClasses.clear();
        reportEventsClear();
        const printView = reportCharts.printableReport([
            { dataReporte: '2026-05-12', categoria: 'Elétrico', quarto: 'Quarto 101', situacao: 'finalizado', descricao: 'Troca <segura>' },
            { dataReporte: '2026-06-03', categoria: 'Canalização', quarto: 'Quarto 202', situacao: 'aberto', descricao: 'Verificar fuga' }
        ], { title: 'Pedidos de Manutenção', period: 'Maio-Junho' });

        assert.equal(printCalls, 1);
        assert.equal(bodyClasses.has('ticket-report-printing'), true);
        assert.match(printView.innerHTML, /Pedidos de Manutenção/);
        assert.match(printView.innerHTML, /Período: Maio-Junho/);
        assert.match(printView.innerHTML, /Pedidos por categoria e estado/);
        assert.match(printView.innerHTML, /Comparativo por categoria entre os dois últimos meses/);
        assert.match(printView.innerHTML, /Volume mensal e projeção de carga/);
        assert.match(printView.innerHTML, /Áreas com maior volume de pedidos/);
        assert.match(printView.innerHTML, /Troca &lt;segura&gt;/);
        printEvents.get('afterprint')();
        assert.equal(bodyClasses.has('ticket-report-printing'), false);
        assert.equal(body.children.includes(printView), false);
    });

    test('embeds charts in the ticket report and binds both print controls', () => {
        assert.match(indexHtml, /js\/ticket-report-charts\.js/);
        assert.match(indexHtml, /\$\{TicketReportCharts\.render\(filtered\)\}/);
        assert.match(indexHtml, /class="report-actions">\s*<button type="button" class="btn-print" onclick="imprimirReporteTickets\(\)">Imprimir PDF/);
        assert.match(indicadoresHtml, /id="printButton" type="button"[^>]*onclick="window\.printTicketReportIndicadores\(\)"/);
        assert.doesNotMatch(indicadoresHtml, /addClick\('printButton'/);
        assert.match(indicadoresHtml, /js\/ticket-report-charts\.js/);
        assert.match(indicadoresHtml, /id="btnPrintTicketReportIndicadores"/);
        assert.match(indicadoresHtml, /window\.printTicketReportIndicadores = printTicketReportIndicadores/);
        assert.match(indicadoresHtml, /TicketReportCharts\.printableReport\(reportTickets/);
    });
});

function reportEventsClear() {
    printEvents.clear();
}
