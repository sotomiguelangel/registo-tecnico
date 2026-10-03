(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.TicketReportCharts = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const COLORS = {
    completed: '#10b981',
    progress: '#0284c7',
    open: '#f59e0b',
    paused: '#64748b',
    projection: '#a855f7',
    previous: '#6366f1'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function ticketMonthKey(ticket) {
    const value = String(ticket && (ticket.dataReporte || ticket.fecha || ticket.criadoEm || '')).trim();
    const iso = value.match(/^(\d{4})-(\d{1,2})/);
    if (iso && Number(iso[2]) >= 1 && Number(iso[2]) <= 12) return `${iso[1]}-${iso[2].padStart(2, '0')}`;
    const pt = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    return pt && Number(pt[2]) >= 1 && Number(pt[2]) <= 12
      ? `${pt[3]}-${pt[2].padStart(2, '0')}`
      : '';
  }

  function statusOf(ticket) {
    const status = String(ticket && ticket.situacao || '').toLowerCase().trim();
    if (['finalizado', 'fechado', 'resolvido', 'concluido', 'concluído', 'cerrado'].includes(status)) return 'completed';
    if (['em_andamento', 'em andamento', 'andamento', 'in progress'].includes(status)) return 'progress';
    if (status === 'pausado' || status === 'paused') return 'paused';
    return 'open';
  }

  function monthLabel(key) {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
  }

  function chartCard(title, chart, className = '') {
    return `<section class="ticket-report-chart ${className}"><h3>${escapeHtml(title)}</h3>${chart}</section>`;
  }

  function emptyChart(message) {
    return `<p class="ticket-report-chart-empty">${escapeHtml(message)}</p>`;
  }

  function categoriesChart(tickets) {
    const counts = new Map();
    tickets.forEach(ticket => {
      const category = String(ticket.categoria || 'Outros').trim() || 'Outros';
      if (!counts.has(category)) counts.set(category, { completed: 0, progress: 0, open: 0, paused: 0 });
      counts.get(category)[statusOf(ticket)]++;
    });
    const rows = Array.from(counts.entries())
      .map(([category, values]) => ({ category, values, total: Object.values(values).reduce((sum, value) => sum + value, 0) }))
      .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
    if (!rows.length) return emptyChart('Sem pedidos no período selecionado.');

    const width = 780;
    const left = 210;
    const right = 62;
    const top = 12;
    const rowHeight = 27;
    const height = top + rows.length * rowHeight + 12;
    const max = Math.max(1, ...rows.map(row => row.total));
    const plotWidth = width - left - right;
    const colors = ['completed', 'progress', 'open', 'paused'];
    const bars = rows.map((row, index) => {
      const y = top + index * rowHeight;
      let x = left;
      const segments = colors.map(status => {
        const value = row.values[status];
        const segmentWidth = plotWidth * value / max;
        const rect = value ? `<rect x="${x.toFixed(1)}" y="${y}" width="${segmentWidth.toFixed(1)}" height="18" rx="2" fill="${COLORS[status]}"><title>${escapeHtml(status)}: ${value}</title></rect>` : '';
        x += segmentWidth;
        return rect;
      }).join('');
      return `<text x="${left - 8}" y="${y + 14}" text-anchor="end" class="chart-label">${escapeHtml(row.category)}</text>${segments}<text x="${Math.min(width - right + 6, x + 6).toFixed(1)}" y="${y + 14}" class="chart-value">${row.total}</text>`;
    }).join('');
    const grid = [0, 0.25, 0.5, 0.75, 1].map(fraction => {
      const x = left + plotWidth * fraction;
      const value = Math.round(max * fraction);
      return `<line x1="${x}" x2="${x}" y1="${top - 4}" y2="${height - 8}" class="chart-grid"/><text x="${x}" y="${height}" text-anchor="middle" class="chart-axis">${value}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Pedidos por categoria e estado">${grid}${bars}</svg><p class="ticket-report-chart-note"><span style="color:${COLORS.completed}">■ Concluídos</span> &nbsp; <span style="color:${COLORS.progress}">■ Em andamento</span> &nbsp; <span style="color:${COLORS.open}">■ Abertos</span> &nbsp; <span style="color:${COLORS.paused}">■ Pausados</span></p>`;
  }

  function monthlyWorkloadChart(tickets) {
    const counts = new Map();
    tickets.forEach(ticket => {
      const key = ticketMonthKey(ticket);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    const keys = Array.from(counts.keys()).sort();
    if (!keys.length) return emptyChart('Não há datas válidas para apresentar o volume mensal.');

    const historyKeys = keys.slice(-12);
    const history = historyKeys.map(key => ({ key, label: monthLabel(key), count: counts.get(key) }));
    const sample = history.slice(-6).map(period => period.count);
    const n = sample.length;
    let slope = 0;
    let intercept = sample[0] || 0;
    if (n > 1) {
      const sumX = sample.reduce((sum, _value, index) => sum + index, 0);
      const sumY = sample.reduce((sum, value) => sum + value, 0);
      const sumXY = sample.reduce((sum, value, index) => sum + index * value, 0);
      const sumXX = sample.reduce((sum, _value, index) => sum + index * index, 0);
      const denominator = n * sumXX - sumX * sumX;
      slope = denominator ? (n * sumXY - sumX * sumY) / denominator : 0;
      intercept = (sumY - slope * sumX) / n;
    }
    const lastKey = historyKeys[historyKeys.length - 1];
    const [year, month] = lastKey.split('-').map(Number);
    const projection = [1, 2, 3].map(offset => {
      const date = new Date(year, month - 1 + offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return {
        key,
        label: `${monthLabel(key)}*`,
        count: Math.max(0, Math.round(slope * (n - 1 + offset) + intercept)),
        projected: true
      };
    });
    const data = history.concat(projection);
    const width = 780;
    const height = 250;
    const margin = { top: 18, right: 24, bottom: 46, left: 48 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const max = Math.max(1, ...data.map(period => period.count));
    const x = index => margin.left + (data.length < 2 ? plotWidth / 2 : index * plotWidth / (data.length - 1));
    const y = value => margin.top + plotHeight - value / max * plotHeight;
    const chartGrid = [0, 0.5, 1].map(fraction => {
      const yy = margin.top + plotHeight * fraction;
      return `<line x1="${margin.left}" x2="${width - margin.right}" y1="${yy}" y2="${yy}" class="chart-grid"/><text x="${margin.left - 8}" y="${yy + 4}" text-anchor="end" class="chart-axis">${Math.round(max * (1 - fraction))}</text>`;
    }).join('');
    const barWidth = Math.min(34, plotWidth / data.length * 0.55);
    const bars = data.map((period, index) => {
      const yy = y(period.count);
      const color = period.projected ? COLORS.projection : '#0284c7';
      return `<rect x="${(x(index) - barWidth / 2).toFixed(1)}" y="${yy.toFixed(1)}" width="${barWidth}" height="${(margin.top + plotHeight - yy).toFixed(1)}" rx="3" fill="${color}"><title>${escapeHtml(period.label)}: ${period.count} pedidos</title></rect><text x="${x(index)}" y="${yy - 5}" text-anchor="middle" class="chart-value">${period.count}</text><text x="${x(index)}" y="${height - 15}" text-anchor="middle" class="chart-axis">${escapeHtml(period.label)}</text>`;
    }).join('');
    const projectionStart = history.length - 1;
    const linePoints = data.slice(projectionStart).map((period, index) => `${x(projectionStart + index).toFixed(1)},${y(period.count).toFixed(1)}`).join(' ');
    const projectionLine = data.length > history.length
      ? `<polyline points="${linePoints}" fill="none" stroke="${COLORS.projection}" stroke-width="3" stroke-dasharray="7 5"/>`
      : '';
    const dividerX = (x(projectionStart) + x(projectionStart + 1)) / 2;
    const divider = `<line x1="${dividerX}" x2="${dividerX}" y1="${margin.top}" y2="${margin.top + plotHeight}" stroke="${COLORS.projection}" stroke-dasharray="4 4"/>`;
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Volume mensal de pedidos e projeção de três meses">${chartGrid}${divider}${bars}${projectionLine}</svg><p class="ticket-report-chart-note">* Projeção linear com base nos últimos seis meses disponíveis; não representa um compromisso de carga futura.</p>`;
  }

  function monthlyCategoryComparisonChart(tickets) {
    const months = Array.from(new Set(tickets.map(ticketMonthKey).filter(Boolean))).sort();
    if (months.length < 2) return emptyChart('São necessários pedidos com datas em pelo menos dois meses para comparar categorias.');

    const previousMonth = months[months.length - 2];
    const currentMonth = months[months.length - 1];
    const counts = new Map();
    tickets.forEach(ticket => {
      const key = ticketMonthKey(ticket);
      if (key !== previousMonth && key !== currentMonth) return;
      const category = String(ticket.categoria || 'Outros').trim() || 'Outros';
      if (!counts.has(category)) counts.set(category, { previous: 0, current: 0 });
      counts.get(category)[key === previousMonth ? 'previous' : 'current']++;
    });
    const rows = Array.from(counts.entries())
      .map(([category, values]) => ({ category, ...values }))
      .sort((a, b) => Math.max(b.previous, b.current) - Math.max(a.previous, a.current) || a.category.localeCompare(b.category));
    const width = 780;
    const left = 210;
    const right = 100;
    const top = 12;
    const rowHeight = 35;
    const height = top + rows.length * rowHeight + 16;
    const plotWidth = width - left - right;
    const max = Math.max(1, ...rows.flatMap(row => [row.previous, row.current]));
    const bars = rows.map((row, index) => {
      const y = top + index * rowHeight;
      const previousWidth = plotWidth * row.previous / max;
      const currentWidth = plotWidth * row.current / max;
      const delta = row.current - row.previous;
      const deltaText = `${delta > 0 ? '+' : ''}${delta}`;
      const deltaColor = delta > 0 ? '#dc2626' : delta < 0 ? '#059669' : '#64748b';
      return `<text x="${left - 8}" y="${y + 22}" text-anchor="end" class="chart-label">${escapeHtml(row.category)}</text><rect x="${left}" y="${y}" width="${previousWidth.toFixed(1)}" height="12" rx="2" fill="${COLORS.previous}"><title>${escapeHtml(monthLabel(previousMonth))}: ${row.previous}</title></rect><rect x="${left}" y="${y + 15}" width="${currentWidth.toFixed(1)}" height="12" rx="2" fill="${COLORS.progress}"><title>${escapeHtml(monthLabel(currentMonth))}: ${row.current}</title></rect><text x="${Math.min(width - right + 4, left + Math.max(previousWidth, currentWidth) + 5).toFixed(1)}" y="${y + 22}" class="chart-value" style="fill:${deltaColor}">${row.previous} → ${row.current} (${deltaText})</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Comparação de pedidos por categoria entre ${escapeHtml(monthLabel(previousMonth))} e ${escapeHtml(monthLabel(currentMonth))}">${bars}</svg><p class="ticket-report-chart-note"><span style="color:${COLORS.previous}">■ ${escapeHtml(monthLabel(previousMonth))}</span> &nbsp; <span style="color:${COLORS.progress}">■ ${escapeHtml(monthLabel(currentMonth))}</span></p>`;
  }

  function locationsChart(tickets) {
    const counts = new Map();
    tickets.forEach(ticket => {
      const location = String(ticket.quarto || ticket.local || 'Geral').trim() || 'Geral';
      const item = counts.get(location) || { total: 0, completed: 0 };
      item.total++;
      if (statusOf(ticket) === 'completed') item.completed++;
      counts.set(location, item);
    });
    const rows = Array.from(counts.entries())
      .map(([location, values]) => ({ location, ...values }))
      .sort((a, b) => b.total - a.total || a.location.localeCompare(b.location))
      .slice(0, 10);
    if (!rows.length) return emptyChart('Sem locais registados no período selecionado.');

    const width = 780;
    const left = 160;
    const right = 62;
    const top = 12;
    const rowHeight = 26;
    const height = top + rows.length * rowHeight + 12;
    const plotWidth = width - left - right;
    const max = Math.max(1, ...rows.map(row => row.total));
    const bars = rows.map((row, index) => {
      const y = top + index * rowHeight;
      const totalWidth = plotWidth * row.total / max;
      const doneWidth = plotWidth * row.completed / max;
      return `<text x="${left - 8}" y="${y + 14}" text-anchor="end" class="chart-label">${escapeHtml(row.location)}</text><rect x="${left}" y="${y}" width="${totalWidth.toFixed(1)}" height="18" rx="2" fill="${COLORS.progress}"/><rect x="${left}" y="${y}" width="${doneWidth.toFixed(1)}" height="18" rx="2" fill="${COLORS.completed}"/><text x="${Math.min(width - right + 6, left + totalWidth + 6).toFixed(1)}" y="${y + 14}" class="chart-value">${row.total} (${row.completed} concl.)</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Dez locais com mais pedidos">${bars}</svg>`;
  }

  function render(tickets) {
    if (!Array.isArray(tickets)) throw new TypeError('Os pedidos do relatório devem ser fornecidos como array.');
    if (!tickets.length) return '';
    return `
      <style>
        .ticket-report-charts { display:grid; grid-template-columns:1fr; gap:14px; margin:18px 0; color:#152736; }
        .ticket-report-chart { border:1px solid #d5e0e9; border-radius:8px; padding:12px 14px; background:#fff; break-inside:avoid; page-break-inside:avoid; }
        .ticket-report-chart h3 { margin:0 0 8px; font-size:14px; color:#152736; }
        .ticket-report-chart svg { display:block; width:100%; height:auto; font-family:Arial,sans-serif; }
        .ticket-report-chart .chart-label { fill:#334155; font-size:11px; font-weight:600; }
        .ticket-report-chart .chart-value { fill:#1e293b; font-size:10px; font-weight:700; }
        .ticket-report-chart .chart-axis { fill:#64748b; font-size:9px; }
        .ticket-report-chart .chart-grid { stroke:#e2e8f0; stroke-dasharray:2 3; }
        .ticket-report-chart-empty,.ticket-report-chart-note { margin:6px 0 0; color:#64748b; font-size:10px; }
        @media print { .ticket-report-charts { display:block; } .ticket-report-chart { margin:0 0 12px; } .ticket-report-chart svg { max-height:250mm; } }
      </style>
      <section class="ticket-report-charts" aria-label="Gráficos do relatório de pedidos">
        ${chartCard('Pedidos por categoria e estado', categoriesChart(tickets))}
        ${chartCard('Comparativo por categoria entre os dois últimos meses', monthlyCategoryComparisonChart(tickets))}
        ${chartCard('Volume mensal e projeção de carga', monthlyWorkloadChart(tickets))}
        ${chartCard('Áreas com maior volume de pedidos', locationsChart(tickets))}
      </section>
    `;
  }

  function printableReport(tickets, options = {}) {
    if (!Array.isArray(tickets)) throw new TypeError('Os pedidos do relatório devem ser fornecidos como array.');
    if (!tickets.length) throw new Error('Não existem pedidos para incluir no relatório.');
    if (typeof window === 'undefined' || typeof window.open !== 'function') {
      throw new Error('A impressão do relatório não está disponível neste contexto.');
    }

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      throw new Error('O navegador bloqueou a janela do relatório. Permita pop-ups para este site e tente novamente.');
    }

    const title = options.title || 'Relatório de Pedidos / Tickets';
    const period = options.period || 'Todos os períodos disponíveis';
    const rows = tickets
      .slice()
      .sort((a, b) => String(b.dataReporte || '').localeCompare(String(a.dataReporte || '')))
      .map(ticket => `
        <tr>
          <td>${escapeHtml(ticket.dataReporte || '—')}</td>
          <td>${escapeHtml(ticket.quarto || ticket.local || '—')}</td>
          <td>${escapeHtml(ticket.categoria || 'Outros')}</td>
          <td>${escapeHtml(ticket.situacao || 'aberto')}</td>
          <td>${escapeHtml(ticket.descricao || '')}</td>
        </tr>
      `).join('');
    const charts = render(tickets);
    const safeTitle = escapeHtml(title);
    const safePeriod = escapeHtml(period);

    reportWindow.document.open();
    reportWindow.document.write(`<!DOCTYPE html>
      <html lang="pt-PT">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${safeTitle}</title>
        <style>
          body { margin:24px auto; max-width:1100px; padding:0 20px; color:#152736; font:13px Arial,sans-serif; }
          h1 { margin:0 0 4px; font-size:22px; }
          .report-meta { margin:0 0 18px; color:#475569; }
          h2 { margin:18px 0 8px; font-size:16px; }
          table { width:100%; border-collapse:collapse; font-size:11px; }
          th,td { padding:6px 8px; text-align:left; vertical-align:top; border:1px solid #d5e0e9; }
          th { background:#eff6fa; }
          tr { break-inside:avoid; }
          @page { size:A4 landscape; margin:12mm; }
          @media print {
            body { max-width:none; margin:0; padding:0; }
            .ticket-report-chart { break-inside:avoid; page-break-inside:avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${safeTitle}</h1>
        <p class="report-meta">Período: ${safePeriod} · ${tickets.length} pedidos · Gerado em ${escapeHtml(new Date().toLocaleString('pt-PT'))}</p>
        ${charts}
        <h2>Detalhe dos pedidos</h2>
        <table>
          <thead><tr><th>Data</th><th>Local</th><th>Categoria</th><th>Estado</th><th>Descrição</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.addEventListener('load',function(){setTimeout(function(){window.focus();window.print();},250);});</script>
      </body>
      </html>`);
    reportWindow.document.close();
    return reportWindow;
  }

  return { render, printableReport, ticketMonthKey };
});
