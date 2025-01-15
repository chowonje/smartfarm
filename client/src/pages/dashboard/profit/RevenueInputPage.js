import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RevenueInputPage.css'; // 스타일 파일 import

function InputPage() {
    const navigate = useNavigate();
  const [salesData, setSalesData] = useState({
    basil: { quantity: '', price: '' },
    butterhead: { quantity: '', price: '' },
    arugula: { quantity: '', price: '' },
    bokchoy: { quantity: '', price: '' },
    startDate: '',
    endDate: '',
    discount: '',
    additionalSales: '',
    sellingCost: '',
  });

  const handleChange = (e, crop) => {
    const { name, value } = e.target;
    setSalesData((prevData) => ({
      ...prevData,
      [crop]: { ...prevData[crop], [name]: value },
    }));
  };
    
    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalesData((prevData) => ({
        ...prevData,
        [name]: value
    }))
  };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 입력된 데이터를 백엔드로 전송하는 로직을 여기에 추가해야 합니다.
        console.log("Submitted Data:", salesData);
        // 여기서는 임시로 Main 페이지로 이동합니다.
        navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <h2>판매 데이터 입력</h2>
      
        <h3>바질</h3>
      
            <label>판매량 (kg):</label>
            <input type="number" name="quantity" value={salesData.basil.quantity} onChange={(e) => handleChange(e, 'basil')} />
      
       
            <label>가격 (원/kg):</label>
            <input type="number" name="price" value={salesData.basil.price} onChange={(e) => handleChange(e, 'basil')} />
     
      
      <h3>버터헤드</h3>
        
            <label>판매량 (kg):</label>
            <input type="number" name="quantity" value={salesData.butterhead.quantity} onChange={(e) => handleChange(e, 'butterhead')} />
       
      
            <label>가격 (원/kg):</label>
            <input type="number" name="price" value={salesData.butterhead.price} onChange={(e) => handleChange(e, 'butterhead')} />
       
      
      <h3>루꼴라</h3>
        
            <label>판매량 (kg):</label>
            <input type="number" name="quantity" value={salesData.arugula.quantity} onChange={(e) => handleChange(e, 'arugula')} />
       
      
            <label>가격 (원/kg):</label>
            <input type="number" name="price" value={salesData.arugula.price} onChange={(e) => handleChange(e, 'arugula')} />
      
      
      <h3>청경채</h3>
       
            <label>판매량 (kg):</label>
            <input type="number" name="quantity" value={salesData.bokchoy.quantity} onChange={(e) => handleChange(e, 'bokchoy')} />
       
      
            <label>가격 (원/kg):</label>
            <input type="number" name="price" value={salesData.bokchoy.price} onChange={(e) => handleChange(e, 'bokchoy')} />
      
    
      
          <label>판매 시작일:</label>
          <input type="date" name="startDate" value={salesData.startDate} onChange={handleInputChange} />
    
      
        <label>판매 종료일:</label>
        <input type="date" name="endDate" value={salesData.endDate} onChange={handleInputChange}/>
     
      
        <label>할인율 (%):</label>
        <input type="number" name="discount" value={salesData.discount} onChange={handleInputChange} />
     
     
        <label>부가 판매 (원):</label>
        <input type="number" name="additionalSales" value={salesData.additionalSales} onChange={handleInputChange} />
     
     
        <label>판매 비용 (원):</label>
        <input type="number" name="sellingCost" value={salesData.sellingCost} onChange={handleInputChange}/>
     
     
        <button type="submit">데이터 제출</button>
    </form>
  );
}

export default InputPage;