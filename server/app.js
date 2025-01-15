const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const { mqttConfig, topics } = require('./config/mqtt');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const environmentService = require('./services/environmentService');
const { sendFCMNotification } = require('./config/fcm');
const alertRoutes = require('./routes/alertRoutes');
const mqttService = require('./services/mqtt.service');

const app = express();

// CORS 및 보안 설정
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
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
app.use('/api/alerts', alertRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

let currentData = {
    bed_number: 1,
    temperature: null,
    humidity: null,
    light_intensity: null,
    created_at: null,
    updated_at: null,
    water_temperature: null,
    ph_level: null,
    water_level: null,
    led1_status: 'OFF',
    led2_status: 'OFF',
    motor_status: 'OFF',
    dc_motor_status: 'OFF'  // 추가된 상태
};

async function saveToDatabase(data) {
    try {
        const { data: result, error } = await supabase
            .from('bed_sensor_data')
            .insert([{
                bed_number: data.bed_number,
                temperature: data.temperature,
                humidity: data.humidity,
                light_intensity: data.light_intensity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (error) throw error;
        console.log('Data saved to Supabase:', result);
    } catch (error) {
        console.error('Supabase error:', error);
    }
}

async function saveWaterTankData(data) {
    try {
        const { data: result, error } = await supabase
            .from('water_tank_data')
            .insert([{
                water_temperature: data.water_temperature,
                ph_level: data.ph_level,
                water_level: data.water_level,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (error) throw error;
        console.log('Water tank data saved to Supabase:', result);
    } catch (error) {
        console.error('Supabase water tank error:', error);
    }
}

// 주기적 데이터 저장
setInterval(async () => {
    if (currentData.temperature !== null && currentData.humidity !== null) {
        await saveToDatabase(currentData);
        console.log('Periodic data save:', currentData);
    }
    
    if (currentData.water_temperature !== null || 
        currentData.ph_level !== null || 
        currentData.water_level !== null) {
        await saveWaterTankData(currentData);
    }
}, 5 * 60 * 1000);

// MQTT 클라이언트 설정
const mqttClient = mqtt.connect(mqttConfig);

// MQTT 이벤트 핸들러
mqttClient.on('connect', () => {
    console.log('MQTT Connected');
    
    // topics 객체에서 필요한 토픽들을 추출
    const subscribeTopics = [
        // 환경 센서 토픽
        topics.environment.temperature,
        topics.environment.humidity,
        topics.environment.waterTemp,
        topics.environment.waterPh,
        topics.environment.waterLevel,
        
        // 제어 상태 토픽
        topics.control.led1.status,
        topics.control.dcMotor.status,
        topics.control.motor.status
    ];

    mqttClient.subscribe(subscribeTopics);
    console.log('Subscribed to topics:', subscribeTopics);
});

mqttClient.on('message', async (topic, message) => {
    const value = message.toString();
    const timestamp = new Date().toISOString();
    console.log('MQTT 메시지 수신:', { topic, value, timestamp });

    // 센서 데이터 처리
    if (topic === 'wonje1/temperature' || topic === 'wonje1/humidity') {
        try {
            await alertRoutes.handleMQTTMessage(topic, parseFloat(value));
        } catch (error) {
            console.error('알림 처리 실패:', error);
        }
    }

    // 상태 업데이트 및 소켓 이벤트 발송
    switch (topic) {
        case 'wonje1/led1/status':
            currentData.led1_status = value;
            io.emit('led1_status', value);
            break;
        case 'dc_motor/status':
            currentData.dc_motor_status = value;
            io.emit('dc_motor_status', value);
            break;
        case 'wonje1/motor/status':
            currentData.motor_status = value;
            io.emit('motor_status', value);
            break;
    }
});

mqttClient.on('error', (error) => {
    console.error('MQTT 에러:', error);
});

// Socket.IO 이벤트 핸들러
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // 초기 상태 전송
    socket.emit('led1_status', currentData.led1_status);
    socket.emit('dc_motor_status', currentData.dc_motor_status);
    socket.emit('motor_status', currentData.motor_status);

    // 센서 데이터 전송
    const sensorData = ['temperature', 'humidity', 'water_temperature', 'ph_level', 'water_level'];
    sensorData.forEach(sensor => {
        if (currentData[sensor] !== null) {
            socket.emit(sensor, {
                value: currentData[sensor],
                timestamp: currentData.updated_at
            });
        }
    });

    // 제어 명령 처리
    socket.on('led1_control', (command) => {
        console.log('LED1 control command received:', command);
        mqttClient.publish('wonje1/led1/control', command.toString());
    });

    socket.on('dc_motor_control', (command) => {
        console.log('DC motor control command received:', command);
        mqttClient.publish('dc_motor/control', command.toString());
    });

    socket.on('motor_control', (command) => {
        console.log('Motor control command received:', command);
        mqttClient.publish('wonje1/motor/control', command.toString());
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// 서비스 초기화
mqttService.initialize(io);
environmentService.initialize(io);

// 서버 시작
const PORT = 5004;
server.listen(PORT, () => {
    console.log(`MQTT & Socket.IO Server running on port ${PORT}`);
});