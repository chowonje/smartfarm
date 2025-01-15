import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const CropMain = () => {
  const navigate = useNavigate();
  const [cropSummaries, setCropSummaries] = useState({
    basil: null,
    bokchoy: null,
    butterhead: null,
    rucola: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 작물 정보를 useMemo로 최적화
  const crops = React.useMemo(() => ({
    basil: {
      name: '바질',
      image: '/images/basil.jpg',
      type: 'basil'
    },
    bokchoy: {
      name: '청경채',
      image: '/images/bokchoy.jpg',
      type: 'bokchoy'
    },
    butterhead: {
      name: '버터헤드',
      image: '/images/butterhead.jpg',
      type: 'butterhead'
    },
    rucola: {
      name: '루꼴라',
      image: '/images/rucola.jpg',
      type: 'rucola'
    }
  }), []); // 빈 의존성 배열로 한 번만 생성

  useEffect(() => {
    const fetchCropSummaries = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5003/api/crops/logs');
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        const data = await response.json();

        const summaries = {};
        Object.keys(crops).forEach(cropType => {
          const cropData = data
            .filter(item => item.crop_name === crops[cropType].name)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
          summaries[cropType] = cropData || null;
        });

        setCropSummaries(summaries);
      } catch (error) {
        console.error('Error fetching crop data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCropSummaries();
  }, [crops]); // crops를 의존성 배열에 추가

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleCropClick = (cropName) => {
    navigate(`/dashboard/crop/list/${cropName}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1>작물 관리 현황</h1>
      <div className="crop-grid">
        {Object.entries(crops).map(([key, crop]) => {
          const summary = cropSummaries[key];
          return (
            <div 
              key={key} 
              className="crop-card" 
              onClick={() => handleCropClick(crop.type)}
            >
              <div className="crop-image">
                <img src={crop.image} alt={crop.name} />
              </div>
              <div className="crop-info">
                <h2>{crop.name}</h2>
                <p className={`status status-${summary?.status?.toLowerCase() || 'normal'}`}>
                  상태: {summary?.status || 'N/A'}
                </p>
                <p>관리자: {summary?.manager || 'N/A'}</p>
                <p>최근 업데이트: {formatDate(summary?.updated_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CropMain;
