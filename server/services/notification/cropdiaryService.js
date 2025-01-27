const supabase = require('../../config/supabase');
const environmentSensorService = require('../sensors/environmentSensorService');
const waterTankService = require('../sensors/waterTankService');
const { getSeoulWeather } = require('../../routes/weather');
const axios = require('axios');

class CropDiaryService {
    constructor() {
        this.crops = {
            1: {
                name: '버터헤드',
                temp: { min: 18, max: 25 },
                humidity: { min: 40, max: 70 },
                waterTemp: { min: 18, max: 24 },
                ph: { min: 6.0, max: 6.8 }
            },
            2: {
                name: '청경채',
                temp: { min: 21, max: 30 },
                humidity: { min: 50, max: 70 },
                waterTemp: { min: 18, max: 24 },
                ph: { min: 6.0, max: 6.8 }
            },
            3: {
                name: '루꼴라',
                temp: { min: 15, max: 20 },
                humidity: { min: 60, max: 70 },
                waterTemp: { min: 15, max: 20 },
                ph: { min: 6.0, max: 7.0 }
            },
            4: {
                name: '바질',
                temp: { min: 20, max: 25 },
                humidity: { min: 50, max: 70 },
                waterTemp: { min: 18, max: 24 },
                ph: { min: 6.0, max: 6.8 }
            }
        };
        this.startAutoLogging();
    }

    evaluateStatus(bedNumber, temperature, humidity, waterTemp, ph) {
        const crop = this.crops[bedNumber];
        if (!crop) return '보통';

        // 모든 조건 확인
        const tempOk = temperature >= crop.temp.min && temperature <= crop.temp.max;
        const humidityOk = humidity >= crop.humidity.min && humidity <= crop.humidity.max;
        const waterTempOk = waterTemp >= crop.waterTemp.min && waterTemp <= crop.waterTemp.max;
        const phOk = ph >= crop.ph.min && ph <= crop.ph.max;

        // 모든 조건이 만족되면 '좋음'
        if (tempOk && humidityOk && waterTempOk && phOk) return '좋음';
        // 모든 조건이 불만족이면 '나쁨'
        if (!tempOk && !humidityOk && !waterTempOk && !phOk) return '나쁨';
        // 그 외는 '보통'
        return '보통';
    }

    generateContent(bedNumber, status, temperature, humidity, waterTemp, ph) {
        const crop = this.crops[bedNumber];
        if (!crop) return '';

        let content = `${crop.name} 생육 상태: ${status}\n`;
        content += `온도: ${temperature}°C (적정 범위: ${crop.temp.min}-${crop.temp.max}°C)\n`;
        content += `습도: ${humidity}% (적정 범위: ${crop.humidity.min}-${crop.humidity.max}%)\n`;
        content += `수온: ${waterTemp}°C (적정 범위: ${crop.waterTemp.min}-${crop.waterTemp.max}°C)\n`;
        content += `pH: ${ph} (적정 범위: ${crop.ph.min}-${crop.ph.max})\n`;
        
        if (status === '나쁨') {
            if (temperature < crop.temp.min) content += "온도가 너무 낮습니다.\n";
            if (temperature > crop.temp.max) content += "온도가 너무 높습니다.\n";
            if (humidity < crop.humidity.min) content += "습도가 너무 낮습니다.\n";
            if (humidity > crop.humidity.max) content += "습도가 너무 높습니다.\n";
            if (waterTemp < crop.waterTemp.min) content += "수온이 너무 낮습니다.\n";
            if (waterTemp > crop.waterTemp.max) content += "수온이 너무 높습니다.\n";
            if (ph < crop.ph.min) content += "pH가 너무 낮습니다.\n";
            if (ph > crop.ph.max) content += "pH가 너무 높습니다.\n";
        }

        return content;
    }

