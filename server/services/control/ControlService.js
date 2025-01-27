const { topics, getMQTTClient } = require('../../config/mqtt');
const BaseSensorService = require('../core/baseSensorService');

class ControlService extends BaseSensorService {
    constructor() {
        super('control_status');
        this.io = null;
        this.currentData = {
            led1_status: 'OFF',
            motor_status: 'OFF',
            dcMotor_status: 'STOP',
            dcMotor_speed: 0,
            lastUpdate: null
        };
        this.lastLoggedStatus = {};  // 마지막으로 기록된 상태
        this.isSubscribed = false;   // 구독 상태 추적
    }

    initialize(io) {
        this.io = io;
        super.initialize();
        this.setupSocketHandlers();
        this.attemptSubscription();
        console.log('Control Service 초기화 완료');
    }

    attemptSubscription() {
        if (!this.isSubscribed) {
            this.subscribeToTopics();
            // 10초마다 구독 상태 확인
            setTimeout(() => this.attemptSubscription(), 10000);
        }
    }

    subscribeToTopics() {
        const subscribeTopics = [
            topics.control.led1.status,
            topics.control.motor.status,
            topics.control.dcMotor.status,
            topics.control.dcMotor.speed
        ];

        subscribeTopics.forEach(topic => {
            this.mqttClient.subscribe(topic, (err) => {
                if (err) {
                    console.error('토픽 구독 실패:', topic);
                    this.isSubscribed = false;
                } else {
                    if (!this.isSubscribed) {
                        console.log('토픽 구독 성공:', subscribeTopics.join(', '));
                        this.isSubscribed = true;
                    }
                }
            });
        });
    }

    handleSensorData(topic, message) {
        const status = message.toString();

        if (topic === topics.control.led1.status) {
            const ledStatus = status === '1' ? 'ON' : 'OFF';
            this.updateDeviceStatus('led1_status', ledStatus);
        }
        else if (topic === topics.control.motor.status) {
            const motorStatus = status === '1' ? 'ON' : 'OFF';
            this.updateDeviceStatus('motor_status', motorStatus);
        }
        else if (topic === topics.control.dcMotor.status) {
            this.updateDeviceStatus('dcMotor_status', status);
        }
        else if (topic === topics.control.dcMotor.speed) {
            this.updateDeviceStatus('dcMotor_speed', parseInt(status));
        }
    }

    updateDeviceStatus(type, status) {
        // 상태가 변경된 경우에만 로그 출력
        if (this.currentData[type] !== status) {
            console.log('디바이스 상태 변경:', { 
                type, 
                이전상태: this.currentData[type], 
                새상태: status 
            });
            
            this.currentData[type] = status;
            this.currentData.lastUpdate = new Date();
            
            if (this.io) {
                this.io.emit(type, status);
            }

            this.saveToDatabase({
                type: type,
                value: status,
                timestamp: new Date()
            });
        }
    }

    setupSocketHandlers() {
        if (!this.io) {
            console.error('Socket.IO가 초기화되지 않았습니다.');
            return;
        }

        this.io.on('connection', (socket) => {
            console.log('새로운 클라이언트 연결:', socket.id);
            this.sendCurrentState(socket);
            this.setupControlHandlers(socket);

            socket.on('disconnect', () => {
                console.log('클라이언트 연결 해제:', socket.id);
            });
        });
    }

    sendCurrentState(socket) {
        // 현재 상태를 클라이언트에 전송
        socket.emit('led1_status', this.currentData.led1_status);
        socket.emit('motor_status', this.currentData.motor_status);
        socket.emit('dcMotor_status', this.currentData.dcMotor_status);
        socket.emit('dcMotor_speed', this.currentData.dcMotor_speed);
    }

    setupControlHandlers(socket) {
        // LED 제어
        socket.on('led1_control', (command) => {
            console.log('LED1 제어 명령 수신:', command);
            try {
                const value = command === 'ON' ? '1' : '0';
                console.log('LED1 제어 토픽:', topics.control.led1.control);
                console.log('LED1 제어 값:', value);
                this.mqttClient.publish(topics.control.led1.control, value);
            } catch (error) {
                console.error('LED1 제어 실패:', error);
                socket.emit('error', { type: 'led1_control', message: error.message });
            }
        });

        // 모터 제어
        socket.on('motor_control', (command) => {
            console.log('모터 제어 명령 수신:', command);
            try {
                const value = command === 'ON' ? '1' : '0';
                console.log('모터 제어 토픽:', topics.control.motor.control);
                console.log('모터 제어 값:', value);
                this.mqttClient.publish(topics.control.motor.control, value);
            } catch (error) {
                console.error('모터 제어 실패:', error);
                socket.emit('error', { type: 'motor_control', message: error.message });
            }
        });

        // DC 모터 방향 제어
        socket.on('dcMotor_direction', (direction) => {
            console.log('DC 모터 방향 제어 명령 수신:', direction);
            try {
                this.mqttClient.publish(topics.control.dcMotor.control, direction);
            } catch (error) {
                console.error('DC 모터 방향 제어 실패:', error);
                socket.emit('error', { type: 'dcMotor_direction', message: error.message });
            }
        });

        // DC 모터 속도 제어
        socket.on('dcMotor_speed', (speed) => {
            console.log('DC 모터 속도 제어 명령 수신:', speed);
            try {
                this.mqttClient.publish(topics.control.dcMotor.speed, speed.toString());
            } catch (error) {
                console.error('DC 모터 속도 제어 실패:', error);
                socket.emit('error', { type: 'dcMotor_speed', message: error.message });
            }
        });
    }
}

module.exports = new ControlService();