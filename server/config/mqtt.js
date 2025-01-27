const mqtt = require('mqtt');

const mqttConfig = {
    host: 'ioko4613.iptime.org',
    port: 993,
    protocol: 'mqtt',
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    qos: 1
};

const topics = {
    control: {
        led1: {
            status: 'wonje1/led1/status',
            control: 'wonje1/led1/control'
        },
        motor: {
            status: 'wonje1/motor/status',
            control: 'wonje1/motor/control'
        },
        dcMotor: {
            status: 'wonje1/dcMotor/status',
            control: 'wonje1/dcMotor/control',
            speed: 'wonje1/dcMotor/speed'
        }
    },
    environment: {
        bed1: {
            temperature: 'Team4/bed1/temp',
            humidity: 'Team4/bed1/humi',
            light: 'Team4/bed1/light',
            GAS: 'Team4/bed1/Gas'
        },
        bed2: {
            temperature: 'Team4/bed2/temp',
            humidity: 'Team4/bed2/humi',
            light: 'Team4/bed2/light'
        },
        bed3: {
            temperature: 'Team4/bed3/temp',
            humidity: 'Team4/bed3/humi',
            light: 'Team4/bed3/light'
        },
        bed4: {
            temperature: 'Team4/bed4/temp',
            humidity: 'Team4/bed4/humi',
            light: 'Team4/bed4/light',
           GAS: 'Team4/bed4/Gas'
        }
    },
    flame: {
        status: 'Team4/Flame'
    },
    light: {
        bed1: 'Team4/bed1/light',
        bed2: 'Team4/bed2/light',
        bed3: 'Team4/bed3/light',
        bed4: 'Team4/bed4/light'
    },
    waterTank: {
        temperature: 'Team4/watertank/temp',
        ph: 'Team4/watertank/ph',
        level: 'Team4/watertank/level'
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