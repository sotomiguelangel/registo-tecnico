// ============================================
// Realtime WebSocket Service
// ============================================

export class WebSocketService {
    constructor(options = {}) {
        this.url = options.url || null;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectDelay = options.reconnectDelay || 2000;
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        this.heartbeatTimer = null;
        this.listeners = new Map();
        this.queue = [];
        this.isConnected = false;
    }

    connect(url = this.url) {
        if (!url || typeof WebSocket === 'undefined') {
            console.info('WebSocket not configured or unsupported in this environment.');
            return;
        }
        this.url = url;

        try {
            this.socket = new WebSocket(url);
            
            this.socket.onopen = (e) => this.handleOpen(e);
            this.socket.onmessage = (e) => this.handleMessage(e);
            this.socket.onclose = (e) => this.handleClose(e);
            this.socket.onerror = (e) => this.handleError(e);
        } catch (err) {
            console.error('WebSocket connection error:', err);
            this.scheduleReconnect();
        }
    }

    handleOpen(event) {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushQueue();
        this.emit('connected', { event });
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') return;
            this.emit(data.type || 'message', data.payload !== undefined ? data.payload : data);
        } catch (err) {
            this.emit('raw', event.data);
        }
    }

    handleClose(event) {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', { event });
        if (!event.wasClean) {
            this.scheduleReconnect();
        }
    }

    handleError(error) {
        this.emit('error', error);
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
        }, this.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max WebSocket reconnect attempts reached.');
            return;
        }
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
        setTimeout(() => this.connect(), delay);
    }

    send(data) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(payload);
        } else {
            this.queue.push(payload);
        }
    }

    flushQueue() {
        while (this.queue.length > 0 && this.isConnected) {
            const msg = this.queue.shift();
            this.socket.send(msg);
        }
    }

    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(handler);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            for (const handler of this.listeners.get(event)) {
                try {
                    handler(data);
                } catch (err) {
                    console.error(`Error in WebSocket listener for ${event}:`, err);
                }
            }
        }
    }

    disconnect() {
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
    }
}

const websocket = new WebSocketService();

export { websocket };
export default websocket;

if (typeof window !== 'undefined') {
    window.websocket = websocket;
    window.WebSocketService = WebSocketService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = websocket;
    module.exports.websocket = websocket;
    module.exports.WebSocketService = WebSocketService;
}
