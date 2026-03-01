
import React, { useState, useEffect, useMemo } from 'react';
import { BrainCircuit, Loader2, Sparkles, ListFilter, Type, Gift, Database, ShieldAlert } from 'lucide-react';
import { initGemini, formatGeminiError } from '../lib/gemini';
import { parseTextLocal } from './api/ParserLocal'; // Import Local API
import { GRAMMAR_PROMPT } from '../constants';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { playSuccessSound } from '../utils/audio';

interface SmartParserProps {
    compact?: boolean;
    user?: User;
    onUpdateUser?: (u: User) => void;
}

const COST = 5;
const TOOL_ID = 'smart_parser';

const SmartParser: React.FC<SmartParserProps> = ({ compact = false, user, onUpdateUser }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'word' | 'sentence'>('sentence');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [anonymousError, setAnonymousError] = useState('');
  const [remainingTrials, setRemainingTrials] = useState<number | null>(null);
  const [isCachedResult, setIsCachedResult] = useState(false);
  
  const [freeChances, setFreeChances] = useState<number>(() => {
      if (!user) return 0;
      const saved = localStorage.getItem(`free_chances_${TOOL_ID}_${user.id}`);
      return saved !== null ? parseInt(saved) : 2;
  });

  const isAdmin = useMemo(() => user ? ['admin', 'teacher_arabic', 'teacher_philosophy', 'teacher_social'].includes(user.role) : false, [user]);

  useEffect(() => {
      if (!user && compact) {
          const localCount = parseInt(localStorage.getItem('anon_parser_uses') || '0');
          setRemainingTrials(Math.max(0, 3 - localCount));
          if (localCount >= 3) setAnonymousError("المحاولات التجريبية انتهت");
      }
  }, [user, compact]);

  const tokens = useMemo(() => {
      if (!input.trim()) return [];
      return input.trim().split(/\s+/).filter(w => w.length > 0);
  }, [input]);

  const toggleWord = (word: string) => {
      if (mode === 'word') setSelectedWords([word]);
      else setSelectedWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
  };

  const getCacheKey = () => {
      const target = selectedWords.join('_');
      return `cache_parser_${mode}_${input.trim().length}_${target}`;
  };

  const executeParse = async () => {
    if (!input.trim() || selectedWords.length === 0) return;
    
    // 1. Local Cache Check
    const cacheKey = getCacheKey();
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        setResult(cachedData);
        setIsCachedResult(true);
        playSuccessSound();
        window.addToast("تم استرجاع الإعراب من الذاكرة المحلية", "success");
        return;
    }

    // Prepare Prompt
    const target = selectedWords.join(' ');
    const promptContent = mode === 'word' ? `أعرب الكلمة: "${target}" في سياق: "${input}"` : `أعرب الجملة: "(${target})" في سياق: "${input}"`;
    const fullPrompt = `${GRAMMAR_PROMPT}\n\n${promptContent}`;

    if (!user) {
        let localCount = parseInt(localStorage.getItem('anon_parser_uses') || '0');
        if (localCount >= 3) return;
        setLoading(true);
        try {
            // Priority: Local File
            let text = await parseTextLocal(fullPrompt);
            if (!text) throw new Error("Local failed");
            
            setResult(text);
            playSuccessSound();
            localStorage.setItem(cacheKey, text);
            localStorage.setItem('anon_parser_uses', (localCount + 1).toString());
            setRemainingTrials(3 - (localCount + 1));
        } catch (e) {
            // Fallback: Global File
            try {
                const ai = initGemini();
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: [{ parts: [{ text: fullPrompt }] }]
                });
                const text = response.text || 'تعذر الإعراب.';
                setResult(text);
                playSuccessSound();
                localStorage.setItem(cacheKey, text);
            } catch(err) {
                window.addToast(formatGeminiError(err), "error");
            }
        } finally { setLoading(false); }
        return;
    }

    const hasFreeChance = freeChances > 0;
    if (!isAdmin && !hasFreeChance && (user.totalEarnings || 0) < COST) {
        window.addToast("رصيدك غير كافٍ!", "info");
        return;
    }

    setLoading(true);
    setResult('');
    setIsCachedResult(false);

    try {
        let text: string | undefined = '';
        
        try {
            // 1. محاولة الملف المحلي أولاً
            text = await parseTextLocal(fullPrompt);
        } catch (localErr) {
            // 2. إذا فشل، الذهاب للملف العام
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
                    await supabase.from('profiles').update({ total_earnings: newTotal }).eq('id', user.id);
                    if (onUpdateUser) onUpdateUser({ ...user, totalEarnings: newTotal });
                }
            }
        }
    } catch (e) {
        window.addToast(formatGeminiError(e), "error");
    } finally { setLoading(false); }
  };

  if (compact) {
      return (
          <div className="w-full space-y-3 animate-fadeIn">
              {!user && remainingTrials !== null && (
                  <div className="flex justify-between items-center px-3 py-1.5 bg-blue-600/5 rounded-lg border border-blue-500/10 mb-1">
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">وضع التجربة</span>
                      <span className="text-[8px] font-black text-gray-600">المحاولات: <span className="text-brand">{remainingTrials}</span></span>
                  </div>
              )}

              {anonymousError ? (
                  <div className="p-4 rounded-2xl border-2 border-red-500/20 bg-red-500/5 flex flex-col items-center text-center space-y-3">
                      <ShieldAlert className="text-red-500" size={24} />
                      <p className="text-[10px] text-red-400 font-bold leading-relaxed">{anonymousError}</p>
                      <button onClick={() => window.location.reload()} className="w-full py-2 bg-red-600 text-white rounded-lg text-[10px] font-black">سجل الآن للمتابعة</button>
                  </div>
              ) : (
                  <>
                      <div className="flex justify-center mb-1">
                          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
                              <button onClick={() => {setMode('sentence'); setSelectedWords([]); setResult('');}} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${mode === 'sentence' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>جملة</button>
                              <button onClick={() => {setMode('word'); setSelectedWords([]); setResult('');}} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${mode === 'word' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>مفردة</button>
                          </div>
                      </div>
                      <textarea value={input} onChange={e => { setInput(e.target.value); setSelectedWords([]); }} placeholder="اكتب جملتك هنا..." className="w-full h-16 bg-black/30 border border-white/5 rounded-xl p-3 text-[12px] font-bold text-white outline-none focus:border-blue-500/30 resize-none shadow-inner text-center" />
                      {tokens.length > 0 && (
                          <div className="space-y-2 animate-slideIn">
                              <div className="flex flex-wrap justify-center gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                                  {tokens.map((word, i) => (
                                      <button key={i} onClick={() => toggleWord(word)} className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all border ${selectedWords.includes(word) ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white/5 border-white/5 text-gray-500'}`}>{word}</button>
                                  ))}
                              </div>
                              <button onClick={executeParse} disabled={loading || selectedWords.length === 0} className="w-full py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                                {loading ? <Loader2 className="animate-spin" size={14}/> : <BrainCircuit size={14}/>} 
                                <span>{loading ? 'جاري التحليل...' : 'ابدأ الإعراب الذكي'}</span>
                              </button>
                          </div>
                      )}
                  </>
              )}

              {result && (
                  <div className={`p-4 rounded-xl animate-slideIn relative overflow-hidden border ${isCachedResult ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-neutral-950/80 border-blue-500/20'}`}>
                      {isCachedResult && <div className="absolute top-2 left-2 text-emerald-500"><Database size={12}/></div>}
                      <div className="text-[11px] font-bold leading-relaxed text-gray-100 text-right whitespace-pre-wrap">{result}</div>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-20 px-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-8 text-white text-center shadow-2xl border border-white/10">
            <BrainCircuit size={40} className="mx-auto mb-3" />
            <h2 className="text-2xl font-black mb-1">المعرب الذكي</h2>
            <div className="flex items-center justify-center gap-2">
                <p className="opacity-80 text-[10px] font-bold tracking-widest uppercase">تحليل إعرابي فوري</p>
                {user && freeChances > 0 && (
                    <span className="bg-brand text-black px-2 py-0.5 rounded text-[8px] font-black animate-pulse">لديك {freeChances} فرص مجانية</span>
                )}
            </div>
        </div>

        <div className="bg-neutral-900/60 border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/5 w-full max-w-xs mx-auto shadow-inner">
                <button onClick={() => {setMode('sentence'); setSelectedWords([]); setResult('');}} className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${mode === 'sentence' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}><ListFilter size={14}/> جملة</button>
                <button onClick={() => {setMode('word'); setSelectedWords([]); setResult('');}} className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${mode === 'word' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}><Type size={14}/> مفردة</button>
            </div>
            
            <textarea value={input} onChange={e => { setInput(e.target.value); setSelectedWords([]); }} placeholder="اكتب الجملة هنا..." className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-lg font-bold outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner text-center" />

            {tokens.length > 0 && (
                <div className="space-y-4 animate-slideIn">
                    <div className="flex flex-wrap justify-center gap-2">
                        {tokens.map((word, i) => (
                            <button key={i} onClick={() => toggleWord(word)} className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${selectedWords.includes(word) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{word}</button>
                        ))}
                    </div>
                    
                    {!isAdmin && freeChances === 0 && (user?.totalEarnings || 0) < COST && (
                        <div className="bg-brand/10 border border-brand/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                            <Gift className="text-brand" size={20}/>
                            <p className="text-[10px] text-brand font-black">نفد رصيدك! استخدم كود الإحالة في إعداداتك لربح النقاط مجاناً.</p>
                        </div>
                    )}

                    <button onClick={executeParse} disabled={loading || selectedWords.length === 0} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-base flex items-center justify-center gap-3 active:scale-98 transition-all shadow-xl shadow-blue-600/10">
                        {loading ? <Loader2 className="animate-spin w-6 h-6"/> : <Sparkles size={24}/>}
                        <span>{freeChances > 0 ? `استخدم فرصة مجانية (${freeChances})` : 'تحليل الإعراب (5 نقاط)'}</span>
                    </button>
                </div>
            )}
        </div>
        
        {result && (
            <div className={`p-8 rounded-[2rem] border-r-4 shadow-2xl animate-slideIn relative ${isCachedResult ? 'bg-emerald-900/30 border-emerald-500' : 'bg-neutral-900/80 border-blue-600'}`}>
                {isCachedResult && (
                    <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1">
                        <Database size={10} /> تم الجلب محلياً
                    </div>
                )}
                <div className="text-gray-100 text-base leading-relaxed whitespace-pre-wrap font-bold">{result}</div>
            </div>
        )}
    </div>
  );
};

export default SmartParser;
