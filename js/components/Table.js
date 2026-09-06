// ============================================
// Table Component
// ============================================

export class Table {
    /**
     * @param {object} options
     * @param {Array<{key: string, label: string, render?: Function, align?: string}>} options.columns
     * @param {Array<object>} [options.data=[]]
     * @param {string} [options.emptyText='Nenhum registo encontrado']
     * @param {string} [options.className='']
     * @param {string} [options.id='']
     */
    constructor(options = {}) {
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.emptyText = options.emptyText || 'Nenhum registo encontrado';
        this.className = options.className || 'table';
        this.id = options.id || '';
        this.element = null;
    }

    render() {
        if (typeof document === 'undefined') return null;

        const table = document.createElement('table');
        table.className = `table ${this.className}`;
        if (this.id) table.id = this.id;

        // Head
        const thead = document.createElement('thead');
        const headTr = document.createElement('tr');
        this.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            if (col.align) th.style.textAlign = col.align;
            headTr.appendChild(th);
        });
        thead.appendChild(headTr);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        if (!this.data || this.data.length === 0) {
            const emptyTr = document.createElement('tr');
            const emptyTd = document.createElement('td');
            emptyTd.colSpan = this.columns.length || 1;
            emptyTd.className = 'table-empty text-center py-4 text-ink-400';
            emptyTd.textContent = this.emptyText;
            emptyTr.appendChild(emptyTd);
            tbody.appendChild(emptyTr);
        } else {
            this.data.forEach((row, idx) => {
                const tr = document.createElement('tr');
                this.columns.forEach(col => {
                    const td = document.createElement('td');
                    if (col.align) td.style.textAlign = col.align;
                    if (typeof col.render === 'function') {
                        const content = col.render(row[col.key], row, idx);
                        if (typeof content === 'string') {
                            td.innerHTML = content;
                        } else if (content instanceof HTMLElement) {
                            td.appendChild(content);
                        }
                    } else {
                        td.textContent = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '—';
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
        table.appendChild(tbody);

        this.element = table;
        return table;
    }

    setData(newData) {
        this.data = newData || [];
        if (this.element && this.element.parentElement) {
            const parent = this.element.parentElement;
            const newTable = this.render();
            parent.replaceChild(newTable, this.element);
        }
    }
}

if (typeof window !== 'undefined') {
    window.Table = Table;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Table;
    module.exports.Table = Table;
}

export default Table;
