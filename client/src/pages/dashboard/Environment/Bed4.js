import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../../../styles/Environment.css';

const Bed4 = () => {
    const [sensorData, setSensorData] = useState({
        temperature: '--',
        humidity: '--',
        light: '--',
        Gas: '--'
    });
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const socket = io(`${process.env.REACT_APP_WEBSOCKET_MQTT_URL}`, {
            withCredentials: true,
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Bed4 connected to MQTT server');
        });

        socket.on('connect_error', (error) => {
            console.log('Connection error:', error);
        });

        socket.on('bed4_temp', (data) => {
            console.log('Temperature data received:', data);
            setSensorData(prev => ({ ...prev, temperature: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('bed4_humi', (data) => {
            console.log('Humidity data received:', data);
            setSensorData(prev => ({ ...prev, humidity: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('bed4_light', (data) => {
            console.log('Light data received:', data);
            setSensorData(prev => ({ ...prev, light: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('bed4_Gas', (data) => {
            console.log('Gas data received:', data);
            setSensorData(prev => ({ ...prev, Gas: data.value }));
            setLastUpdate(data.timestamp);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className="bed-container">
            <div className="bed-content-wrapper">
                <div className="sensor-section">
                    <h2>베드 4 센서 데이터</h2>
                    <div className="sensor-grid">
                        <div className="sensor-card">
                            <h3>온도</h3>
                            <p className="sensor-value">{sensorData.temperature}°C</p>
                        </div>
                        <div className="sensor-card">
                            <h3>습도</h3>
                            <p className="sensor-value">{sensorData.humidity}%</p>
                        </div>
                        <div className="sensor-card">
                            <h3>조도</h3>
                            <p className="sensor-value">{sensorData.light}</p>
                        </div>
                        <div className="sensor-card">
                            <h3>가스</h3>
                            <p className="sensor-value">{sensorData.Gas} ppm</p>
                        </div>
                    </div>
                </div>

                <div className={`camera-section ${isFullscreen ? 'fullscreen' : ''}`}>
                    <div className="camera-header">
                        <h3>실시간 카메라</h3>
                        <button 
                            className="fullscreen-button"
                            onClick={handleFullscreen}
                        >
                            {isFullscreen ? '축소' : '전체화면'}
                        </button>
                    </div>
                    <div className="camera-container">
                        <img 
                            src="http://192.168.0.4:81/stream"
                            alt="Bed 4 Camera Stream"
                            className="camera-stream"
                        />
                    </div>
                </div>
            </div>

            {lastUpdate && (
                <div className="last-update">
                    <p>마지막 업데이트: {new Date(lastUpdate).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default Bed4;