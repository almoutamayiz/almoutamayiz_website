
import { GoogleGenAI } from "@google/genai";

/**
 * تهيئة عميل Gemini باستخدام نظام تدوير المفاتيح (Key Rotation) الذكي.
 * يبدأ دائماً بالمفتاح الأول، وإذا وجده مشغولاً ينتقل للتالي لضمان أسرع استجابة.
 */
export const initGemini = () => {
  const env = (import.meta as any).env || {};
  const availableKeys: string[] = [];
  const seen = new Set<string>();

  const addKey = (k: string | undefined) => {
    if (k && k.trim() !== '' && !seen.has(k.trim())) {
      availableKeys.push(k.trim());
      seen.add(k.trim());
    }
  };

  // 1. Check process.env.API_KEY
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    // @ts-ignore
    addKey(process.env.API_KEY);
  }

  // 2. Check VITE_API_KEY
  addKey(env.VITE_API_KEY);

  // 3. Rotation Keys (VITE_API_KEY_1 ... VITE_API_KEY_20)
  for (let i = 1; i <= 20; i++) {
    addKey(env[`VITE_API_KEY_${i}`]);
  }

  if (availableKeys.length === 0) {
    console.error("Gemini API: No keys found.");
    throw new Error("Missing API Keys - يرجى إضافة مفاتيح API في إعدادات البيئة");
  }

  // إرجاع كائن يحاكي واجهة GoogleGenAI مع منطق التدوير التسلسلي
  return {
    models: {
      generateContent: async (params: any) => {
        let lastError = null;
        
        // المحاولة عبر المفاتيح بالتسلسل
        for (const key of availableKeys) {
          try {
            const ai = new GoogleGenAI({ apiKey: key });
            const result = await ai.models.generateContent(params);
            return result;
          } catch (error: any) {
            lastError = error;
            const msg = error.message || "";
            
            // إذا كان الخطأ بسبب الضغط أو الصلاحية، ننتقل للمفتاح التالي
            if (
              msg.includes('429') || 
              msg.includes('500') || 
              msg.includes('403') || 
              msg.includes('PERMISSION_DENIED') ||
              msg.includes('RESOURCE_EXHAUSTED')
            ) {
              console.warn("Gemini Key busy, trying next key...");
              continue;
            }
            
            // إذا كان خطأ آخر (مثل صياغة السؤال)، نتوقف ونظهره
            throw error;
          }
        }
        
        throw lastError || new Error("جميع مفاتيح الذكاء الاصطناعي مشغولة حالياً.");
      }
    }
  } as any;
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
