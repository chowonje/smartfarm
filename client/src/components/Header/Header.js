import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useSidebar } from '../../context/SidebarContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const user = JSON.parse(localStorage.getItem('user'));
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/alerts/unread');
      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('알림 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000); // 1분마다 갱신
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={toggleSidebar}>
          <strong>☰</strong>
        </button>
        <Link to="/" className="logo-container">
          <span className="logo-text">SmartFarm</span>
        </Link>
      </div>
      
      <div className="header-right">
        {user ? (
          <>
            <span 
              className="notification-icon"
              onClick={() => navigate('/dashboard/Alert/Alerts')}
            >
              <IoNotificationsOutline size={24} />
              {unreadCount > 0 && (
                <span className="alert-badge">
                  {unreadCount}
                </span>
              )}
            </span>
            <span className="user-name">{user.name || user.id}님</span>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">로그인</Link>
            <Link to="/register" className="login-button">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;