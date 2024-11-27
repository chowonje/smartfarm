const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    // 기본 파라미터 설정
    const params = {
      language: 'ko',
      pageSize: 5,    // 기사 수를 5개로 변경
      page: 1,
      q: '스마트팜'   // 검색 키워드를 '스마트팜'으로 변경
    };

    // everything 엔드포인트 사용
    const url = `https://newsapi.org/v2/everything?` + 
      `q=${encodeURIComponent(params.q)}` +  // 한글 키워드는 인코딩 필요
      `&language=${params.language}` +
      `&pageSize=${params.pageSize}` +
      `&page=${params.page}` +
      `&sortBy=publishedAt` +  // 최신 기사부터 정렬
      `&apiKey=${apiKey}`;
    
    console.log('Requesting URL:', url.replace(apiKey, 'HIDDEN'));

    const response = await axios.get(url);
    const articleCounts = response.data.totalResults;

    // 기사가 없는 경우
    if (articleCounts === 0) {
      return res.status(200).json({
        success: false,
        errorMessage: "스마트팜 관련 기사가 없습니다.",
      });
    }

    // 기사가 있는 경우
    res.json({
      success: true,
      data: response.data.articles,
      totalResults: articleCounts
    });

  } catch (error) {
    console.error('News API Error:', {
      message: error.message,
      response: error.response?.data
    });
    
    res.status(500).json({
      success: false,
      errorMessage: "뉴스 데이터를 가져오는데 실패했습니다.",
      details: error.response?.data
    });
  }
});

module.exports = router;
