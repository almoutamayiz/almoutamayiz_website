
import React, { useState, useEffect } from 'react';
import { LessonContent, Exam, User } from '../types';
import { 
    FileText, ArrowRight, BrainCircuit, BookOpen, Calendar, Users, List, 
    FileCheck, Sigma, ChevronLeft, Download, PenTool, Loader2, Map as MapIcon, Video,
    Layers, Book, Bookmark, Sparkles, Palette, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ALL_SUBJECTS_LIST, SUBJECT_SECTIONS_MAP } from '../constants'; 
import LessonRenderer from './LessonRenderer';
import { playClickSound, playSuccessSound } from '../utils/audio';

import SmartParser from './SmartParser';
import RhetoricTool from './RhetoricTool';
import EssayBuilder from './EssayBuilder';
import EssayCorrector from './EssayCorrector';

const INSTRUCTION_TEXT = "text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]";
const GLASS_CARD = "bg-neutral-900/50 backdrop-blur-md border border-white/5 shadow-2xl hover:border-brand/30 active:scale-[0.97] transition-all duration-300 cursor-pointer overflow-hidden relative group clickable";

const getSectionIcon = (sectionId: string) => {
    const id = sectionId.toLowerCase();
    if (id.includes('map')) return MapIcon;
    if (id.includes('video')) return Video;
    if (id.includes('lesson')) return BookOpen;
    if (id.includes('grammar')) return PenTool;
    if (id.includes('term') || id.includes('def')) return List;
    if (id.includes('date')) return Calendar;
    if (id.includes('char')) return Users;
    if (id.includes('critic')) return FileText;
    if (id.includes('math') || id.includes('law')) return Sigma;
    return Layers;
};

const SUBJECT_VISUALS: Record<string, { gradient: string; icon: string }> = {
    'arabic': { gradient: 'from-emerald-600/20 to-black', icon: '📖' },
    'philosophy': { gradient: 'from-purple-600/20 to-black', icon: '🤔' },
    'history': { gradient: 'from-amber-600/20 to-black', icon: '📜' },
    'geography': { gradient: 'from-blue-600/20 to-black', icon: '🗺️' },
    'islamic': { gradient: 'from-teal-600/20 to-black', icon: '🕌' },
    'math': { gradient: 'from-cyan-600/20 to-black', icon: '📐' },
    'english': { gradient: 'from-red-600/20 to-black', icon: '🇬🇧' },
    'french': { gradient: 'from-indigo-600/20 to-black', icon: '🇫🇷' },
};

const TRIMESTERS = [
    { id: 't1', label: 'الفصل الأول' },
    { id: 't2', label: 'الفصل الثاني' },
    { id: 't3', label: 'الفصل الثالث' }
];

interface LessonsScreenProps {
    user: User;
    onUpdateUserScore: (points: number) => void;
}

type ViewStep = 'main' | 'subject_hub' | 'sections_list' | 'lessons_list' | 'lesson_content' | 'exams_hub' | 'ai_parser' | 'ai_rhetoric' | 'ai_builder' | 'ai_corrector';

