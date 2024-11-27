const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/weather
router.get('/', async (req, res) => {
  try {
    const city = req.query.city || "Seoul";
    const apiKey = process.env.WEATHER_API_KEY;
    
    // API 키 확인
    console.log('Environment variables:', process.env);
    console.log('Weather API Key:', apiKey);
    
    if (!apiKey) {
      throw new Error('Weather API key is not configured');
    }

    const lang = "kr";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${lang}&units=metric`;
    
    console.log('Request URL:', url);

    const response = await axios.get(url);
    
    console.log('Weather API Response:', response.data);

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
    if (error.response?.status === 404) {
      res.status(404).json({ error: '도시를 찾을 수 없습니다.' });
    } else if (error.response?.status === 401) {
      res.status(401).json({ error: 'API 키가 유효하지 않습니다.' });
    } else {
      res.status(500).json({ error: '날씨 데이터를 가져오는데 실패했습니다.' });
    }
  }
});

module.exports = router; 