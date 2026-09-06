// ============================================
// ReportesView - Report generation
// ============================================

class ReportesView extends BaseView {
    constructor() { super('reportes'); }
    
    async init() {
        // Setup period toggle
        document.querySelectorAll('.period-toggle button[data-periodo]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-toggle button[data-periodo]')
                    .forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        const generateBtn = document.getElementById('btnGenerarReporte');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateReport());
        }
    }
    
    getSelectedPeriod() {
        const activeBtn = document.querySelector('.period-toggle button[data-periodo].active');
        const period = activeBtn?.dataset.periodo || 'semana';
        
        const now = new Date();
        
        if (period === 'semana') {
            const day = (now.getDay() + 6) % 7;
            const monday = new Date(now);
            monday.setDate(now.getDate() - day);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return {
                desde: monday.toISOString().split('T')[0],
                hasta: sunday.toISOString().split('T')[0]
            };
        }
        
        if (period === 'mes') {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
                desde: first.toISOString().split('T')[0],
                hasta: last.toISOString().split('T')[0]
            };
        }
        
        if (period === 'mes_anterior') {
            const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const last = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                desde: first.toISOString().split('T')[0],
                hasta: last.toISOString().split('T')[0]
            };
        }
        
        // Custom
        return {
            desde: document.getElementById('rep-desde')?.value || '',
            hasta: document.getElementById('rep-hasta')?.value || ''
        };
    }
    
    async generateReport() {
        const { desde, hasta } = this.getSelectedPeriod();
        
        if (!desde || !hasta) {
            this.showToast('Selecione o período', true);
            return;
        }
        
        this.showLoading('A gerar relatório...');
        
        try {
            const records = await Promise.all([
                storage.getRecordsByIndex('general', 'fecha', desde),
                storage.getRecordsByIndex('quarto', 'fecha', desde),
                storage.getRecordsByIndex('temperatura', 'fecha', desde)
            ]);
            
            const output = document.getElementById('reporteOutput');
            if (output) {
                output.innerHTML = `
                    <div class="card">
                        <h3>Relatório: ${desde} a ${hasta}</h3>
                        <p>Registos gerais: ${records[0].length}</p>
                        <p>Registos quartos: ${records[1].length}</p>
                        <p>Registos temperatura: ${records[2].length}</p>
                    </div>
                `;
            }
            
        } catch (error) {
            this.showError('Erro ao gerar relatório: ' + error.message);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesView;
}
