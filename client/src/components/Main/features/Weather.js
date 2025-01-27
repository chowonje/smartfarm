import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Weather({ activeTab, selectedLocation }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 천호역의 기본 위치 정보
  const defaultLocation = {
    latitude: 37.5386,
    longitude: 127.1254,
    address: '천호역',
  };

  // 실제 사용할 위치 정보 (선택된 위치가 있으면 그 위치, 없으면 기본 위치 사용)
  const locationToUse = selectedLocation || defaultLocation;

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_SERVER_API_URL}/api/weather?lat=${lat}&lon=${lon}`);
      if (response.data) {
        setWeather(response.data);
        setError(null);
      }
    } catch (error) {
      console.error('날씨 데이터를 불러오는데 실패했습니다:', error);
      setError('날씨 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'weather') {
      fetchWeather(locationToUse.latitude, locationToUse.longitude);
    }
  }, [activeTab, selectedLocation]);

  if (activeTab !== 'weather') return null;

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!weather) {
    return <div className="no-weather">날씨 정보가 없습니다.</div>;
  }

  return (
    <div className="weather-container">
      <h2>
        {locationToUse.address || locationToUse.place_name || weather.city}의 날씨
      </h2>
      <div className="weather-info">
        <div className="weather-main">
          <h3>{Math.round(weather.temperature)}°C</h3>
          <p>{weather.description}</p>
        </div>
        <div className="weather-details">
          <p>체감온도: {Math.round(weather.feelsLike)}°C</p>
          <p>습도: {weather.humidity}%</p>
          <p>풍속: {weather.windSpeed}m/s</p>
          <p>최저기온: {Math.round(weather.tempMin)}°C</p>
          <p>최고기온: {Math.round(weather.tempMax)}°C</p>
        </div>
        <div className="sun-times">
          <p>일출: {new Date(weather.sunrise).toLocaleTimeString()}</p>
          <p>일몰: {new Date(weather.sunset).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

export default Weather;
