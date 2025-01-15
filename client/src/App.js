import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import News from './components/Main/features/News';
import Price from './components/Main/features/Price';
import Map from './components/Main/features/Map';
import Weather from './components/Main/features/Weather';
import ChatGPT from './components/Main/features/ChatGPT';
import Header from './components/Header/Header';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Environment from './pages/dashboard/Environment';
import Control from './pages/dashboard/Control';
import CropList from './pages/dashboard/Crop/List';
import CropWrite from './pages/dashboard/Crop/Write';
import CropView from './pages/dashboard/Crop/View';
import CropEdit from './pages/dashboard/Crop/Edit';
import CropMain from './pages/dashboard/Crop/main';
import DeviceList from './pages/dashboard/Device/List';
import DeviceWrite from './pages/dashboard/Device/Write';
import DeviceView from './pages/dashboard/Device/View';
import DeviceEdit from './pages/dashboard/Device/Edit';
import Alerts from './pages/dashboard/Alert/Alerts';
import MainPage from './pages/dashboard/profit/Mainpage';
import TotalRevenuePage from './pages/dashboard/profit/TotalRevenuePage';
import TotalCostPage from './pages/dashboard/profit/TotalCostPage';
import NetProfitPage from './pages/dashboard/profit/NetProfitPage';
import RevenueInputPage from './pages/dashboard/profit/RevenueInputPage';
import CostInputPage from './pages/dashboard/profit/CostInputPage';
import './styles/App.css';
import { SidebarProvider } from './context/SidebarContext';
import Sidebar from './components/Sidebar/Sidebar';

function MainContent({ isAuthenticated }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('map');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'news':
        return <News activeTab={activeTab} />;
      case 'price':
        return <Price activeTab={activeTab} />;
      case 'weather':
        return <Weather activeTab={activeTab} selectedLocation={selectedLocation} />;
      case 'map':
        return <Map activeTab={activeTab} onLocationSelect={handleLocationSelect} />;
      case 'chatgpt':
        return <ChatGPT />;
      case 'crop':
        return null;
      default:
        return <h2>Welcome to SmartFarm</h2>;
    }
  };

  return (
    <div className="main-content-wrapper">
      <nav className="top-nav">
        <div className="nav-container">
          <div 
            className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => handleTabClick('news')}
          >
            <i className="nav-icon">📰</i>
            <span>뉴스</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => handleTabClick('weather')}
          >
            <i className="nav-icon">🌤</i>
            <span>날씨</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => handleTabClick('map')}
          >
            <i className="nav-icon">🗺</i>
            <span>지도</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'price' ? 'active' : ''}`}
            onClick={() => handleTabClick('price')}
          >
            <i className="nav-icon">💰</i>
            <span>시세</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'chatgpt' ? 'active' : ''}`}
            onClick={() => handleTabClick('chatgpt')}
          >
            <i className="nav-icon">🤖</i>
            <span>ChatGPT</span>
          </div>
        </div>
      </nav>

      <div className="content-container">
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <SidebarProvider>
      <Router>
        <div className="App">
          <Header isAuthenticated={isAuthenticated} />
          <Sidebar />
          <div style={{ paddingTop: '60px' }}>
            <Routes>
              <Route path="/" element={<MainContent isAuthenticated={isAuthenticated} />} />
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard/environment" element={
                <div className="dashboard-content">
                  <Environment />
                </div>
              } />
              <Route path="/dashboard/crop" element={<CropMain />} />
              <Route path="/dashboard/crop/list/:cropType" element={<CropList />} />
              <Route path="/dashboard/crop/list" element={<CropList />} />
              <Route path="/dashboard/crop/write" element={<CropWrite />} />
              <Route path="/dashboard/crop/view/:id" element={<CropView />} />
              <Route path="/dashboard/crop/edit/:id" element={<CropEdit />} />

              <Route path="/dashboard/device" element={<DeviceList />} />
              <Route path="/dashboard/device/write" element={<DeviceWrite />} />
              <Route path="/dashboard/device/view/:id" element={<DeviceView />} />
              <Route path="/dashboard/device/edit/:id" element={<DeviceEdit />} />  
              <Route path="/dashboard/control" element={
                <div className="dashboard-content">
                  <Control />
                </div>
              } />
              <Route path="/dashboard/Alert/Alerts" element={
                <div className="dashboard-content">
                  <Alerts />
                </div>
              } />
              <Route path="/dashboard/profit/MainPage" element={
                <div className="dashboard-content">
                  <MainPage />
                </div>
              } />
              <Route path="/dashboard/profit/TotalRevenuePage" element={
                <div className="dashboard-content">
                  <TotalRevenuePage />
                </div>
              } />
              <Route path="/dashboard/profit/TotalCostPage" element={
                <div className="dashboard-content">
                  <TotalCostPage />
                </div>
              } />
              <Route path="/dashboard/profit/NetProfitPage" element={
                <div className="dashboard-content">
                  <NetProfitPage />
                </div>
              } />
              <Route path="/dashboard/profit/RevenueInputPage" element={
                <div className="dashboard-content">
                  <RevenueInputPage />
                </div>
              } />
              <Route path="/dashboard/profit/CostInputPage" element={
                <div className="dashboard-content">
                  <CostInputPage />
                </div>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </SidebarProvider>
  );
}

export default App;
