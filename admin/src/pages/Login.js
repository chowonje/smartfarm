import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response:', data);  // 응답 데이터 확인

            if (data.success) {
                // JWT 토큰 저장
                localStorage.setItem('adminToken', data.token);
                
                // 관리자 정보 저장
                localStorage.setItem('adminInfo', JSON.stringify(data.admin));
                
                // 대시보드로 이동
                navigate('/dashboard');
            } else {
                alert(data.message || '로그인 실패');
            }
        } catch (error) {
            console.error('로그인 오류:', error.message);
            alert('서버 연결에 실패했습니다. 서버가 실행중인지 확인해주세요.');
        }
    };

    return (
        <div className="login-container">
            <h2>관리자 로그인</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={credentials.email}
                        onChange={(e) => setCredentials({
                            ...credentials,
                            email: e.target.value
                        })}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={credentials.password}
                        onChange={(e) => setCredentials({
                            ...credentials,
                            password: e.target.value
                        })}
                    />
                </div>
                <button type="submit">로그인</button>
            </form>
        </div>
    );
}

export default Login;
