import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

function Login({ setIsAuthenticated }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!id || !password) {
                setError('아이디와 비밀번호를 모두 입력해주세요.');
                return;
            }

            const response = await fetch('http://localhost:5003/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id.trim(),
                    password: password.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsAuthenticated(true);
                navigate('/');
            } else {
                setError(data.message || '아이디 또는 비밀번호가 잘못되었습니다.');
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>로그인</h2>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin(e);
                    }} 
                    className="auth-form"
                >
                    <div className="form-group">
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder="아이디"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호"
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="button-group">
                        <button type="submit" className="primary-button">
                            로그인
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="secondary-button"
                        >
                            회원가입
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;