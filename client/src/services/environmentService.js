import { io } from 'socket.io-client';

export const saveToDatabase = async (bedNumber, sensorData) => {
  try {
    await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/environment/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bed_number: bedNumber,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        light: sensorData.light,
        created_at: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

// 특정 베드의 환경 데이터 조회
export const getEnvironmentData = async (bedNumber) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/environment/bed/${bedNumber}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return null;
  }
};

// 실시간 데이터 구독을 위한 Socket.IO 연결
export const subscribeToRealTimeData = (bedNumber, callback) => {
  const socket = io(`${process.env.REACT_APP_SERVER_API_URL}`, {
    withCredentials: true,
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on(`bed${bedNumber}/data`, (data) => {
    callback(data);
  });

  return () => socket.disconnect();
};
