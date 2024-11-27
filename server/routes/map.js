const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/map
router.get('/', async (req, res) => {
  try {
    const { query, lat, lng, name, id } = req.query;
    const KAKAO_API_KEY = process.env.KAKAO_MAP_API_KEY;

    // URL 생성 함수들
    const createMapUrls = (lat, lng, name, id) => {
      const urls = {};
      
      if (lat && lng) {
        urls.map = `https://map.kakao.com/link/map/${lat},${lng}`;
        if (name) {
          urls.namedMap = `https://map.kakao.com/link/map/${name},${lat},${lng}`;
        }
        urls.roadview = `https://map.kakao.com/link/roadview/${lat},${lng}`;
        urls.directions = `https://map.kakao.com/link/to/${name || '목적지'},${lat},${lng}`;
      }
      
      if (id) {
        urls.placeMap = `https://map.kakao.com/link/map/${id}`;
        urls.placeRoadview = `https://map.kakao.com/link/roadview/${id}`;
        urls.placeDirections = `https://map.kakao.com/link/to/${id}`;
      }
      
      return urls;
    };

    // 검색 API 호출 (장소 검색)
    const searchPlace = async (query) => {
      if (!query) return null;
      
      try {
        const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword', {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`
          },
          params: {
            query,
            size: 5
          }
        });

        return response.data.documents;
      } catch (error) {
        console.error('Kakao Search API Error:', error);
        return null;
      }
    };

    // 응답 데이터 구성
    let responseData = {
      success: true,
      urls: createMapUrls(lat, lng, name, id)
    };

    // 검색어가 있는 경우 검색 결과 추가
    if (query) {
      const searchResults = await searchPlace(query);
      if (searchResults) {
        responseData.searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
        responseData.searchResults = searchResults;
      }
    }

    res.json(responseData);

  } catch (error) {
    console.error('Map API Error:', error);
    res.status(500).json({
      success: false,
      error: "지도 정보를 가져오는데 실패했습니다.",
      details: error.message
    });
  }
});

module.exports = router;
