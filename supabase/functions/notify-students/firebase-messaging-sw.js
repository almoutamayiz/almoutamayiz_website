
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCgsA2AuOZUAi-O0VLHSvQK040mIlVt1Es",
  authDomain: "almoutamayiz-6a7ac.firebaseapp.com",
  projectId: "almoutamayiz-6a7ac",
  storageBucket: "almoutamayiz-6a7ac.appspot.com",
  messagingSenderId: "339333129137",
  appId: "1:339333129137:web:737d3ae9a88fc635f51390"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.ibb.co/SDT3LtNC/IMG-20260111-172954.jpg',
    badge: 'https://i.ibb.co/SDT3LtNC/IMG-20260111-172954.jpg',
    tag: 'almoutamayiz-notif',
    renotify: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
