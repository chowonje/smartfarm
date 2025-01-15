const { getMQTTClient, topics } = require('../config/mqtt');

class MqttService {
    constructor() {
        this.client = null;
        this.io = null;
    }

    initialize(io) {
        this.io = io;
        this.client = getMQTTClient();

        // 제어 관련 토픽만 구독
        const controlTopics = [
            topics.control.led1.status,
            topics.control.dcMotor.status,
            topics.control.motor.status
        ];

        this.client.subscribe(controlTopics);
        this.setupMessageHandlers();
        this.setupSocketHandlers();
    }

    setupMessageHandlers() {
        this.client.on('message', (topic, message) => {
            const value = message.toString();
            
            switch(topic) {
                case topics.control.led1.status:
                    this.io.emit('led1_status', value);
                    console.log('LED1 status updated:', value);
                    break;
                case topics.control.dcMotor.status:
                    this.io.emit('dc_motor_status', value);
                    console.log('DC Motor status updated:', value);
                    break;
                case topics.control.motor.status:
                    this.io.emit('motor_status', value);
                    console.log('Motor status updated:', value);
                    break;
            }
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Control client connected');

            socket.on('led1_control', (command) => {
                this.client.publish(topics.control.led1.control, command);
            });

            socket.on('dc_motor_control', (command) => {
                this.client.publish(topics.control.dcMotor.control, command);
            });

            socket.on('motor_control', (command) => {
                this.client.publish(topics.control.motor.control, command);
            });

            socket.on('disconnect', () => {
                console.log('Control client disconnected');
            });
        });
    }
}

module.exports = new MqttService();
