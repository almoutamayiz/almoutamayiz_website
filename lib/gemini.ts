
import { GoogleGenAI } from "@google/genai";

/**
 * تهيئة عميل Gemini.
 * يلتزم بمعايير الكود لاستخدام process.env.API_KEY
 * مع الحفاظ على منطق تدوير المفاتيح كخيار إضافي لتعزيز الاستقرار.
 */
export const initGemini = () => {
  const keys: string[] = [];

  // 1. الأولوية للمفتاح القياسي (Standard Env Var) - حسب التعليمات
  // Assume process.env.API_KEY is pre-configured and valid
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    keys.push(process.env.API_KEY);
  }

  // 2. دعم بيئة Vite المحلية (Local Dev)
  const viteEnv = (import.meta as any).env || {};
  if (viteEnv.VITE_API_KEY) {
    keys.push(viteEnv.VITE_API_KEY);
  }

  // 3. دعم تدوير المفاتيح (Key Rotation) إذا توفرت مفاتيح إضافية
  for (let i = 1; i <= 20; i++) {
    const key = viteEnv[`VITE_API_KEY_${i}`] || (typeof process !== 'undefined' && process.env?.[`API_KEY_${i}`]);
    if (key && typeof key === 'string' && key.trim().length > 0) {
      keys.push(key);
    }
  }

  // التحقق النهائي
  if (keys.length === 0) {
    console.error("Gemini API Error: No API keys found in environment variables.");
    // لمنع توقف التطبيق كلياً عند التحميل، يمكننا رمي خطأ يتم التقاطه لاحقاً
    throw new Error("Missing API Keys - يرجى التأكد من إعداد API_KEY أو VITE_API_KEY");
  }

  // اختيار مفتاح عشوائي لتوزيع الحمل (Load Balancing)
  const randomKey = keys[Math.floor(Math.random() * keys.length)];

  return new GoogleGenAI({ apiKey: randomKey });
};

/**
 * معالج أخطاء ذكي يعيد رسائل مفهومة للمستخدم العربي.
 */
export const formatGeminiError = (error: any): string => {
  console.error("Gemini Error Log:", error);

  if (!error) return "حدث خطأ غير متوقع في الاتصال";

  const message = error.message || error.toString();

  if (message.includes('400') || message.includes('INVALID_ARGUMENT')) {
    return "لا يمكن معالجة هذا النص، يرجى المحاولة بصياغة أخرى.";
  }
  if (message.includes('403') || message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
    return "المفتاح المستخدم حالياً مشغول أو غير صالح. حاول مجدداً.";
  }
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return "ضغط عالٍ على الخادم. يرجى المحاولة بعد قليل.";
  }
  if (message.includes('500') || message.includes('Internal')) {
    return "خطأ مؤقت في خوادم جوجل، حاول مجدداً.";
  }
  if (message.includes('fetch') || message.includes('Network')) {
    return "تأكد من اتصالك بالإنترنت.";
  }

  return "حدث خطأ تقني، يرجى إعادة المحاولة.";
};
