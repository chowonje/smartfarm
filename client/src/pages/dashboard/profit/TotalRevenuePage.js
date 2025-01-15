import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';

function TotalRevenuePage() {
    const navigate = useNavigate();
    const totalRevenue = 5000;

    const handleInputClick = () => {
        navigate('/dashboard/profit/RevenueInputPage');
    };

    return (
        <div className="revenue-page">
            <h1>총수익</h1>
            <p>총수익: {totalRevenue}원</p>
            <div className="button-container">
                <Button onClick={handleInputClick}>수익 입력</Button>
                <Link to="/dashboard/profit/MainPage">
                    <Button>메인으로</Button>
                </Link>
            </div>
        </div>
    );
}

export default TotalRevenuePage;
