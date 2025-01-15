const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 테스트용 라우트
router.get('/test', (req, res) => {
    res.json({ message: 'ChatGPT 라우터가 정상적으로 작동중입니다.' });
});

router.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        
        console.log('Received question:', question);
        console.log('API Key:', OPENAI_API_KEY);

        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured');
        }

        if (!question) {
            return res.status(400).json({
                success: false,
                error: '질문을 입력해주세요.'
            });
        }

        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a helpful assistant specializing in smart farming and hydroponics. Please provide answers in Korean.' 
                    },
                    { 
                        role: 'user', 
                        content: question 
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        console.log('OpenAI Response:', response.data);

        res.json({
            success: true,
            answer: response.data.choices[0].message.content
        });

    } catch (error) {
        console.error('Detailed Error:', error);
        console.error('Error response:', error.response?.data);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || error.message
        });
    }
});

module.exports = router; 