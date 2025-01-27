import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FarmManagement() {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFarm, setNewFarm] = useState({
        name: '',
        location: '',
        description: '',
        port: ''
    });

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/admin/farms`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setFarms(data.farms);
                }
            } catch (error) {
                console.error('농장 목록 조회 실패:', error);
            }
        };

        fetchFarms();
    }, []);

    const handleAddFarm = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/admin/farms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newFarm)
            });

            const data = await response.json();
            if (data.success) {
                setFarms([...farms, data.farm]);
                setShowAddModal(false);
                setNewFarm({ 
                    name: '', 
                    location: '', 
                    description: '', 
                    port: '' 
                });
            }
        } catch (error) {
            console.error('농장 추가 실패:', error);
        }
    };

    const goToDashboard = () => {
        navigate('/dashboard');
    };

    const handleFarmSelect = (farmId) => {
        window.open(`${process.env.REACT_APP_FRONT_API_URL}/?farmId=${farmId}`, '_blank');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>농장 관리</h2>
                <div style={styles.headerButtons}>
                    <button 
                        style={styles.dashboardButton}
                        onClick={goToDashboard}
                    >
                        대시보드
                    </button>
                    <button 
                        style={styles.addButton}
                        onClick={() => setShowAddModal(true)}
                    >
                        새 농장 추가
                    </button>
                </div>
            </div>
            <div style={styles.farmGrid}>
                {farms.map(farm => (
                    <div key={farm.id} 
                         style={styles.farmCard} 
                         onClick={() => handleFarmSelect(farm.id)}>
                        <h3>{farm.name}</h3>
                        <p>위치: {farm.location}</p>
                        <p>포트: {farm.port || '3000'}</p>
                        <p>상태: {farm.status || '활성'}</p>
                        <div style={styles.cardFooter}>
                            <span style={styles.clickGuide}>클릭하여 모니터링 페이지로 이동</span>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>새 농장 추가</h3>
                        <form onSubmit={handleAddFarm}>
                            <div style={styles.formGroup}>
                                <label>농장 이름:</label>
                                <input
                                    type="text"
                                    value={newFarm.name}
                                    onChange={(e) => setNewFarm({...newFarm, name: e.target.value})}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>위치:</label>
                                <input
                                    type="text"
                                    value={newFarm.location}
                                    onChange={(e) => setNewFarm({...newFarm, location: e.target.value})}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>설명:</label>
                                <textarea
                                    value={newFarm.description}
                                    onChange={(e) => setNewFarm({...newFarm, description: e.target.value})}
                                    style={styles.textarea}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>포트 번호:</label>
                                <input
                                    type="text"
                                    value={newFarm.port}
                                    onChange={(e) => setNewFarm({...newFarm, port: e.target.value})}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.submitButton}>
                                    추가
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    style={styles.cancelButton}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '20px'
    },
    farmGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
    },
    farmCard: {
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: 'white',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%'
    },
    formGroup: {
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    textarea: {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minHeight: '100px'
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    },
    submitButton: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    cancelButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    cardFooter: {
        marginTop: '10px',
        borderTop: '1px solid #eee',
        paddingTop: '10px'
    },
    clickGuide: {
        fontSize: '0.8em',
        color: '#666',
        fontStyle: 'italic'
    }
};

export default FarmManagement; 