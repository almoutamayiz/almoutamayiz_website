
import { GoogleGenAI } from "@google/genai";

/**
 * تهيئة عميل Gemini مع نظام التدوير الذكي والبحث الشامل عن المفاتيح.
 * هذا الكود مصمم خصيصاً لبيئة Vercel و Vite.
 */
export const initGemini = () => {
  // 1. استخراج المتغيرات من بيئة Vite (المتصفح)
  const viteEnv = (import.meta as any).env || {};
  
  // 2. استخراج المتغيرات من بيئة Process (في حال كان هناك Polyfill)
  const processEnv = typeof process !== 'undefined' && process.env ? process.env : {};

  // القائمة الصريحة للمفاتيح التي سيبحث عنها النظام
  // التكرار هنا مقصود لضمان أن الـ Bundler يقوم باستبدال القيم النصية أثناء البناء
  const candidates = [
    // المفاتيح الأساسية (Vite Standard)
    viteEnv.VITE_API_KEY,
    viteEnv.VITE_KEY_1,
    viteEnv.VITE_KEY_2,
    viteEnv.VITE_KEY_3,
    viteEnv.VITE_KEY_4,
    viteEnv.VITE_KEY_5,
    
    // محاولات احتياطية (Fallback)
    viteEnv.API_KEY,
    processEnv.VITE_API_KEY,
    processEnv.API_KEY,
    processEnv.REACT_APP_API_KEY,
    processEnv.NEXT_PUBLIC_API_KEY
  ];

  // تصفية المفاتيح الصالحة فقط (التي تبدأ بـ AIza ولها طول مناسب)
  const validKeys = candidates.filter(key => 
    key && 
    typeof key === 'string' && 
    key.length > 30 && 
    key.startsWith('AIza')
  );

  // إزالة التكرار
  const uniqueKeys = [...new Set(validKeys)];

  // التحقق النهائي
  if (uniqueKeys.length === 0) {
    console.error("Gemini Critical Error: No valid 'AIza...' keys found in environment.");
    // رمي خطأ واضح للمستخدم
    throw new Error("لم يتم العثور على مفاتيح API صالحة. الرجاء التأكد من إضافة VITE_API_KEY في إعدادات Vercel.");
  }

  // اختيار مفتاح عشوائي لتوزيع الحمل (Load Balancing)
  const randomKey = uniqueKeys[Math.floor(Math.random() * uniqueKeys.length)];
  
  // طباعة (للمطور فقط) - عدد المفاتيح النشطة
  // console.log(`Gemini System Active: ${uniqueKeys.length} keys loaded.`);

  return new GoogleGenAI({ apiKey: randomKey });
};

/**
 * معالج أخطاء ذكي يعيد رسائل عربية دقيقة للمستخدم.
 */
export const formatGeminiError = (error: any): string => {
  if (!error) return "حدث خطأ غير معروف.";

  const msg = (error.message || error.toString()).toLowerCase();

  // 1. أخطاء الحظر والصلاحيات
  if (msg.includes('403') || msg.includes('permission') || msg.includes('key')) {
    return "المفتاح المستخدم حالياً محظور أو انتهت صلاحيته. سيقوم النظام بتجربة مفتاح آخر تلقائياً.";
  }

  // 2. أخطاء الضغط والكوتا
  if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
    return "الخادم مشغول جداً (ضغط عالي). يرجى الانتظار دقيقة ثم المحاولة.";
  }

  // 3. أخطاء الخادم
  if (msg.includes('500') || msg.includes('503') || msg.includes('overloaded')) {
    return "خوادم جوجل تواجه ضغطاً مؤقتاً. حاول مرة أخرى.";
  }

  // 4. أخطاء الشبكة
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('internet')) {
    return "فشل الاتصال بالإنترنت. تأكد من جودة الشبكة لديك.";
  }

  // 5. أخطاء المحتوى (Safety Filters)
  if (msg.includes('candidate') || msg.includes('safety') || msg.includes('blocked')) {
    return "عذراً، لم أتمكن من الإجابة لأن السؤال قد يخالف معايير المحتوى.";
  }

  return "حدث خطأ تقني أثناء المعالجة (Code: G-ERR).";
};
