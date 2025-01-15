import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const DeviceList = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5003/api/device/devices');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        setDevices(data);
      } catch (error) {
        console.error('Error details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  // 데이터 정렬 (날짜 기준 내림차순)
  const sortedDevices = [...devices].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // 필터링 로직
  const filteredDevices = sortedDevices.filter(device => {
    const locationMatch = selectedLocation === 'all' || device.location === selectedLocation;
    const statusMatch = selectedStatus === 'all' || device.current_status === selectedStatus;
    return locationMatch && statusMatch;
  });

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>장비 관리 목록</strong>
        <p>스마트팜 장비의 상태를 관리하고 점검합니다.</p>
      </div>

      <div className="board_list_wrap">
        <div className="board_filter">
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">전체 위치</option>
            <option value="온실 1구역">온실 1구역</option>
            <option value="온실 2구역">온실 2구역</option>
            <option value="제어실">제어실</option>
            <option value="양액 공급실">양액 공급실</option>
          </select>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="정상작동">정상작동</option>
            <option value="점검필요">점검필요</option>
            <option value="수리중">수리중</option>
            <option value="고장">고장</option>
          </select>
          <Link to="/dashboard/device/write" className="btn">장비 등록</Link>
        </div>

        <div className="board_list">
          <div className="top">
            <div className="date">등록일</div>
            <div className="name">장비명</div>
            <div className="location">위치</div>
            <div className="status">상태</div>
            <div className="manager">담당자</div>
          </div>

          {filteredDevices.map((device) => (
            <Link to={`/dashboard/device/view/${device.id}`} key={device.id} className="board-row">
              <div className="row-content">
                <div className="date">{formatDate(device.created_at)}</div>
                <div className="name">{device.device_name}</div>
                <div className="location">{device.location}</div>
                <div className={`status status-${device.current_status?.toLowerCase() || 'normal'}`}>
                  {device.current_status || '정상'}
                </div>
                <div className="manager">{device.responsible_person || 'N/A'}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="board_page">
          <a href="#!" className="bt first">{'<<'}</a>
          <a href="#!" className="bt prev">{'<'}</a>
          <a href="#!" className="num on">1</a>
          <a href="#!" className="num">2</a>
          <a href="#!" className="num">3</a>
          <a href="#!" className="bt next">{'>'}</a>
          <a href="#!" className="bt last">{'>>'}</a>
        </div>
      </div>
    </div>
  );
};

export default DeviceList; 