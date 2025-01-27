import React, { useState } from 'react';
import WaterTank from './WaterTank';
import Bed1 from './Bed1';
import Bed2 from './Bed2';
import Bed3 from './Bed3';
import Bed4 from './Bed4';
import '../../../styles/Environment.css';

const Environment = () => {
    const [selectedBed, setSelectedBed] = useState(null);

    const renderContent = () => {
        switch (selectedBed) {
            case 1:
                return <Bed1 />;
            case 2:
                return <Bed2 />;
            case 3:
                return <Bed3 />;
            case 4:
                return <Bed4 />;
            default:
                return null;
        }
    };

    return (
        <div className="environment-container">
            <div className="bed-selector">
                <h2>베드 선택</h2>
                <div className="bed-buttons">
                    {[1, 2, 3, 4].map((bedNum) => (
                        <button
                            key={bedNum}
                            className={`bed-button ${selectedBed === bedNum ? 'active' : ''}`}
                            onClick={() => setSelectedBed(bedNum)}
                        >
                            베드 {bedNum}
                        </button>
                    ))}
                </div>
            </div>

            {/* 선택된 베드의 컴포넌트 렌더링 */}
            <div className="bed-content">
                {renderContent()}
            </div>

            {/* 물탱크는 항상 표시 */}
            <WaterTank />
        </div>
    );
};

export default Environment;