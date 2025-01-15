import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

function TotalRevenuePage() {
    // 실제 데이터는 여기서 가져와야 함
    const totalRevenue = 5000;

  return (
    <div>
      <h1>총수익</h1>
      <p>총수익: {totalRevenue}원</p>
      <Link to="/">
        <Button>메인으로</Button>
      </Link>
    </div>
  );
}

function TotalCostPage() {
    const totalCost = 2000;
  return (
    <div>
      <h1>총비용</h1>
      <p>총비용: {totalCost}원</p>
      <Link to="/">
      <Button>메인으로</Button>
      </Link>
    </div>
  );
}


function NetProfitPage() {
    const totalRevenue = 5000;
    const totalCost = 2000;
    const netProfit = totalRevenue - totalCost;
  return (
    <div>
      <h1>순이익</h1>
      <p>순이익: {netProfit}원</p>
      <Link to="/">
        <Button>메인으로</Button>
      </Link>
    </div>
  );
}


export default TotalRevenuePage;
export { TotalCostPage, NetProfitPage };