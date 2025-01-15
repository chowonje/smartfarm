const admin = require('firebase-admin');
const serviceAccount = require('../firebase/serviceAccountKey.json');

// Firebase 초기화
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// FCM 알림 전송 함수
const sendFCMNotification = async (title, body, token) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            token: token
        };

        const response = await admin.messaging().send(message);
        console.log('알림 전송 성공:', response);
        return true;
    } catch (error) {
        console.error('알림 전송 실패:', error);
        return false;
    }
};

// 다중 디바이스 알림 전송 함수
const sendMulticastNotification = async (title, body, tokens) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            tokens: tokens // 최대 500개 토큰까지 지원
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log('성공:', response.successCount, '실패:', response.failureCount);
        return response.successCount;
    } catch (error) {
        console.error('다중 알림 전송 실패:', error);
        return 0;
    }
};

module.exports = { sendFCMNotification, sendMulticastNotification }; 