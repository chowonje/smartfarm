# User Management System - Client

일반 사용자를 위한 프론트엔드 애플리케이션입니다.

## 주요 기능

- 회원가입
- 로그인/로그아웃
- 사용자 프로필 조회

## 폴더 구조
client/
├── src/
│ ├── components/ # 재사용 가능한 컴포넌트
│ │ ├── Header.js
│ │ └── UserList.js
│ ├── pages/ # 페이지 컴포넌트
│ │ ├── Login.js
│ │ └── Register.js
│ └── App.js # 메인 앱 컴포넌트


## 실행 방법

1. 필요한 패키지 설치
bash
npm install

2. 개발 서버 실행
bash
npm start

클라이언트는 http://localhost:3000 에서 실행됩니다.