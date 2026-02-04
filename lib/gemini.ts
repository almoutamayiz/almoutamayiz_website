
import { GoogleGenAI } from "@google/genai";

/**
 * تهيئة عميل Gemini مع نظام التدوير الذكي للمفاتيح (Load Balancing).
 * يدعم بيئة Vercel و Vite بشكل كامل.
 */
export const initGemini = () => {
  const keys: string[] = [];

  // دالة مساعدة لإضافة المفتاح إذا كان صالحاً
  const addKey = (key: any) => {
    if (key && typeof key === 'string' && key.trim().length > 10) { // التحقق من أن المفتاح ليس فارغاً وطويل بما يكفي
      keys.push(key.trim());
    }
  };

  // 1. الوصول للمتغيرات في بيئة Vite (المتصفح/Vercel Client-Side)
  // ملاحظة هامة: في Vercel، يجب تسمية المفاتيح بـ VITE_API_KEY_1، VITE_API_KEY_2...
  const viteEnv = (import.meta as any).env || {};

  // إضافة المفتاح الرئيسي
  addKey(viteEnv.VITE_API_KEY);
  addKey(viteEnv.API_KEY); // محاولة، قد لا تعمل في المتصفح لكن نحتفظ بها

  if (typeof process !== 'undefined' && process.env) {
    addKey(process.env.API_KEY);
    addKey(process.env.VITE_API_KEY);
  }

  // 2. تدوير المفاتيح من 1 إلى 15 لضمان عدم الضغط (Load Balancing)
  for (let i = 1; i <= 15; i++) {
    // محاولة الصيغ المختلفة (مع VITE وبدون)
    addKey(viteEnv[`VITE_API_KEY_${i}`]);
    addKey(viteEnv[`API_KEY_${i}`]);
    
    if (typeof process !== 'undefined' && process.env) {
      addKey(process.env[`API_KEY_${i}`]);
      addKey(process.env[`VITE_API_KEY_${i}`]);
    }
  }

  // إزالة التكرار
  const uniqueKeys = [...new Set(keys)];

  // التحقق النهائي
  if (uniqueKeys.length === 0) {
    console.error("Gemini API Error: No API keys found. Please check Vercel Environment Variables (Must start with VITE_).");
    throw new Error("لم يتم العثور على مفاتيح API. تأكد من إعداد VITE_API_KEY في إعدادات الاستضافة.");
  }

  // اختيار مفتاح عشوائي لتوزيع الحمل
  const randomKey = uniqueKeys[Math.floor(Math.random() * uniqueKeys.length)];
  
  // طباعة توضيحية للمطور (تظهر في الكونسول للتأكد من عدد المفاتيح المحملة)
  // console.log(`Loaded ${uniqueKeys.length} API keys. Using key ending in ...${randomKey.slice(-4)}`);

  return new GoogleGenAI({ apiKey: randomKey });
};

/**
 * معالج أخطاء ذكي يعيد رسائل مفهومة للمستخدم العربي.
 */
export const formatGeminiError = (error: any): string => {
  console.error("Gemini Error Log:", error);

  if (!error) return "حدث خطأ غير متوقع في الاتصال";

  const message = (error.message || error.toString()).toLowerCase();

  if (message.includes('400') || message.includes('invalid_argument')) {
    return "صياغة الطلب غير مقبولة للنموذج، حاول تغيير النص.";
  }
  if (message.includes('403') || message.includes('permission_denied') || message.includes('api_key_invalid')) {
    return "المفتاح المستخدم حالياً محظور أو غير صالح. (سيتم استخدام مفتاح آخر في المحاولة القادمة)";
  }
  if (message.includes('429') || message.includes('resource_exhausted') || message.includes('too many requests')) {
    return "ضغط عالٍ جداً على المفاتيح الحالية. يرجى الانتظار دقيقة ثم المحاولة.";
  }
  if (message.includes('500') || message.includes('internal')) {
    return "خطأ مؤقت في خوادم جوجل، حاول مجدداً.";
  }
  if (message.includes('503') || message.includes('overloaded')) {
    return "النموذج الذكي مشغول جداً حالياً (Overloaded).";
  }
  if (message.includes('fetch') || message.includes('network')) {
    return "تأكد من اتصالك بالإنترنت.";
  }

  return "حدث خطأ تقني أثناء المعالجة.";
};
