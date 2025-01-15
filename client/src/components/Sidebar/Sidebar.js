import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 3000);
    }
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
      <div className="widget search-widget">
        <i className="home-icon">🏠</i>
        <span>Homepage</span>
      </div>

      <div className="widget login-widget" onClick={() => navigate('/login')}>
        <i className="user-icon">👤</i>
        <span>Login</span>
      </div>

      <div 
        className="widget menu-widget"
        onClick={handleMenuClick}
        onMouseEnter={() => window.innerWidth > 768 && setIsMenuOpen(true)}
        onMouseLeave={() => window.innerWidth > 768 && setIsMenuOpen(false)}
      >
        <div className="widget-header">
          <div className="menu-title">
            <i className="menu-icon">📚</i>
            <span>Menu</span>
          </div>
        </div>
        {isMenuOpen && (
          <div className="menu-items">
            <div className="menu-item" onClick={() => navigate('/dashboard/crop')}>작물관리</div>
            <div className="menu-item" onClick={() => navigate('/dashboard/device')}>장치관리</div>
            <div className="menu-item" onClick={() => navigate('/dashboard/control')}>장치조정</div>
            <div className="menu-item" onClick={() => navigate('/dashboard/environment')}>환경기록</div>
            <div className="menu-item" onClick={() => navigate('/dashboard/Alert/Alerts')}>알람기록</div>
            <div className="menu-item" onClick={() => navigate('/dashboard/profit/MainPage')}>수익관리</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;