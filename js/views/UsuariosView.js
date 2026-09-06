// ============================================
// UsuariosView - User management
// ============================================

class UsuariosView extends BaseView {
    constructor() { super('usuarios'); }
    
    async onShow() {
        super.onShow();
        
        if (!this.hasPermission('admin')) {
            const el = this.getElement();
            if (el) el.innerHTML = '<div class="empty">Acesso restrito a administradores</div>';
            return;
        }
        
        await this.refresh();
    }
    
    async refresh() {
        this.showLoading('A carregar utilizadores...');
        
        try {
            const result = await api.listUsers();
            this.renderUserList(result.users || []);
            
        } catch (error) {
            this.showError('Erro ao carregar: ' + error.message);
        }
    }
    
    renderUserList(users) {
        const list = document.getElementById('usersList');
        if (!list) return;
        
        if (users.length === 0) {
            list.innerHTML = '<div class="empty">Sem utilizadores</div>';
            return;
        }
        
        list.innerHTML = users.map(user => `
            <div class="user-row">
                <div class="info">
                    <span class="n">${user.nome || user.nombre || '—'}</span>
                    <span class="u">@${user.usuario}</span>
                </div>
                <span class="badge-rol ${user.rol || 'tecnico'}">${user.rol === 'admin' ? 'Admin' : (user.rol === 'visualizador' ? 'Visualizador' : 'Técnico')}</span>
            </div>
        `).join('');
    }
    
    hasPermission(permission) {
        const user = typeof appState !== 'undefined' ? appState.state.user : null;
        if (!user) return false;
        return user.rol === 'admin';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsuariosView;
}
