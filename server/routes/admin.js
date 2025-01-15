const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../middleware/authMiddleware');
const db = require('../config/supabase');
const { generateAdminToken } = require('../utils/jwt');

// 관리자 로그인 페이지 렌더링 (GET 요청)
router.get('/login', (req, res) => {
    res.json({
        success: true,
        message: '관리자 로그인 페이지입니다.'
    });
});

// 관리자 로그인 처리 (POST 요청)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: admin, error } = await db
            .from('admin')
            .select('*')
            .eq('email', email)
            .single();

        if (error) throw error;

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: '관리자 계정이 존재하지 않습니다.'
            });
        }

        if (password !== admin.password) {
            return res.status(401).json({
                success: false,
                message: '비밀번호가 일치하지 않습니다.'
            });
        }

        const token = generateAdminToken(admin);
        
        res.json({ 
            success: true, 
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 관리자 대시보드 (인증 필요)
router.get('/', checkAdmin, async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: '관리자 접근 성공',
            user: req.user 
        });
    } catch (error) {
        console.error('Admin access error:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 사용자 목록 조회 (인증 필요)
router.get('/users', checkAdmin, async (req, res) => {
    try {
        const { data: users, error } = await db
            .from('register')  // register 테이블에서 사용자 조회
            .select('*');

        if (error) throw error;

        res.json({ 
            success: true, 
            users 
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 농장 목록 조회 (인증 필요)
router.get('/farms', checkAdmin, async (req, res) => {
    try {
        const { data: farms, error } = await db
            .from('farms')  // farms 테이블에서 조회
            .select('*');

        if (error) throw error;

        res.json({ 
            success: true, 
            farms 
        });
    } catch (error) {
        console.error('Farms list error:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 사용자 삭제 엔드포인트 추가
router.delete('/users/:id', checkAdmin, async (req, res) => {
    try {
        const { error } = await db
            .from('register')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ 
            success: true, 
            message: '사용자가 삭제되었습니다.' 
        });
    } catch (error) {
        console.error('User delete error:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

module.exports = router;