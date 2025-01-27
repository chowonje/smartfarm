import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();

  return (
    <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
      <br></br>
      <div className="menu-item" onClick={() => navigate('/dashboard/crop')}>
        <i className="nav-icon">🌱 </i>작물관리
      </div>
      <div className="menu-item" onClick={() => navigate('/dashboard/device')}>
        <i className="nav-icon">⚙️ </i>장치관리
      </div>
      <div className="menu-item" onClick={() => navigate('/dashboard/control')}>
        <i className="nav-icon">🎮 </i>장치조정
      </div>
      <div className="menu-item" onClick={() => navigate('/dashboard/environment')}>
        <i className="nav-icon">🌡️ </i>환경기록
      </div>
      <div className="menu-item" onClick={() => navigate('/dashboard/Alert/Alerts')}>
        <i className="nav-icon">🔔 </i>알람기록
      </div>
      <div className="menu-item" onClick={() => navigate('/dashboard/profit/MainPage')}>
        <i className="nav-icon">💰 </i>수익관리
      </div>
    </div>
  );
};

export default Sidebar;