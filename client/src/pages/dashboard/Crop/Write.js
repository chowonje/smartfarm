import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const CropWrite = () => {
  const navigate = useNavigate();
  // 베드 센서용 날짜/시간
  const [selectedBedDateTime, setSelectedBedDateTime] = useState({
    date: '',
    time: ''
  });
  // 물탱크용 날짜/시간
  const [selectedWaterDateTime, setSelectedWaterDateTime] = useState({
    date: '',
    time: ''
  });
  const [selectedBedNumber, setSelectedBedNumber] = useState('');
  const [formData, setFormData] = useState({
    crop_name: '',
    status: '좋음',
    manager: '',
    content: '',
    // 환경 데이터
    temperature: '',
    humidity: '',
    light: '',
    ec: '',
    // 물탱크 데이터
    water_level: '',
    water_temp: '',
    ph: ''
  });

  // 물탱크 데이터 조회
  const handleWaterTankSelect = async (date, time) => {
    try {
      const queryParams = new URLSearchParams({
        date: date,
        ...(time && { time: time })
      }).toString();

      const response = await fetch(`http://localhost:5003/api/crops/water-tank-data?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert('해당 날짜의 데이터가 없습니다.');
          return;
        }
        throw new Error('데이터 조회 실패');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const latestData = data[0];
        setFormData(prev => ({
          ...prev,
          water_level: latestData.water_level?.toString() || '',
          water_temp: latestData.water_temperature?.toString() || '',
          ph: latestData.ph_level?.toString() || ''
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('데이터 조회에 실패했습니다.');
    }
  };

  // 베드 센서 데이터 조회
  const handleBedSensorSelect = async (date, time, bedNumber) => {
    try {
      const queryParams = new URLSearchParams({
        date: date,
        ...(time && { time: time }),
        ...(bedNumber && { bed_number: bedNumber })
      }).toString();

      const response = await fetch(`http://localhost:5003/api/crops/bed-sensor-data?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert('해당 조건의 데이터가 없습니다.');
          return;
        }
        throw new Error('데이터 조회 실패');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const latestData = data[0];
        setFormData(prev => ({
          ...prev,
          temperature: latestData.temperature?.toString() || '',
          humidity: latestData.humidity?.toString() || '',
          light: latestData.light_intensity?.toString() || ''
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('데이터 조회에 실패했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 숫자 데이터 변환
    const numericFormData = {
      ...formData,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      humidity: formData.humidity ? parseFloat(formData.humidity) : null,
      light: formData.light ? parseFloat(formData.light) : null,
      ec: formData.ec ? parseFloat(formData.ec) : null,
      water_level: formData.water_level ? parseFloat(formData.water_level) : null,
      water_temp: formData.water_temp ? parseFloat(formData.water_temp) : null,
      ph: formData.ph ? parseFloat(formData.ph) : null
    };

    try {
      const response = await fetch('http://localhost:5003/api/crops/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(numericFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '작성에 실패했습니다');
      }

      const data = await response.json();
      console.log('Response:', data);

      alert('작성이 완료되었습니다.');
      navigate('/dashboard/crop');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || '서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>작물관리 작성</strong>
        <p>작물 관리 일지를 작성합니다.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="board_write_wrap">
          <div className="board_write">
            <div className="title">
              <dl>
                <dt>작물명</dt>
                <dd>
                  <input 
                    type="text" 
                    name="crop_name"
                    value={formData.crop_name}
                    onChange={handleChange}
                    placeholder="작물명 입력"
                    required
                  />
                </dd>
              </dl>
            </div>
            <div className="info">
              <dl>
                <dt>상태</dt>
                <dd>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="좋음">좋음</option>
                    <option value="보통">보통</option>
                    <option value="나쁨">나쁨</option>
                  </select>
                </dd>
              </dl>
              <dl>
                <dt>관리자</dt>
                <dd>
                  <input 
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    placeholder="관리자명 입력"
                  />
                </dd>
              </dl>
            </div>

            <div className="sensor_info">
              <h4>환경 데이터</h4>
              <div className="date-selector">
                <div>
                  <label>날짜 선택:</label>
                  <input
                    type="date"
                    value={selectedBedDateTime.date}
                    onChange={(e) => {
                      setSelectedBedDateTime(prev => ({
                        ...prev,
                        date: e.target.value
                      }));
                      handleBedSensorSelect(e.target.value, selectedBedDateTime.time, selectedBedNumber);
                    }}
                  />
                </div>
                <div>
                  <label>시간 선택:</label>
                  <input
                    type="time"
                    value={selectedBedDateTime.time}
                    onChange={(e) => {
                      setSelectedBedDateTime(prev => ({
                        ...prev,
                        time: e.target.value
                      }));
                      handleBedSensorSelect(selectedBedDateTime.date, e.target.value, selectedBedNumber);
                    }}
                  />
                </div>
                <div>
                  <label>베드 번호:</label>
                  <select
                    value={selectedBedNumber}
                    onChange={(e) => {
                      setSelectedBedNumber(e.target.value);
                      handleBedSensorSelect(selectedBedDateTime.date, selectedBedDateTime.time, e.target.value);
                    }}
                  >
                    <option value="">선택하세요</option>
                    <option value="1">1번 베드</option>
                    <option value="2">2번 베드</option>
                    <option value="3">3번 베드</option>
                    <option value="4">4번 베드</option>
                  </select>
                </div>
              </div>
              <div className="sensor_grid">
                <div className="sensor_item">
                  <span>온도 (°C)</span>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="온도"
                    step="0.1"
                  />
                </div>
                <div className="sensor_item">
                  <span>습도 (%)</span>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    placeholder="습도"
                    step="0.1"
                  />
                </div>
                <div className="sensor_item">
                  <span>조도 (lux)</span>
                  <input
                    type="number"
                    name="light"
                    value={formData.light}
                    onChange={handleChange}
                    placeholder="조도"
                  />
                </div>
                <div className="sensor_item">
                  <span>EC (mS/cm)</span>
                  <input
                    type="number"
                    name="ec"
                    value={formData.ec}
                    onChange={handleChange}
                    placeholder="EC"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="sensor_info">
              <h4>물탱크 데이터</h4>
              <div className="date-selector">
                <div>
                  <label>날짜 선택:</label>
                  <input
                    type="date"
                    value={selectedWaterDateTime.date}
                    onChange={(e) => {
                      setSelectedWaterDateTime(prev => ({
                        ...prev,
                        date: e.target.value
                      }));
                      handleWaterTankSelect(e.target.value, selectedWaterDateTime.time);
                    }}
                  />
                </div>
                <div>
                  <label>시간 선택:</label>
                  <input
                    type="time"
                    value={selectedWaterDateTime.time}
                    onChange={(e) => {
                      setSelectedWaterDateTime(prev => ({
                        ...prev,
                        time: e.target.value
                      }));
                      handleWaterTankSelect(selectedWaterDateTime.date, e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="sensor_grid">
                <div className="sensor_item">
                  <span>수위 (%)</span>
                  <input
                    type="number"
                    name="water_level"
                    value={formData.water_level}
                    onChange={handleChange}
                    placeholder="수위"
                    step="0.1"
                  />
                </div>
                <div className="sensor_item">
                  <span>수온 (°C)</span>
                  <input
                    type="number"
                    name="water_temp"
                    value={formData.water_temp}
                    onChange={handleChange}
                    placeholder="수온"
                    step="0.1"
                  />
                </div>
                <div className="sensor_item">
                  <span>pH</span>
                  <input
                    type="number"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    placeholder="pH"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="cont">
              <textarea 
                name="content"
                placeholder="내용 입력"
                value={formData.content}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="bt_wrap">
            <button type="submit" className="btn">등록</button>
            <button type="button" className="btn" onClick={() => navigate('/dashboard/crop')}>
              취소
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CropWrite;