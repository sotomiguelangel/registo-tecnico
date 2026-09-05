// ============================================
// Formatters - Text and data formatting utilities
// ============================================

const Formatters = {
    /**
     * Format date from YYYY-MM-DD to localized format
     */
    date: (dateStr, locale = 'pt-PT') => {
        if (!dateStr || typeof dateStr !== 'string') return '—';
        
        const [year, month, day] = dateStr.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
        
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    /**
     * Format date from YYYY-MM-DD to full Portuguese format
     */
    dateFull: (dateStr) => {
        if (!dateStr) return '—';
        
        const [year, month, day] = dateStr.split('-').map(Number);
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        if (month >= 1 && month <= 12) {
            return `${day} de ${months[month - 1]} de ${year}`;
        }
        
        return dateStr;
    },
    
    /**
     * Format time from HH:mm to localized format
     */
    time: (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return '—';
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return timeStr;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },
    
    /**
     * Format datetime from YYYY-MM-DD HH:mm
     */
    dateTime: (dateStr, timeStr = '') => {
        const date = Formatters.date(dateStr);
        const time = timeStr ? ` ${Formatters.time(timeStr)}` : '';
        return date + time;
    },
    
    /**
     * Format number with specific decimal places
     */
    number: (value, decimals = 2) => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return parseFloat(value).toFixed(decimals);
    },
    
    /**
     * Format currency (Euro)
     */
    currency: (value) => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return parseFloat(value).toLocaleString('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        });
    },
    
    /**
     * Format percentage
     */
    percentage: (value, decimals = 0) => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return `${parseFloat(value).toFixed(decimals)}%`;
    },
    
    /**
     * Format temperature with unit
     */
    temperature: (value, unit = '°C') => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return `${parseFloat(value).toFixed(1)} ${unit}`;
    },
    
    /**
     * Format water consumption (m³)
     */
    waterVolume: (value) => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return `${parseFloat(value).toFixed(2)} m³`;
    },
    
    /**
     * Format electricity consumption (kWh)
     */
    electricity: (value) => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return `${parseFloat(value).toFixed(2)} kWh`;
    },
    
    /**
     * Format chlorine (ppm)
     */
    chlorine: (value) => {
        if (value === null || value === undefined || isNaN(value)) return '—';
        return `${parseFloat(value).toFixed(2)} ppm`;
    },
    
    /**
     * Format room number (normalize: "1" -> "001")
     */
    roomNumber: (value) => {
        if (!value) return '';
        
        const str = String(value).trim();
        const match = str.match(/(?:quarto|hab|room|q\.?)?\s*(\d+)/i);
        
        if (match && match[1]) {
            let num = match[1];
            if (num.length < 3) num = num.padStart(3, '0');
            return num;
        }
        
        return str;
    },
    
    /**
     * Format month name from YYYY-MM
     */
    monthName: (monthKey) => {
        if (!monthKey || monthKey.length < 7) return monthKey;
        
        const [year, month] = monthKey.split('-').map(Number);
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        if (month >= 1 && month <= 12) {
            return `${months[month - 1]} ${year}`;
        }
        
        return monthKey;
    },
    
    /**
     * Format relative time ("há 2 horas", "há 3 dias")
     */
    relativeTime: (dateStr, timeStr = '00:00') => {
        if (!dateStr) return '—';
        
        const datePart = dateStr.split('-').map(Number);
        let hours = 0, minutes = 0;
        
        if (timeStr && timeStr.includes(':')) {
            [hours, minutes] = timeStr.split(':').map(Number);
        }
        
        const then = new Date(datePart[0], datePart[1] - 1, datePart[2], hours || 0, minutes || 0);
        const now = new Date();
        
        const diffMs = now - then;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMinutes < 1) return 'agora mesmo';
        if (diffMinutes < 60) return `há ${diffMinutes} min`;
        if (diffHours < 24) return `há ${diffHours}h`;
        if (diffDays === 1) return 'ontem';
        if (diffDays < 7) return `há ${diffDays} dias`;
        if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem`;
        return Formatters.date(dateStr);
    },
    
    /**
     * Format phone number
     */
    phone: (value) => {
        if (!value) return '—';
        const cleaned = String(value).replace(/\D/g, '');
        if (cleaned.length === 9) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }
        if (cleaned.length === 12 && cleaned.startsWith('351')) {
            return `+351 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        }
        return value;
    },
    
    /**
     * Format email (mask for privacy)
     */
    emailMask: (email) => {
        if (!email || !email.includes('@')) return '—';
        
        const [local, domain] = email.split('@');
        const visibleChars = Math.min(3, local.length);
        const masked = local.slice(0, visibleChars) + '***';
        
        return `${masked}@${domain}`;
    },
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml: (str) => {
        if (str === undefined || str === null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    
    /**
     * Truncate text with ellipsis
     */
    truncate: (str, maxLength = 50) => {
        if (!str || str.length <= maxLength) return str;
        return str.slice(0, maxLength - 3) + '...';
    },
    
    /**
     * Format file size
     */
    fileSize: (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Format boolean to Portuguese yes/no
     */
    yesNo: (value) => {
        if (value === undefined || value === null) return '—';
        const str = String(value).trim().toLowerCase();
        if (str === 'sim' || str === 'sí' || str === 'yes') return 'Sim';
        if (str === 'não' || str === 'no') return 'Não';
        return '—';
    },
    
    /**
     * Format initials from name
     */
    initials: (name) => {
        if (!name) return '—';
        return name
            .split(' ')
            .map(word => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}
