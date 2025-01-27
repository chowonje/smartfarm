import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const CropView = () => {
  const { id } = useParams();
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 날짜 포맷팅 함수 추가
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.toLocaleTimeString()}`;
  };

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/crops/logs/${id}`);
        
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
          water_temperature: String(data.water_temp || ''),
          ph_level: String(data.ph || ''),
          content: String(data.content || ''),
          gas: String(data.gas || 'N/A'),
          weather_temp: data.weather_temp || null,
          weather_desc: data.weather_desc || null,
          weather_feels_like: data.weather_feels_like || null,
          weather_humidity: data.weather_humidity || null,
          weather_wind_speed: data.weather_wind_speed || null,
          weather_temp_min: data.weather_temp_min || null,
          weather_temp_max: data.weather_temp_max || null,
          weather_sunrise: data.weather_sunrise ? formatDateTime(data.weather_sunrise) : null,
          weather_sunset: data.weather_sunset ? formatDateTime(data.weather_sunset) : null
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
              <div className="sensor_item">
                <span>가스 (ppm)</span>
                <span className="value">{cropData.gas || 'N/A'}</span>
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

          <div className="sensor_info">
            <h4>날씨 데이터</h4>
            <div className="sensor_grid">
              <div className="sensor_item">
                <span>기온 (°C)</span>
                <span className="value">{cropData.weather_temp || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>날씨</span>
                <span className="value">{cropData.weather_desc || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>체감온도 (°C)</span>
                <span className="value">{cropData.weather_feels_like || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>습도 (%)</span>
                <span className="value">{cropData.weather_humidity || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>풍속 (m/s)</span>
                <span className="value">{cropData.weather_wind_speed || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>최저기온 (°C)</span>
                <span className="value">{cropData.weather_temp_min || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>최고기온 (°C)</span>
                <span className="value">{cropData.weather_temp_max || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>일출</span>
                <span className="value">{cropData.weather_sunrise || 'N/A'}</span>
              </div>
              <div className="sensor_item">
                <span>일몰</span>
                <span className="value">{cropData.weather_sunset || 'N/A'}</span>
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

