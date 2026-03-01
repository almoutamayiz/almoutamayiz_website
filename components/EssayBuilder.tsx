
import React, { useState, useEffect, useMemo } from 'react';
import { PenTool, Loader2, Send, Copy, CheckCircle2, Coins, Gift, Database } from 'lucide-react';
import { initGemini, formatGeminiError } from '../lib/gemini';
import { buildEssayLocal } from './api/BuilderLocal'; // Import Local API
import { PHILOSOPHER_PROMPT } from '../constants';
import { supabase } from '../lib/supabase';
import { LessonContent, User } from '../types';
import { playSuccessSound } from '../utils/audio';

interface EssayBuilderProps {
    user?: User;
    onUpdateUser?: (u: User) => void;
}

const COST = 10;
const TOOL_ID = 'essay_builder';
const ADMIN_EMAILS = ['yayachdz@gmail.com', 'amineghouil@yahoo.com'];

const EssayBuilder: React.FC<EssayBuilderProps> = ({ user, onUpdateUser }) => {
  const [lessons, setLessons] = useState<LessonContent[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [method, setMethod] = useState('dialectical');
  const [defendedPosition, setDefendedPosition] = useState<'1' | '2'>('1');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCachedResult, setIsCachedResult] = useState(false);

  const [freeChances, setFreeChances] = useState<number>(() => {
      if (!user) return 0;
      const saved = localStorage.getItem(`free_chances_${TOOL_ID}_${user.id}`);
      return saved !== null ? parseInt(saved) : 2;
  });

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email?.toLowerCase() || '') || ['admin', 'teacher_arabic', 'teacher_philosophy', 'teacher_social'].includes(user.role);
  }, [user]);

  useEffect(() => {
      fetchPhilosophyLessons();
  }, []);

  const fetchPhilosophyLessons = async () => {
      setFetchLoading(true);
      try {
          const { data } = await supabase
              .from('lessons_content')
              .select('*')
              .eq('subject', 'الفلسفة')
              .ilike('section_id', '%philosophy_article%')
              .order('created_at', { ascending: false });
          
          if (data) setLessons(data);
      } catch (e) {
          console.error("Fetch Error:", e);
      } finally {
          setFetchLoading(false);
      }
  };

  const handleCopy = () => {
      if (!result) return;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.addToast("تم نسخ المقالة بالكامل", "success");
  };

  const getCacheKey = () => {
      return `cache_essay_builder_${selectedLessonId}_${method}_${defendedPosition}`;
  };

  const executeBuild = async () => {
    if (!selectedLessonId || !user || !onUpdateUser) return;
    
    // 1. Check Local Storage
    const cacheKey = getCacheKey();
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        setResult(cachedData);
        setIsCachedResult(true);
        playSuccessSound();
        window.addToast("تم استخراج المقالة من الأرشيف المحلي", "success");
        return;
    }

    const hasFreeChance = freeChances > 0;

    if (!isAdmin && !hasFreeChance && (user.totalEarnings || 0) < COST) {
        window.addToast("رصيدك غير كافٍ!", "info");
        return;
    }

    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (!lesson) return;

    setLoading(true);
    setResult('');
    setIsCachedResult(false);
    
    try {
        let methodText = "";
        let extraInstruction = "";
        
        switch (method) {
            case 'dialectical': 
                methodText = 'المنهجية الجدلية (طرح المشكلة، محاولة حل المشكلة: الموقف 1، النقد، الموقف 2، النقد، التركيب، الخاتمة)'; 
                break;
            case 'comparison': 
                methodText = 'منهجية المقارنة (أوجه الاختلاف، أوجه التشابه، مواطن التداخل، الخاتمة)'; 
                break;
            case 'investigation': 
                methodText = 'منهجية الاستقصاء بالوضع';
                extraInstruction = `\nالمهمة الحرجة: المقالة يجب أن تكون استقصاء بالوضع للدفاع عن [الموقف رقم ${defendedPosition}] المذكور في الدرس. 
                يجب اتباع الخطوات المنهجية الرسمية للدفاع عن الأطروحة وتفنيد خصومها.`;
                break;
        }
        
        const finalPrompt = `${PHILOSOPHER_PROMPT}
---
الموضوع المرجعي: ${lesson.title}
---
البيانات الخام للدرس (يجب تحويل كل تفصيلة هنا إلى فقرة كاملة وعدم اختصارها):
${lesson.content}
---
المنهجية المطلوبة: ${methodText}
تعليمات إضافية: ${extraInstruction}
تنبيه أخير: لا تختصر أبداً. إذا وجدت فيلاًسوفاً ومقولة، اشرحها في 6 أسطر على الأقل. المقدمة يجب أن تكون غنية وتتوسع في التمهيد العام والخاص.`;

        let text: string | undefined = '';
        try {
            // 1. Priority: Local File
            text = await buildEssayLocal(finalPrompt);
        } catch (localError) {
            // 2. Fallback: Global File
            const ai = initGemini();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview', 
                contents: [{ parts: [{ text: finalPrompt }] }]
            });
            text = response.text;
        }
        
        if (text) {
            setResult(text);
            playSuccessSound();
            localStorage.setItem(cacheKey, text); 

            if (!isAdmin) {
                if (hasFreeChance) {
                    const nextFree = freeChances - 1;
                    setFreeChances(nextFree);
                    localStorage.setItem(`free_chances_${TOOL_ID}_${user.id}`, nextFree.toString());
                    window.addToast(`تم استخدام فرصة مجانية. المتبقي: ${nextFree}`, "success");
                } else {
                    const newTotal = (user.totalEarnings || 0) - COST;
                    const { error: dbError } = await supabase.from('profiles').update({ total_earnings: newTotal }).eq('id', user.id);
                    if (dbError) throw dbError;
                    onUpdateUser({ ...user, totalEarnings: newTotal });
                }
            }
        }
    } catch (error) {
        window.addToast(formatGeminiError(error), "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-32 px-4">
        <div className="bg-gradient-to-br from-indigo-700 via-purple-800 to-black rounded-[3rem] p-10 text-white text-center shadow-2xl relative border border-white/10">
            <PenTool size={56} className="mx-auto mb-4 text-brand" />
            <h2 className="text-3xl font-black mb-2 tracking-tight">منشئ المقالات المنهجي</h2>
            <div className="flex items-center justify-center gap-2">
                <p className="opacity-80 text-sm font-bold tracking-widest uppercase">بناء مقالات احترافية</p>
                {user && freeChances > 0 && (
                    <span className="bg-brand text-black px-2 py-0.5 rounded text-[8px] font-black animate-pulse">لديك {freeChances} فرص مجانية</span>
                )}
            </div>
        </div>

        <div className="bg-neutral-900/60 border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-2xl backdrop-blur-xl">
             <div className="flex items-center justify-between bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl">
                 <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase"><Coins size={16}/> رصيدك: {user?.totalEarnings || 0}</div>
                 <div className="text-brand font-black text-xs uppercase">التكلفة: {COST} نقاط</div>
             </div>
             
             <select 
                value={selectedLessonId || ''} 
                onChange={(e) => setSelectedLessonId(Number(e.target.value))} 
                className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-brand transition-all shadow-inner"
                disabled={fetchLoading}
             >
                <option value="">{fetchLoading ? 'جاري التحميل...' : '-- اختر الموضوع --'}</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
             </select>

             <div className="grid grid-cols-3 gap-3">
                {['dialectical', 'comparison', 'investigation'].map(id => (
                    <button key={id} onClick={() => setMethod(id)} className={`py-4 rounded-2xl text-[10px] font-black transition-all border-2 ${method === id ? 'bg-brand text-black border-brand' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                        {id === 'dialectical' ? 'جدلية' : id === 'comparison' ? 'مقارنة' : 'استقصاء'}
                    </button>
                ))}
             </div>

             {method === 'investigation' && (
                 <div className="p-5 bg-brand/5 border border-brand/20 rounded-2xl animate-slideIn">
                    <label className="text-[10px] text-brand font-black mb-3 block uppercase tracking-widest">اختر الموقف المراد إثباته (الأطروحة)</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setDefendedPosition('1')} className={`py-3 rounded-xl text-xs font-black border-2 ${defendedPosition === '1' ? 'bg-brand text-black border-brand' : 'bg-black text-gray-500 border-white/5'}`}>الموقف الأول</button>
                        <button onClick={() => setDefendedPosition('2')} className={`py-3 rounded-xl text-xs font-black border-2 ${defendedPosition === '2' ? 'bg-brand text-black border-brand' : 'bg-black text-gray-500 border-white/5'}`}>الموقف الثاني</button>
                    </div>
                 </div>
             )}

            {!isAdmin && freeChances === 0 && (user?.totalEarnings || 0) < COST && (
                <div className="bg-brand/10 border border-brand/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                    <Gift className="text-brand" size={20}/>
                    <p className="text-[10px] text-brand font-black">نفد رصيدك! ادعُ زملاءك للمنصة لربح 50 نقطة عن كل صديق والاستمرار في توليد المقالات.</p>
                </div>
            )}

             <button onClick={executeBuild} disabled={loading || !selectedLessonId} className="w-full py-6 bg-brand text-black rounded-2xl font-black text-xl flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-30 transition-all shadow-xl shadow-brand/20 group">
                {loading ? <Loader2 className="animate-spin w-8 h-8"/> : <Send size={32}/>}
                <span>{freeChances > 0 ? `توليد مجاني (${freeChances} متبقية)` : `توليد المقالة (${COST} نقاط)`}</span>
             </button>
        </div>

        {result && (
            <div className={`p-10 rounded-[3rem] shadow-2xl animate-slideIn relative ${isCachedResult ? 'bg-purple-900/30 border border-purple-500' : 'bg-neutral-900/80 border border-brand/20'}`}>
                {isCachedResult && (
                    <div className="absolute top-6 left-6 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1">
                        <Database size={10} /> تم الجلب محلياً
                    </div>
                )}
                <div className="text-gray-100 text-lg leading-loose text-justify whitespace-pre-wrap font-bold">{result}</div>
                <button onClick={handleCopy} className={`mt-8 w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white/10 text-brand border border-brand/30 hover:bg-brand hover:text-black'}`}>
                    {copied ? <CheckCircle2 size={24}/> : <Copy size={24}/>}
                    <span>{copied ? 'تم النسخ' : 'نسخ المقالة بالكامل'}</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default EssayBuilder;
