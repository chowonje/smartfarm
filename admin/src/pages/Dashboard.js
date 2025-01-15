import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';

function Dashboard() {
    const navigate = useNavigate();
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const adminToken = localStorage.getItem('adminToken');
                if (!adminToken) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:5003/api/admin/farms', {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch farms');
                }

                const data = await response.json();
                if (data.success) {
                    setFarms(data.farms);
                }
            } catch (error) {
                console.error('농장 목록 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFarms();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>관리자 대시보드</h2>
                    <p style={styles.adminInfo}>관리자: {adminInfo?.name}</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    로그아웃
                </button>
            </div>
            <div style={styles.navigation}>
                <button onClick={() => navigate('/users')} style={styles.navButton}>
                    사용자 관리
                </button>
                <button onClick={() => navigate('/farms')} style={styles.navButton}>
                    농장 관리
                </button>
            </div>
            <div style={styles.content}>
                <h3>시스템 개요</h3>
                {/* 대시보드 통계 등 표시 */}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: {
        margin: '0',
        color: '#333'
    },
    adminInfo: {
        color: '#666',
        margin: '5px 0'
    },
    logoutButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    content: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    navigation: {
        marginBottom: '20px',
        display: 'flex',
        gap: '10px'
    },
    navButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
    },
    statNumber: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#007bff'
    },
    farmList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
    },
    farmCard: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }
};

export default Dashboard;