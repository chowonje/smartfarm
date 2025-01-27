const BaseSensorService = require('../core/baseSensorService');
const { topics } = require('../../config/mqtt');
const alertService = require('../notification/alertService');
const supabase = require('../../config/supabase');

class WaterTankService extends BaseSensorService {
    constructor() {
        super('water_tank_data', true);
    }

    subscribeToTopics() {
        const topicsToSubscribe = [
            'Team4/watertank/temp',
            'Team4/watertank/ph',
            'Team4/watertank/level'
        ];

        this.mqttClient.subscribe(topicsToSubscribe, (err) => {
            if (!err) {
                // console.log('물탱크 센서 토픽 구독 성공');
            } else {
                // console.error('물탱크 센서 토픽 구독 실패:', err);
            }
        });
    }

    async handleSensorData(topic, message) {
        const value = parseFloat(message.toString());
        const [team, device, sensorType] = topic.split('/');

        switch(sensorType) {
            case 'temp':
                this.tankData.water_temperature = value;
                await alertService.processAlert('water_temperature', value);
                break;
            case 'ph':
                this.tankData.ph_level = value;
                await alertService.processAlert('ph_level', value);
                break;
            case 'level':
                this.tankData.water_level = value;
                await alertService.processAlert('water_level', value);
                break;
        }
    }

    getCurrentData() {
        return this.tankData;
    }

    async getLatestData() {
        const { data, error } = await supabase
            .from('water_tank_data')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching water tank data:', error);
            return null;
        }
        return data[0];
    }
}

module.exports = new WaterTankService();