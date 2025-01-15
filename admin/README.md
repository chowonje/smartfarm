# User Management System - Admin

관리자를 위한 프론트엔드 애플리케이션입니다.

## 주요 기능

- 관리자 로그인
- 사용자 목록 조회
- 사용자 삭제
- 관리자 대시보드

## 폴더 구조
```
admin/
├── src/
│   ├── components/    # 재사용 가능한 컴포넌트
│   │   └── PrivateRoute.js
│   ├── pages/        # 페이지 컴포넌트
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   └── UserManagement.js
│   ├── styles/       # CSS 파일들
│   │   └── main.css
│   └── App.js        # 메인 앱 컴포넌트
```

## 실행 방법

1. 필요한 패키지 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm start
```

관리자 페이지는 http://localhost:3001 에서 실행됩니다.

## 주의사항

- 관리자 권한이 있는 계정으로만 접근 가능
- 백엔드 서버(5000번 포트)가 실행 중이어야 함
admin/
├── src/
│ ├── components/ # 재사용 가능한 컴포넌트
│ │ └── PrivateRoute.js
│ ├── pages/ # 페이지 컴포넌트
│ │ ├── Login.js
│ │ ├── Dashboard.js
│ │ └── UserManagement.js
│ ├── styles/ # CSS 파일들
│ │ └── main.css
│ └── App.js # 메인 앱 컴포넌트

## 실행 방법

1. 필요한 패키지 설치
bash
npm install

2. 개발 서버 실행
bash
npm start

관리자 페이지는 http://localhost:3001 에서 실행됩니다.

## 주의사항

- 관리자 권한이 있는 계정으로만 접근 가능
- 백엔드 서버(5000번 포트)가 실행 중이어야 함