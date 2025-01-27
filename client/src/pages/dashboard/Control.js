import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../../styles/Control.css';

const Control = () => {
  const [socket, setSocket] = useState(null);
  const [led1State, setLed1State] = useState(false);
  const [dcMotorDirection, setDcMotorDirection] = useState('stop');
  const [dcMotorSpeed, setDcMotorSpeed] = useState(50);
  const [motorState, setMotorState] = useState(false);

  const [timers, setTimers] = useState({
    led1: { startTime: '', endTime: '', enabled: false },
    motor: { startTime: '', endTime: '', enabled: false }
  });

  useEffect(() => {
    const newSocket = io(`${process.env.REACT_APP_WEBSOCKET_MQTT_URL}`, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('브라우저: 서버에 연결됨');
    });

    newSocket.on('led1_status', (status) => {
      console.log('브라우저: LED 상태 수신:', status);
      setLed1State(status === 'ON' || status === '1');
    });

    newSocket.on('motor_status', (status) => {
      console.log('브라우저: 모터 상태 수신:', status);
      setMotorState(status === 'ON' || status === '1');
    });

    newSocket.on('dcMotor_status', (status) => {
      console.log('브라우저: DC 모터 방향 상태 수신:', status);
      setDcMotorDirection(status.toLowerCase());
    });

    newSocket.on('dcMotor_speed', (speed) => {
      console.log('브라우저: DC 모터 속도 상태 수신:', speed);
      setDcMotorSpeed(parseInt(speed));
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const currentTime = new Date();
      const currentTimeString = currentTime.toTimeString().slice(0, 5);

      if (timers.led1.enabled) {
        if (currentTimeString === timers.led1.startTime) {
          toggleLED1(true);
        } else if (currentTimeString === timers.led1.endTime) {
          toggleLED1(false);
        }
      }

      if (timers.motor.enabled) {
        if (currentTimeString === timers.motor.startTime && !motorState) {
          toggleMotor(true);
        } else if (currentTimeString === timers.motor.endTime && motorState) {
          toggleMotor(false);
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timers, motorState]);

  useEffect(() => {
    if (socket) {
      socket.on('error', (error) => {
        if (error.type === 'led1_control') {
          console.error('LED 제어 실패:', error.message);
          setLed1State(prev => !prev);
        }
      });
    }
  }, [socket]);

  const handleTimerChange = (device, field, value) => {
    setTimers(prev => ({
      ...prev,
      [device]: {
        ...prev[device],
        [field]: value
      }
    }));
  };

  const toggleTimer = (device) => {
    setTimers(prev => ({
      ...prev,
      [device]: {
        ...prev[device],
        enabled: !prev[device].enabled
      }
    }));
  };

  const toggleLED1 = (forcedState = null) => {
    if (socket) {
      const newState = forcedState !== null ? forcedState : !led1State;
      const command = newState ? 'ON' : 'OFF';
      console.log('브라우저: LED 제어 명령 전송:', command);
      socket.emit('led1_control', command);
    }
  };

  const toggleMotor = (forcedState = null) => {
    if (socket) {
      const newState = forcedState !== null ? forcedState : !motorState;
      console.log('브라우저: 모터 제어 명령 전송:', newState ? 'ON' : 'OFF');
      socket.emit('motor_control', newState ? 'ON' : 'OFF');
    } else {
      console.log('브라우저: 소켓 연결 안됨');
    }
  };

  const controlDcMotor = (direction) => {
    if (socket) {
        console.log('브라우저: DC 모터 방향 명령 전송:', direction);
        socket.emit('dcMotor_direction', direction);
    }
  };

  const handleSpeedChange = (speed) => {
    if (socket) {
        console.log('브라우저: DC 모터 속도 명령 전송:', speed);
        socket.emit('dcMotor_speed', speed);
    }
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>장치조정</strong>
        <p>장치를 조정합니다.</p>
      </div>

      <div className="control-panel">
        {/* LED 제어 섹션 */}
        <div className="control-item">
          <h3>LED 1 제어</h3>
          <button 
            onClick={() => toggleLED1()}
            className={`led-button ${led1State ? 'on' : 'off'}`}
          >
            {led1State ? 'LED 1 OFF' : 'LED 1 ON'}
          </button>
          <div className="timer-controls">
            {/* LED 타이머 컨트롤 */}
            <div className="timer-header">
              <span>타이머 설정</span>
              <button 
                onClick={() => toggleTimer('led1')}
                className={timers.led1.enabled ? 'timer-on' : 'timer-off'}
              >
                {timers.led1.enabled ? '타이머 해제' : '타이머 설정'}
              </button>
            </div>
            <div className="timer-inputs">
              <div className="time-input-group">
                <label>켜지는 시간</label>
                <input
                  type="time"
                  value={timers.led1.startTime}
                  onChange={(e) => handleTimerChange('led1', 'startTime', e.target.value)}
                />
              </div>
              <div className="time-input-group">
                <label>꺼지는 시간</label>
                <input
                  type="time"
                  value={timers.led1.endTime}
                  onChange={(e) => handleTimerChange('led1', 'endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DC 모터 제어 섹션 */}
        <div className="control-item">
          <h3>DC motor 제어</h3>
          <div className="dc-motor-controls">
            <div className="direction-buttons">
              <button 
                onClick={() => controlDcMotor('LEFT')}
                className={`motor-button ${dcMotorDirection === 'left' ? 'on' : ''}`}
              >
                LEFT
              </button>
              <button 
                onClick={() => controlDcMotor('STOP')}
                className={`motor-button1 ${dcMotorDirection === 'stop' ? 'on' : ''}`}
              >
                STOP
              </button>
              <button 
                onClick={() => controlDcMotor('RIGHT')}
                className={`motor-button ${dcMotorDirection === 'right' ? 'on' : ''}`}
              >
                RIGHT
              </button>
            </div>
            <div className="speed-control">
              <label>속도 조절</label>
              <input
                type="range"
                min="0"
                max="255"
                value={dcMotorSpeed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
              />
              <span>{dcMotorSpeed}</span>
            </div>
          </div>
        </div>

        {/* 일반 모터 제어 섹션 */}
        <div className="control-item">
          <h3>모터 제어</h3>
          <button 
            onClick={() => toggleMotor()}
            className={`motor-button ${motorState ? 'on' : 'off'}`}
          >
            {motorState ? '모터 정지' : '모터 작동'}
          </button>
          <div className="timer-controls">
            {/* 모터 타이머 컨트롤 */}
            <div className="timer-header">
              <span>타이머 설정</span>
              <button 
                onClick={() => toggleTimer('motor')}
                className={timers.motor.enabled ? 'timer-on' : 'timer-off'}
              >
                {timers.motor.enabled ? '타이머 해제' : '타이머 설정'}
              </button>
            </div>
            <div className="timer-inputs">
              <div className="time-input-group">
                <label>켜지는 시간</label>
                <input
                  type="time"
                  value={timers.motor.startTime}
                  onChange={(e) => handleTimerChange('motor', 'startTime', e.target.value)}
                />
              </div>
              <div className="time-input-group">
                <label>꺼지는 시간</label>
                <input
                  type="time"
                  value={timers.motor.endTime}
                  onChange={(e) => handleTimerChange('motor', 'endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Control;