import React from 'react';
import { useNavigate } from 'react-router-dom';
import Graph from './Graph';
import Button from './Button';
import './MainPage.css';

function MainPage() {
    const navigate = useNavigate();

    const handleRevenueClick = () => navigate('/dashboard/profit/TotalRevenuePage');
    const handleCostClick = () => navigate('/dashboard/profit/TotalCostPage');
    const handleProfitClick = () => navigate('/dashboard/profit/NetProfitPage');

    const chartData = {
        labels: ['1월', '2월', '3월', '4월', '5월'],
        datasets: [{
            label: '예상 수익',
            data: [1000, 1500, 1200, 1800, 2000],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    return (
        <div className="profit-main-page">
            <h1 className="profit-title">예상 수익</h1>
            <div className="profit-graph-container">
                <Graph chartData={chartData} />
            </div>
            <div className="profit-button-container">
                <Button onClick={handleRevenueClick}>총수익</Button>
                <Button onClick={handleCostClick}>총비용</Button>
                <Button onClick={handleProfitClick}>순이익</Button>
            </div>
        </div>
    );
}

export default MainPage;