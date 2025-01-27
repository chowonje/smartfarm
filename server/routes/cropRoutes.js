const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const fetch = require('node-fetch');

// 작물 일지 조회
router.get('/logs', async (req, res) => {
  try {
    console.log('Fetching crop diary...');
    
    const { data, error } = await supabase
      .from('crop_diary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Data fetched:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching crop diary:', error);
    res.status(500).json({ error: '데이터를 불러오는데 실패했습니다' });
  }
});

// 날씨 데이터 포맷팅 유틸리티 함수
const formatWeatherData = (weatherData) => {
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.toLocaleTimeString()}`;
  };

  // 날씨 데이터가 없는 경우 빈 문자열 반환
  if (!weatherData) {
    return {
      weather_temp: '',
      weather_desc: '',
      weather_feels_like: '',
      weather_humidity: '',
      weather_wind_speed: '',
      weather_temp_min: '',
      weather_temp_max: '',
      weather_sunrise: '',
      weather_sunset: ''
    };
  }

  return {
    weather_temp: weatherData.temperature?.toString() || '',
    weather_desc: weatherData.description || '',
    weather_feels_like: weatherData.feelsLike?.toString() || '',
    weather_humidity: weatherData.humidity?.toString() || '',
    weather_wind_speed: weatherData.windSpeed?.toString() || '',
    weather_temp_min: weatherData.tempMin?.toString() || '',
    weather_temp_max: weatherData.tempMax?.toString() || '',
    weather_sunrise: formatDateTime(weatherData.sunrise) || '',
    weather_sunset: formatDateTime(weatherData.sunset) || ''
  };
};

// 작물 일지 상세 조회
router.get('/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('crop_diary')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: '작물 일지를 찾을 수 없습니다' });
    }

    // 데이터베이스에서 가져온 날씨 데이터를 그대로 사용
    const responseData = {
      ...data,
      // 날씨 데이터는 데이터베이스에 저장된 값을 그대로 사용
      weather_temp: data.weather_temp,
      weather_desc: data.weather_desc,
      weather_feels_like: data.weather_feels_like,
      weather_humidity: data.weather_humidity,
      weather_wind_speed: data.weather_wind_speed,
      weather_temp_min: data.weather_temp_min,
      weather_temp_max: data.weather_temp_max,
      weather_sunrise: data.weather_sunrise,
      weather_sunset: data.weather_sunset
    };

    console.log('Fetched crop diary:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching crop diary:', error);
    res.status(500).json({ error: '작물 일지 조회에 실패했습니다' });
  }
});

// 날씨 데이터 가져오는 유틸리티 함수
const fetchWeatherData = async () => {
  try {
    const weatherResponse = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/weather`);
    const weatherData = await weatherResponse.json();
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

// 작물 일지 생성 라우트
router.post('/logs', async (req, res) => {
  try {
    console.log('Creating crop diary...');
    
    // 날씨 데이터 자동 조회
    const weatherData = await fetchWeatherData();
    const formattedWeatherData = formatWeatherData(weatherData);

    // 클라이언트 데이터와 날씨 데이터 병합
    const combinedData = {
      ...req.body,
      ...formattedWeatherData,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crop_diary')
      .insert([combinedData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Data created:', data);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating crop diary:', error);
    res.status(500).json({ error: '작물 일지 생성에 실패했습니다' });
  }
});

// 작물 일지 수정 라우트
router.put('/logs/:id', async (req, res) => {
  try {
    console.log('Updating crop diary...', req.body);
    const { id } = req.params;
    
    const {
      crop_name,
      status,
      manager,
      content,
      temperature,
      humidity,
      light,
      ec,
      water_temp,
      ph,
      Gas
      // 날씨 데이터는 제외
    } = req.body;

    const { data, error } = await supabase
      .from('crop_diary')
      .update({
        crop_name,
        status,
        manager,
        content,
        temperature,
        humidity,
        light,
        ec,
        water_temperature: water_temp,
        ph_level: ph,
        Gas,
        updated_at: new Date()
        // 날씨 데이터 필드 제외
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Data updated:', data);
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating crop diary:', error);
    res.status(500).json({ error: '작물 일지 수정에 실패했습니다' });
  }
});

// 물탱크 데이터 조회
router.get('/water-tank-data', async (req, res) => {
  try {
    const { date, time } = req.query;
    let query = supabase
      .from('water_tank_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 날짜와 시간 필터링
    if (date) {
      const startDateTime = time 
        ? new Date(`${date}T${time}:00`) 
        : new Date(`${date}T00:00:00`);
      
      const endDateTime = time 
        ? new Date(`${date}T${time}:59`) 
        : new Date(`${date}T23:59:59`);
      
      query = query
        .gte('created_at', startDateTime.toISOString())
        .lte('created_at', endDateTime.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: '해당 날짜의 데이터가 없습니다.' 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching water tank data:', error);
    res.status(500).json({ 
      error: '물탱크 데이터를 불러오는데 실패했습니다' 
    });
  }
});

// 베드 센서 데이터 조회
router.get('/bed-sensor-data', async (req, res) => {
  try {
    const { date, time, bed_number } = req.query;
    let query = supabase
      .from('bed_sensor_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 베드 번호 필터링
    if (bed_number) {
      query = query.eq('bed_number', parseInt(bed_number));
    }
    
    // 날짜와 시간 필터링
    if (date) {
      const startDateTime = time 
        ? new Date(`${date}T${time}:00`) 
        : new Date(`${date}T00:00:00`);
      
      const endDateTime = time 
        ? new Date(`${date}T${time}:59`) 
        : new Date(`${date}T23:59:59`);
      
      query = query
        .gte('created_at', startDateTime.toISOString())
        .lte('created_at', endDateTime.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    if (data.length === 0) {
      return res.status(404).json({ 
        error: '해당 조건의 데이터가 없습니다.' 
      });
    }

    console.log('Bed sensor data fetched:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching bed sensor data:', error);
    res.status(500).json({ 
      error: '베드 센서 데이터를 불러오는데 실패했습니다' 
    });
  }
});

module.exports = router;
