const express = require('express');
const router = express.Router();
const axios = require('axios');

// 서비스 함수 추가
async function getSeoulWeather() {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = "Seoul";
    const lang = "kr";
    
    if (!apiKey) {
      throw new Error('Weather API key is not configured');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${lang}&units=metric`;
    const response = await axios.get(url);
    
    return {
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      tempMin: response.data.main.temp_min,
      tempMax: response.data.main.temp_max,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    const city = req.query.city || "Seoul";
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('Weather API key is not configured');
    }

    const lang = "kr";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${lang}&units=metric`;
    
    const response = await axios.get(url);
    
    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      feelsLike: response.data.main.feels_like,
      tempMin: response.data.main.temp_min,
      tempMax: response.data.main.temp_max,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 위도/경도로 날씨 조회
router.get('/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    
    // 요청 파라미터 로깅
    console.log('받은 위도/경도:', { lat, lon });
    console.log('API Key:', apiKey ? '설정됨' : '설정되지 않음');

    if (!apiKey) {
      throw new Error('Weather API key is not configured');
    }

    if (!lat || !lon) {
      throw new Error('위도와 경도가 필요합니다.');
    }

    const lang = "kr";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=${lang}&units=metric`;
    
    // API 요청 URL 로깅
    console.log('OpenWeather API 요청 URL:', url);

    const response = await axios.get(url);
    
    // OpenWeather API 응답 로깅
    console.log('OpenWeather API 응답:', response.data);

    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      feelsLike: response.data.main.feels_like,
      tempMin: response.data.main.temp_min,
      tempMax: response.data.main.temp_max,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    };

    // 가공된 날씨 데이터 로깅
    console.log('클라이언트로 보내는 날씨 데이터:', weatherData);

    res.json(weatherData);
  } catch (error) {
    // 에러 상세 로깅
    console.error('Weather API 에러 상세:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 404) {
      res.status(404).json({ error: '해당 위치의 날씨 정보를 찾을 수 없습니다.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
module.exports.getSeoulWeather = getSeoulWeather; 