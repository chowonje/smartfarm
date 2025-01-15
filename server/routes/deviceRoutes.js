const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 장비 목록 조회
router.get('/devices', async (req, res) => {
  try {
    console.log('Fetching devices...');
    
    const { data, error } = await supabase
      .from('device_management')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Devices fetched:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: '데이터를 불러오는데 실패했습니다' });
  }
});

// 개별 장비 조회
router.get('/devices/:id', async (req, res) => {
  try {
    console.log('Fetching single device...');
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('device_management')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Device fetched:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: '데이터를 불러오는데 실패했습니다' });
  }
});

// 상태별 장비 조회
router.get('/devices/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const { data, error } = await supabase
      .from('device_management')
      .select('*')
      .eq('current_status', status);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '상태별 장비 조회에 실패했습니다' });
  }
});

// 위치별 장비 조회
router.get('/devices/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { data, error } = await supabase
      .from('device_management')
      .select('*')
      .eq('location', location);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '위치별 장비 조회에 실패했습니다' });
  }
});

// 보증기간 만료 예정 장비 조회
router.get('/devices/warranty-expiring', async (req, res) => {
  try {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const { data, error } = await supabase
      .from('device_management')
      .select('*')
      .lte('warranty_expiration', threeMonthsFromNow.toISOString())
      .gte('warranty_expiration', new Date().toISOString());

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '보증기간 만료 예정 장비 조회에 실패했습니다' });
  }
});

// 장비 등록
router.post('/devices', async (req, res) => {
  try {
    console.log('Creating device...');
    const {
      device_name,
      device_id,
      quantity,
      location,
      purchase_date,
      price,
      warranty_expiration,
      current_status,
      last_inspection_date,
      repair_history,
      replacement_history,
      disposal_date,
      responsible_person
    } = req.body;

    const { data, error } = await supabase
      .from('device_management')
      .insert([{
        device_name,
        device_id,
        quantity,
        location,
        purchase_date,
        price,
        warranty_expiration,
        current_status,
        last_inspection_date,
        repair_history,
        replacement_history,
        disposal_date,
        responsible_person,
        created_at: new Date()
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Device created:', data);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: '장비 등록에 실패했습니다' });
  }
});

// 장비 정보 수정
router.put('/devices/:id', async (req, res) => {
  try {
    console.log('Updating device...', req.body);
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const { data, error } = await supabase
      .from('device_management')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Device updated:', data);
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: '장비 정보 수정에 실패했습니다' });
  }
});

// 장비 삭제
router.delete('/devices/:id', async (req, res) => {
  try {
    console.log('Deleting device...');
    const { id } = req.params;

    const { error } = await supabase
      .from('device_management')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({ message: '장비가 성공적으로 삭제되었습니다' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: '장비 삭제에 실패했습니다' });
  }
});

module.exports = router; 