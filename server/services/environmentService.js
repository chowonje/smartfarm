const mqtt = require('mqtt');
const { mqttConfig } = require('../config/mqtt');

class EnvironmentService {
    constructor() {
        this.mqttClient = null;
        this.io = null;
        this.currentData = {
            temperature: null,
            humidity: null,
            waterTemp: null,
            phLevel: null,
            waterLevel: null,
            lastUpdate: null
        };
    }

    initialize(io) {
        this.io = io;
        this.setupMQTT();
        this.setupSocketIO();
    }

    setupMQTT() {
        this.mqttClient = mqtt.connect(mqttConfig);

        this.mqttClient.on('connect', () => {
            console.log('Environment Service: Connected to MQTT broker');
            
            // 환경 데이터 관련 토픽 구독
            const topics = [
                'wonje1/temperature',
                'wonje1/humidity',
                'wonje1/water/temp',
                'wonje1/water/ph',
                'wonje1/water/level'
            ];
            
            topics.forEach(topic => {
                this.mqttClient.subscribe(topic);
                console.log(`Subscribed to ${topic}`);
            });
        });

        this.mqttClient.on('message', (topic, message) => {
            const value = message.toString();
            const timestamp = new Date().toISOString();
            // 모든 데이터를 기본적으로 1번 베드에 할당
            const bed_number = 1;

            switch(topic) {
                case 'wonje1/temperature':
                    this.currentData.temperature = parseFloat(value);
                    this.io.emit('temperature', { bed_number, value, timestamp });
                    console.log('Temperature update:', value);
                    break;
                
                case 'wonje1/humidity':
                    this.currentData.humidity = parseFloat(value);
                    this.io.emit('humidity', { bed_number, value, timestamp });
                    console.log('Humidity update:', value);
                    break;
                
                case 'wonje1/water/temp':
                    this.currentData.waterTemp = parseFloat(value);
                    this.io.emit('water_temp', { bed_number, value, timestamp });
                    console.log('Water temperature update:', value);
                    break;
                
                case 'wonje1/water/ph':
                    this.currentData.phLevel = parseFloat(value);
                    this.io.emit('ph_level', { bed_number, value, timestamp });
                    console.log('pH level update:', value);
                    break;
                
                case 'wonje1/water/level':
                    this.currentData.waterLevel = parseFloat(value);
                    this.io.emit('water_level', { bed_number, value, timestamp });
                    console.log('Water level update:', value);
                    break;
            }

            this.currentData.lastUpdate = timestamp;
        });

        this.mqttClient.on('error', (error) => {
            console.error('MQTT Error:', error);
        });
    }

    setupSocketIO() {
        this.io.on('connection', (socket) => {
            console.log('Environment client connected');

            // 연결된 클라이언트에게 현재 데이터 전송
            if (this.currentData.lastUpdate) {
                Object.entries(this.currentData).forEach(([key, value]) => {
                    if (value !== null && key !== 'lastUpdate') {
                        socket.emit(key, {
                            value: value,
                            timestamp: this.currentData.lastUpdate
                        });
                    }
                });
            }

            socket.on('disconnect', () => {
                console.log('Environment client disconnected');
            });
        });
    }

    // 현재 환경 데이터 가져오기
    getCurrentData() {
        return this.currentData;
    }
}

module.exports = new EnvironmentService(); 