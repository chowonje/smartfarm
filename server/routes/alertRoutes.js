const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const alertService = require('../services/notification/alertService');

// FCM 토큰 설정
router.post('/fcm-token', async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({ success: false, error: 'FCM 토큰이 필요합니다.' });
        }
        alertService.setFCMToken(fcmToken);
        res.json({ success: true });
    } catch (error) {
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



module.exports = router; 