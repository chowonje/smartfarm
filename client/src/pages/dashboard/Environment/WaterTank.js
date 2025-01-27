import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const WaterTank = () => {
    const [waterData, setWaterData] = useState({
        waterTemp: '--',
        phLevel: '--',
        waterLevel: '--'
    });
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const socket = io(`${process.env.REACT_APP_WEBSOCKET_MQTT_URL}`, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('WaterTank connected to MQTT server');
        });

        socket.on('watertank_temp', (data) => {
            setWaterData(prev => ({ ...prev, waterTemp: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('watertank_ph', (data) => {
            setWaterData(prev => ({ ...prev, phLevel: data.value }));
            setLastUpdate(data.timestamp);
        });

        socket.on('watertank_level', (data) => {
            setWaterData(prev => ({ ...prev, waterLevel: data.value }));
            setLastUpdate(data.timestamp);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
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
            {lastUpdate && (
                <div className="last-update">
                    <p>마지막 업데이트: {new Date(lastUpdate).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default WaterTank;