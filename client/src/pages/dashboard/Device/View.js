import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const DeviceView = () => {
  const { id } = useParams();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/device/devices/${id}`);
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        
        const data = await response.json();
        console.log('Received data:', data);

        if (!data || typeof data !== 'object') {
          throw new Error('잘못된 데이터 형식입니다');
        }

        const processedData = {
          device_name: String(data.device_name || ''),
          device_id: String(data.device_id || ''),
          quantity: String(data.quantity || ''),
          location: String(data.location || ''),
          purchase_date: data.purchase_date || '',
          price: String(data.price || ''),
          warranty_expiration: data.warranty_expiration || '',
          current_status: String(data.current_status || '정상작동'),
          last_inspection_date: data.last_inspection_date || '',
          repair_history: String(data.repair_history || ''),
          replacement_history: String(data.replacement_history || ''),
          disposal_date: data.disposal_date || '',
          responsible_person: String(data.responsible_person || '')
        };

        setDeviceData(processedData);
      } catch (error) {
        console.error('Error fetching device data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!deviceData) return <div>데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>장비 상세 정보</strong>
        <p>장비의 상세 정보를 확인합니다.</p>
      </div>

      <div className="board_write_wrap">
        <div className="board_write">
          <div className="title">
            <dl>
              <dt>장비명</dt>
              <dd>{deviceData.device_name || 'N/A'}</dd>
            </dl>
          </div>

          <div className="info">
            <dl>
              <dt>장비 ID</dt>
              <dd>{deviceData.device_id || 'N/A'}</dd>
            </dl>
            <dl>
              <dt>수량</dt>
              <dd>{deviceData.quantity || 'N/A'}</dd>
            </dl>
          </div>

          <div className="info">
            <dl>
              <dt>위치</dt>
              <dd>{deviceData.location || 'N/A'}</dd>
            </dl>
            <dl>
              <dt>상태</dt>
              <dd className={`status status-${String(deviceData.current_status || '').toLowerCase()}`}>
                {deviceData.current_status || '정상작동'}
              </dd>
            </dl>
          </div>

          <div className="info">
            <dl>
              <dt>구매일자</dt>
              <dd>{formatDate(deviceData.purchase_date)}</dd>
            </dl>
            <dl>
              <dt>보증만료일</dt>
              <dd>{formatDate(deviceData.warranty_expiration)}</dd>
            </dl>
          </div>

          <div className="info">
            <dl>
              <dt>가격</dt>
              <dd>{deviceData.price ? `${Number(deviceData.price).toLocaleString()}원` : 'N/A'}</dd>
            </dl>
            <dl>
              <dt>최근 점검일</dt>
              <dd>{formatDate(deviceData.last_inspection_date)}</dd>
            </dl>
          </div>

          <div className="cont">
            <dl>
              <dt>수리 이력</dt>
              <dd className="content-box">
                {deviceData.repair_history || '수리 이력이 없습니다.'}
              </dd>
            </dl>
            <dl>
              <dt>교체 이력</dt>
              <dd className="content-box">
                {deviceData.replacement_history || '교체 이력이 없습니다.'}
              </dd>
            </dl>
          </div>

          <div className="info">
            <dl>
              <dt>담당자</dt>
              <dd>{deviceData.responsible_person || 'N/A'}</dd>
            </dl>
            {deviceData.disposal_date && (
              <dl>
                <dt>폐기일</dt>
                <dd>{formatDate(deviceData.disposal_date)}</dd>
              </dl>
            )}
          </div>
        </div>
        
        <div className="bt_wrap">
          <Link to={`/dashboard/device/edit/${id}`} className="btn">수정</Link>
          <Link to="/dashboard/device" className="btn">목록</Link>
        </div>
      </div>
    </div>
  );
};

export default DeviceView; 