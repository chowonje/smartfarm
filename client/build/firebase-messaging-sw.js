/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyD1ApjxgWXhd-dCGWksotw7ymKO9oyznD0",
    authDomain: "smartfarm-notification.firebaseapp.com",
    projectId: "smartfarm-notification",
    storageBucket: "smartfarm-notification.firebasestorage.app",
    messagingSenderId: "564912239654",
    appId: "1:564912239654:web:d6fcaf7ff1ab565e6f22e7"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('백그라운드 메시지 수신:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    registration.showNotification(notificationTitle, notificationOptions);
}); 