
import { GoogleGenAI } from "@google/genai";

/**
 * تهيئة عميل Gemini مع نظام التدوير الذكي للمفاتيح (Load Balancing).
 * يدعم بيئة Vercel و Vite بشكل كامل.
 */
export const initGemini = () => {
  const keys: string[] = [];

  // 1. محاولة الوصول عبر import.meta.env (الطريقة القياسية في Vite)
  // نستخدم casting (as any) لتجنب أخطاء TypeScript إذا لم تكن الأنواع معرفة
  const viteEnv = (import.meta as any).env || {};

  // القائمة الصريحة للمتغيرات لضمان أن الـ Bundler يقوم بتضمينها
  // ملاحظة: في Vercel، يجب تسمية المفاتيح بـ VITE_API_KEY للحماية والأمان
  const possibleKeys = [
    viteEnv.VITE_API_KEY,
    viteEnv.VITE_API_KEY_1,
    viteEnv.VITE_API_KEY_2,
    viteEnv.VITE_API_KEY_3,
    viteEnv.VITE_API_KEY_4,
    viteEnv.VITE_API_KEY_5,
    viteEnv.VITE_API_KEY_6,
    viteEnv.VITE_API_KEY_7,
    viteEnv.VITE_API_KEY_8,
    viteEnv.VITE_API_KEY_9,
    viteEnv.VITE_API_KEY_10,
    viteEnv.API_KEY, // محاولة احتياطية
    // دعم خاص لـ process.env في حال كانت البيئة تدعمه (مثل Node.js أو بعض إعدادات Vercel القديمة)
    typeof process !== 'undefined' && process.env ? process.env.VITE_API_KEY : undefined,
    typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined
  ];

  // تصفية المفاتيح الصالحة فقط
  possibleKeys.forEach(key => {
    if (key && typeof key === 'string' && key.trim().length > 10 && !key.includes('placeholder')) {
      keys.push(key.trim());
    }
  });

  // إزالة التكرار
  const uniqueKeys = [...new Set(keys)];

  // التحقق النهائي
  if (uniqueKeys.length === 0) {
    console.error("Gemini API Error: No valid API keys found.");
    // رمي خطأ صريح ليظهر للمطور/المستخدم
    throw new Error("مفاتيح الربط مفقودة. تأكد من إضافة VITE_API_KEY في إعدادات Vercel (Environment Variables).");
  }

  // اختيار مفتاح عشوائي لتوزيع الحمل (Load Balancing)
  const randomKey = uniqueKeys[Math.floor(Math.random() * uniqueKeys.length)];
  
  return new GoogleGenAI({ apiKey: randomKey });
};

/**
 * معالج أخطاء ذكي يعيد رسائل مفهومة للمستخدم العربي.
 */
export const formatGeminiError = (error: any): string => {
  console.error("Gemini Error Log:", error);

  if (!error) return "حدث خطأ غير متوقع في الاتصال";

  // تحويل الخطأ لنص للبحث فيه
  const message = (error.message || error.toString()).toLowerCase();

  // تحليل نوع الخطأ
  if (message.includes('400') || message.includes('invalid_argument')) {
    return "صياغة الطلب غير مقبولة للنموذج، حاول تغيير النص.";
  }
  if (message.includes('403') || message.includes('permission_denied') || message.includes('api_key_invalid')) {
    return "مفتاح API المستخدم محظور أو غير صالح. (سيتم استخدام مفتاح آخر تلقائياً في المرة القادمة).";
  }
  if (message.includes('429') || message.includes('resource_exhausted') || message.includes('too many requests')) {
    return "الخادم مشغول جداً حالياً (ضغط عالٍ). يرجى الانتظار دقيقة ثم المحاولة.";
  }
  if (message.includes('500') || message.includes('internal')) {
    return "خطأ مؤقت في خوادم جوجل، حاول مجدداً.";
  }
  if (message.includes('503') || message.includes('overloaded')) {
    return "النموذج الذكي تحت ضغط شديد (Overloaded).";
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
    return "فشل الاتصال بالإنترنت، تأكد من الشبكة.";
  }
  if (message.includes('candidate') || message.includes('safety')) {
    return "تم حجب الإجابة لانتهاكها معايير الأمان أو المحتوى.";
  }

  return "حدث خطأ تقني أثناء المعالجة (Code: Unknown).";
};
