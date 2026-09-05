// ============================================
// GeneralView - Daily installation records
// ============================================

class GeneralView extends BaseView {
    constructor() { super('general'); }
    
    async init() {
        // Setup form handlers
        const saveBtn = document.getElementById('btnSaveGeneral');
        const cancelBtn = document.getElementById('btnCancelEditGeneral');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveRecord());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetForm());
        }
        
        // Set default date/time
        const fecha = document.getElementById('g-fecha');
        const hora = document.getElementById('g-hora');
        if (fecha && !fecha.value) fecha.value = new Date().toISOString().split('T')[0];
        if (hora && !hora.value) hora.value = new Date().toTimeString().slice(0, 5);
    }
    
    async onShow() {
        super.onShow();
        await this.refresh();
    }
    
    async refresh() {
        const records = await storage.getAllRecords('general');
        this.data = records;
        
        // Update active period UI
        this.updateActivePeriodUI();
    }
    
    updateActivePeriodUI() {
        // Update period indicator based on current date
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const labelEl = document.getElementById('genActiveMonthLabel');
        if (labelEl) {
            labelEl.textContent = typeof Formatters !== 'undefined' ? Formatters.monthName(monthKey) : monthKey;
        }
    }
    
    async saveRecord() {
        const fecha = document.getElementById('g-fecha')?.value;
        const hora = document.getElementById('g-hora')?.value;
        
        if (!fecha) {
            this.showToast('Indique a data', true);
            return;
        }
        
        const record = {
            id: `gen_${Date.now()}`,
            fecha,
            hora: hora || '00:00',
            usuario: (typeof appState !== 'undefined' && appState.state.user?.nome) || 'Técnico',
            agua: document.getElementById('g-agua')?.value || '',
            electricidad: document.getElementById('g-electricidad')?.value || '',
            retornoAqs: document.getElementById('g-retornoAqs')?.value || '',
            aqsQuartos: document.getElementById('g-aqsQuartos')?.value || '',
            estadoPiscina: document.getElementById('g-estadoPiscina')?.value || '',
            tempPiscina: document.getElementById('g-tempPiscina')?.value || '',
            phPiscina: document.getElementById('g-phPiscina')?.value || '',
            cloroLibre: document.getElementById('g-cloroLibre')?.value || '',
            cloroTotal: document.getElementById('g-cloroTotal')?.value || '',
            observacoes: document.getElementById('g-observacoes')?.value || '',
            criadoEm: new Date().toISOString()
        };
        
        try {
            await storage.saveRecords('general', [record]);
            
            // Sync to cloud
            const sync = typeof getSyncService !== 'undefined' ? getSyncService() : (typeof syncService !== 'undefined' ? syncService : null);
            if (sync) {
                await sync.enqueue('save', 'general', { data: record });
            }
            
            this.showToast('Registo guardado com sucesso');
            this.resetForm();
            this.refresh();
            
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Erro ao guardar: ' + error.message, true);
        }
    }
    
    resetForm() {
        const campos = ['g-agua', 'g-electricidad', 'g-retornoAqs', 'g-aqsQuartos', 
                       'g-estadoPiscina', 'g-tempPiscina', 'g-phPiscina', 
                       'g-cloroLibre', 'g-cloroTotal', 'g-observacoes'];
        
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        const horaEl = document.getElementById('g-hora');
        if (horaEl) horaEl.value = new Date().toTimeString().slice(0, 5);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeneralView;
}
