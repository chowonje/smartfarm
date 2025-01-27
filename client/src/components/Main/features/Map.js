import React, { useEffect, useRef, useState } from 'react';

function Map({ activeTab, onLocationSelect }) {
  const mapContainer = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infowindows, setInfowindows] = useState([]);

  // 지도 초기화
  useEffect(() => {
    if (activeTab === 'map' && mapContainer.current && !map) {
      const initializeMap = () => {
        try {
          const options = {
            center: new window.kakao.maps.LatLng(37.5386, 127.1254),
            level: 3
          };

          const newMap = new window.kakao.maps.Map(mapContainer.current, options);
          setMap(newMap);
          console.log('지도 초기화 완료');
        } catch (error) {
          console.error('지도 초기화 중 오류:', error);
        }
      };

      // kakao maps API가 로드된 후에 초기화
      if (window.kakao && window.kakao.maps) {
        initializeMap();
      } else {
        console.error('카카오맵 SDK가 로드되지 않았습니다.');
      }
    }
  }, [activeTab, map]);

  // 마커와 인포윈도우 정리
  useEffect(() => {
    return () => {
      if (map && (markers.length > 0 || infowindows.length > 0)) {
        markers.forEach(marker => marker.setMap(null));
        infowindows.forEach(infowindow => infowindow.close());
        setMarkers([]);
        setInfowindows([]);
      }
    };
  }, [map, markers, infowindows]);

  const displayPlaces = (places) => {
    if (!map) {
      console.log('지도가 아직 로드되지 않았습니다.');
      return;
    }

    // 기존 마커와 인포윈도우 제거
    markers.forEach(marker => marker.setMap(null));
    infowindows.forEach(infowindow => infowindow.close());
    
    const newMarkers = [];
    const newInfowindows = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    // 단일 장소 데이터를 배열로 변환
    const placesArray = Array.isArray(places) ? places : [places];

    placesArray.forEach(place => {
      console.log('처리중인 장소 데이터:', place); // 디버깅용 로그

      if (!place.y || !place.x) {
        console.log(`위치 정보 없음: ${place.place_name}`);
        return;
      }

      const position = new window.kakao.maps.LatLng(place.y, place.x);
      const marker = new window.kakao.maps.Marker({
        map: map,
        position: position
      });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:5px;font-size:12px;">
            <strong>${place.place_name}</strong><br/>
            ${place.road_address_name || place.address_name}<br/>
            ${place.phone ? `연락처: ${place.phone}` : ''}
          </div>
        `
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        newInfowindows.forEach(iw => iw.close());
        infowindow.open(map, marker);
      });

      bounds.extend(position);
      newMarkers.push(marker);
      newInfowindows.push(infowindow);
    });

    setMarkers(newMarkers);
    setInfowindows(newInfowindows);

    if (newMarkers.length > 0) {
      map.setBounds(bounds);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/api/map?query=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      
      const data = await response.json();

      if (data.success && data.data) {
        const location = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          address: data.data.address_name,  // 한글 주소
          place_name: data.data.place_name  // 장소명
        };
        
        displayPlaces({
          place_name: data.data.place_name,
          address_name: data.data.address_name,
          road_address_name: data.data.road_address_name,
          y: data.data.latitude,
          x: data.data.longitude,
          phone: data.data.phone
        });

        // 위치 정보를 상위 컴포넌트로 전달
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="map-wrapper" style={{ 
      padding: '20px',
      width: '100%',
      height: '100%'
    }}>
      <h2>스마트팜 지도</h2>
      <div className="map-container" style={{ 
        width: '100%',
        height: 'calc(100vh - 200px)',
        position: 'relative',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div className="search-container" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: '2',
          display: 'flex',
          gap: '10px',
          background: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="주소를 입력하세요"
            style={{
              padding: '8px',
              width: '200px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            검색
          </button>
        </div>
        <div 
          ref={mapContainer} 
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }} 
        />
      </div>
    </div>
  );
}

export default Map;
