import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Price({ activeTab }) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5003/api/price');
      if (response.data.success) {
        setPrices(response.data.data);
      }
    } catch (error) {
      console.error('가격 데이터를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'price') {
      fetchPrices();
    }
  }, [activeTab]);

  const filteredPrices = Object.entries(prices).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item => 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  if (activeTab !== 'price') return null;

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="price-container">
      <div className="price-search">
        <input
          type="text"
          placeholder="작물 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="price-search-input"
        />
      </div>
      
      {Object.entries(filteredPrices).map(([category, items]) => (
        <div key={category} className="price-category">
          <h3>{category}</h3>
          <div className="price-items">
            {items.map((item, index) => (
              <div key={index} className="price-item">
                <h4>{item.item_name || item.product_name}</h4>
                <p>평균가: {item.dpr1 || item.price || '가격 정보 없음'}원</p>
                <p>단위: {item.unit || item.std_unit || '단위 정보 없음'}</p>
                <p>등급: {item.grad || item.grade || '등급 정보 없음'}</p>
                <p>날짜: {item.date || new Date().toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Price;
