const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionService = require('../services/visionService');

// 이미지 업로드를 위한 multer 설정
const upload = multer({ dest: 'uploads/crops/' });

// 작물 이미지 분석 API
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        const result = await visionService.analyzeCrop(req.file.path);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 