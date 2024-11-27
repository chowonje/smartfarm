require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 환경변수 로드 확인
console.log('Server starting with API key:', process.env.NEWS_API_KEY ? 'Found' : 'Not Found');

const app = express();

// 보안 헤더 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://newsapi.org"]
    }
  }
}));

// 기본 미들웨어 설정
app.use(cors());
app.use(express.json());

// 포트 설정
const port = process.env.PORT || 3001;

// 라우트 설정
app.use('/api/news', require('./routes/news'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/map', require('./routes/map'));
app.use('/api/price', require('./routes/price'));

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
