
import React, { useState, useMemo } from 'react';
import { Loader2, Sparkles, Palette, Coins, Gift, Database } from 'lucide-react';
import { initGemini, formatGeminiError } from '../lib/gemini';
import { analyzeRhetoricLocal } from './api/RhetoricLocal'; // Import Local API
import { RHETORIC_PROMPT } from '../constants';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { playSuccessSound } from '../utils/audio';

interface RhetoricToolProps {
    user?: User;
    onUpdateUser?: (u: User) => void;
}

const COST = 3;
const TOOL_ID = 'rhetoric_tool';

const RhetoricTool: React.FC<RhetoricToolProps> = ({ user, onUpdateUser }) => {
  const [input, setInput] = useState('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCachedResult, setIsCachedResult] = useState(false);

  const [freeChances, setFreeChances] = useState<number>(() => {
      if (!user) return 0;
      const saved = localStorage.getItem(`free_chances_${TOOL_ID}_${user.id}`);
      return saved !== null ? parseInt(saved) : 2;
  });

  const isAdmin = useMemo(() => user ? ['admin', 'teacher_arabic', 'teacher_philosophy', 'teacher_social'].includes(user.role) : false, [user]);

  const tokens = useMemo(() => {
      if (!input.trim()) return [];
      return input.trim().split(/\s+/).filter(w => w.length > 0);
  }, [input]);

  const toggleWord = (word: string) => {
      setSelectedWords(prev => 
          prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
      );
  };

  const getCacheKey = () => {
      return `cache_rhetoric_${input.trim().length}_${selectedWords.join('_')}`;
  };

  const executeAnalysis = async () => {
    if (!user || !onUpdateUser || !input.trim()) return;
    
    // 1. Local Cache Check
    const cacheKey = getCacheKey();
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        setResult(cachedData);
        setIsCachedResult(true);
        playSuccessSound();
        window.addToast("تم استرجاع التحليل من الذاكرة المحلية", "success");
        return;
    }

    const hasFreeChance = freeChances > 0;

    if (!isAdmin && !hasFreeChance && (user.totalEarnings || 0) < COST) {
        window.addToast("رصيدك غير كافٍ! شارك كود الإحالة الخاص بك.", "info");
        return;
    }

    setLoading(true);
    setResult('');
    setIsCachedResult(false);
    
    const context = selectedWords.length > 0 
        ? `الكلمات المعنية بالصورة البيانية: [${selectedWords.join(' ')}]\nفي الجملة: "${input}"`
        : `الجملة كاملة: "${input}"`;
    const fullPrompt = `${RHETORIC_PROMPT}\n\nالمطلوب تحليل:\n${context}`;

    try {
        let text: string | undefined = '';
        try {
            // 1. Priority: Local File
            text = await analyzeRhetoricLocal(fullPrompt);
        } catch (localError) {
            // 2. Fallback: Global File
            const ai = initGemini();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
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
                    window.addToast(`تم استخدام فرصة مجانية. المتبقي: ${nextFree}`, "success");
                } else {
                    const newTotal = (user.totalEarnings || 0) - COST;
                    const { error } = await supabase.from('profiles').update({ total_earnings: newTotal }).eq('id', user.id);
                    if (error) throw error;
                    onUpdateUser({ ...user, totalEarnings: newTotal });
                }
            }
        }
    } catch (e) {
        window.addToast(formatGeminiError(e), "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20 px-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-10 text-white text-center shadow-2xl relative overflow-hidden border border-white/10">
            <Palette size={56} className="mx-auto mb-4 drop-shadow-xl" />
            <h2 className="text-4xl font-black mb-2">محدد الصور البيانية</h2>
            <div className="flex items-center justify-center gap-2">
                <p className="opacity-90 text-sm font-bold tracking-widest uppercase">تحليل بلاغي منهجـي</p>
                {user && freeChances > 0 && (
                    <span className="bg-brand text-black px-2 py-0.5 rounded text-[8px] font-black animate-pulse">لديك {freeChances} فرص مجانية</span>
                )}
            </div>
        </div>

        <div className="bg-neutral-900/60 border border-white/10 rounded-[3rem] p-8 space-y-8 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between bg-emerald-600/10 border border-emerald-500/20 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase">
                    <Coins size={14}/> رصيدك الحالي: {user?.totalEarnings || 0}
                </div>
                <div className="text-amber-400 font-black text-[10px] uppercase">سعر الخدمة: {COST} نقاط</div>
            </div>

            <textarea 
                value={input} 
                onChange={e => { setInput(e.target.value); setSelectedWords([]); }} 
                placeholder="مثال: رأيت أسداً يحمل سيفاً..." 
                className="w-full h-32 bg-black/40 border border-white/10 rounded-[2rem] p-8 text-white text-xl font-bold outline-none focus:border-emerald-500 transition-all resize-none shadow-inner" 
            />

            {tokens.length > 0 && (
                <div className="space-y-4 animate-slideIn">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">حدد الكلمات التي تشكل الصورة:</p>
                    <div className="flex flex-wrap justify-center gap-2 p-6 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                        {tokens.map((word, i) => (
                            <button key={i} onClick={() => toggleWord(word)} className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${selectedWords.includes(word) ? 'bg-emerald-600 border-emerald-400 text-white scale-110 z-10' : 'bg-white/5 border-white/5 text-gray-500'}`}>{word}</button>
                        ))}
                    </div>
                </div>
            )}

            {!isAdmin && freeChances === 0 && (user?.totalEarnings || 0) < COST && (
                <div className="bg-brand/10 border border-brand/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                    <Gift className="text-brand" size={20}/>
                    <p className="text-[10px] text-brand font-black">نفد رصيدك! استخدم كود الإحالة في حسابك لدعوة أصدقاءك وربح النقاط مجاناً.</p>
                </div>
            )}

            <button onClick={executeAnalysis} disabled={loading || !input.trim()} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-30 transition-all shadow-xl shadow-emerald-600/20 group">
                {loading ? <Loader2 className="animate-spin w-8 h-8"/> : <Sparkles size={32}/>}
                <span>{freeChances > 0 ? `استخدم فرصة مجانية (${freeChances})` : `تحديد الصورة (${COST} نقاط)`}</span>
            </button>
        </div>

        {result && (
            <div className={`p-10 rounded-[3.5rem] border-r-8 animate-slideIn shadow-2xl relative overflow-hidden text-right ${isCachedResult ? 'bg-emerald-900/30 border-emerald-400' : 'bg-neutral-900/80 border-emerald-600'}`}>
                {isCachedResult && (
                    <div className="absolute top-6 left-6 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1">
                        <Database size={10} /> تم الجلب من الذاكرة المحلية
                    </div>
                )}
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                <div className="text-gray-100 text-lg leading-loose whitespace-pre-wrap font-bold">{result}</div>
            </div>
        )}
    </div>
  );
};

export default RhetoricTool;
