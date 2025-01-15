import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CostInputPage.css';

function CostInputPage() {
    const navigate = useNavigate();
    const [costData, setCostData] = useState({
        laborCost: '',
        maintenanceCost: '',
        seedCost: '',
        etcCost: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCostData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitted Cost Data:", costData);
        // 백엔드 연동 전 임시로 TotalCostPage로 이동
        navigate('/dashboard/profit/TotalCostPage');
    };

    return (
        <form onSubmit={handleSubmit} className="input-form">
            <h2>총비용 데이터 입력</h2>
            <div className="input-group">
                <label>인건비:</label>
                <input 
                    type="number" 
                    name="laborCost" 
                    value={costData.laborCost} 
                    onChange={handleInputChange} 
                    placeholder="인건비를 입력하세요"
                />
            </div>
            <div className="input-group">
                <label>유지보수비:</label>
                <input 
                    type="number" 
                    name="maintenanceCost" 
                    value={costData.maintenanceCost} 
                    onChange={handleInputChange} 
                    placeholder="유지보수비를 입력하세요"
                />
            </div>
            <div className="input-group">
                <label>종자비:</label>
                <input 
                    type="number" 
                    name="seedCost" 
                    value={costData.seedCost} 
                    onChange={handleInputChange} 
                    placeholder="종자비를 입력하세요"
                />
            </div>
            <div className="input-group">
                <label>기타 비용:</label>
                <input 
                    type="number" 
                    name="etcCost" 
                    value={costData.etcCost} 
                    onChange={handleInputChange} 
                    placeholder="기타 비용을 입력하세요"
                />
            </div>
            <div className="button-container">
                <button type="submit">데이터 제출</button>
            </div>
        </form>
    );
}

export default CostInputPage;