
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Book, Layers, FileText, ChevronRight, Sparkles, Loader2, Calendar, List, Users, Play, ArrowLeft, Quote, Clock, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { initGemini } from '../lib/gemini';

const ALLOWED_GAME_SUBJECTS = [
  { id: 'arabic', name: 'اللغة العربية', icon: '📜' },
  { id: 'philosophy', name: 'الفلسفة', icon: '⚖️' },
  { id: 'history', name: 'التاريخ', icon: '🏰' },
  { id: 'english', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
  { id: 'french', name: 'اللغة الفرنسية', icon: '🇫🇷' }
];

const GAME_SECTIONS_CONFIG: Record<string, { id: string; label: string; icon: any }[]> = {
    'arabic': [{ id: 'criticism', label: 'رواد التقاويم النقدية', icon: Users }],
    'philosophy': [{ id: 'philosophy_article', label: 'الأقوال الفلسفية', icon: Quote }],
    'history': [
        { id: 'dates', label: 'التواريخ والمعالم', icon: Calendar },
        { id: 'characters', label: 'الشخصيات التاريخية', icon: Users },
        { id: 'terms', label: 'المصطلحات والمفاهيم', icon: List }
    ],
    'english': [
        { id: 'grammar', label: 'Grammar & Rules', icon: Sparkles },
        { id: 'terms', label: 'Vocabulary', icon: Languages }
    ],
    'french': [
        { id: 'grammar', label: 'Grammaire & Conjugaison', icon: Sparkles },
        { id: 'terms', label: 'Lexique & Vocabulaire', icon: Languages }
    ]
};

interface SelectionScreenProps {
  questions: Question[];
  onStartGame: (filteredQuestions: Question[]) => void;
  onBack: () => void;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onStartGame, onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTrimester, setSelectedTrimester] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [availableLessons, setAvailableLessons] = useState<{id: number, title: string}[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    if (selectedSubject && selectedSection && selectedTrimester) {
        fetchLessons();
    }
  }, [selectedSubject, selectedSection, selectedTrimester]);

  const fetchLessons = async () => {
      setIsLoadingLessons(true);
      try {
          const sectionId = `${selectedSubject}_${selectedTrimester}_${selectedSection}`;
          const { data } = await supabase
            .from('lessons_content')
            .select('id, title')
            .eq('section_id', sectionId)
            .order('created_at', { ascending: true });
          
          if (data) setAvailableLessons(data);
      } catch (e) { console.error(e); }
      finally { setIsLoadingLessons(false); }
  };

  const handleStartGame = async () => {
      if (!selectedSubject || !selectedSection || !selectedTrimester) return window.addToast("أكمل جميع الاختيارات أولاً", "info");
      setIsGenerating(true);
      setLoadingStep('جاري تحليل المحتوى المنهجي...');
      try {
          await handleAiGenerate();
      } catch (e) {
          window.addToast("فشل في تحضير المسابقة", "error");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleAiGenerate = async () => {
      setLoadingStep('الذكاء الاصطناعي يستخرج المعلومات...');
      try {
          let contentText = "";
          if (selectedLessonId) {
              const { data } = await supabase.from('lessons_content').select('content, title').eq('id', selectedLessonId).single();
              if (data) contentText = `الدرس: ${data.title}\nالمحتوى الخام: ${data.content}`;
          } else {
              const sectionId = `${selectedSubject}_${selectedTrimester}_${selectedSection}`;
              const { data } = await supabase.from('lessons_content').select('content').eq('section_id', sectionId).limit(5);
              if (data) contentText = data.map(d => d.content).join("\n");
          }

          let specializedInstruction = "";
          if (selectedSubject === 'arabic') {
              specializedInstruction = "ابحث في النص عن أسماء الرواد (الشعراء أو الأدباء أو النقاد) واربطهم بالمدارس أو الأفكار النقدية المذكورة.";
          } else if (selectedSubject === 'philosophy') {
              specializedInstruction = "ادخل إلى هيكل المقالة، ابحث عن قسم الفلاسفة، واستخرج الأقوال الشهيرة للفلاسفة المذكورين واربط القول بصاحبه.";
          } else if (selectedSubject === 'history') {
              const sectionLabel = GAME_SECTIONS_CONFIG['history'].find(s=>s.id===selectedSection)?.label;
              specializedInstruction = `ركز حصراً وبدقة على ${sectionLabel}؛ استخرج الأسماء/التواريخ/المصطلحات المذكورة في الدروس بدقة تامة.`;
          } else if (selectedSection === 'grammar') {
              specializedInstruction = "استخرج القواعد النحوية أو التصريفات المذكورة في النص وقم بتوليد أسئلة تطبيقية عليها (مثلاً: ما هو تصريف الفعل الفلاني في زمن كذا).";
          } else if (selectedSubject === 'english' || selectedSubject === 'french') {
              specializedInstruction = "استخرج الكلمات أو المصطلحات الأجنبية الواردة في النص مع ترجمتها الصحيحة للغة العربية المذكورة في سياق الدرس.";
          }

          const prompt = `أنت أستاذ خبير في التحضير للبكالوريا. قم بتوليد 15 سؤالاً لمسابقة "من سيربح المليون" بناءً على البيانات المقدمة.
          
          مهمة محددة: ${specializedInstruction}

          قواعد التوليد:
          1. الأسئلة يجب أن تكون منهجية وصحيحة علمياً 100%.
          2. التدرج في الصعوبة (5 سهل، 5 متوسط، 5 صعب).
          3. يجب أن تكون الخيارات الأربعة منطقية ومتقاربة لزيادة التحدي.
          4. الرد يجب أن يكون JSON فقط بالتنسيق التالي:
          [{"text": "السؤال؟", "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], "correctAnswerIndex": 0, "difficulty": "easy/medium/hard"}]

          المحتوى المرجعي: ${contentText.substring(0, 4000)}`;

          const ai = initGemini();
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: [{ parts: [{ text: prompt }] }],
              config: { responseMimeType: "application/json" }
          });

          const generatedQs = JSON.parse(response.text || '[]');
          const finalQs: Question[] = generatedQs.map((q: any, idx: number) => {
              // بعثرة الخيارات لضمان عدم بقاء الإجابة الصحيحة في مكان واحد دائماً
              const options = [...q.options];
              const correctText = options[q.correctAnswerIndex];
              
              // Fisher-Yates Shuffle
              for (let i = options.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [options[i], options[j]] = [options[j], options[i]];
              }
              
              const newCorrectIndex = options.indexOf(correctText);

              return {
                  id: Date.now() + idx,
                  text: q.text,
                  options: options,
                  correctAnswerIndex: newCorrectIndex !== -1 ? newCorrectIndex : q.correctAnswerIndex,
                  prize: "0",
                  difficulty: q.difficulty || (idx < 5 ? 'easy' : idx < 10 ? 'medium' : 'hard'),
                  subject: selectedSubject
              };
          });

          onStartGame(finalQs);
      } catch (err: any) {
          console.error(err);
          window.addToast("حدث خطأ في التوليد، تأكد من كفاية المحتوى في هذا القسم", "error");
      }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-cairo">
       <div className="w-full max-w-lg bg-neutral-900/60 border border-white/10 rounded-[3rem] p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="text-center">
                <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand/30">
                    <Sparkles className="text-brand w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">تحدي المليون</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">تجهيز المسابقة المنهجية</p>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black mr-2 uppercase">1. المادة الدراسية</label>
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => { setSelectedSubject(e.target.value); setSelectedSection(''); setSelectedTrimester(''); setSelectedLessonId(null); }} 
                        className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-brand transition-all"
                    >
                        <option value="">-- اختر المادة --</option>
                        {ALLOWED_GAME_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                </div>

                {selectedSubject && (
                    <div className="space-y-2 animate-slideIn">
                        <label className="text-[10px] text-gray-500 font-black mr-2 uppercase">2. مجال اللعب</label>
                        <div className="grid grid-cols-1 gap-2">
                            {GAME_SECTIONS_CONFIG[selectedSubject]?.map(sec => (
                                <button 
                                    key={sec.id}
                                    onClick={() => { setSelectedSection(sec.id); setSelectedTrimester(''); setSelectedLessonId(null); }}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedSection === sec.id ? 'bg-brand/10 border-brand text-brand' : 'bg-black/40 border-white/5 text-gray-500 hover:border-brand/30'}`}
                                >
                                    <sec.icon size={18} />
                                    <span className="text-xs font-black">{sec.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedSection && (
                    <div className="space-y-2 animate-slideIn">
                        <label className="text-[10px] text-gray-500 font-black mr-2 uppercase">3. الفصل الدراسي</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['t1', 't2', 't3'].map(t => (
                                <button 
                                    key={t} 
                                    onClick={() => { setSelectedTrimester(t); setSelectedLessonId(null); }} 
                                    className={`py-3 rounded-xl font-black text-[10px] transition-all border-b-4 active:translate-y-1 ${selectedTrimester === t ? 'bg-brand text-black border-brand-dark' : 'bg-black text-gray-500 border-neutral-950'}`}
                                >
                                    {t === 't1' ? 'الفصل 1' : t === 't2' ? 'الفصل 2' : 'الفصل 3'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTrimester && (
                    <div className="space-y-2 animate-slideIn">
                        <label className="text-[10px] text-gray-500 font-black mr-2 uppercase">4. تحديد درس (اختياري)</label>
                        <select 
                            value={selectedLessonId || ''} 
                            onChange={(e) => setSelectedLessonId(Number(e.target.value))} 
                            className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-brand disabled:opacity-20 transition-all"
                            disabled={isLoadingLessons}
                        >
                            <option value="">-- جميع دروس القسم --</option>
                            {availableLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="pt-6 space-y-3">
                <button 
                    onClick={handleStartGame} 
                    disabled={isGenerating || !selectedTrimester} 
                    className="w-full py-5 bg-brand text-black rounded-2xl font-black text-xl shadow-xl active:scale-[0.98] disabled:opacity-30 transition-all flex flex-col items-center justify-center"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{loadingStep}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Play size={24} fill="currentColor" />
                            <span>ابدأ رحلة النجاح</span>
                        </div>
                    )}
                </button>
                <button onClick={onBack} className="w-full py-2 text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft size={14}/> عودة للقائمة
                </button>
            </div>
       </div>
    </div>
  );
};
export default SelectionScreen;
