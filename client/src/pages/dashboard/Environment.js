import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../../styles/Environment.css';

const Environment = () => {
    const [selectedBed, setSelectedBed] = useState(1);
    const [sensorData, setSensorData] = useState({
        1: { temperature: '--', humidity: '--' },
        2: { temperature: '--', humidity: '--' },
        3: { temperature: '--', humidity: '--' },
        4: { temperature: '--', humidity: '--' }
    });
    const [waterData, setWaterData] = useState({
        waterTemp: '--',
        phLevel: '--',
        waterLevel: '--'
    });
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const socket = io('http://localhost:5004', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Socket connected to MQTT server');
        });

        // 베드별 센서 데이터 수신
        socket.on('temperature', (data) => {
            const { bed_number, value, timestamp } = data;
            setSensorData(prev => ({
                ...prev,
                [bed_number]: {
                    ...prev[bed_number],
                    temperature: parseFloat(value).toFixed(1)
                }
            }));
            setLastUpdate(timestamp);
        });

        socket.on('humidity', (data) => {
            const { bed_number, value, timestamp } = data;
            setSensorData(prev => ({
                ...prev,
                [bed_number]: {
                    ...prev[bed_number],
                    humidity: parseFloat(value).toFixed(1)
                }
            }));
            setLastUpdate(timestamp);
        });

        // 물탱크 데이터 수신
        socket.on('water_temp', (data) => {
            setWaterData(prev => ({ ...prev, waterTemp: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('ph_level', (data) => {
            setWaterData(prev => ({ ...prev, phLevel: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('water_level', (data) => {
            setWaterData(prev => ({ ...prev, waterLevel: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            console.log('Disconnecting socket');
            socket.disconnect();
        };
    }, []);

    return (
        <div className="environment-container">
            <div className="bed-selector">
                <h2>베드 선택</h2>
                <div className="bed-buttons">
                    {[1, 2, 3, 4].map((bedNum) => (
                        <button
                            key={bedNum}
                            className={`bed-button ${selectedBed === bedNum ? 'active' : ''}`}
                            onClick={() => setSelectedBed(bedNum)}
                        >
                            베드 {bedNum}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sensor-section">
                <h2>베드 {selectedBed} 센서 데이터</h2>
                <div className="sensor-grid">
                    <div className="sensor-card">
                        <h3>온도</h3>
                        <p className="sensor-value">{sensorData[selectedBed].temperature}°C</p>
                    </div>
                    <div className="sensor-card">
                        <h3>습도</h3>
                        <p className="sensor-value">{sensorData[selectedBed].humidity}%</p>
                    </div>
                </div>
            </div>

            <div className="water-tank-section">
                <h2>물탱크 데이터</h2>
                <div className="sensor-grid">
                    <div className="sensor-card">
                        <h3>수온</h3>
                        <p className="sensor-value">{waterData.waterTemp}°C</p>
                    </div>
                    <div className="sensor-card">
                        <h3>pH</h3>
                        <p className="sensor-value">{waterData.phLevel}</p>
                    </div>
                    <div className="sensor-card">
                        <h3>수위</h3>
                        <p className="sensor-value">{waterData.waterLevel}%</p>
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

export default Environment;