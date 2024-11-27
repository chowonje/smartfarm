# 스마트팜 프로젝트

## 프로젝트 소개
스마트팜 관련 정보를 제공하는 웹 서비스입니다.

## 주요 기능
- 날씨 정보 조회
- 스마트팜 관련 뉴스 조회
- 농산물 가격 정보 조회
- 지도 서비스

## API 목록
### 1. 날씨 API
// 서울 날씨 정보 조회
GET http://localhost:3001/api/weather
### 2. 뉴스 API
// 스마트팜 관련 최신 뉴스 5개 조회
GET http://localhost:3001/api/news
### 3. 농산물 가격 API
// 농산물 가격 정보 조회
GET http://localhost:3001/api/price
### 4. 지도 API
// 지도 정보 조회
GET http://localhost:3001/api/map
// 위치 검색
GET http://localhost:3001/api/map?query=강남역

// 특정 좌표의 지도
GET http://localhost:3001/api/map?lat=37.498095&lng=127.027610

// 이름이 포함된 지도
GET http://localhost:3001/api/map?name=강남역&lat=37.498095&lng=127.027610

다음 단계는:
프론트엔드 개발 시작
API 연동 테스트
에러 처리 보완
성능 최적화