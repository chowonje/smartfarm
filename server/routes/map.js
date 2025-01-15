const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "검색어를 입력해주세요."
      });
    }

    const KAKAO_API_KEY = process.env.MAP_API_KEY;
    if (!KAKAO_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "카카오 API 키가 설정되지 않았습니다."
      });
    }

    const response = await axios({
      method: 'GET',
      url: 'https://dapi.kakao.com/v2/local/search/keyword.json',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`
      },
      params: { 
        query,
        size: 1  // 결과 개수를 1개로 제한
      }
    });

    if (!response.data.documents || response.data.documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "검색 결과가 없습니다."
      });
    }

    // 첫 번째 결과만 반환
    const firstResult = response.data.documents[0];
    res.json({
      success: true,
      data: {
        place_name: firstResult.place_name,
        address_name: firstResult.address_name,
        road_address_name: firstResult.road_address_name,
        latitude: firstResult.y,
        longitude: firstResult.x,
        phone: firstResult.phone || ''
      }
    });

  } catch (error) {
    console.error('API 요청 에러:', error);
    res.status(500).json({
      success: false,
      message: "서버 에러가 발생했습니다.",
      error: error.message
    });
  }
});

module.exports = router;
