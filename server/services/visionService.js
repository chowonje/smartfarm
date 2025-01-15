const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
    keyFilename: './config/service-account-key.json'
});

async function analyzeCrop(imagePath) {
    // Vision AI 분석 로직
    // 이전에 작성한 분석 코드를 여기로 이동
}

module.exports = {
    analyzeCrop
}; 