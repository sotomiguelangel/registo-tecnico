// ============================================
// QuartoView - Room water quality records
// ============================================

class QuartoView extends BaseView {
    constructor() { super('quarto'); }
    
    async init() {
        this.roomsList = [];
        this.selectedRoom = '';
        
        // Load rooms list
        const storedRooms = await storage.getSetting('rooms');
        this.roomsList = storedRooms ? JSON.parse(storedRooms) : this.generateDefaultRooms();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render room grid
        this.renderRoomGrid();
    }
    
    async onShow() {
        super.onShow();
        await this.refresh();
    }
    
    setupEventListeners() {
        const input = document.getElementById('q-numero');
        if (input) {
            input.addEventListener('input', (e) => {
                this.selectedRoom = this.normalizeRoomNumber(e.target.value);
                this.updateSelectedBanner();
            });
        }
        
        const saveBtn = document.getElementById('btnSaveQuarto');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveRecord());
        }
        
        const cycleSelect = document.getElementById('qCycleSelect');
        if (cycleSelect) {
            cycleSelect.addEventListener('change', (e) => {
                this.selectedCycle = e.target.value;
                this.renderRoomGrid();
            });
        }
    }
    
    generateDefaultRooms() {
        const rooms = [];
        for (let i = 1; i <= 40; i++) {
            rooms.push(String(i).padStart(3, '0'));
        }
        return rooms;
    }
    
    normalizeRoomNumber(value) {
        if (!value) return '';
        const match = String(value).match(/(\d+)/);
        return match ? match[1].padStart(3, '0') : value;
    }
    
    renderRoomGrid() {
        const grid = document.getElementById('roomGrid');
        if (!grid) return;
        
        // Group rooms by floor
        const floors = {};
        this.roomsList.forEach(room => {
            const floor = room.charAt(0);
            if (!floors[floor]) floors[floor] = [];
            floors[floor].push(room);
        });
        
        let html = '';
        Object.keys(floors).sort().forEach(floor => {
            html += `<div class="floor-label">Piso ${floor}</div>`;
            html += `<div class="room-grid">`;
            floors[floor].forEach(room => {
                html += `
                    <button type="button" class="room-chip" data-room="${room}">
                        ${room}
                    </button>
                `;
            });
            html += `</div>`;
        });
        
        grid.innerHTML = html;
        
        grid.querySelectorAll('.room-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectRoom(btn.dataset.room);
            });
        });
        
        // Update counters
        const totalEl = document.getElementById('roomsTotalCount');
        const doneEl = document.getElementById('roomsDoneCount');
        if (totalEl) totalEl.textContent = this.roomsList.length;
        if (doneEl) doneEl.textContent = '0';
    }
    
    selectRoom(room) {
        this.selectedRoom = room;
        
        const input = document.getElementById('q-numero');
        if (input) input.value = room;
        
        this.updateSelectedBanner();
    }
    
    updateSelectedBanner() {
        const banner = document.getElementById('selectedRoomBanner');
        if (banner) {
            banner.classList.toggle('show', !!this.selectedRoom);
            const label = document.getElementById('selectedRoomLabel');
            if (label) label.textContent = this.selectedRoom;
        }
        
        // Update grid selection
        document.querySelectorAll('.room-chip').forEach(chip => {
            chip.classList.toggle('selected', chip.dataset.room === this.selectedRoom);
        });
    }
    
    async saveRecord() {
        const numero = this.selectedRoom;
        const fecha = document.getElementById('q-fecha')?.value;
        
        if (!numero || !fecha) {
            this.showToast('Indique o número do quarto e a data', true);
            return;
        }
        
        const record = {
            id: `q_${Date.now()}`,
            numero,
            fecha,
            hora: document.getElementById('q-hora')?.value || '00:00',
            usuario: (typeof appState !== 'undefined' && appState.state.user?.nome) || 'Técnico',
            phCaliente: document.getElementById('q-phCaliente')?.value || '',
            cloroCaliente: document.getElementById('q-cloroCaliente')?.value || '',
            phFria: document.getElementById('q-phFria')?.value || '',
            cloroFria: document.getElementById('q-cloroFria')?.value || '',
            criadoEm: new Date().toISOString()
        };
        
        try {
            await storage.saveRecords('quarto', [record]);
            const sync = typeof getSyncService !== 'undefined' ? getSyncService() : (typeof syncService !== 'undefined' ? syncService : null);
            if (sync) {
                await sync.enqueue('save', 'quarto', { data: record });
            }
            
            this.showToast('Leitura guardada com sucesso');
            this.refresh();
            
        } catch (error) {
            this.showToast('Erro ao guardar: ' + error.message, true);
        }
    }
    
    async refresh() {
        const records = await storage.getAllRecords('quarto');
        this.data = records;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuartoView;
}