    async collectSensorData() {
        const sensorData = {};
        for (const bedNumber of Object.keys(this.crops)) {
            let latestBedData = {};
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_API_URL}/sensor/bed/${bedNumber}`);
                latestBedData = response.data;
                console.log(`Fetched data for bed ${bedNumber}:`, latestBedData);
            } catch (error) {
                console.error(`Error fetching latest bed data for bed ${bedNumber}:`, error);
            }

            const waterTankData = await waterTankService.getLatestData() || {};
            const weatherData = await getSeoulWeather() || {};

            sensorData[bedNumber] = {
                temperature: latestBedData?.temperature ? parseFloat(latestBedData.temperature) : null,
                humidity: latestBedData?.humidity ? parseFloat(latestBedData.humidity) : null,
                water_temperature: waterTankData?.water_temperature ? parseFloat(waterTankData.water_temperature) : null,
                ph_level: waterTankData?.ph_level ? parseFloat(waterTankData.ph_level) : null,
                weather: {
                    temperature: weatherData?.temperature || null,
                    description: weatherData?.description || null,
                    feelsLike: weatherData?.feelsLike || null,
                    humidity: weatherData?.humidity || null,
                    windSpeed: weatherData?.windSpeed || null,
                    tempMin: weatherData?.tempMin || null,
                    tempMax: weatherData?.tempMax || null,
                    sunrise: weatherData?.sunrise || null,
                    sunset: weatherData?.sunset || null
                }
            };
        }
        return sensorData;
    }

    async saveToDatabase(bedNumber, sensorData) {
        const diaryEntry = {
            bed_number: bedNumber,
            crop_name: this.crops[bedNumber].name,
            status: this.evaluateStatus(
                bedNumber,
                sensorData.temperature,
                sensorData.humidity,
                sensorData.water_temperature,
                sensorData.ph_level
            ),
            manager: '관리자',
            content: this.generateContent(
                bedNumber,
                this.evaluateStatus(
                    bedNumber,
                    sensorData.temperature,
                    sensorData.humidity,
                    sensorData.water_temperature,
                    sensorData.ph_level
                ),
                sensorData.temperature,
                sensorData.humidity,
                sensorData.water_temperature,
                sensorData.ph_level
            ),
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            light: null, // 필요에 따라 추가
            Gas: null, // 필요에 따라 추가
            water_level: null, // 필요에 따라 추가
            water_temperature: sensorData.water_temperature,
            ph_level: sensorData.ph_level,
            weather_temp: sensorData.weather.temperature,
            weather_desc: sensorData.weather.description,
            weather_feels_like: sensorData.weather.feelsLike,
            weather_humidity: sensorData.weather.humidity,
            weather_wind_speed: sensorData.weather.windSpeed,
            weather_temp_min: sensorData.weather.tempMin,
            weather_temp_max: sensorData.weather.tempMax,
            weather_sunrise: sensorData.weather.sunrise,
            weather_sunset: sensorData.weather.sunset
        };

            const { error } = await supabase
                .from('crop_diary')
                .insert([diaryEntry]);

        if (error) {
            console.error(`Database save error:`, error);
        } else {
            console.log(`${this.crops[bedNumber].name} 작물 일지 자동 작성 완료`);
        }
    }

    async createDiaryEntry(bedNumber) {
        try {
            console.log(`작물 일지 작성 시작 (베드 ${bedNumber})`);
            const sensorData = await this.collectSensorData();
            await this.saveToDatabase(bedNumber, sensorData[bedNumber]);
        } catch (error) {
            console.error(`작물 일지 작성 실패 (베드 ${bedNumber}):`, error);
        }
    }

    startAutoLogging() {
        // 즉시 각 베드의 작물 일지 작성
        Object.keys(this.crops).forEach(bedNumber => {
            this.createDiaryEntry(parseInt(bedNumber)); // 즉시 작성
        });

        // 1시간마다 작물 일지 작성
        setInterval(() => {
            Object.keys(this.crops).forEach(bedNumber => {
                this.createDiaryEntry(parseInt(bedNumber)); // 1시간마다 작성
            });
        }, 3600000); // 1시간 (3600000 밀리초)
    }
}

module.exports = new CropDiaryService();