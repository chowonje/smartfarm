class SocketService {
    constructor() {
        this.io = null;
        this.eventHandlers = new Map();
    }

    initialize(io) {
        this.io = io;
        
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            
            // 등록된 모든 이벤트 핸들러 설정
            this.eventHandlers.forEach((handler, event) => {
                socket.on(event, (data) => handler(socket, data));
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    registerHandler(event, handler) {
        this.eventHandlers.set(event, handler);
    }

    emit(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

module.exports = new SocketService(); 