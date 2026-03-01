
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileCheck, Loader2, Sparkles, Image as ImageIcon, Search, X, Trash2, RotateCw, Coins, Plus, Files, Gift, Database } from 'lucide-react';
import { initGemini, formatGeminiError } from '../lib/gemini';
import { correctEssayLocal } from './api/CorrectorLocal'; // Import Local API
import { ESSAY_CORRECTION_PROMPT } from '../constants';
import { supabase } from '../lib/supabase';
import { LessonContent, User } from '../types';
import { playSuccessSound } from '../utils/audio';

interface EssayCorrectorProps {
    user?: User;
    onUpdateUser?: (u: User) => void;
}

const COST = 15;
const TOOL_ID = 'essay_corrector';
const ADMIN_EMAILS = ['yayachdz@gmail.com', 'amineghouil@yahoo.com'];

const EssayCorrector: React.FC<EssayCorrectorProps> = ({ user, onUpdateUser }) => {
  const [lessons, setLessons] = useState<LessonContent[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [method, setMethod] = useState('dialectical');
  const [studentText, setStudentText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const processAllImages = async () => {
    if (imageFiles.length === 0) return;
    
    setIsExtracting(true);
    try {
      const parts: any[] = [];
      for (const file of imageFiles) {
          const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(file);
          });
          parts.push({ inlineData: { data: base64, mimeType: file.type } });
      }

      parts.push({ text: `أنت خبير منهجية فلسفية جزائرية ومحلل نصوص محترف.
المطلوب منك:
1. استخراج النص العربي من جميع الصور المرفقة بدقة 100%.
2. هذه الصور قد تكون لصفحات مقالة فلسفية واحدة ولكنها غير مرتبة.
3. قم بـ "إعادة ترتيب" النص المستخرج منطقياً حسب المنهجية الفلسفية.
4. ادمج النص في مقالة واحدة منسجمة دون أي كلام خارجي من قبلك.` });

      // هنا نستخدم مكتبة عامة لأنها صور ولا يمكن تمريرها بسهولة عبر الملف المحلي النصي
      const ai = initGemini();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts }
      });

      const structuredText = response.text?.trim() || "";
      setStudentText(structuredText);
      setImageFiles([]);
      setPreviews([]);
      window.addToast("تم قراءة وترتيب المقالة بنجاح", "success");
    } catch (err) {
      window.addToast(formatGeminiError(err), "error");
    } finally {
      setIsExtracting(false);
    }
  };

  const getCacheKey = () => {
      let hash = 0;
      const str = studentText.trim();
      for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
      }
      return `cache_essay_corrector_${selectedLessonId}_${method}_${hash}`;
  };

  const executeCorrection = async () => {
    if (!user || !onUpdateUser || !selectedLessonId || !studentText.trim()) {
      window.addToast("أدخل النص أو اختر الموضوع أولاً", "info");
      return;
    }

    // 1. Check Local Storage
    const cacheKey = getCacheKey();
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        setResult(cachedData);
        setIsCachedResult(true);
        playSuccessSound();
        window.addToast("تم استرجاع التصحيح من الذاكرة المحلية", "success");
        return;
    }

    const hasFreeChance = freeChances > 0;

    if (!isAdmin && !hasFreeChance && (user.totalEarnings || 0) < COST) {
        window.addToast("رصيدك غير كافٍ!", "info");
        return;
    }

    const reference = lessons.find(l => l.id === selectedLessonId);
    if (!reference) return;

    setLoading(true);
    setResult('');
    setIsCachedResult(false);

    try {
      const methodText = method === 'dialectical' ? 'الجدلية' : method === 'comparison' ? 'المقارنة' : 'الاستقصاء بالوضع';
      const context = `المنهجية: ${methodText}\nالمرجع الرسمي:\n${reference.content}\n\nمقالة التلميذ:\n${studentText}`;
      const fullPrompt = `${ESSAY_CORRECTION_PROMPT}\n\nالبيانات:\n${context}`;

      let text: string | undefined = '';
      try {
          // 1. Priority: Local File
          text = await correctEssayLocal(fullPrompt);
      } catch (localError) {
          // 2. Fallback: Global File
          const ai = initGemini();
          const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ parts: [{ text: fullPrompt }] }]
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
                  window.addToast(`تم استخدام فرصة مجانية للتصحيح. المتبقي: ${nextFree}`, "success");
              } else {
                  const newTotal = (user.totalEarnings || 0) - COST;
                  await supabase.from('profiles').update({ total_earnings: newTotal }).eq('id', user.id);
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

  const clearAll = () => {
    setStudentText('');
    setResult('');
    setPreviews([]);
    setImageFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-32 px-4">
      <div className="bg-gradient-to-br from-amber-600 to-orange-900 rounded-[3rem] p-10 text-white text-center shadow-2xl relative border border-white/10">
        <FileCheck size={56} className="mx-auto mb-4 text-yellow-300" />
        <h2 className="text-3xl font-black mb-2 tracking-tight">المصحح المنهجي المتميز</h2>
        <div className="flex items-center justify-center gap-2">
            <p className="opacity-90 text-sm font-bold tracking-widest uppercase">تحليل المقالات بالذكاء الاصطناعي</p>
            {user && freeChances > 0 && (
                <span className="bg-brand text-black px-2 py-0.5 rounded text-[8px] font-black animate-pulse">لديك {freeChances} فرص مجانية</span>
            )}
        </div>
      </div>

      <div className="bg-neutral-900/60 border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between bg-amber-600/10 border border-amber-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase"><Coins size={16}/> رصيدك: {user?.totalEarnings || 0}</div>
            <div className="text-white font-black text-xs uppercase">التكلفة: {COST} نقاط</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
            {['dialectical', 'comparison', 'investigation'].map(m => (
              <button key={m} onClick={() => setMethod(m)} className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${method === m ? 'bg-brand text-black border-brand' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
                {m === 'dialectical' ? 'جدلية' : m === 'comparison' ? 'مقارنة' : 'استقصاء'}
              </button>
            ))}
        </div>

        <select 
            value={selectedLessonId || ''} 
            onChange={(e) => setSelectedLessonId(Number(e.target.value))} 
            className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-brand transition-all shadow-inner"
            disabled={fetchLoading}
          >
            <option value="">{fetchLoading ? 'جاري جلب المواضيع...' : '-- اختر الموضوع للمقارنة --'}</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>

        <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center px-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <Files size={14}/> أوراق المقالة (صور)
                </label>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-blue-600/30 transition-all">
                        <Plus size={14}/> إضافة أوراق
                    </button>
                    {(previews.length > 0 || studentText) && (
                        <button onClick={clearAll} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2"><Trash2 size={14}/> مسح الكل</button>
                    )}
                </div>
            </div>

            {previews.length > 0 && (
                <div className="p-4 bg-black/40 rounded-[2rem] border border-white/5">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {previews.map((src, idx) => (
                            <div key={idx} className="relative w-20 h-28 rounded-xl overflow-hidden border border-white/10 shadow-lg group">
                                <img src={src} className="w-full h-full object-cover" alt="Page" />
                                <button onClick={() => removeImage(idx)} className="absolute top-1 left-1 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                <div className="absolute bottom-0 right-0 bg-black/60 text-[8px] text-white px-2 py-0.5 font-black">{idx + 1}</div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={processAllImages} 
                        disabled={isExtracting}
                        className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                    >
                        {isExtracting ? (
                            <>
                                <Loader2 className="animate-spin" size={18}/>
                                <span>جاري قراءة وترتيب {imageFiles.length} صفحات...</span>
                            </>
                        ) : (
                            <>
                                <RotateCw size={18}/>
                                <span>ابدأ استخراج وترتيب النص</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {isExtracting && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-pulse">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                        <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24}/>
                    </div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">المعرب الذكي يحلل الخط اليدوي الآن...</p>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-4">المقالة المكتشفة:</label>
                <textarea 
                    value={studentText} 
                    onChange={(e) => setStudentText(e.target.value)} 
                    placeholder="سيظهر النص هنا بعد معالجة الصور، أو يمكنك كتابته يدوياً..." 
                    className="w-full h-80 bg-black/40 border border-white/10 rounded-[2rem] p-8 text-white text-base font-bold outline-none focus:border-brand transition-all resize-none shadow-inner leading-relaxed text-right" 
                />
            </div>
        </div>

        {!isAdmin && freeChances === 0 && (user?.totalEarnings || 0) < COST && (
            <div className="bg-brand/10 border border-brand/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <Gift className="text-brand" size={20}/>
                <p className="text-[10px] text-brand font-black">رصيدك لا يكفي! ادعُ أصدقاءك بكودك الخاص لربح 50 نقطة فوراً واستكمال التصحيح.</p>
            </div>
        )}

        <button onClick={executeCorrection} disabled={loading || !selectedLessonId || !studentText.trim()} className="w-full py-6 bg-amber-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-30 transition-all shadow-xl shadow-amber-600/20 group">
          {loading ? <Loader2 className="animate-spin w-8 h-8"/> : <Sparkles size={32}/>}
          <span>{freeChances > 0 ? `تصحيح مجاني (${freeChances} متبقية)` : `بدأ التصحيح (${COST} نقاط)`}</span>
        </button>
      </div>

      {result && (
        <div className={`p-10 rounded-[3rem] border-r-8 shadow-2xl animate-slideIn relative overflow-hidden ${isCachedResult ? 'bg-amber-900/30 border-amber-400' : 'bg-neutral-900/90 border-amber-500'}`}>
          {isCachedResult && (
              <div className="absolute top-6 left-6 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1">
                  <Database size={10} /> تم الجلب محلياً
              </div>
          )}
          <div className="text-gray-100 text-lg leading-loose text-justify whitespace-pre-wrap font-bold drop-shadow-sm">{result}</div>
        </div>
      )}
    </div>
  );
};

export default EssayCorrector;
