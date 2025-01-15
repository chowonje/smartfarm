import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../../styles/Control.css';

const Control = () => {
  const [socket, setSocket] = useState(null);
  const [led1State, setLed1State] = useState(false);
  const [dcMotorDirection, setDcMotorDirection] = useState('stop');
  const [dcMotorSpeed, setDcMotorSpeed] = useState(50);
  const [motorState, setMotorState] = useState(false);

  // 타이머 상태 추가
  const [timers, setTimers] = useState({
    led1: { startTime: '', endTime: '', enabled: false },
    motor: { startTime: '', endTime: '', enabled: false }
  });

  useEffect(() => {
    const newSocket = io('http://localhost:5004', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    // LED와 모터 상태 업데이트를 위한 리스너 추가
    newSocket.on('led1_status', (status) => {
      setLed1State(status === 'ON' || status === '1');
    });

    newSocket.on('motor_status', (status) => {
      setMotorState(status === 'ON' || status === '1');
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // 타이머 체크 함수
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const currentTime = new Date();
      const currentTimeString = currentTime.toTimeString().slice(0, 5);

      // LED1 타이머 체크
      if (timers.led1.enabled) {
        if (currentTimeString === timers.led1.startTime) {
          toggleLED1(true);
        } else if (currentTimeString === timers.led1.endTime) {
          toggleLED1(false);
        }
      }

      // 모터 타이머 체크
      if (timers.motor.enabled) {
        if (currentTimeString === timers.motor.startTime && !motorState) {
          // 모터가 꺼져있을 때만 켜기
          toggleMotor(true);
        } else if (currentTimeString === timers.motor.endTime && motorState) {
          // 모터가 켜져있을 때만 끄기
          toggleMotor(false);
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timers]);

  // 타이머 설정 함수
  const handleTimerChange = (device, field, value) => {
    setTimers(prev => ({
      ...prev,
      [device]: {
        ...prev[device],
        [field]: value
      }
    }));
  };

  // 타이머 토글 함수
  const toggleTimer = (device) => {
    setTimers(prev => ({
      ...prev,
      [device]: {
        ...prev[device],
        enabled: !prev[device].enabled
      }
    }));
  };

  // 제어 함수 수정
  const toggleLED1 = (forcedState = null) => {
    const newState = forcedState !== null ? forcedState : !led1State;
    if (socket) {
      socket.emit('led1_control', newState ? 'ON' : 'OFF');
    }
    // 상태 업데이트는 서버로부터의 응답을 통해 이루어집니다.
  };

  const toggleDcMotor = (forcedState = null) => {
    const newState = forcedState !== null ? forcedState : (dcMotorDirection !== 'stop');
    if (socket) {
      socket.emit('dc_motor_control', { 
        direction: newState ? 'right' : 'stop',
        speed: dcMotorSpeed 
      });
    }
  };

  const toggleMotor = (forcedState = null) => {
    const newState = forcedState !== null ? forcedState : !motorState;
    if (socket) {
      socket.emit('motor_control', newState ? 'ON' : 'OFF');
    }
  };

  // DC 모터 제어 함수 수정
  const controlDcMotor = (direction) => {
    if (socket) {
      socket.emit('dc_motor_control', { direction, speed: dcMotorSpeed });
    }
    setDcMotorDirection(direction);
  };

  const handleSpeedChange = (speed) => {
    if (socket) {
      socket.emit('dc_motor_control', { direction: dcMotorDirection, speed });
    }
    setDcMotorSpeed(speed);
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>장치조정</strong>
        <p>장치를 조정합니다.</p>
      </div>

      <div className="control-panel">
        <div className="control-item">
          <h3>LED 1 제어</h3>
          <button 
            onClick={() => toggleLED1()}
            className={`led-button ${led1State ? 'on' : 'off'}`}
          >
            {led1State ? 'LED 1 OFF' : 'LED 1 ON'}
          </button>
          <div className="timer-controls">
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

        <div className="control-item">
          <h3>DC motor 제어</h3>
          <div className="dc-motor-controls">
            <div className="direction-buttons">
              <button 
                onClick={() => controlDcMotor('left')}
                className={`motor-button ${dcMotorDirection === 'left' ? 'on' : ''}`}
              >
                LEFT
              </button>
              <button 
                onClick={() => controlDcMotor('stop')}
                className={`motor-button1 ${dcMotorDirection === 'stop' ? 'on' : ''}`}
              >
                STOP
              </button>
              <button 
                onClick={() => controlDcMotor('right')}
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
                max="100"
                value={dcMotorSpeed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
              />
              <span>{dcMotorSpeed}%</span>
            </div>
          </div>
        </div>

        <div className="control-item">
          <h3>모터 제어</h3>
          <button 
            onClick={() => toggleMotor()}
            className={`motor-button ${motorState ? 'on' : 'off'}`}
          >
            {motorState ? '모터 정지' : '모터 작동'}
          </button>
          <div className="timer-controls">
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

