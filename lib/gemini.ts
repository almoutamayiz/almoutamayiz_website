
import { GoogleGenAI } from "@google/genai";

/**
 * تهيئة عميل Gemini باستخدام نظام تدوير المفاتيح (Key Rotation).
 * يقوم هذا النظام بسحب مفتاح عشوائي من مجموعة المفاتيح المتوفرة لتوزيع الحمل.
 */
export const initGemini = () => {
  // Access environment variables safely
  // Note: Vite replaces process.env.API_KEY if defined in define config, or we use import.meta.env
  const env = (import.meta as any).env || {};
  const availableKeys: string[] = [];

  // 1. Strict Instruction: Check process.env.API_KEY
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    // @ts-ignore
    availableKeys.push(process.env.API_KEY);
  }

  // 2. Check VITE_API_KEY (Common in Vite)
  if (env.VITE_API_KEY && env.VITE_API_KEY.trim() !== '') {
    availableKeys.push(env.VITE_API_KEY);
  }

  // 3. Rotation Keys (VITE_API_KEY_1 ... VITE_API_KEY_20)
  for (let i = 1; i <= 20; i++) {
    const key = env[`VITE_API_KEY_${i}`];
    if (key && key.trim() !== '') {
      availableKeys.push(key);
    }
  }

  // التحقق من توفر مفاتيح صالحة
  if (availableKeys.length === 0) {
    console.error("Gemini API: No keys found. Ensure API_KEY or VITE_API_KEY_* are set.");
    // Fallback to prevent crash if possible, or throw clearer error
    throw new Error("Missing API Keys - يرجى إضافة مفاتيح API في إعدادات البيئة");
  }

  // 4. Random Load Balancing
  const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];

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
    return "المفتاح المستخدم حالياً مشغول أو غير صالح. حاول مرة أخرى.";
  }
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return "ضغط عالٍ على الخادم. حاول مجدداً الآن.";
  }
  if (message.includes('500') || message.includes('Internal')) {
    return "خطأ مؤقت في خوادم جوجل، حاول مجدداً.";
  }
  if (message.includes('fetch') || message.includes('Network') || message.includes('Failed to fetch')) {
    return "تأكد من اتصالك بالإنترنت.";
  }
  if (message.includes('Missing API Keys')) {
    return "خطأ في التكوين: مفاتيح الذكاء الاصطناعي مفقودة.";
  }

  return "حدث خطأ تقني، يرجى إعادة المحاولة.";
};
