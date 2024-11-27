const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const certKey = process.env.KAMIS_CERT_KEY;
    const certId = process.env.KAMIS_CERT_ID;
    
    // API URL 및 파라미터 설정
    const baseUrl = 'http://www.kamis.co.kr/service/price/xml.do';
    const params = new URLSearchParams({
      'action': 'dailySalesList',
      'p_cert_key': certKey,
      'p_cert_id': certId,
      'p_returntype': 'json',
      'p_product_cls_code': '01'  // 농산물 코드
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Requesting URL:', url.replace(certKey, 'HIDDEN'));

    const response = await axios.get(url);
    let priceData = response.data.price;

    // 원하는 카테고리만 필터링
    const allowedCategories = [
      '채소류',
      '특용작물',
      '식량작물',
      '과일류'
    ];

    priceData = priceData.filter(item => {
      const category = item.category_name || item.item_category_name;
      return allowedCategories.some(allowed => category?.includes(allowed));
    });

    // 데이터가 없는 경우
    if (!priceData || priceData.length === 0) {
      return res.status(200).json({
        success: false,
        errorMessage: "해당하는 농산물 가격 데이터를 찾을 수 없습니다."
      });
    }

    // 데이터를 카테고리별로 그룹화
    const groupedData = priceData.reduce((acc, item) => {
      const category = item.category_name || item.item_category_name;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    // 데이터가 있는 경우
    res.json({
      success: true,
      data: groupedData,
      totalCount: priceData.length,
      categories: Object.keys(groupedData)
    });

  } catch (error) {
    console.error('Price API Error:', {
      message: error.message,
      response: error.response?.data
    });
    
    res.status(500).json({
      success: false,
      errorMessage: "농산물 가격 데이터를 가져오는데 실패했습니다.",
      details: error.response?.data
    });
  }
});

module.exports = router;
