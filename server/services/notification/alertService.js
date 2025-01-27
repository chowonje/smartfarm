const supabase = require('../../config/supabase');
const fcmConfig = require('../../config/fcm');

class AlertService {
    constructor() {
        this.storedFcmToken = null;
        this.lastAlertTimes = {
            'temperature': null,
            'humidity': null,
            'flame': null,
            'water_temperature': null,  // 수온 추가
            'ph': null,                // pH 추가
            'Gas': null                // co2를 gas로 변경
        };
        this.THRESHOLDS = {
            temperature: { min: 15, max: 30 },
            humidity: { min: 40, max: 70 },
            water_temperature: { min: 15, max: 24 },  // 수온 임계값
            ph: { min: 6.0, max: 7.0 },              // pH 임계값
            Gas: { min: 400, max: 1500 }             // co2를 gas로 변경
        };
        this.ALERT_INTERVAL = 20 * 60 * 1000; // 20분
    }

    setFCMToken(token) {
        this.storedFcmToken = token;
        console.log('FCM 토큰 설정됨:', token);
    }

    canSendAlert(sensorType) {
        const lastAlertTime = this.lastAlertTimes[sensorType];
        const now = Date.now();
        
        if (!lastAlertTime || (now - lastAlertTime) >= this.ALERT_INTERVAL) {
            this.lastAlertTimes[sensorType] = now;
            return true;
        }
        return false;
    }

    async processAlert(sensorType, value, bedNumber = null) {
        let alertMessage = null;

        if (sensorType === 'flame') {
            if (value === '1' || value === 1 || value.toLowerCase() === 'fire detected!') {
                alertMessage = `🔥 긴급: 화재가 감지되었습니다! 즉시 확인이 필요합니다!`;
                this.ALERT_INTERVAL = 1 * 60 * 1000;
            }
        } else {
            const numValue = parseFloat(value);
            const location = bedNumber ? `베드 ${bedNumber}의 ` : '';

            switch(sensorType) {
                case 'temperature':
                    if (numValue > this.THRESHOLDS.temperature.max) {
                        alertMessage = `경고: ${location}온도가 너무 높습니다! (현재: ${numValue}°C, 기준: ${this.THRESHOLDS.temperature.max}°C)`;
                    } else if (numValue < this.THRESHOLDS.temperature.min) {
                        alertMessage = `경고: ${location}온도가 너무 낮습니다! (현재: ${numValue}°C, 기준: ${this.THRESHOLDS.temperature.min}°C)`;
                    }
                    break;

                case 'humidity':
                    if (numValue > this.THRESHOLDS.humidity.max) {
                        alertMessage = `경고: ${location}습도가 너무 높습니다! (현재: ${numValue}%, 기준: ${this.THRESHOLDS.humidity.max}%)`;
                    } else if (numValue < this.THRESHOLDS.humidity.min) {
                        alertMessage = `경고: ${location}습도가 너무 낮습니다! (현재: ${numValue}%, 기준: ${this.THRESHOLDS.humidity.min}%)`;
                    }
                    break;

                case 'water_temperature':
                    if (numValue > this.THRESHOLDS.water_temperature.max) {
                        alertMessage = `경고: 수온이 너무 높습니다! (현재: ${numValue}°C, 기준: ${this.THRESHOLDS.water_temperature.max}°C)`;
                    } else if (numValue < this.THRESHOLDS.water_temperature.min) {
                        alertMessage = `경고: 수온이 너무 낮습니다! (현재: ${numValue}°C, 기준: ${this.THRESHOLDS.water_temperature.min}°C)`;
                    }
                    break;

                case 'ph':
                    if (numValue > this.THRESHOLDS.ph.max) {
                        alertMessage = `경고: pH가 너무 높습니다! (현재: ${numValue}, 기준: ${this.THRESHOLDS.ph.max})`;
                    } else if (numValue < this.THRESHOLDS.ph.min) {
                        alertMessage = `경고: pH가 너무 낮습니다! (현재: ${numValue}, 기준: ${this.THRESHOLDS.ph.min})`;
                    }
                    break;

                case 'Gas':
                    if (numValue > this.THRESHOLDS.Gas.max) {
                        alertMessage = `경고: ${location}가스 너무 높습니다! (현재: ${numValue}ppm, 기준: ${this.THRESHOLDS.Gas.max}ppm)`;
                    } else if (numValue < this.THRESHOLDS.Gas.min) {
                        alertMessage = `경고: ${location}가스 너무 낮습니다! (현재: ${numValue}ppm, 기준: ${this.THRESHOLDS.Gas.min}ppm)`;
                    }
                    break;
            }
        }

        if (alertMessage && this.canSendAlert(sensorType)) {
            await this.saveAndSendAlert(alertMessage, sensorType, value);
        }
    }

    async saveAndSendAlert(alertMessage, sensorType, value) {
        // FCM 알림 전송
        if (this.storedFcmToken) {
            try {
                await sendFCMNotification(
                    'SmartFarm 경고 알림',
                    alertMessage,
                    this.storedFcmToken
                );
                console.log('FCM 알림 전송 성공');
            } catch (error) {
                console.error('FCM 알림 전송 실패:', error);
            }
        }

        // Supabase에 알림 저장
        try {
            const { error } = await supabase
                .from('alerts')
                .insert([{
                    title: 'SmartFarm 경고 알림',
                    body: alertMessage,
                    timestamp: new Date().toISOString(),
                    type: sensorType,
                    value: value,
                    read: false
                }]);

            if (error) throw error;
            console.log('알림 저장 성공');
        } catch (error) {
            console.error('알림 저장 실패:', error);
        }
    }
}

module.exports = new AlertService();