const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// 라우트 핸러 전에 로깅 미들웨어 추가
router.use('/login', (req, res, next) => {
    console.log('Login route accessed:', {
        method: req.method,
        headers: req.headers,
        body: req.body
    });
    next();
});

router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    
    // 데이터�이스에서 직접 사용자 확인
    const { data: user, error } = await supabase
      .from('register')  // 테이블명을 'register'로 변경
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.idx,
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        idx: user.idx,
        id: user.id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: '로그인에 실패했습니다.'
    });
  }
});

// GET /login 엔드포트 추가
router.get('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint is accessible',
    supportedMethods: ['GET', 'POST']
  });
});

// 루트 경로 핸들러 추가
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint is working'
  });
});

// 회원가입 ��우트 추가
router.post('/register', async (req, res) => {
  try {
    const { id, password, name, phone, address, email } = req.body;

    // 이미 존재하는 아이디인지 확인
    const { data: existingUser } = await supabase
      .from('register')
      .select('id')
      .eq('id', id)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 아이디입니다.'
      });
    }

    // 새 사용자 등록
    const { data: newUser, error } = await supabase
      .from('register')
      .insert([
        {
          id,
          password,
          name,
          phone,
          address,
          email,
          role: 'user' // 기본 역할 설정
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Register error:', error);
      return res.status(400).json({
        success: false,
        message: '회원가입에 실패했습니다.'
      });
    }

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
