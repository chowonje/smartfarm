const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { sendFCMNotification } = require('../config/fcm');

let storedFcmToken = null;
let lastAlertTimes = {
    'wonje1/temperature': null,
    'wonje1/humidity': null
};

// 임계값 설정
const THRESHOLDS = {
    temperature: { min: 11, max: 12 },
    humidity: { min: 44, max: 80 }
};

// 알림 간격 설정 (5분 = 300000 밀리초)
const ALERT_INTERVAL = 5 * 60 * 1000;

// 알림 가능 여부 체크 함수
function canSendAlert(topic) {
    const lastAlertTime = lastAlertTimes[topic];
    const now = Date.now();
    
    if (!lastAlertTime || (now - lastAlertTime) >= ALERT_INTERVAL) {
        lastAlertTimes[topic] = now;
        return true;
    }
    return false;
}

// FCM 토큰 관련 엔드포인트
router.route('/fcm-token')
    .post(async (req, res) => {
        try {
            const { fcmToken } = req.body;
            if (!fcmToken) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'FCM 토큰이 필요합니다.' 
                });
            }
            storedFcmToken = fcmToken;
            console.log('FCM 토큰 저장됨:', storedFcmToken);
            res.json({ success: true, fcmToken: storedFcmToken });
        } catch (error) {
            console.error('FCM 토큰 저장 실패:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    })
    .get(async (req, res) => {
        try {
            res.json({ 
                success: true, 
                fcmToken: storedFcmToken 
            });
        } catch (error) {
            console.error('FCM 토큰 조회 실패:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

// 알림 목록 조회 엔드포인트
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .order('timestamp', { ascending: false });
            
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('알림 조회 실패:', error);
        res.status(500).json({ error: '알림 조회 실패' });
    }
});

// 읽지 않은 알림 개수 조회 엔드포인트
router.get('/unread', async (req, res) => {
    try {
        // 전체 알림 조회
        const { data: allAlerts, error: allError } = await supabase
            .from('alerts')
            .select('*')
            .order('timestamp', { ascending: false });

        // 읽지 않은 알림 조회
        const { data: unreadAlerts, error: unreadError } = await supabase
            .from('alerts')
            .select('*')
            .eq('read', false)
            .order('timestamp', { ascending: false });
            
        if (allError) throw allError;
        if (unreadError) throw unreadError;

        res.json({ 
            success: true,
            totalCount: allAlerts.length,
            unreadCount: unreadAlerts.length
        });
    } catch (error) {
        console.error('알림 개수 조회 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: '알림 개수 조회 실패'
        });
    }
});

// 알림 읽음 처리 엔드포인트
router.put('/read/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('alerts')
            .update({ read: true })
            .eq('id', id);
            
        if (error) throw error;

        res.json({ 
            success: true, 
            message: '알림이 읽음 처리되었습니다.' 
        });
    } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: '알림 읽음 처리 실패' 
        });
    }
});

// 알림 삭제 엔드포인트
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('alerts')
            .delete()
            .eq('id', id);
            
        if (error) throw error;

        res.json({ 
            success: true, 
            message: '알림이 삭제되었습니다.' 
        });
    } catch (error) {
        console.error('알림 삭제 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: '알림 삭제 실패' 
        });
    }
});

// MQTT 메시지 처리 함수
const handleMQTTMessage = async (topic, value) => {
    console.log('====== 알림 처리 시작 ======');
    
    let alertMessage = null;
    
    switch(topic) {
        case 'wonje1/temperature':
            if (value > THRESHOLDS.temperature.max) {
                alertMessage = `경고: 온도가 너무 높습니다! (현재: ${value}°C, 기준: ${THRESHOLDS.temperature.max}°C)`;
            } else if (value < THRESHOLDS.temperature.min) {
                alertMessage = `경고: 온도가 너무 낮습니다! (현재: ${value}°C, 기준: ${THRESHOLDS.temperature.min}°C)`;
            }
            break;
            
        case 'wonje1/humidity':
            if (value > THRESHOLDS.humidity.max) {
                alertMessage = `경고: 습도가 너무 높습니다! (현재: ${value}%, 기준: ${THRESHOLDS.humidity.max}%)`;
            } else if (value < THRESHOLDS.humidity.min) {
                alertMessage = `경고: 습도가 너무 낮습니다! (현재: ${value}%, 기준: ${THRESHOLDS.humidity.min}%)`;
            }
            break;
    }

    // alertMessage가 있고 5분이 지났으면 저장
    if (alertMessage && canSendAlert(topic)) {
        console.log(`${topic} 알림 전송 - 마지막 알림으로부터 ${ALERT_INTERVAL/1000}초 경과`);
        
        // FCM 알림 전송 (토큰이 있는 경우에만)
        if (storedFcmToken) {
            try {
                await sendFCMNotification(
                    'SmartFarm 경고 알림',
                    alertMessage,
                    storedFcmToken
                );
                console.log('FCM 알림 전송 성공');
            } catch (error) {
                console.error('FCM 알림 전송 실패:', error);
            }
        }

        // Supabase에 알림 저장
        try {
            const { data, error } = await supabase
                .from('alerts')
                .insert([{
                    title: 'SmartFarm 경고 알림',
                    body: alertMessage,
                    timestamp: new Date().toISOString(),
                    type: topic,
                    value: value,
                    read: false
                }]);

            if (error) throw error;
            console.log('알림 저장 성공:', data);
        } catch (error) {
            console.error('알림 저장 실패:', error);
        }
    } else if (alertMessage) {
        console.log(`${topic} 알림 스킵 - 마지막 알림으로부터 5분이 지나지 않음`);
    }
    
    console.log('====== 알림 처리 종료 ======\n');
};

module.exports = router;
module.exports.handleMQTTMessage = handleMQTTMessage; 