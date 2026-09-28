(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.MaintenanceWorkload = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function ticketMonthKey(ticket) {
    if (!ticket || typeof ticket !== 'object') return '';
    const data = ticket.data && typeof ticket.data === 'object' ? ticket.data : {};
    const candidates = [
      ticket.dataReporte, ticket.fecha, ticket.criadoEm, ticket.timestamp,
      typeof ticket.data === 'string' ? ticket.data : '',
      data.dataReporte, data.fecha, data.criadoEm, data.timestamp
    ];

    for (const candidate of candidates) {
      const value = String(candidate || '').trim();
      const iso = value.match(/^(\d{4})[/-](\d{1,2})/);
      if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}`;
      const portuguese = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (portuguese) return `${portuguese[3]}-${portuguese[2].padStart(2, '0')}`;
    }
    return '';
  }

  function buildMonthlyWorkloadForecast(tickets, now, options) {
    if (!Array.isArray(tickets)) {
      throw new TypeError('A lista de tickets para a projeção mensal deve ser um array.');
    }
    const currentDate = now instanceof Date ? new Date(now.getTime()) : new Date(now);
    if (Number.isNaN(currentDate.getTime())) {
      throw new TypeError('A data de referência para a projeção mensal é inválida.');
    }

    const settings = Object.assign({ historyMonths: 12, forecastMonths: 3, regressionMonths: 6 }, options);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const daysElapsed = currentDate.getDate();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isCurrentMonthIncomplete = daysElapsed < daysInCurrentMonth;
    const counts = new Map();

    tickets.forEach(ticket => {
      const key = ticketMonthKey(ticket);
      if (key && key <= currentKey) counts.set(key, (counts.get(key) || 0) + 1);
    });

    const periods = [];
    for (let offset = settings.historyMonths - 1; offset >= 0; offset--) {
      const date = new Date(currentYear, currentMonth - offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const count = counts.get(key) || 0;
      const isCurrent = key === currentKey;
      const label = date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
      periods.push({
        key,
        label: isCurrent && isCurrentMonthIncomplete ? `${label}*` : label,
        count,
        isCurrent,
        isIncomplete: isCurrent && isCurrentMonthIncomplete,
        isProjection: false,
        forecast: null
      });
    }

    const currentPeriod = periods[periods.length - 1];
    const hasData = periods.some(period => period.count > 0);
    const currentProjection = currentPeriod.isIncomplete
      ? Math.round(currentPeriod.count / Math.max(1, daysElapsed) * daysInCurrentMonth)
      : currentPeriod.count;
    const completeHistory = periods
      .filter(period => !period.isCurrent || !period.isIncomplete)
      .slice(-settings.regressionMonths);
    const regressionData = completeHistory.map(period => period.count);
    if (currentPeriod.isIncomplete && hasData) regressionData.push(currentProjection);

    let slope = 0;
    let intercept = regressionData[0] || currentProjection;
    if (regressionData.length > 1) {
      const n = regressionData.length;
      const sumX = regressionData.reduce((sum, _value, index) => sum + index, 0);
      const sumY = regressionData.reduce((sum, value) => sum + value, 0);
      const sumXY = regressionData.reduce((sum, value, index) => sum + index * value, 0);
      const sumXX = regressionData.reduce((sum, _value, index) => sum + index * index, 0);
      const denominator = n * sumXX - sumX * sumX;
      slope = denominator ? (n * sumXY - sumX * sumY) / denominator : 0;
      intercept = (sumY - slope * sumX) / n;
    } else if (hasData) {
      intercept = currentProjection;
    }

    currentPeriod.forecast = hasData ? currentProjection : null;

    for (let offset = 1; offset <= settings.forecastMonths; offset++) {
      const date = new Date(currentYear, currentMonth + offset, 1);
      const rawForecast = slope * (regressionData.length - 1 + offset) + intercept;
      const forecast = hasData ? Math.max(0, Math.round(rawForecast)) : null;
      periods.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: `${date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' })} (Proj.)`,
        count: null,
        isCurrent: false,
        isIncomplete: false,
        isProjection: true,
        forecast
      });
    }

    return {
      periods,
      hasData,
      currentKey,
      currentActual: currentPeriod.count,
      currentProjection: hasData ? currentProjection : null,
      daysElapsed,
      daysInCurrentMonth,
      isCurrentMonthIncomplete
    };
  }

  function renderMonthlyWorkloadChart({ host, controlsWrap, footerWrap, tickets, d3, now }) {
    if (!host) throw new Error('Não foi encontrado o espaço para apresentar o gráfico mensal.');
    if (!d3) throw new Error('A biblioteca D3 não está disponível para o gráfico mensal.');

    host.innerHTML = '';
    const model = buildMonthlyWorkloadForecast(tickets, now);
    if (controlsWrap) {
      controlsWrap.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <span style="font-size:12px; color:var(--muted);">Entradas mensais de tickets/pedidos: histórico de 12 meses e previsão dos próximos 3.</span>
          <span style="font-size:11px; font-weight:700; color:#a855f7;">Projeção estatística · sem dados fictícios</span>
        </div>
      `;
    }
    if (footerWrap) footerWrap.innerHTML = '';

    if (!model.hasData) {
      host.innerHTML = '<div style="padding:40px; text-align:center; color:var(--muted);">Ainda não há tickets com datas válidas nos últimos 12 meses para estimar a carga de trabalho.</div>';
      return model;
    }

    const isDark = document.documentElement.dataset.theme === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
    const width = Math.max(host.clientWidth || 860, 340);
    const height = 360;
    const margin = { top: 26, right: 32, bottom: 54, left: 58 };
    const maxValue = Math.max(1, ...model.periods.flatMap(period => [period.count || 0, period.forecast || 0]));
    const xScale = d3.scalePoint()
      .domain(model.periods.map(period => period.label))
      .range([margin.left, width - margin.right])
      .padding(0.35);
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.2])
      .range([height - margin.bottom, margin.top])
      .nice();

    const svg = d3.select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Volume mensal de pedidos e projeção de carga de trabalho');

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .call(axis => axis.select('.domain').attr('stroke', gridColor))
      .call(axis => axis.selectAll('.tick line').attr('stroke', gridColor))
      .call(axis => axis.selectAll('.tick text').attr('fill', textColor).attr('font-size', '10.5px'));

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(value => Number.isInteger(value) ? value : ''))
      .call(axis => axis.select('.domain').remove())
      .call(axis => axis.selectAll('.tick line')
        .attr('x2', width - margin.left - margin.right)
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', '2,3'))
      .call(axis => axis.selectAll('.tick text').attr('fill', textColor).attr('font-size', '11px'));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height - margin.bottom + margin.top) / 2)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text('Pedidos / tickets por mês');

    const forecastPeriods = model.periods.filter(period => period.isProjection);
    const forecastStart = model.periods.find(period => period.isCurrent);
    const forecastLine = [
      ...(forecastStart && forecastStart.forecast !== null ? [{
        label: forecastStart.label,
        forecast: forecastStart.forecast,
        isCurrentEstimate: forecastStart.isIncomplete
      }] : []),
      ...forecastPeriods.map(period => ({
        label: period.label,
        forecast: period.forecast,
        isCurrentEstimate: false
      }))
    ];
    const currentX = forecastStart ? xScale(forecastStart.label) : null;
    const firstFutureX = forecastPeriods.length ? xScale(forecastPeriods[0].label) : null;
    if (currentX !== null && firstFutureX !== null) {
      const splitX = (currentX + firstFutureX) / 2;
      svg.append('rect')
        .attr('x', splitX)
        .attr('y', margin.top)
        .attr('width', width - margin.right - splitX)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', isDark ? 'rgba(168,85,247,0.07)' : 'rgba(168,85,247,0.045)');
      svg.append('line')
        .attr('x1', splitX).attr('x2', splitX)
        .attr('y1', margin.top).attr('y2', height - margin.bottom)
        .attr('stroke', '#a855f7')
        .attr('stroke-dasharray', '4,4');
    }

    const barWidth = Math.min(30, (width - margin.left - margin.right) / model.periods.length * 0.55);
    const actualPeriods = model.periods.filter(period => !period.isProjection);
    svg.selectAll('.workload-actual-bar')
      .data(actualPeriods)
      .enter()
      .append('rect')
      .attr('class', 'workload-actual-bar')
      .attr('x', period => xScale(period.label) - barWidth / 2)
      .attr('y', period => yScale(period.count))
      .attr('width', barWidth)
      .attr('height', period => Math.max(0, yScale(0) - yScale(period.count)))
      .attr('rx', 3)
      .attr('fill', period => period.isIncomplete ? '#f59e0b' : '#0284c7');

    if (forecastLine.length > 1) {
      svg.append('path')
        .datum(forecastLine)
        .attr('fill', 'none')
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '6,4')
        .attr('d', d3.line()
          .x(point => xScale(point.label))
          .y(point => yScale(point.forecast))
          .curve(d3.curveMonotoneX));
    }
    svg.selectAll('.workload-forecast-point')
      .data(forecastLine)
      .enter()
      .append('circle')
      .attr('class', 'workload-forecast-point')
      .attr('cx', point => xScale(point.label))
      .attr('cy', point => yScale(point.forecast))
      .attr('r', 4.5)
      .attr('fill', '#a855f7')
      .attr('stroke', isDark ? '#0f172a' : '#fff')
      .attr('stroke-width', 2);

    let tooltip = document.getElementById('maintKpiTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'maintKpiTooltip';
      tooltip.className = 'maint-kpi-tooltip';
      document.body.appendChild(tooltip);
    }
    model.periods.forEach(period => {
      const value = period.isProjection ? period.forecast : period.count;
      const x = xScale(period.label);
      svg.append('rect')
        .attr('x', x - barWidth)
        .attr('y', margin.top)
        .attr('width', barWidth * 2)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'transparent')
        .on('mouseenter', () => {
          tooltip.style.opacity = '1';
          tooltip.textContent = `${period.label}: ${period.isProjection ? 'carga estimada' : (period.isIncomplete ? 'pedidos registados até hoje' : 'pedidos registados')}: ${value === null ? '—' : value}` +
            (period.isCurrent && period.isIncomplete ? `. Estimativa ao fechar o mês: ${model.currentProjection} (${model.daysElapsed}/${model.daysInCurrentMonth} dias).` : '');
        })
        .on('mousemove', event => {
          tooltip.style.left = `${event.clientX + 14}px`;
          tooltip.style.top = `${event.clientY - 12}px`;
        })
        .on('mouseleave', () => { tooltip.style.opacity = '0'; });
    });

    if (footerWrap) {
      footerWrap.innerHTML = `
        <div class="maint-kpi-legend">
          <div class="maint-kpi-legend-item"><span class="maint-kpi-legend-dot" style="background:#0284c7;"></span><span>Volume mensal registado</span></div>
          <div class="maint-kpi-legend-item"><span class="maint-kpi-legend-dot" style="background:#f59e0b;"></span><span>Mês atual, parcial</span></div>
          <div class="maint-kpi-legend-item"><span class="maint-kpi-legend-dot" style="background:#a855f7;"></span><span>Estimativa do mês atual e projeção dos próximos 3 meses</span></div>
          <div style="margin-left:auto; font-size:11px; color:var(--muted);">A estimativa do mês atual usa o ritmo diário; a tendência usa até 6 meses completos.</div>
        </div>
      `;
    }
    return model;
  }

  return { buildMonthlyWorkloadForecast, renderMonthlyWorkloadChart, ticketMonthKey };
});
