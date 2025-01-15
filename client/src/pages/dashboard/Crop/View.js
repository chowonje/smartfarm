import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const CropView = () => {
  const { id } = useParams();
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5003/api/crops/logs/${id}`);
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        
        const data = await response.json();
        console.log('Received data:', data);

        if (!data || typeof data !== 'object') {
          throw new Error('잘못된 데이터 형식입니다');
        }

        const processedData = {
          crop_name: String(data.crop_name || ''),
          status: String(data.status || '보통'),
          manager: String(data.manager || ''),
          temperature: String(data.temperature || ''),
          humidity: String(data.humidity || ''),
          light: String(data.light || ''),
          ec: String(data.ec || ''),
          water_level: String(data.water_level || ''),
          water_temperature: String(data.water_temperature || ''),
          ph_level: String(data.ph_level || ''),
          content: String(data.content || '')
        };

        setCropData(processedData);
      } catch (error) {
        console.error('Error fetching crop data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCropData();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!cropData) return <div>데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>작물관리 상세</strong>
        <p>작물 관리 일지의 상세 내용입니다.</p>
      </div>

      <div className="board_write_wrap">
        <div className="board_write">
          <div className="title">
            <dl>
              <dt>작물명</dt>
              <dd>{cropData.crop_name || 'N/A'}</dd>
            </dl>
          </div>
          <div className="info">
            <dl>
              <dt>상태</dt>
              <dd className={`status status-${String(cropData?.status || '').toLowerCase() || 'normal'}`}>
                {cropData?.status || '보통'}
              </dd>
            </dl>
            <dl>
              <dt>관리자</dt>
              <dd>{cropData?.manager || 'N/A'}</dd>
            </dl>
          </div>

          <div className="sensor_info">
            <h4>환경 데이터</h4>
            <div className="sensor_grid">
              <div className="sensor_item">
                <span>온도 (°C)</span>
                <span className="value">{cropData.temperature || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>습도 (%)</span>
                <span className="value">{cropData.humidity || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>조도 (lux)</span>
                <span className="value">{cropData.light || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>EC (mS/cm)</span>
                <span className="value">{cropData.ec || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="sensor_info">
            <h4>물탱크 데이터</h4>
            <div className="sensor_grid">
              <div className="sensor_item">
                <span>수위 (%)</span>
                <span className="value">{cropData.water_level || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>수온 (°C)</span>
                <span className="value">{cropData.water_temperature || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>pH</span>
                <span className="value">{cropData.ph_level || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="cont">
            <div className="content-box">
              {cropData?.content || '내용이 없습니다.'}
            </div>
          </div>
        </div>
        
        <div className="bt_wrap">
          <Link to={`/dashboard/crop/edit/${id}`} className="btn">수정</Link>
          <Link to="/dashboard/crop" className="btn">목록</Link>
        </div>
      </div>
    </div>
  );
};

export default CropView;

