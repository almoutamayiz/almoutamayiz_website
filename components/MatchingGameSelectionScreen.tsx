
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GAME_THEMES, PHILOSOPHY_SUMMARIZATION_PROMPT } from '../constants';
import {
    ChevronRight, Calendar, Loader2, Play, Users, List, Speech, Quote, Languages,
    ArrowLeft, Sparkles, Sword, Anchor
} from 'lucide-react';
import { LessonContent, MatchingGameData, MatchItem } from '../types';
import { initGemini } from '../lib/gemini';

const MENU_MUSIC = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=adventure-cinematic-113063.mp3";

const ALLOWED_GAME_SUBJECTS = [
    { id: 'arabic', name: 'اللغة العربية', icon: '📜' },
    { id: 'philosophy', name: 'الفلسفة', icon: '⚖️' },
    { id: 'history', name: 'التاريخ', icon: '🏰' },
    { id: 'english', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
    { id: 'french', name: 'اللغة الفرنسية', icon: '🇫🇷' }
];

const SUBJECT_GAME_MODES: Record<string, { id: string; label: string; icon: any; promptHint: string }[]> = {
    'arabic': [{ id: 'criticism', label: 'الرواد vs. المدارس', icon: Users, promptHint: "ابحث عن أسماء الرواد (أدباء/شعراء) واربطهم بالمدارس النقدية أو المذهب الأدبي المذكور في النص." }],
    'philosophy': [{ id: 'philosophy_article', label: 'الفيلسوف vs. القول', icon: Quote, promptHint: "ابحث في هيكلية المقالات عن أسماء الفلاسفة واستخرج القول المأثور لكل فيلسوف بدقة تامة." }],
    'history': [
        { id: 'dates', label: 'تاريخ vs. حدث', icon: Calendar, promptHint: "اربط بين التاريخ (اليوم/الشهر/السنة) والحدث التاريخي المقابل له المذكور في الدرس." },
        { id: 'characters', label: 'شخصية vs. نبذة', icon: Users, promptHint: "اربط بين اسم الشخصية التاريخية وأهم إنجازاتها أو دورها السياسي/العسكري المذكور." },
        { id: 'terms', label: 'مصطلح vs. تعريف', icon: List, promptHint: "اربط بين المصطلح التاريخي المكتوب بخط عريض والتعريف المنهجي المذكور له." }
    ],
    'english': [
        { id: 'grammar', label: 'Grammar vs. Example', icon: Sparkles, promptHint: "اربط بين القاعدة النحوية والمثال التطبيقي المباشر لها المذكور في الدرس." },
        { id: 'terms', label: 'Word vs. Arabic Translation', icon: Languages, promptHint: "اربط بين المصطلح باللغة الإنجليزية وترجمته الصحيحة والمباشرة للغة العربية الواردة في الدرس." }
    ],
    'french': [
        { id: 'grammar', label: 'Grammaire vs. Exemple', icon: Sparkles, promptHint: "اربط بين القاعدة النحوية أو زمن الفعل ومثال تطبيقي أو تصريف صحيح ورد في الدرس." },
        { id: 'terms', label: 'Mot vs. Traduction Arabe', icon: Languages, promptHint: "اربط بين المصطلح باللغة الفرنسية وترجمته الصحيحة والمباشرة للغة العربية الواردة في الدرس." }
    ]
};

interface MatchingGameSelectionScreenProps {
    onStartGame: (gameConfig: MatchingGameData) => void;
    onBack: () => void;
}

const MatchingGameSelectionScreen: React.FC<MatchingGameSelectionScreenProps> = ({ onStartGame, onBack }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [selectedTrimester, setSelectedTrimester] = useState<string>('');
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [availableLessons, setAvailableLessons] = useState<LessonContent[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);
    const [isGeneratingGame, setIsGeneratingGame] = useState(false);
    const [gameErrorMessage, setGameErrorMessage] = useState('');
    const [processingStage, setProcessingStage] = useState('');
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        audioRef.current = new Audio(MENU_MUSIC);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log("Audio play blocked"));
        return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } };
    }, []);

    useEffect(() => {
        if (selectedSubjectId && selectedSectionId && selectedTrimester) { fetchLessons(); }
    }, [selectedSubjectId, selectedSectionId, selectedTrimester]);

    const fetchLessons = async () => {
        setIsLoadingLessons(true);
        try {
            const sectionFullId = `${selectedSubjectId}_${selectedTrimester}_${selectedSectionId}`;
            const { data } = await supabase.from('lessons_content').select('*').eq('section_id', sectionFullId);
            setAvailableLessons(data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoadingLessons(false); }
    };

    const handleStartGame = async () => {
        if (!selectedSubjectId || !selectedSectionId || !selectedTrimester) {
            setGameErrorMessage('يرجى إكمال جميع الاختيارات');
            return;
        }
        setIsGeneratingGame(true);
        setProcessingStage('جاري تجهيز اللوح المنهجي...');
        setGameErrorMessage('');

        try {
            let contentText = "";
            if (selectedLessonId) {
                const lesson = availableLessons.find(l => l.id === selectedLessonId);
                if (lesson) contentText = lesson.content;
            } else {
                contentText = availableLessons.map(l => l.content).join("\n");
            }

            if (!contentText) throw new Error("لا توجد دروس متوفرة في هذا القسم حالياً");

            const currentMode = SUBJECT_GAME_MODES[selectedSubjectId]?.find(m => m.id === selectedSectionId);
            const ai = initGemini();
            setProcessingStage('الذكاء الاصطناعي يستخرج الروابط...');
            
            const prompt = `أنت مساعد تعليمي متخصص. قم بتحليل النص المرفق وتوليد 10 أزواج مطابقة (Match Pairs).
            
            المهمة المحددة: ${currentMode?.promptHint}

            القواعد:
            1. الرد يجب أن يكون JSON فقط كقائمة من الأشياء (left, right).
            2. يجب أن تكون المعلومات من صلب النص المرفق.
            3. الصيغة: [{"id": "1", "left": "العنصر 1", "right": "الرابط 1"}]

            المحتوى: ${contentText.substring(0, 4000)}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });

            const items: MatchItem[] = JSON.parse(response.text || '[]');
            if (items.length < 5) throw new Error("المحتوى المنهجي في هذا القسم غير كافٍ لتوليد لعبة");

            const theme = GAME_THEMES[selectedSubjectId] || GAME_THEMES.default;
            onStartGame({
                modeId: `${selectedSubjectId}_${selectedSectionId}_${Date.now()}`,
                items: items,
                title: currentMode?.label || "تحدي المطابقة",
                description: "اربط العناصر بذكاء وسرعة لترسيخ المعلومة",
                ...theme
            });

        } catch (e: any) {
            console.error(e);
            setGameErrorMessage(e.message || "فشل بدء اللعبة؛ حاول اختيار فصل أو مادة أخرى");
        } finally {
            setIsGeneratingGame(false);
            setProcessingStage('');
        }
    };

    return (
        <div className="min-h-screen bg-[#2d1b15] text-[#d7ccc8] flex flex-col font-serif relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none"></div>
            <header className="p-4 flex items-center justify-between z-10 bg-[#3e2723] border-b-4 border-[#271c19] shadow-xl">
                <button onClick={onBack} className="p-2 bg-[#5d4037] rounded-lg hover:bg-[#6d4c41] transition-colors shadow-md"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-black text-[#ffecb3] drop-shadow-sm uppercase tracking-tighter">ركن المطابقة</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 z-10 max-w-2xl mx-auto w-full space-y-8 pb-20">
                <div className="text-center space-y-2">
                    <div className="bg-[#5d4037] inline-block p-4 rounded-full border-4 border-[#3e2723] shadow-inner mb-2"><Sword size={40} className="text-[#ffca28]" /></div>
                    <h2 className="text-3xl font-black text-[#ffecb3]">تجهيز اللوح</h2>
                    <p className="text-xs text-[#a1887f] font-bold uppercase tracking-widest">اختر مسار التحدي المنهجي</p>
                </div>
                <div className="bg-[#4e342e] border-4 border-[#3e2723] rounded-xl p-8 shadow-2xl space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#8d6e63] uppercase mr-2">أولاً: المادة</label>
                            <select value={selectedSubjectId} onChange={e => { setSelectedSubjectId(e.target.value); setSelectedSectionId(''); setSelectedTrimester(''); }} className="w-full bg-[#3e2723] border-2 border-[#5d4037] rounded-lg p-4 text-[#ffecb3] font-bold outline-none focus:border-[#ffca28] transition-all"><option value="">-- اختر مادة اللعب --</option>{ALLOWED_GAME_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        </div>
                        {selectedSubjectId && (
                            <div className="space-y-2 animate-fadeIn">
                                <label className="text-[10px] font-black text-[#8d6e63] uppercase mr-2">ثانياً: التخصص</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {SUBJECT_GAME_MODES[selectedSubjectId]?.map(mode => (
                                        <button key={mode.id} onClick={() => { setSelectedSectionId(mode.id); setSelectedTrimester(''); }} className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${selectedSectionId === mode.id ? 'bg-[#ffca28]/10 border-[#ffca28] text-[#ffca28]' : 'bg-[#3e2723] border-[#5d4037] text-[#a1887f] hover:border-[#8d6e63]'}`}><mode.icon size={20} /><span className="text-sm font-black">{mode.label}</span></button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedSectionId && (
                            <div className="space-y-2 animate-fadeIn">
                                <label className="text-[10px] font-black text-[#8d6e63] uppercase mr-2">ثالثاً: الفصل الدراسي</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['t1', 't2', 't3'].map(t => (
                                        <button key={t} onClick={() => setSelectedTrimester(t)} className={`py-3 rounded-lg font-black text-xs transition-all border-b-4 active:translate-y-1 ${selectedTrimester === t ? 'bg-[#ffca28] text-[#3e2723] border-[#f57f17]' : 'bg-[#5d4037] text-[#a1887f] border-[#271c19]'}`}>{t === 't1' ? 'فصل 1' : t === 't2' ? 'فصل 2' : 'فصل 3'}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedTrimester && (
                            <div className="space-y-1 animate-fadeIn">
                                <label className="text-[10px] font-black text-[#8d6e63] uppercase mr-2">رابعاً: الدرس (اختياري)</label>
                                <select value={selectedLessonId || ''} onChange={e => setSelectedLessonId(Number(e.target.value))} className="w-full bg-[#3e2723] border-2 border-[#5d4037] rounded-lg p-4 text-[#ffecb3] font-bold outline-none focus:border-[#ffca28] transition-all disabled:opacity-30" disabled={isLoadingLessons}><option value="">-- جميع دروس الفصل --</option>{availableLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
                            </div>
                        )}
                    </div>
                    {gameErrorMessage && <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-red-200 text-xs font-bold text-center">{gameErrorMessage}</div>}
                    <button onClick={handleStartGame} disabled={isGeneratingGame || !selectedTrimester} className="w-full py-5 bg-[#ffca28] text-[#3e2723] rounded-xl font-black text-xl shadow-lg border-b-4 border-[#f57f17] active:border-b-0 active:translate-y-1 disabled:opacity-30 disabled:grayscale transition-all flex flex-col items-center justify-center">{isGeneratingGame ? <><Loader2 className="animate-spin mb-1" /><span className="text-xs">{processingStage}</span></> : <div className="flex items-center gap-3"><Play size={24} fill="currentColor" /><span>نقش اللوح (ابدأ)</span></div>}</button>
                </div>
            </main>
        </div>
    );
};

export default MatchingGameSelectionScreen;
