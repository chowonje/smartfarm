const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Core Services
const socketService = require('./services/core/socketService');
const mqttService = require('./services/core/mqttService');

// Control Services
const controlService = require('./services/control/ControlService');

// Sensor Services
const environmentSensorService = require('./services/sensors/environmentSensorService');
const waterTankService = require('./services/sensors/waterTankService');

// Notification Services
const alertService = require('./services/notification/alertService');
const cropDiaryService = require('./services/notification/cropdiaryService');

const app = express();
const server = http.createServer(app);

// CORS 및 보안 설정
app.use(cors({
    origin: [
        process.env.REACT_APP_FRONT_API_URL,
        process.env.REACT_APP_ADMIN_API_URL,
        'http://localhost:3000',
        'http://0.0.0.0:3000',
        'http://ioko4613.synology.me:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; style-src 'self' 'unsafe-inline' https://www.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    );
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO 초기화
const io = new Server(server, {
    cors: {
        origin: [
            process.env.REACT_APP_FRONT_API_URL,
            process.env.REACT_APP_ADMIN_API_URL,
            'http://localhost:3000',
            'http://0.0.0.0:3000',
            'http://ioko4613.synology.me:3000'
        ],
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
    }
});

// 서비스 초기화
socketService.initialize(io);
mqttService.setSocketIO(io);
controlService.initialize(io);

// 센서 서비스 초기화
environmentSensorService.setSocketIO(io);
environmentSensorService.initialize();

waterTankService.initialize();

// 작물 일지 서비스는 생성자에서 자동으로 초기화됨 (startAutoLogging)
console.log('작물 일지 자동 작성 서비스 시작됨');

// Socket.IO 연결 로그
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// MQTT 서비스에 Socket.IO 인스턴스 전달
mqttService.setSocketIO(io);

// MQTT 서비스 초기화
mqttService.initialize();

// 디버깅을 위한 MQTT 메시지 로그
mqttService.client.on('message', (topic, message) => {
    console.log('MQTT message received:', {
        topic,
        message: message.toString()
    });
});

// 서버 시작
const PORT1 = process.env.PORT1 || 5004;
server.listen(PORT1, () => {
    console.log(`Server running on port ${PORT1}`);
});