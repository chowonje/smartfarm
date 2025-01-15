# User Management System

이 프로젝트는 사용자 관리 시스템의 백엔드 서버를 포함합니다.

## 서버 구조

- Port: 5000
- 기술 스택: Node.js, Express, MySQL

### 주요 API 엔드포인트

#### 인증 관련
- POST `/api/auth/register` - 회원가입
- POST `/api/auth/login` - 로그인
- POST `/api/auth/logout` - 로그아웃
- GET `/api/auth/check` - 로그인 상태 확인

#### 사용자 관리
- GET `/api/auth/users` - 사용자 목록 조회
- DELETE `/api/auth/users/:userId` - 사용자 삭제

#### 관리자 전용
- POST `/api/admin/login` - 관리자 로그인
- GET `/api/admin/users` - 관리자용 사용자 목록 조회

### 폴더 구조
api/
├── server/
│ ├── routes/ # API 라우트 정의
│ ├── models/ # 데이터베이스 모델
│ ├── middleware/ # 미들웨어 함수들
│ └── server.js # 메인 서버 파일
├── client/ # 사용자 프론트엔드
└── admin/ # 관리자 프론트엔드

## 실행 방법

1. 필요한 패키지 설치
bash
npm install

2. 서버 실행
bash
npm start

서버는 기본적으로 http://localhost:5000 에서 실행됩니다.