import React, { useEffect, useState } from 'react';
import '../../../styles/Alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    // Firebase 초기화를 조건부로 수행
    const initializeFirebase = async () => {
      try {
        if (window.location.protocol === 'https:') {
          const { initializeApp } = await import('firebase/app');
          const { getMessaging, onMessage } = await import('firebase/messaging');
          
          const firebaseConfig = {
            apiKey: "AIzaSyD1ApjxgWXhd-dCGWksotw7ymKO9oyznD0",
            authDomain: "smartfarm-notification.firebaseapp.com",
            projectId: "smartfarm-notification",
            storageBucket: "smartfarm-notification.firebasestorage.app",
            messagingSenderId: "564912239654",
            appId: "1:564912239654:web:d6fcaf7ff1ab565e6f22e7"
          };

          const app = initializeApp(firebaseConfig);
          const messaging = getMessaging(app);

          onMessage(messaging, (payload) => {
            console.log('알림 수신:', payload);
            setAlerts(prev => [{
              id: Date.now(),
              title: payload.notification.title,
              body: payload.notification.body,
              timestamp: new Date().toISOString(),
              ...payload.data
            }, ...prev]);
          });
        }
      } catch (error) {
        console.log('Firebase 초기화 실패 (프로덕션 환경이 아닐 수 있음):', error);
      }
    };

    initializeFirebase();
    fetchAlertsData();
  }, []);

  const fetchAlertsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('알람 데이터 로딩 실패:', error);
    }
  };

  const handleAlertClick = async (alert) => {
    if (selectedAlert?.id === alert.id) {
      setSelectedAlert(null);
      return;
    }

    if (!alert.read) {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/alerts/read/${alert.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to mark alert as read');

        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, read: true } : a
        ));
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }

    setSelectedAlert(alert);
  };

  const handleDelete = async (alertId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('이 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete alert');

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  return (
    <div className="board_wrap">
      <div className="board_title">
        <strong>알람기록</strong>
        <p>알람을 기록합니다.</p>
      </div>
      <div className="board_list_wrap">
        <div className="board_list">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              className={`alert_item ${selectedAlert?.id === alert.id ? 'active' : ''} ${!alert.read ? 'unread' : ''}`}
            >
              <div className="alert_header">
                <div className="header_content" onClick={() => handleAlertClick(alert)}>
                  <h3>{alert.title}</h3>
                  <span className="alert_date">
                    {new Date(alert.timestamp).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="alert_actions">
                  <span 
                    className="toggle_icon" 
                    onClick={() => handleAlertClick(alert)}
                  >
                    {selectedAlert?.id === alert.id ? '▼' : '▶'}
                  </span>
                  <button 
                    className="delete_btn"
                    onClick={(e) => handleDelete(alert.id, e)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {selectedAlert?.id === alert.id && (
                <div className="alert_details">
                  <div className="detail_item">
                    <label>센서 타입:</label>
                    <span>{alert.type}</span>
                  </div>
                  <div className="detail_item">
                    <label>경고 내용:</label>
                    <span>{alert.body}</span>
                  </div>
                  <div className="detail_item">
                    <label>발생 시간:</label>
                    <span>{new Date(alert.timestamp).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
