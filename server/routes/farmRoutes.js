const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// 인증 미들웨어
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.id;
        next();
    } catch (error) {
        console.error('인증 실패:', error);
        res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.'
        });
    }
};

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateAdmin);

// GET: 농장 목록 조회
router.get('/farms', async (req, res) => {
    try {
        const { data: farms, error } = await supabase
            .from('farms')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            farms
        });
    } catch (error) {
        console.error('농장 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '농장 목록을 불러오는데 실패했습니다.'
        });
    }
});

// POST: 새 농장 추가
router.post('/farms', async (req, res) => {
    try {
        const { name, location, description, port } = req.body;

        // 필수 필드 검증
        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: '농장 이름과 위치는 필수 입력 사항입니다.'
            });
        }

        // 새 농장 추가
        const { data: newFarm, error } = await supabase
            .from('farms')
            .insert([
                {
                    name,
                    location,
                    description,
                    port: port || '3000',
                    status: '활성',
                    created_by: req.adminId  // 관리자 ID 저장
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: '농장이 성공적으로 추가되었습니다.',
            farm: newFarm
        });
    } catch (error) {
        console.error('농장 추가 실패:', error);
        res.status(500).json({
            success: false,
            message: '농장 추가에 실패했습니다.'
        });
    }
});

// 특정 농장 조회
router.get('/farms/:id', async (req, res) => {
    try {
        const { data: farm, error } = await supabase
            .from('farms')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: '해당 농장을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            farm
        });
    } catch (error) {
        console.error('농장 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '농장 정보를 불러오는데 실패했습니다.'
        });
    }
});

// 농장 정보 수정
router.put('/farms/:id', async (req, res) => {
    try {
        const { name, location, description, port, status } = req.body;
        const { data: farm, error } = await supabase
            .from('farms')
            .update({
                name,
                location,
                description,
                port,
                status,
                updated_at: new Date()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: '농장 정보가 성공적으로 수정되었습니다.',
            farm
        });
    } catch (error) {
        console.error('농장 수정 실패:', error);
        res.status(500).json({
            success: false,
            message: '농장 정보 수정에 실패했습니다.'
        });
    }
});

// 농장 삭제
router.delete('/farms/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('farms')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({
            success: true,
            message: '농장이 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        console.error('농장 삭제 실패:', error);
        res.status(500).json({
            success: false,
            message: '농장 삭제에 실패했습니다.'
        });
    }
});

module.exports = router; 