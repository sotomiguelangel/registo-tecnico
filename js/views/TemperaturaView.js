// ============================================
// TemperaturaView - Refrigeration control
// ============================================

class TemperaturaView extends BaseView {
    constructor() { super('temperatura'); }
    
    async init() {
        this.equipamentos = [];
        this.selectedEquip = null;
        
        await this.loadEquipamentos();
        this.setupEventListeners();
    }
    
    async loadEquipamentos() {
        try {
            const result = await api.listEquipamentos();
            this.equipamentos = result.equipamentos || [];
        } catch (error) {
            console.error('Error loading equipamentos:', error);
            this.equipamentos = [];
        }
    }
    
    setupEventListeners() {
        const select = document.getElementById('t-equipamento');
        if (select) {
            select.addEventListener('change', (e) => {
                this.selectedEquip = this.equipamentos.find(eq => eq.id === e.target.value);
                this.updateEquipBanner();
            });
        }
        
        const saveBtn = document.getElementById('btnSaveTemp');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveRecord());
        }
        
        const refreshBtn = document.getElementById('btnRefreshTempWeek');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.renderWeekView());
        }
    }
    
    updateEquipBanner() {
        const banner = document.getElementById('tempSelected');
        if (banner) {
            banner.classList.toggle('show', !!this.selectedEquip);
            
            if (this.selectedEquip) {
                const nameEl = document.getElementById('tempSelName');
                const rangeEl = document.getElementById('tempSelRange');
                if (nameEl) nameEl.textContent = this.selectedEquip.nome;
                if (rangeEl) rangeEl.textContent = `Intervalo: ${this.selectedEquip.min} a ${this.selectedEquip.max}°C`;
            }
        }
    }
    
    async onShow() {
        super.onShow();
        await this.refresh();
    }
    
    async refresh() {
        this.showLoading('A carregar equipamentos...');
        
        await this.loadEquipamentos();
        
        const records = await storage.getAllRecords('temperatura');
        this.data = records;
        
        this.renderWeekView();
    }
    
    renderWeekView() {
        const box = document.getElementById('tempWeekBox');
        if (!box) return;
        
        // Group by week
        const weeks = {};
        (this.data || []).forEach(r => {
            const date = new Date(r.fecha);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeks[weekKey]) weeks[weekKey] = [];
            weeks[weekKey].push(r);
        });
        
        let html = '';
        Object.keys(weeks).sort().reverse().forEach(weekKey => {
            const weekRecords = weeks[weekKey];
            const measured = weekRecords.filter(r => this.equipamentos.some(eq => eq.id === r.equipamentoId)).length;
            const bad = weekRecords.filter(r => r.dentroIntervalo === 'Não').length;
            
            html += `
                <div class="week-card">
                    <div class="wn">Semana ${weekKey}</div>
                    <div class="wm">${weekRecords.length} leituras</div>
                    <span class="week-pill ${bad > 0 ? 'bad' : (measured > 0 ? 'ok' : 'pend')}">
                        ${bad > 0 ? `⚠️ ${bad} alertas` : (measured > 0 ? '✓ OK' : 'Pendente')}
                    </span>
                </div>
            `;
        });
        
        box.innerHTML = html || '<div class="empty">Sem registos de temperatura</div>';
        
        // Update select options
        const select = document.getElementById('t-equipamento');
        if (select) {
            select.innerHTML = '<option value="">Selecionar...</option>' +
                this.equipamentos.map(eq => 
                    `<option value="${eq.id}">${eq.nome} (${eq.tipo})</option>`
                ).join('');
        }
    }
    
    async saveRecord() {
        if (!this.selectedEquip) {
            this.showToast('Selecione um equipamento', true);
            return;
        }
        
        const temperatura = document.getElementById('t-temperatura')?.value;
        const fecha = document.getElementById('t-fecha')?.value;
        
        if (!temperatura || !fecha) {
            this.showToast('Indique a temperatura e data', true);
            return;
        }
        
        const numTemp = parseFloat(temperatura);
        const min = parseFloat(this.selectedEquip.min);
        const max = parseFloat(this.selectedEquip.max);
        
        const record = {
            id: `temp_${Date.now()}`,
            equipamentoId: this.selectedEquip.id,
            nome: this.selectedEquip.nome,
            tipo: this.selectedEquip.tipo,
            ubicacao: this.selectedEquip.ubicacao || '',
            fecha,
            hora: document.getElementById('t-hora')?.value || '00:00',
            temperatura,
            dentroIntervalo: (numTemp >= min && numTemp <= max) ? 'Sim' : 'Não',
            usuario: (typeof appState !== 'undefined' && appState.state.user?.nome) || 'Técnico',
            criadoEm: new Date().toISOString()
        };
        
        try {
            await storage.saveRecords('temperatura', [record]);
            const sync = typeof getSyncService !== 'undefined' ? getSyncService() : (typeof syncService !== 'undefined' ? syncService : null);
            if (sync) {
                await sync.enqueue('save', 'temperatura', { data: record });
            }
            
            this.showToast('Temperatura guardada');
            this.refresh();
            
        } catch (error) {
            this.showToast('Erro ao guardar: ' + error.message, true);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemperaturaView;
}
