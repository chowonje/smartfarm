import React from 'react';
import axios from 'axios';

function News({ activeTab }) {
  const [news, setNews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5003/api/news');
      if (response.data.success) {
        setNews(response.data.data);
      }
    } catch (error) {
      console.error('뉴스를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'news') {
      fetchNews();
    }
  }, [activeTab]);

  if (activeTab !== 'news') return null;
  
  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="news-container">
      {news && news.length > 0 ? (
        news.map((item, index) => (
          <div key={index} className="news-item">
            {item.urlToImage && (
              <img 
                src={item.urlToImage} 
                alt={item.title}
                className="news-image"
              />
            )}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="news-footer">
              <span className="news-source">{item.source?.name}</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                자세히 보기
              </a>
            </div>
          </div>
        ))
      ) : (
        <div className="no-news">뉴스가 없습니다.</div>
      )}
    </div>
  );
}

export default News;
