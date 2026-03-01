
import { messaging, getToken, onMessage } from './firebaseConfig';
import { supabase } from './supabase';

export const setupForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground: ', payload);
    // إظهار تنبيه داخلي في التطبيق عند وصول إشعار وأنت تتصفحه
    if (window.addToast) {
      window.addToast(payload.notification?.title || 'إشعار جديد', 'info');
    }
  });
};

export const requestNotificationPermission = async (userId: string) => {
  try {
    // التأكد من دعم المتصفح للإشعارات
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // تسجيل الـ Service Worker يدوياً لضمان عمله في بيئة Vite
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      const token = await getToken(messaging, {
        vapidKey: 'BMnTS6pKsWRU-Idg_il2McWvfrN5L9dWffT8s7_s8PmzeIR9wGKnAJXAdYqZnFA7WFBvvv-XMzv27nomY8FlQa4',
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('FCM Token generated successfully');
        // تخزين التوكن في قاعدة البيانات
        const { error } = await supabase
          .from('profiles')
          .update({ fcm_token: token })
          .eq('id', userId);

        if (error) console.error('Error saving FCM token to Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error in notification setup:', error);
  }
};
