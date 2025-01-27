const mqtt = require('mqtt');
const { mqttConfig, topics } = require('../../config/mqtt');

class MQTTService {
    constructor() {
        this.client = null;
        this.messageHandlers = new Map();
        this.io = null;
        this.isConnected = false;  // 연결 상태 추적
    }

    setSocketIO(io) {
        this.io = io;
    }ㄴ

    initialize() {
        this.client = mqtt.connect({
            host: mqttConfig.host,
            port: mqttConfig.port,
            protocol: mqttConfig.protocol,
            clientId: mqttConfig.clientId,
            clean: mqttConfig.clean,
            connectTimeout: mqttConfig.connectTimeout,
            reconnectPeriod: mqttConfig.reconnectPeriod,
            qos: mqttConfig.qos
        });

        this.client.on('connect', () => {
            if (!this.isConnected) {  // 최초 연결 시에만 로그
                console.log('MQTT Connected');
                this.isConnected = true;
            }
        });

        this.client.on('disconnect', () => {
            console.log('MQTT Disconnected');
            this.isConnected = false;
        });

        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
            this.isConnected = false;
        });

        this.client.on('reconnect', () => {
            console.log('MQTT Reconnecting...');
        });

        this.client.on('message', (topic, message) => {
            const value = message.toString();
            const timestamp = new Date().toISOString();
            
            // Socket.IO를 통해 클라이언트에 데이터 전송
            if (this.io) {
                const socketEvent = this.getSocketEventName(topic);
                this.io.emit(socketEvent, {
                    value: parseFloat(value),
                    timestamp: timestamp
                });
            }

            // 기존 메시지 핸들러 처리
            const handlers = this.messageHandlers.get(topic);
            if (handlers) {
                handlers.forEach(handler => handler(topic, message));
            }
        });
    }

    // 토픽을 Socket.IO 이벤트 이름으로 변환
    getSocketEventName(topic) {
        const parts = topic.split('/');
        if (parts.length >= 3) {
            const bed = parts[1].toLowerCase();
            const type = parts[2];
            return `${bed}_${type}`;
        }
        return topic;
    }

    subscribe(topic, handler) {
        this.client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to ${topic}`);
                if (!this.messageHandlers.has(topic)) {
                    this.messageHandlers.set(topic, new Set());
                }
                this.messageHandlers.get(topic).add(handler);
            } else {
                console.error(`Subscribe error for ${topic}:`, err);
            }
        });
    }

    publish(topic, message) {
        if (this.client?.connected) {
            this.client.publish(topic, message.toString());
        } else {
            console.error('MQTT client not connected');
        }
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const mqttService = new MQTTService();
module.exports = mqttService; 