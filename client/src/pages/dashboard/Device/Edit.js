import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../../styles/Dashboard.css';

const DeviceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    device_name: '',
    device_id: '',
    quantity: '',
    location: '',
    purchase_date: '',
    price: '',
    warranty_expiration: '',
    current_status: '정상작동',
    last_inspection_date: '',
    repair_history: '',
    replacement_history: '',
    disposal_date: '',
    responsible_person: ''
  });

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/device/devices/${id}`);
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        const data = await response.json();
        
        setFormData({
          device_name: data.device_name || '',
          device_id: data.device_id || '',
          quantity: data.quantity || '',
          location: data.location || '',
          purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : '',
          price: data.price || '',
          warranty_expiration: data.warranty_expiration ? data.warranty_expiration.split('T')[0] : '',
          current_status: data.current_status || '정상작동',
          last_inspection_date: data.last_inspection_date ? data.last_inspection_date.split('T')[0] : '',
          repair_history: data.repair_history || '',
          replacement_history: data.replacement_history || '',
          disposal_date: data.disposal_date ? data.disposal_date.split('T')[0] : '',
          responsible_person: data.responsible_person || ''
        });

        console.log('Loaded data:', data);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    };

    fetchDeviceData();
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
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      purchase_date: formData.purchase_date || null,
      warranty_expiration: formData.warranty_expiration || null,
      last_inspection_date: formData.last_inspection_date || null,
      disposal_date: formData.disposal_date || null
    };

    try {
      const response = await fetch(`http://localhost:5003/api/device/devices/${id}`, {
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
      navigate('/dashboard/device');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || '서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>장비 정보 수정</strong>
        <p>장비의 정보를 수정합니다.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="board_write_wrap">
          <div className="board_write">
            <div className="title">
              <dl>
                <dt>장비명</dt>
                <dd>
                  <input 
                    type="text" 
                    name="device_name"
                    value={formData.device_name}
                    onChange={handleChange}
                    placeholder="장비명 입력"
                    required
                  />
                </dd>
              </dl>
            </div>

            <div className="info">
              <dl>
                <dt>장비 ID</dt>
                <dd>
                  <input 
                    type="text"
                    name="device_id"
                    value={formData.device_id}
                    onChange={handleChange}
                    placeholder="장비 ID 입력"
                    required
                  />
                </dd>
              </dl>
              <dl>
                <dt>수량</dt>
                <dd>
                  <input 
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="수량 입력"
                    min="1"
                    required
                  />
                </dd>
              </dl>
            </div>

            <div className="info">
              <dl>
                <dt>위치</dt>
                <dd>
                  <input 
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="위치 입력"
                    required
                  />
                </dd>
              </dl>
              <dl>
                <dt>상태</dt>
                <dd>
                  <select 
                    name="current_status"
                    value={formData.current_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="정상작동">정상작동</option>
                    <option value="점검필요">점검필요</option>
                    <option value="수리중">수리중</option>
                    <option value="고장">고장</option>
                  </select>
                </dd>
              </dl>
            </div>

            <div className="info">
              <dl>
                <dt>구매일자</dt>
                <dd>
                  <input 
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    required
                  />
                </dd>
              </dl>
              <dl>
                <dt>보증만료일</dt>
                <dd>
                  <input 
                    type="date"
                    name="warranty_expiration"
                    value={formData.warranty_expiration}
                    onChange={handleChange}
                    required
                  />
                </dd>
              </dl>
            </div>

            <div className="info">
              <dl>
                <dt>가격 (원)</dt>
                <dd>
                  <input 
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="가격 입력"
                    required
                  />
                </dd>
              </dl>
              <dl>
                <dt>최근 점검일</dt>
                <dd>
                  <input 
                    type="date"
                    name="last_inspection_date"
                    value={formData.last_inspection_date}
                    onChange={handleChange}
                  />
                </dd>
              </dl>
            </div>

            <div className="cont">
              <dl>
                <dt>수리 이력</dt>
                <dd>
                  <textarea
                    name="repair_history"
                    value={formData.repair_history}
                    onChange={handleChange}
                    placeholder="수리 이력을 입력하세요"
                  />
                </dd>
              </dl>
              <dl>
                <dt>교체 이력</dt>
                <dd>
                  <textarea
                    name="replacement_history"
                    value={formData.replacement_history}
                    onChange={handleChange}
                    placeholder="교체 이력을 입력하세요"
                  />
                </dd>
              </dl>
            </div>

            <div className="info">
              <dl>
                <dt>담당자</dt>
                <dd>
                  <input 
                    type="text"
                    name="responsible_person"
                    value={formData.responsible_person}
                    onChange={handleChange}
                    placeholder="담당자명 입력"
                    required
                  />
                </dd>
              </dl>
              <dl>
                <dt>폐기일</dt>
                <dd>
                  <input 
                    type="date"
                    name="disposal_date"
                    value={formData.disposal_date}
                    onChange={handleChange}
                  />
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bt_wrap">
            <button type="submit" className="btn">수정</button>
            <button type="button" className="btn" onClick={() => navigate('/dashboard/device')}>
              취소
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeviceEdit; 