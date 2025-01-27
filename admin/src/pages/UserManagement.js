import React, { useState, useEffect } from 'react';

function UserManagement() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('사용자 목록 조회 실패:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    alert('사용자가 삭제되었습니다.');
                    fetchUsers();
                }
            } catch (error) {
                alert('삭제 중 오류가 발생했습니다.');
                console.error('삭제 오류:', error);
            }
        }
    };

    return (
        <div>
            <h2>사용자 관리</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    style={styles.deleteButton}
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    },
    deleteButton: {
        padding: '5px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default UserManagement;
