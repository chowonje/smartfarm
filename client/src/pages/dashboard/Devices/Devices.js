import React, { useEffect, useState } from 'react';
import '../../components/Dashboard/Dashboard.css';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDevicesData();
  }, []);

  const fetchDevicesData = async () => {
    try {
      const response = await fetch('http://192.168.0.76/api/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('장치 데이터 로딩 실패:', error);
    }
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>장치관리</strong>
        <p>장치를 관리합니다.</p>
      </div>
      <div className="board_list_wrap">
        {/* list2.php와 동일한 구조로 데이터 표시 */}
      </div>
    </div>
  );
};

export default Devices;
