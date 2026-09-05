// ============================================
// DashboardView - Main operational panel
// ============================================

class DashboardView extends BaseView {
    constructor() { super('dashboard'); }
    
    async init() { /* Setup specific to dashboard */ }
    
    async onShow() {
        super.onShow();
        await this.refresh();
    }
    
    async refresh() {
        if (!this.isActive) return;
        
        this.showLoading('A carregar indicadores...');
        
        try {
            const [general, quarto, temperatura] = await Promise.all([
                storage.getAllRecords('general'),
                storage.getAllRecords('quarto'),
                storage.getAllRecords('temperatura')
            ]);
            
            const stats = this.calculateStats(general, quarto, temperatura);
            this.render(stats);
            this.lastUpdate = Date.now();
        } catch (error) {
            console.error('Dashboard error:', error);
            this.showError('Erro ao carregar painel: ' + error.message);
        }
    }
    
    calculateStats(general, quarto, temperatura) {
        const today = new Date().toISOString().split('T')[0];
        
        return {
            general: {
                total: general.length,
                today: general.filter(r => r.fecha === today).length
            },
            quarto: {
                total: quarto.length,
                today: quarto.filter(r => r.fecha === today).length
            },
            temperatura: {
                total: temperatura.length,
                today: temperatura.filter(r => r.fecha === today).length,
                bad: temperatura.filter(r => r.dentroIntervalo === 'Não').length
            }
        };
    }
    
    render(stats) {
        const el = this.getElement();
        if (!el) return;
        
        const { general, quarto, temperatura } = stats;
        
        el.innerHTML = `
            <p class="section-title">Painel operacional</p>
            <p class="dashboard-period" id="dashboardPeriod">Atualizado ${new Date().toLocaleTimeString('pt-PT')}</p>
            
            <button class="primary" id="btnRefreshDashboard" style="margin-bottom:16px">
                <span class="spinner"></span><span class="lbl-text">Atualizar painel</span>
            </button>
            
            <div id="dashboardOutput">
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="lab">Registos gerais</div>
                        <div class="value">${general.total}</div>
                        <div class="meta">${general.today} hoje</div>
                    </div>
                    <div class="dashboard-card">
                        <div class="lab">Leituras quartos</div>
                        <div class="value">${quarto.total}</div>
                        <div class="meta">${quarto.today} hoje</div>
                    </div>
                    <div class="dashboard-card ${temperatura.bad > 0 ? 'alert' : (temperatura.today > 0 ? 'good' : 'zero')}">
                        <div class="lab">Refrigeração (7 dias)</div>
                        <div class="value">${temperatura.bad > 0 ? `⚠️ ${temperatura.bad}` : temperatura.today}</div>
                        <div class="meta">${temperatura.today} leituras, ${temperatura.bad} alertas</div>
                    </div>
                </div>
            </div>
        `;
        
        // Bind refresh button
        const refreshBtn = document.getElementById('btnRefreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardView;
}
