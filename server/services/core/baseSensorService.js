const mqtt = require('mqtt');
const { mqttConfig, getMQTTClient, topics } = require('../../config/mqtt');
const supabase = require('../../config/supabase');

class BaseSensorService {
    constructor(tableName, isWaterTank = false) {
        this.mqttClient = null;
        this.tableName = tableName;
        this.isWaterTank = isWaterTank;
        
        if (!isWaterTank) {
            this.bedsData = {
                bed1: {
                    bed_number: 1,
                    temperature: '--',
                    humidity: '--',
                    light_intensity: '--',
                    Gas: '--',
                    image_url: null,
                    created_at: null,
                    updated_at: null
                },
                bed2: {
                    bed_number: 2,
                    temperature: '--',
                    humidity: '--',
                    light_intensity: '--',
                    Gas: '--',
                    image_url: null,
                    created_at: null,
                    updated_at: null
                },
                bed3: {
                    bed_number: 3,
                    temperature: '--',
                    humidity: '--',
                    light_intensity: '--',
                    Gas: '--',
                    image_url: null,
                    created_at: null,
                    updated_at: null
                },
                bed4: {
                    bed_number: 4,
                    temperature: '--',
                    humidity: '--',
                    light_intensity: '--',
                    Gas: '--',
                    image_url: null,
                    created_at: null,
                    updated_at: null
                }
            };
        } else {
            this.tankData = {
                water_temperature: null,
                ph_level: null,
                water_level: null,
                created_at: null,
                updated_at: null
            };
        }
    }

    initialize() {
        this.setupMQTT();
        this.setupPeriodicSave();
    }

    setupMQTT() {
        try {
            // 싱글톤 MQTT 클라이언트 사용
            this.mqttClient = getMQTTClient();

            this.mqttClient.on('connect', () => {
                console.log(`${this.tableName} - MQTT Connected to ioko4613.iptime.org:993`);
                this.subscribeToTopics();
            });

            this.mqttClient.on('message', async (topic, message) => {
                await this.handleSensorData(topic, message);
            });

            this.mqttClient.on('error', (error) => {
                console.error(`${this.tableName} - MQTT Error:`, error);
            });

            this.mqttClient.on('close', () => {
                console.log(`${this.tableName} - MQTT Connection closed`);
            });

            this.mqttClient.on('reconnect', () => {
                console.log(`${this.tableName} - MQTT Reconnecting...`);
            });

        } catch (error) {
            console.error(`${this.tableName} - MQTT Setup Error:`, error);
        }
    }

    // 하위 클래스에서 구현할 메서드들
    subscribeToTopics() {
        throw new Error('Must be implemented by subclass');
    }

    handleSensorData(topic, message) {
        throw new Error('Must be implemented by subclass');
    }

    // 토픽에서 베드 번호 추출하는 유틸리티 메서드
    extractBedNumber(topic) {
        const parts = topic.split('/');
        for (const part of parts) {
            if (part.startsWith('bed')) {
                return parseInt(part.replace('bed', ''));
            }
        }
        return null;
    }

    async saveToDatabase() {
        try {
            const currentTime = new Date().toISOString();
            
            if (this.isWaterTank) {
                // 물탱크 데이터 저장 로직...
            } else {
                // 베드별 데이터 저장 (bed_sensor_data 테이블)
                for (const [bed, data] of Object.entries(this.bedsData)) {
                    // 센서 데이터가 하나라도 있는 경우에만 저장
                    if (data.temperature !== '--' || 
                        data.humidity !== '--' || 
                        data.light_intensity !== '--' || 
                        data.Gas !== '--') {
                        
                        const dataToSave = {
                            bed_number: data.bed_number,
                            temperature: this.validateNumeric(data.temperature),
                            humidity: this.validateNumeric(data.humidity),
                            light_intensity: this.validateNumeric(data.light_intensity),
                            Gas: this.validateNumeric(data.Gas),
                            image_url: null,
                            created_at: currentTime,
                            updated_at: currentTime
                        };
    
                        console.log(`Saving data for bed ${bed}:`, dataToSave);
                        const { error } = await supabase
                            .from('bed_sensor_data')
                            .insert([dataToSave]);
                        
                        if (error) {
                            console.error(`Database save error (bed ${bed}):`, error);
                        } else {
                            console.log(`Bed ${bed} data saved successfully:`, dataToSave);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Database save error:', error);
        }
    }
    validateNumeric(value) {
        if (value === null || value === undefined || value === '--') {
            return null;
        }
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
    }

    setupPeriodicSave() {
        setInterval(() => {
            this.saveToDatabase();
        }, 10 * 60 * 1000); // 10분으로 변경
    }
}

module.exports = BaseSensorService;