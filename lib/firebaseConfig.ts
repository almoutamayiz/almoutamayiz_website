
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCgsA2AuOZUAi-O0VLHSvQK040mIlVt1Es",
  authDomain: "almoutamayiz-6a7ac.firebaseapp.com",
  projectId: "almoutamayiz-6a7ac",
  storageBucket: "almoutamayiz-6a7ac.appspot.com",
  messagingSenderId: "339333129137",
  appId: "1:339333129137:web:737d3ae9a88fc635f51390"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export { getToken, onMessage };
