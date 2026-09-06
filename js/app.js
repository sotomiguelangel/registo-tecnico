// ============================================
// Moon and Sun - Main Application Entry Point
// ============================================

class App {
    constructor() {
        this.views = {};
        this.currentView = null;
        this.isInitialized = false;
        
        // Initialize when DOM is ready
        if (typeof document !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeServices());
            } else {
                this.initializeServices();
            }
        }
    }
    
    /**
     * Initialize all services
     */
    async initializeServices() {
        console.log('🔧 Initializing Moon and Sun App...');
        
        try {
            // Initialize storage
            await storage.init();
            
            // Initialize sync service
            this.syncService = getSyncService();
            await this.syncService.init();
            
            // Initialize app views & UI
            await this.init();
        } catch (err) {
            console.error('Initialization error:', err);
        }
    }
    
    /**
     * Main initialization
     */
    async init() {
        // Create views
        this.views = {
            dashboard: new DashboardView(),
            ejecutivo: new BaseView('ejecutivo'),
            general: new GeneralView(),
            quarto: new QuartoView(),
            temperatura: new TemperaturaView(),
            historial: new HistorialView(),
            reportes: new ReportesView(),
            usuarios: new UsuariosView(),
            importar: new BaseView('importar')
        };
        
        // Initialize view components
        for (const key of Object.keys(this.views)) {
            try {
                await this.views[key].init();
            } catch (e) {
                console.warn(`View ${key} init warning:`, e);
            }
        }
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup global events
        this.setupGlobalEvents();
        
        // Check for existing session
        await this.checkSession();
        
        this.isInitialized = true;
        console.log('✅ App initialized successfully');
    }
    
    /**
     * Setup navigation
     */
    setupNavigation() {
        const tabs = document.querySelectorAll('nav.tabs button[data-view]');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const viewName = tab.dataset.view;
                this.navigateTo(viewName);
            });
        });
    }
    
    /**
     * Navigate to a view
     */
    navigateTo(viewName) {
        if (!viewName) return;
        
        // Update tab buttons
        document.querySelectorAll('nav.tabs button[data-view]')
            .forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
        
        // Update view sections
        document.querySelectorAll('section.view')
            .forEach(section => {
                const isActive = section.dataset.view === viewName;
                section.classList.toggle('active', isActive);
            });
        
        // Hide previous view
        if (this.currentView && this.views[this.currentView]) {
            this.views[this.currentView].onHide();
        }
        
        // Show new view
        this.currentView = viewName;
        appState.setState({ currentView: viewName });
        
        if (this.views[viewName]) {
            this.views[viewName].onShow();
        }
    }
    
    /**
     * Setup global events
     */
    setupGlobalEvents() {
        // Clock
        setInterval(() => this.updateClock(), 1000);
        this.updateClock();
        
        // Online/offline detection
        window.addEventListener('online', () => {
            toast.success('Ligação restabelecida');
            if (this.syncService) this.syncService.processQueue();
        });
        
        window.addEventListener('offline', () => {
            toast.warning('Sem ligação à internet');
        });
        
        // Version modal
        const versionBtn = document.getElementById('btnOpenVersionModal');
        if (versionBtn) {
            versionBtn.addEventListener('click', () => this.showVersionModal());
        }
        
        // Update banner actions
        const btnUpdateDismiss = document.getElementById('btnUpdateDismiss');
        if (btnUpdateDismiss) {
            btnUpdateDismiss.addEventListener('click', () => {
                const banner = document.getElementById('updateBanner');
                if (banner) banner.style.display = 'none';
            });
        }
        
        const btnUpdateNow = document.getElementById('btnUpdateNow');
        if (btnUpdateNow) {
            btnUpdateNow.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
    
    /**
     * Update clock display
     */
    updateClock() {
        const now = new Date();
        const timeEl = document.getElementById('clockTime');
        const dateEl = document.getElementById('clockDate');
        
        if (timeEl) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeEl.textContent = `${hours}:${minutes}`;
        }
        
        if (dateEl) {
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const dayName = days[now.getDay()];
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            dateEl.textContent = `${dayName} ${day}/${month}`;
        }
    }
    
    /**
     * Check for existing session
     */
    async checkSession() {
        const token = localStorage.getItem(CONSTANTS.STORAGE_KEYS.TOKEN);
        const userJson = localStorage.getItem(CONSTANTS.STORAGE_KEYS.USER);
        
        if (token && userJson) {
            try {
                const user = JSON.parse(userJson);
                appState.setState({
                    user,
                    isAuthenticated: true,
                    isViewer: user?.rol === 'visualizador'
                });
                
                this.onLoggedIn(user);
                
                // Try bootstrap in background if online
                if (navigator.onLine) {
                    api.bootstrap().then(result => {
                        if (result.ok && result.user) {
                            appState.setState({ user: result.user });
                            this.updateUserBadge(result.user);
                        }
                    }).catch(err => {
                        console.log('Background bootstrap skipped:', err.message);
                    });
                }
                return;
            } catch (e) {
                console.log('Session restore error:', e);
            }
        }
        
        // Show login if not authenticated
        this.showLoginScreen();
    }
    
    /**
     * Show login screen
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            loginScreen.classList.add('show');
        }
        
        const loginForm = document.getElementById('loginFormContainer');
        if (loginForm) {
            loginForm.innerHTML = `
                <form id="formLogin" onsubmit="return false;" style="display:flex;flex-direction:column;gap:12px;margin-top:14px;">
                    <label class="field">
                        <span class="lbl">Utilizador</span>
                        <input type="text" id="login-usuario" placeholder="ex: miguel.soto" autocomplete="username" required>
                    </label>
                    <label class="field">
                        <span class="lbl">PIN de Acesso</span>
                        <input type="password" id="login-pin" placeholder="••••" inputmode="numeric" autocomplete="current-password" required>
                    </label>
                    <p class="login-hint" id="loginHint" style="font-size:12px;color:var(--coral-500);min-height:16px;margin:0;"></p>
                    <button type="submit" class="primary" id="btnLogin" style="margin-top:6px;">
                        <span class="spinner" style="display:none" id="loginSpinner"></span>
                        <span class="lbl-text" id="loginBtnText">Entrar</span>
                    </button>
                </form>
            `;
            
            const form = document.getElementById('formLogin');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.login();
                });
            }
        }
    }
    
    /**
     * Perform login
     */
    async login() {
        const usuarioInput = document.getElementById('login-usuario');
        const pinInput = document.getElementById('login-pin');
        const hintEl = document.getElementById('loginHint');
        const btn = document.getElementById('btnLogin');
        const spinner = document.getElementById('loginSpinner');
        const btnText = document.getElementById('loginBtnText');
        
        const usuario = usuarioInput ? usuarioInput.value.trim() : '';
        const pin = pinInput ? pinInput.value.trim() : '';
        
        if (!usuario || !pin) {
            if (hintEl) hintEl.textContent = 'Indique utilizador e PIN';
            return;
        }
        
        if (hintEl) hintEl.textContent = '';
        if (btn) btn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (btnText) btnText.textContent = 'A verificar...';
        
        try {
            // Check offline or remote login
            const result = await api.login(usuario, pin);
            
            if (result && result.ok) {
                const user = result.user || { usuario, nome: usuario, rol: 'tecnico' };
                const token = result.token || `tok_${Date.now()}`;
                
                api.setToken(token);
                localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(user));
                
                appState.setState({
                    user,
                    isAuthenticated: true,
                    isViewer: user.rol === 'visualizador'
                });
                
                this.hideLoginScreen();
                this.onLoggedIn(user);
                toast.success(`Bem-vindo, ${user.nome || user.usuario}!`);
            } else {
                if (hintEl) hintEl.textContent = result?.error || 'Credenciais inválidas';
            }
        } catch (err) {
            console.error('Login error:', err);
            // If offline fallback login
            const savedUserJson = localStorage.getItem(CONSTANTS.STORAGE_KEYS.USER);
            if (savedUserJson) {
                try {
                    const savedUser = JSON.parse(savedUserJson);
                    if (savedUser.usuario === usuario) {
                        appState.setState({ user: savedUser, isAuthenticated: true });
                        this.hideLoginScreen();
                        this.onLoggedIn(savedUser);
                        toast.info('Sessão restaurada em modo offline');
                        return;
                    }
                } catch (e) {}
            }
            if (hintEl) hintEl.textContent = err.message || 'Erro ao tentar autenticar';
        } finally {
            if (btn) btn.disabled = false;
            if (spinner) spinner.style.display = 'none';
            if (btnText) btnText.textContent = 'Entrar';
        }
    }
    
    hideLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.classList.remove('show');
            loginScreen.style.display = 'none';
        }
    }
    
    onLoggedIn(user) {
        this.updateUserBadge(user);
        
        // Show/hide admin-only elements
        const navUsuarios = document.getElementById('navUsuarios');
        if (navUsuarios) {
            navUsuarios.style.display = user.rol === 'admin' ? 'inline-block' : 'none';
        }
        
        // Navigate to default view
        const defaultView = appState.state.currentView || 'dashboard';
        this.navigateTo(defaultView);
    }
    
    updateUserBadge(user) {
        const badge = document.getElementById('userBadge');
        const nameEl = document.getElementById('userBadgeName');
        const roleEl = document.getElementById('userBadgeRole');
        
        if (badge && user) {
            badge.style.display = 'flex';
            if (nameEl) nameEl.textContent = user.nome || user.usuario;
            if (roleEl) {
                const roleMap = { admin: 'Administrador', tecnico: 'Técnico', visualizador: 'Visualizador' };
                roleEl.textContent = roleMap[user.rol] || user.rol;
            }
        }
    }
    
    logout() {
        api.setToken(null);
        localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USER);
        
        appState.setState({
            user: null,
            isAuthenticated: false,
            isViewer: false
        });
        
        const badge = document.getElementById('userBadge');
        if (badge) badge.style.display = 'none';
        
        this.showLoginScreen();
        toast.info('Sessão terminada');
    }
    
    showVersionModal() {
        modal.alert(
            'Informação da Versão',
            `Aplicação Registo Técnico\nVersão: ${CONFIG.VERSION}\nBuild: ${CONFIG.BUILD_ID} (${CONFIG.BUILD_DATE})\nEstado: Operacional\nArmazenamento: IndexedDB Ativo`
        );
    }
    
    showSetupScreen() {
        const setup = document.getElementById('setupScreen');
        if (setup) setup.style.display = 'flex';
    }
    
    getView(name) {
        return this.views[name];
    }
}

// Instantiate and expose globally
const app = new App();
if (typeof window !== 'undefined') {
    window.app = app;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
