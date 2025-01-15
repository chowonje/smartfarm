const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

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

// 개별 작물 일지 조회
router.get('/logs/:id', async (req, res) => {
  try {
    console.log('Fetching single crop diary...');
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('crop_diary')
      .select('*')
      .eq('id', id)
      .single();

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

// 작물 일지 생성 라우트 수정
router.post('/logs', async (req, res) => {
  try {
    console.log('Creating crop diary...');
    const {
      crop_name,
      status,
      manager,
      content,
      temperature,
      humidity,
      light,
      ec,
      water_temperature,
      ph_level,
      crop_type,
      bed_number,
      bed_sensor_id,
      water_tank_id
    } = req.body;

    const { data, error } = await supabase
      .from('crop_diary')
      .insert([{
        crop_name,
        status,
        manager,
        content,
        temperature,
        humidity,
        light,
        ec,
        water_temperature,
        ph_level,
        crop_type,
        bed_number,
        bed_sensor_id,
        water_tank_id,
        created_at: new Date()
      }])
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

// 작물 일지 수정 라우트 추가
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
      ph
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
        crop_type: null,
        bed_number: null,
        bed_sensor_id: null,
        water_tank_id: null,
        updated_at: new Date()
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
