import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const CropEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    crop_name: '',
    status: '좋음',
    manager: '',
    content: '',
    temperature: '',
    humidity: '',
    light: '',
    ec: '',
    water_level: '',
    water_temp: '',
    ph: ''
  });

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/crops/logs/${id}`);
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        const data = await response.json();
        
        setFormData({
          crop_name: data.crop_name || '',
          status: data.status || '좋음',
          manager: data.manager || '',
          content: data.content || '',
          temperature: data.temperature || '',
          humidity: data.humidity || '',
          light: data.light || '',
          ec: data.ec || '',
          water_level: data.water_level || '',
          water_temp: data.water_temperature || '',
          ph: data.ph_level || ''
        });

        console.log('Loaded data:', data);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    };

    fetchCropData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      const response = await fetch(`http://localhost:5003/api/crops/logs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '수정에 실패했습니다');
      }

      alert('수정이 완료되었습니다.');
      navigate('/dashboard/crop');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || '서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>작물관리 수정</strong>
        <p>작물 관리 일지를 수정합니다.</p>
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
            <button type="submit" className="btn">수정</button>
            <button type="button" className="btn" onClick={() => navigate('/dashboard/crop')}>
              취소
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CropEdit;    