import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [registerData, setRegisterData] = useState({
        id: '',
        name: '',
        password: '',
        phone: '',
        address: '',
        email: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5003/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (data.success) {
                alert('회원가입이 완료되었습니다.');
                navigate('/login');
            } else {
                setError(data.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 에러:', error);
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>회원가입</h2>
                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="id"
                            placeholder="아이디"
                            value={registerData.id}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="이름"
                            value={registerData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={registerData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="전화번호"
                            value={registerData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="address"
                            placeholder="주소"
                            value={registerData.address}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={registerData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="button-group">
                        <button type="submit" className="primary-button">
                            회원가입
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="secondary-button"
                        >
                            로그인으로 돌아가기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
