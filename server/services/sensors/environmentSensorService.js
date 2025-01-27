const { topics } = require('../../config/mqtt');
const BaseSensorService = require('../core/baseSensorService');
const alertService = require('../notification/alertService');
const mqttService = require('../core/mqttService');

class EnvironmentSensorService extends BaseSensorService {
    constructor() {
        super('bed_sensor_data', false);
        this.bedsData = {
            bed1: { bed_number: 1, temperature: '--', humidity: '--', light_intensity: '--', Gas: '--' },
            bed2: { bed_number: 2, temperature: '--', humidity: '--', light_intensity: '--', Gas: '--' },
            bed3: { bed_number: 3, temperature: '--', humidity: '--', light_intensity: '--', Gas: '--' },
            bed4: { bed_number: 4, temperature: '--', humidity: '--', light_intensity: '--', Gas: '--' }
        };
        this.io = null;
        this.mqttLogTime = null;
    }

    setSocketIO(io) {
        this.io = io;
        console.log('Socket.IO 인스턴스가 설정되었습니다.');
    }

    initialize() {
        this.mqttClient = mqttService.client;
        
        if (!this.mqttClient) {
            console.log('MQTT 클라이언트 연결 대기 중...');
            setTimeout(() => this.initialize(), 1000);
            return;
        }

        const topics = [
            'Team4/bed1/temp', 'Team4/bed1/humi', 'Team4/bed1/light', 'Team4/bed1/Gas',
            'Team4/bed2/temp', 'Team4/bed2/humi', 'Team4/bed2/light', 
            'Team4/bed3/temp', 'Team4/bed3/humi', 'Team4/bed3/light', 
            'Team4/bed4/temp', 'Team4/bed4/humi', 'Team4/bed4/light', 'Team4/bed4/Gas',
            'Team4/Flame'
        ];

        this.mqttClient.on('connect', () => {
            this.subscribeToTopics(topics);
            console.log('MQTT 연결됨');
        });

        this.mqttClient.on('message', async (topic, message) => {
            await this.handleSensorData(topic, message);
        });
    }

    subscribeToTopics(topics) {
        topics.forEach(topic => {
            this.mqttClient.subscribe(topic, (err) => {
                const currentTime = new Date();
                if (err) {
                    if (!this.mqttLogTime || (currentTime - this.mqttLogTime) >= 2 * 60 * 1000) {
                        console.error(`토픽 구독 실패: ${topic}`, err);
                        this.mqttLogTime = currentTime;
                    }
                } else {
                    if (!this.mqttLogTime || (currentTime - this.mqttLogTime) >= 2 * 60 * 1000) {
                        console.log(`토픽 구독 성공: ${topic}`);
                        this.mqttLogTime = currentTime;
                    }
                }
            });
        });
    }

    async handleSensorData(topic, message) {
        const value = parseFloat(message.toString());
        const [team, bed, sensorType] = topic.split('/');

        if (!this.bedsData[bed]) {
            console.error(`알 수 없는 베드: ${bed}`);
            return;
        }

        switch(sensorType) {
            case 'temp':
                this.bedsData[bed].temperature = value;
                if (this.io) this.io.emit(`${bed}_temp`, { value, timestamp: Date.now() });
                await alertService.processAlert('temperature', value, bed.replace('bed', ''));
                break;
            case 'humi':
                this.bedsData[bed].humidity = value;
                if (this.io) this.io.emit(`${bed}_humi`, { value, timestamp: Date.now() });
                await alertService.processAlert('humidity', value, bed.replace('bed', ''));
                break;
            case 'light':
                this.bedsData[bed].light_intensity = value;
                if (this.io) this.io.emit(`${bed}_light`, { value, timestamp: Date.now() });
                break;
            case 'Gas':
                this.bedsData[bed].Gas = value;
                if (this.io) this.io.emit(`${bed}_Gas`, { value, timestamp: Date.now() });
                break;
        }

        // 전체 데이터 업데이트 이벤트 발생
        if (this.io) {
            this.io.emit('environment_data', this.bedsData);
        }

        // 데이터베이스에 저장
        await this.saveToDatabase();

        // 2분에 한 번만 로그 출력
        if (new Date().getMinutes() % 2 === 0) {
            console.log(`Sensor data saved for topic: ${topic} at ${new Date().toISOString()}`);
        }
    }

    getBedData(bedNumber) {
        return this.bedsData[`bed${bedNumber}`];
    }

    getAllBedsData() {
        return this.bedsData;
    }
}

module.exports = new EnvironmentSensorService();