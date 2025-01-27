require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

// CORS 설정
app.use(cors({
  origin: [
    `${process.env.REACT_APP_FRONT_API_URL}`, 
    `${process.env.REACT_APP_ADMIN_API_URL}`,  // 관리자 페이지용 포트 추가
    `${process.env.REACT_APP_FRONT_API_URL}`
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 허용할 HTTP 메서드 명시
  allowedHeaders: ['Content-Type', 'Authorization']  // 허용할 헤더 명시
}));

// Helmet 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://www.gstatic.com",
        "https://*.googleapis.com"
      ],
      styleSrcElem: [
        "'self'", 
        "'unsafe-inline'", 
        "https://www.gstatic.com",
        "https://*.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'", 
        "https://dapi.kakao.com",
        "https://*.kakao.com",
        "https://t1.daumcdn.net",
        "https://spi.maps.daum.net",
        "https://*.googleapis.com",
        "https://www.gstatic.com"
      ],
      imgSrc: [
        "'self'", 
        "https:", 
        "data:", 
        "https://dapi.kakao.com", 
        "https://t1.daumcdn.net",
        "https://*.kakao.com",
        "https://spi.maps.daum.net"
      ],
      connectSrc: [
        "'self'",
        `${process.env.REACT_APP_SERVER_API_URL}`,
        `${process.env.REACT_APP_FRONT_API_URL}`,
        `${process.env.REACT_APP_ADMIN_API_URL}`,
        `${process.env.REACT_APP_FRONT_API_URL}`,
        "https://newsapi.org",
        "https://dapi.kakao.com",
        "https://*.kakao.com",
        "http://www.kamis.co.kr",
        "https://api.openweathermap.org",
        "https://spi.maps.daum.net",
        "https://*.maps.daum.net",
        "https://*.googleapis.com",
        "https://fcmregistrations.googleapis.com"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://dapi.kakao.com"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// 요청 로깅 미들웨어를 라우터 등록 전에 배치
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://www.gstatic.com;"
  );
  next();
});

// cookie 파싱 미들웨어
app.use(cookieParser());

// JSON 파싱 미들웨어
app.use(express.json());

// API 라우트
const sensorRoutes = require('./routes/sensorRoutes');
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const weatherRouter = require('./routes/weather');
const mapRoutes = require('./routes/map');
const priceRoutes = require('./routes/price');
const adminRoutes = require('./routes/admin');
const cropRoutes = require('./routes/cropRoutes');
const chatgptRoutes = require('./routes/chatgpt');
const deviceRoutes = require('./routes/deviceRoutes');
const alertRoutes = require('./routes/alertRoutes');
const farmRoutes = require('./routes/farmRoutes');

// 라우터 등록
app.use('/sensor', sensorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/weather', weatherRouter);
app.use('/api/map', mapRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/chatgpt', chatgptRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', farmRoutes);

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 5003;
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
});
