const mqtt = require('mqtt');

const mqttConfig = {
    host: 'ioko4613.iptime.org',
    port: 993,
    protocol: 'mqtt',
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`
};

const topics = {
    environment: {
        temperature: 'wonje1/temperature',
        humidity: 'wonje1/humidity',
        waterTemp: 'wonje1/water/temp',
        waterPh: 'wonje1/water/ph',
        waterLevel: 'wonje1/water/level'
    },
    control: {
        led1: {
            status: 'wonje1/led1/status',
            control: 'wonje1/led1/control'
        },
        dcMotor: {
            status: 'dc_motor/status',
            control: 'dc_motor/control'
        },
        motor: {
            status: 'wonje1/motor/status',
            control: 'wonje1/motor/control'
        }
    }
};

// 싱글톤 MQTT 클라이언트
let mqttClient = null;

const getMQTTClient = () => {
    if (!mqttClient) {
        mqttClient = mqtt.connect(mqttConfig);
        mqttClient.on('connect', () => {
            console.log('MQTT 브로커에 연결됨');
        });
        mqttClient.on('error', (error) => {
            console.error('MQTT 오류:', error);
        });
    }
    return mqttClient;
};

// 여기서 getMQTTClient를 export 하는 것이 중요합니다
module.exports = { mqttConfig, topics, getMQTTClient };    