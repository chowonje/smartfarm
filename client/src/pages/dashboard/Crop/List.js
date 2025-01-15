import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const CropList = () => {
  const { cropType } = useParams();
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [cropLogs, setCropLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cropNames = useMemo(() => ({
    basil: '바질',
    bokchoy: '청경채',
    butterhead: '버터헤드',
    rucola: '루꼴라'
  }), []);

  useEffect(() => {
    if (cropType && cropNames[cropType]) {
      setSelectedCrop(cropNames[cropType]);
    }
  }, [cropType, cropNames]);

  useEffect(() => {
    const fetchCropLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5003/api/crops/logs');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        setCropLogs(data);
      } catch (error) {
        console.error('Error details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCropLogs();
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
  const sortedLogs = [...cropLogs].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // 중복 제거
  const uniqueLogs = sortedLogs.filter((log, index, self) =>
    index === self.findIndex((t) => t.id === log.id)
  );

  const filteredLogs = selectedCrop === 'all' 
    ? uniqueLogs 
    : uniqueLogs.filter(log => log.crop_name === selectedCrop);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>작물 관리 일지</strong>
        <p>작물의 생육 상태를 기록하고 관리합니다.</p>
      </div>

      <div className="board_list_wrap">
        <div className="board_filter">
          <select 
            value={selectedCrop} 
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="all">전체 작물</option>
            <option value="바질">바질</option>
            <option value="루꼴라">루꼴라</option>
            <option value="버터헤드">버터헤드</option>
            <option value="청경채">청경채</option>
          </select>
          <Link to="/dashboard/crop/write" className="btn">작성하기</Link>
        </div>

        <div className="board_list">
          <div className="top">
            <div className="date">날짜</div>
            <div className="crop">작물</div>
            <div className="status">상태</div>
            <div className="manager">관리자</div>
          </div>

          {filteredLogs.map((log) => (
            <Link to={`/dashboard/crop/view/${log.id}`} key={log.id} className="board-row">
              <div className="row-content">
                <div className="date">{formatDate(log.created_at)}</div>
                <div className="crop">{log.crop_name}</div>
                <div className={`status status-${log.status?.toLowerCase() || 'normal'}`}>
                  {log.status || '보통'}
                </div>
                <div className="manager">{log.manager || 'N/A'}</div>
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

export default CropList;