const LessonsScreen: React.FC<LessonsScreenProps> = ({ user, onUpdateUserScore }) => {
    const [step, setStep] = useState<ViewStep>('main');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedTrimester, setSelectedTrimester] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
    const [lessons, setLessons] = useState<LessonContent[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (step === 'lessons_list' && selectedSubject && selectedTrimester && selectedSection) {
            fetchLessons();
            fetchUserProgress();
        }
    }, [step, selectedSubject, selectedTrimester, selectedSection]);

    useEffect(() => {
        if (step === 'exams_hub' && selectedSubject) fetchExams();
    }, [step, selectedSubject]);

    const fetchUserProgress = async () => {
        if (!user) return;
        try {
            const { data } = await supabase.from('user_progress').select('item_id').eq('user_id', user.id).eq('item_type', 'lesson_completion');
            if (data) { setCompletedLessonIds(new Set(data.map(d => parseInt(d.item_id)))); }
        } catch (e) {}
    };

    const toggleLessonCompletion = async (e: React.MouseEvent, lessonId: number) => {
        e.stopPropagation();
        if (!user) return;
        
        const isCompleted = completedLessonIds.has(lessonId);
        if (!isCompleted) playSuccessSound();
        else playClickSound();

        const nextSet = new Set(completedLessonIds);
        if (isCompleted) nextSet.delete(lessonId); else nextSet.add(lessonId);
        setCompletedLessonIds(nextSet);
        try {
            if (isCompleted) {
                await supabase.from('user_progress').delete().eq('user_id', user.id).eq('item_id', lessonId.toString()).eq('item_type', 'lesson_completion');
            } else {
                await supabase.from('user_progress').insert({ user_id: user.id, item_id: lessonId.toString(), item_type: 'lesson_completion', subject: selectedSubject || 'unknown' });
            }
        } catch (err) { setCompletedLessonIds(completedLessonIds); }
    };

    const fetchLessons = async () => {
        setLoading(true);
        try {
            const sectionId = `${selectedSubject}_${selectedTrimester}_${selectedSection}`;
            const { data } = await supabase.from('lessons_content').select('*').eq('section_id', sectionId).order('order_index', { ascending: true }); 
            setLessons(data || []);
        } catch (e) { window.addToast("خطأ في الاتصال", "error"); }
        setLoading(false);
    };

    const fetchExams = async () => {
        setLoading(true);
        const subjectName = ALL_SUBJECTS_LIST.find(s => s.id === selectedSubject)?.name;
        if (subjectName) {
            const { data } = await supabase.from('exams').select('*').eq('subject', subjectName).order('year', { ascending: false });
            if (data) setExams(data);
        }
        setLoading(false);
    };

    const handleBack = () => {
        if (step === 'lesson_content') setStep('lessons_list');
        else if (step === 'lessons_list') { 
            const sections = (selectedSubject && SUBJECT_SECTIONS_MAP[selectedSubject]) || [];
            if (sections.length === 1) { setSelectedSection(null); setSelectedTrimester(null); setStep('subject_hub'); }
            else { setSelectedSection(null); setStep('sections_list'); }
        }
        else if (step === 'sections_list') { setSelectedTrimester(null); setStep('subject_hub'); }
        else if (step === 'exams_hub' || step === 'ai_parser' || step === 'ai_rhetoric' || step === 'ai_builder' || step === 'ai_corrector') setStep('subject_hub');
        else if (step === 'subject_hub') { setSelectedSubject(null); setStep('main'); }
    };

    const CompactBackButton = () => (
        <button onClick={handleBack} className="flex items-center gap-2 px-6 py-2 bg-neutral-900 border border-white/5 rounded-full text-gray-400 hover:text-white transition-all active:scale-95 shadow-lg text-[10px] font-black uppercase tracking-widest mb-6">
            <ArrowRight size={14} /> عودة للخلف
        </button>
    );

    const currentSub = ALL_SUBJECTS_LIST.find(s => s.id === selectedSubject);

    return (
        <div className="h-full flex flex-col custom-scrollbar overflow-y-auto pb-32">
            <div key={step} className="section-entry px-6">
                {step === 'main' && (
                    <div className="max-w-4xl mx-auto flex flex-col items-center pt-4">
                        <div className="text-center mb-10">
                            <p className={INSTRUCTION_TEXT}>اختر مادة للمراجعة</p>
                            <div className="w-12 h-1 bg-brand mx-auto mt-2 rounded-full shadow-lg"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {ALL_SUBJECTS_LIST.map((sub) => {
                                const v = SUBJECT_VISUALS[sub.id] || { gradient: 'from-neutral-600/20 to-black', icon: '📚' };
                                return (
                                    <div key={sub.id} onClick={() => { setSelectedSubject(sub.id); setStep('subject_hub'); playClickSound(); }} className={GLASS_CARD + " aspect-square rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-center"}>
                                        <div className={`absolute inset-0 bg-gradient-to-b ${v.gradient} opacity-20`}></div>
                                        <span className="text-4xl relative z-10">{v.icon}</span>
                                        <h3 className="font-black text-xs sm:text-sm text-white relative z-10">{sub.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 'subject_hub' && (
                    <div className="max-w-xl mx-auto flex flex-col items-center pt-4">
                        <CompactBackButton />
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-black text-white">{currentSub?.name}</h2>
                            <p className={INSTRUCTION_TEXT}>اختر الفصل الدراسي</p>
                        </div>
                        <div className="grid gap-3 w-full">
                            {TRIMESTERS.map((t) => (
                                <div key={t.id} onClick={() => { 
                                    setSelectedTrimester(t.id); 
                                    playClickSound();
                                    const sections = (selectedSubject && SUBJECT_SECTIONS_MAP[selectedSubject]) || [];
                                    if (sections.length === 1) { setSelectedSection(sections[0].id); setStep('lessons_list'); }
                                    else { setStep('sections_list'); }
                                }} className={GLASS_CARD + " p-6 rounded-3xl flex items-center justify-center gap-4 border-white/5"}>
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand"><Calendar size={24}/></div>
                                    <span className="font-black text-lg text-white">{t.label}</span>
                                </div>
                            ))}
                            <div onClick={() => { setStep('exams_hub'); playClickSound(); }} className={GLASS_CARD + " p-10 rounded-[2.5rem] border-brand/20 bg-brand/5 mt-8 flex flex-col items-center justify-center gap-4 text-center"}>
                                <FileCheck size={32} className="text-brand" />
                                <span className="font-black text-xl text-brand block">بنك المواضيع</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'sections_list' && (
                    <div className="max-w-4xl mx-auto flex flex-col items-center pt-4">
                        <CompactBackButton />
                        <div className="mb-10 text-center">
                            <h2 className="text-lg font-black text-white/40">{currentSub?.name}</h2>
                            <p className={INSTRUCTION_TEXT}>اختر القسم المطلوب</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {((selectedSubject && SUBJECT_SECTIONS_MAP[selectedSubject]) || []).map((sec) => {
                                const Icon = getSectionIcon(sec.id);
                                return (
                                    <div key={sec.id} onClick={() => { setSelectedSection(sec.id); setStep('lessons_list'); playClickSound(); }} className={GLASS_CARD + " aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4"}>
                                        <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/10"><Icon size={28} /></div>
                                        <span className="font-black text-sm px-4 leading-tight">{sec.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 'lessons_list' && (
                    <div className="max-w-2xl mx-auto w-full pt-4">
                        <CompactBackButton />
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-black text-white">قائمة الدروس</h2>
                            <p className="text-[10px] text-brand font-black uppercase mt-1 tracking-widest">{currentSub?.name}</p>
                        </div>
                        <div className="grid gap-3">
                            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand" size={40} /></div> : lessons.map((lesson, idx) => {
                                const isDone = completedLessonIds.has(lesson.id);
                                return (
                                    <div key={lesson.id} onClick={() => { setActiveLesson(lesson); setStep('lesson_content'); playClickSound(); }} className={`bg-neutral-900/40 p-6 rounded-3xl border border-white/5 flex items-center gap-5 hover:border-brand/40 transition-all cursor-pointer group clickable ${isDone ? 'opacity-80' : ''}`}>
                                        <button onClick={(e) => toggleLessonCompletion(e, lesson.id)} className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${isDone ? 'bg-brand border-brand' : 'border-white/20'}`}>
                                            {isDone && <Check size={14} className="text-black" strokeWidth={4} />}
                                        </button>
                                        <h4 className={`font-black text-sm flex-1 text-right ${isDone ? 'text-brand' : 'text-gray-200'}`}>{lesson.title}</h4>
                                        <ChevronLeft size={18} className="text-gray-700" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 'lesson_content' && activeLesson && (
                    <div className="max-w-2xl mx-auto w-full pt-4">
                        <CompactBackButton />
                        <LessonRenderer lessonId={activeLesson.id} content={activeLesson.content} completedSubItems={new Set()} onToggle={() => {}} subjectId={selectedSubject!} sectionId={selectedSection!} />
                    </div>
                )}

                {step === 'ai_parser' && <div className="pt-4"><CompactBackButton /><SmartParser /></div>}
                {step === 'ai_rhetoric' && <div className="pt-4"><CompactBackButton /><RhetoricTool /></div>}
                {step === 'ai_builder' && <div className="pt-4"><CompactBackButton /><EssayBuilder /></div>}
                {step === 'ai_corrector' && <div className="pt-4"><CompactBackButton /><EssayCorrector /></div>}

                {step === 'exams_hub' && (
                    <div className="max-w-2xl mx-auto w-full pt-4">
                        <CompactBackButton />
                        <div className="grid gap-3">
                            {exams.map((exam) => (
                                <a key={exam.id} href={exam.pdf_url} target="_blank" rel="noreferrer" className="bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between hover:border-brand/40 transition-all group clickable">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-brand/30"><FileText size={28}/></div>
                                        <div className="text-right">
                                            <h4 className="font-black text-lg text-gray-200">دورة {exam.year}</h4>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase">ملف PDF</p>
                                        </div>
                                    </div>
                                    <Download size={22} className="text-gray-700 group-hover:text-brand transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonsScreen;
