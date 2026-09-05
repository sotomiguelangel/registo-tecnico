// ============================================
// Chart - SVG Chart rendering utilities
// ============================================

class Chart {
    constructor(container) {
        this.container = typeof container === 'string' ? (typeof document !== 'undefined' ? document.querySelector(container) : null) : container;
        this.width = 480;
        this.height = 210;
        this.margin = { top: 20, right: 14, bottom: 28, left: 46 };
    }
    
    /**
     * Create a line chart
     */
    lineChart(data, options = {}) {
        const {
            xKey = 'date',
            yKey = 'value',
            xLabel = 'Data',
            yLabel = 'Valor',
            color = '#22b8b0',
            areaColor = null,
            referenceLines = [],
            formatValue = (v) => v.toFixed(2)
        } = options;
        
        if (!data || data.length === 0) {
            this.renderEmpty('Sem dados para o gráfico');
            return;
        }
        
        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Calculate scales
        const yValues = data.map(d => d[yKey]);
        
        const xMin = 0;
        const xMax = data.length - 1;
        const yMin = Math.min(...yValues) * 0.9;
        const yMax = Math.max(...yValues) * 1.1;
        
        const xScale = (i) => this.margin.left + (i / (xMax - xMin || 1)) * innerWidth;
        const yScale = (v) => this.margin.top + innerHeight - ((v - yMin) / (yMax - yMin || 1)) * innerHeight;
        
        // Build SVG
        let svg = `<svg viewBox="0 0 ${this.width} ${this.height}" class="dashboard-chart">`;
        
        // Grid
        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
            const y = this.margin.top + (i / yTicks) * innerHeight;
            const value = yMin + ((yTicks - i) / yTicks) * (yMax - yMin);
            svg += `<line class="grid" x1="${this.margin.left}" x2="${this.width - this.margin.right}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="2 2"/>`;
            svg += `<text class="axis-text" x="${this.margin.left - 6}" y="${y + 3}" text-anchor="end" fill="var(--ink-400)">${formatValue(value)}</text>`;
        }
        
        // Reference lines
        referenceLines.forEach(line => {
            const y = yScale(line.value);
            svg += `<line x1="${this.margin.left}" x2="${this.width - this.margin.right}" y1="${y}" y2="${y}" stroke="${line.color || '#e0a12b'}" stroke-width="1" stroke-dasharray="4 2"/>`;
            svg += `<text x="${this.width - this.margin.right}" y="${y - 4}" text-anchor="end" fill="${line.color || '#b07a1a'}" font-size="9.5">${line.label}</text>`;
        });
        
        // Area fill
        if (areaColor) {
            let areaPath = `M${xScale(0)},${this.margin.top + innerHeight}`;
            data.forEach((d, i) => {
                areaPath += ` L${xScale(i)},${yScale(d[yKey])}`;
            });
            areaPath += ` L${xScale(data.length - 1)},${this.margin.top + innerHeight} Z`;
            svg += `<path d="${areaPath}" fill="${areaColor}" opacity="0.2"/>`;
        }
        
        // Line path
        let linePath = '';
        data.forEach((d, i) => {
            linePath += (i === 0 ? 'M' : 'L') + `${xScale(i)},${yScale(d[yKey])}`;
        });
        svg += `<path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
        
        // Points
        data.forEach((d, i) => {
            const x = xScale(i);
            const y = yScale(d[yKey]);
            svg += `<circle cx="${x}" cy="${y}" r="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
        });
        
        // X axis labels (show a few)
        const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
        labelIndices.forEach(i => {
            const x = xScale(i);
            const label = data[i][xKey];
            svg += `<text x="${x}" y="${this.height - 8}" text-anchor="middle" fill="var(--ink-400)" font-size="10">${label}</text>`;
        });
        
        // Y axis label
        svg += `<text x="${this.margin.left - 30}" y="${this.height / 2}" transform="rotate(-90, ${this.margin.left - 30}, ${this.height / 2})" text-anchor="middle" fill="var(--ink-600)" font-size="11" font-weight="600">${yLabel}</text>`;
        
        svg += '</svg>';
        
        this.render(svg);
    }
    
    /**
     * Create a bar chart
     */
    barChart(data, options = {}) {
        const {
            xKey = 'label',
            yKey = 'value',
            color = '#22b8b0',
            formatValue = (v) => v.toFixed(0)
        } = options;
        
        if (!data || data.length === 0) {
            this.renderEmpty('Sem dados para o gráfico');
            return;
        }
        
        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;
        
        const maxValue = Math.max(...data.map(d => d[yKey])) * 1.1;
        const barWidth = (innerWidth / data.length) * 0.7;
        const barGap = (innerWidth / data.length) * 0.3;
        
        let svg = `<svg viewBox="0 0 ${this.width} ${this.height}" class="dashboard-chart">`;
        
        // Y axis
        const yScale = (v) => (v / maxValue) * innerHeight;
        for (let i = 0; i <= 4; i++) {
            const y = this.margin.top + innerHeight - (i / 4) * innerHeight;
            const value = (i / 4) * maxValue;
            svg += `<line x1="${this.margin.left}" x2="${this.width - this.margin.right}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="2 2"/>`;
            svg += `<text x="${this.margin.left - 6}" y="${y + 3}" text-anchor="end" fill="var(--ink-400)" font-size="10">${formatValue(value)}</text>`;
        }
        
        // Bars
        data.forEach((d, i) => {
            const x = this.margin.left + (i * (barWidth + barGap)) + barGap / 2;
            const barHeight = yScale(d[yKey]);
            const y = this.margin.top + innerHeight - barHeight;
            
            svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="3"/>`;
            
            // Label below bar
            svg += `<text x="${x + barWidth / 2}" y="${this.height - 8}" text-anchor="middle" fill="var(--ink-400)" font-size="9">${d[xKey]}</text>`;
            
            // Value on top of bar
            if (barHeight > 20) {
                svg += `<text x="${x + barWidth / 2}" y="${y - 4}" text-anchor="middle" fill="${color}" font-size="10" font-weight="700">${formatValue(d[yKey])}</text>`;
            }
        });
        
        svg += '</svg>';
        
        this.render(svg);
    }
    
    /**
     * Render SVG to container
     */
    render(svg) {
        if (this.container) {
            this.container.innerHTML = svg;
        }
    }
    
    /**
     * Render empty state
     */
    renderEmpty(message) {
        this.render(`<div class="empty" style="padding: 24px; text-align: center; color: var(--ink-400);">${message}</div>`);
    }
    
    /**
     * Render sparkline (small inline chart)
     */
    static sparkline(values, options = {}) {
        const {
            color = '#22b8b0',
            width = 60,
            height = 20
        } = options;
        
        if (!values || values.length < 2) return '';
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        
        const points = values.map((v, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - ((v - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');
        
        return `
            <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:inline-block;vertical-align:middle;">
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5"/>
                <circle cx="${points.split(' ').pop().split(',')[0]}" cy="${points.split(' ').pop().split(',')[1]}" r="2" fill="${color}"/>
            </svg>
        `;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chart;
}
