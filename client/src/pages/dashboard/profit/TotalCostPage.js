import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';

function TotalCostPage() {
    const navigate = useNavigate();
    const totalCost = 2000;

    const handleInputClick = () => {
        navigate('/dashboard/profit/CostInputPage');
    };

    return (
        <div className="cost-page">
            <h1>총비용</h1>
            <p>총비용: {totalCost}원</p>
            <div className="button-container">
                <Button onClick={handleInputClick}>비용 입력</Button>
                <Link to="/dashboard/profit/MainPage">
                    <Button>메인으로</Button>
                </Link>
            </div>
        </div>
    );
}

export default TotalCostPage;