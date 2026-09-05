// ============================================
// HistorialView - Record history
// ============================================

class HistorialView extends BaseView {
    constructor() { super('historial'); }
    
    async onShow() {
        super.onShow();
        await this.refresh();
    }
    
    async refresh() {
        this.showLoading('A carregar histórico...');
        
        try {
            const [general, quarto, temperatura] = await Promise.all([
                storage.getAllRecords('general'),
                storage.getAllRecords('quarto'),
                storage.getAllRecords('temperatura')
            ]);
            
            // Combine and sort by date
            const allRecords = [
                ...general.map(r => ({ ...r, type: 'general' })),
                ...quarto.map(r => ({ ...r, type: 'quarto' })),
                ...temperatura.map(r => ({ ...r, type: 'temperatura' }))
            ].sort((a, b) => {
                const dateA = `${a.fecha}${a.hora || ''}`;
                const dateB = `${b.fecha}${b.hora || ''}`;
                return dateB.localeCompare(dateA);
            });
            
            this.data = allRecords;
            this.renderList(allRecords);
            
        } catch (error) {
            this.showError('Erro ao carregar: ' + error.message);
        }
    }
    
    renderList(records) {
        const list = document.getElementById('histList');
        if (!list) return;
        
        if (records.length === 0) {
            list.innerHTML = '<div class="empty">Sem registos</div>';
            return;
        }
        
        // Use virtual list for performance
        const virtualList = new VirtualList(list, {
            itemHeight: 175,
            renderItem: (record) => this.renderRecordCard(record),
            emptyHtml: '<div class="empty">Sem registos</div>'
        });
        
        virtualList.setItems(records);
    }
    
    renderRecordCard(record) {
        const typeLabels = {
            general: 'Geral',
            quarto: `Quarto ${record.numero}`,
            temperatura: record.nome
        };
        
        const typeClasses = {
            general: 'tag-general',
            quarto: 'tag-quarto',
            temperatura: 'tag-temp'
        };
        
        const formattedDate = typeof Formatters !== 'undefined' ? Formatters.date(record.fecha) : record.fecha;
        
        return `
            <div class="entry" data-id="${record.id}">
                <div class="entry-head">
                    <span class="entry-date">${formattedDate} · ${record.hora || ''}</span>
                    <span class="entry-tag ${typeClasses[record.type] || ''}">${typeLabels[record.type] || record.type}</span>
                </div>
                <div class="entry-user">👤 ${record.usuario || 'Técnico'}</div>
                <div class="entry-grid">
                    ${this.renderRecordDetails(record)}
                </div>
            </div>
        `;
    }
    
    renderRecordDetails(record) {
        if (record.type === 'general') {
            return `
                <div class="entry-item"><span class="k">Água</span><span class="v">${record.agua || '—'} m³</span></div>
                <div class="entry-item"><span class="k">Eletricidade</span><span class="v">${record.electricidad || '—'} kWh</span></div>
                <div class="entry-item"><span class="k">Retorno AQS</span><span class="v">${record.retornoAqs || '—'}°C</span></div>
                <div class="entry-item"><span class="k">pH piscina</span><span class="v">${record.phPiscina || '—'}</span></div>
            `;
        }
        
        if (record.type === 'quarto') {
            return `
                <div class="entry-item"><span class="k">pH quente</span><span class="v">${record.phCaliente || '—'}</span></div>
                <div class="entry-item"><span class="k">Cloro quente</span><span class="v">${record.cloroCaliente || '—'} ppm</span></div>
                <div class="entry-item"><span class="k">pH fria</span><span class="v">${record.phFria || '—'}</span></div>
                <div class="entry-item"><span class="k">Cloro fria</span><span class="v">${record.cloroFria || '—'} ppm</span></div>
            `;
        }
        
        return `
            <div class="entry-item"><span class="k">Temperatura</span><span class="v">${record.temperatura || '—'}°C</span></div>
            <div class="entry-item"><span class="k">Intervalo</span><span class="v">${record.dentroIntervalo || '—'}</span></div>
        `;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistorialView;
}
