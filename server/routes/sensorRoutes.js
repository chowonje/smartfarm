const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 마지막 저장 시간
let lastSaveTime = null;

// 임시 데이터 저장소
let tempData = {
    temperature: null,
    humidity: null
};

// 저장 간격 설정 (10분 = 600000 밀리초)
const SAVE_INTERVAL = 10 * 60 * 1000;

// 저장 가능 여부 체크 함수
function canSaveData() {
    const now = Date.now();
    if (!lastSaveTime || (now - lastSaveTime) >= SAVE_INTERVAL) {
        lastSaveTime = now;
        return true;
    }
    return false;
}

// 베든 베드의 센서 데이터 조회
router.get('/bed', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bed_sensor_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('베드 센서 데이터 조회 실패:', error);
        res.status(500).json({ error: '베드 센서 데이터 조회 실패' });
    }
});

// 물든 물탱크 데이터 조회
router.get('/water-tank', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('water_tank_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('물탱크 데이터 조회 실패:', error);
        res.status(500).json({ error: '물탱크 데이터 조회 실패' });
    }
});

// 센서 데이터 저장 함수
const handleSensorData = async (topic, value) => {
    try {
        console.log('====== 센서 데이터 처리 시작 ======');
        const [prefix, sensorType] = topic.split('/');
        
        // 임시 데이터 업데이트
        if (sensorType === 'temperature') {
            tempData.temperature = parseFloat(value);
        } else if (sensorType === 'humidity') {
            tempData.humidity = parseFloat(value);
        }

        // 두 데이터가 모두 있고, 10분이 지났으면 저장
        if (tempData.temperature !== null && 
            tempData.humidity !== null && 
            canSaveData()) {
            
            const timestamp = new Date().toISOString();
            const sensorData = {
                bed_number: 1,
                temperature: tempData.temperature,
                humidity: tempData.humidity,
                updated_at: timestamp
            };

            const { error } = await supabase
                .from('bed_sensor_data')
                .insert([sensorData]);

            if (error) throw error;
            console.log('베드 1 센서 데이터 저장 완료:', sensorData);

            // 임시 데이터 초기화
            tempData = {
                temperature: null,
                humidity: null
            };
        } else {
            console.log('데이터 수집 중...', tempData);
        }

        console.log('====== 센서 데이터 처리 완료 ======\n');
    } catch (error) {
        console.error('센서 데이터 처리 실패:', error);
    }
};

module.exports = router;
module.exports.handleSensorData = handleSensorData; 