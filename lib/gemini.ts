
import { GoogleGenAI } from "@google/genai";

/**
 * الحصول على مفتاح API صالح باستخدام التدوير (Rotation) ومحاولة قراءة جميع الصيغ الممكنة.
 */
const getApiKey = (): string => {
  const env = (import.meta as any).env || {};
  const availableKeys: string[] = [];

  // 1. Process Env (Defined in Vite Config)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    // @ts-ignore
    availableKeys.push(process.env.API_KEY);
  }

  // 2. Vite Env
  if (env.VITE_API_KEY) availableKeys.push(env.VITE_API_KEY);

  // 3. Rotation Keys
  for (let i = 1; i <= 20; i++) {
    // @ts-ignore
    const pk = typeof process !== 'undefined' && process.env ? process.env[`VITE_API_KEY_${i}`] : undefined;
    const vk = env[`VITE_API_KEY_${i}`];
    if (pk) availableKeys.push(pk);
    if (vk) availableKeys.push(vk);
  }

  // تصفية المفاتيح الفارغة واختيار واحد عشوائي
  const validKeys = [...new Set(availableKeys.filter(k => k && k.trim().length > 0))];
  
  if (validKeys.length === 0) {
    console.error("No API Keys found!");
    throw new Error("Missing API Keys");
  }

  return validKeys[Math.floor(Math.random() * validKeys.length)];
};

/**
 * تهيئة العميل (للاستخدام اليدوي إذا لزم الأمر)
 */
export const initGemini = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

/**
 * دالة مركزية لتوليد المحتوى مع مهلة زمنية (Timeout)
 * تمنع التطبيق من الدوران إلى ما لا نهاية.
 */
export const generateContentWithTimeout = async (params: {
  model: string;
  contents: any[];
  config?: any;
  timeout?: number;
}): Promise<string | undefined> => {
  const { model, contents, config, timeout = 25000 } = params; // مهلة افتراضية 25 ثانية

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // إنشاء Promise للاتصال بـ Gemini
  const fetchPromise = ai.models.generateContent({
    model,
    contents,
    config
  });

  // إنشاء Promise للمهلة الزمنية
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("TIMEOUT_EXCEEDED"));
    }, timeout);
  });

  try {
    // السباق بين الاتصال والمهلة
    const response: any = await Promise.race([fetchPromise, timeoutPromise]);
    return response.text;
  } catch (error: any) {
    if (error.message === "TIMEOUT_EXCEEDED") {
      throw new Error("استغرق الخادم وقتاً طويلاً جداً. يرجى المحاولة مرة أخرى.");
    }
    throw error;
  }
};

/**
 * تنسيق رسائل الخطأ للمستخدم العربي
 */
export const formatGeminiError = (error: any): string => {
  console.error("Gemini Error:", error);
  const msg = error.message || error.toString();

  if (msg.includes("TIMEOUT")) return "تأخر الرد من الخادم، تحقق من الإنترنت وحاول مجدداً.";
  if (msg.includes("Missing API")) return "مفتاح التشغيل مفقود في الإعدادات.";
  if (msg.includes("429") || msg.includes("Quota")) return "ضغط عالٍ على الخدمة، انتظر قليلاً.";
  if (msg.includes("fetch") || msg.includes("Network")) return "تعذر الاتصال بالإنترنت.";
  
  return "حدث خطأ غير متوقع، حاول صياغة طلبك بشكل أبسط.";
};
