
import React, { useState } from 'react';
import { MathLessonStructuredContent, MathPart } from '../types';
import { 
    Plus, Trash2, Video, FileText, Save, X, ChevronUp, ChevronDown, ListPlus, Youtube, AlertTriangle
} from 'lucide-react';

interface MathLessonEditorProps {
    initialData: MathLessonStructuredContent | null;
    onSave: (updatedData: MathLessonStructuredContent) => void;
    onCancel: () => void;
}

const MathLessonEditor: React.FC<MathLessonEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [data, setData] = useState<MathLessonStructuredContent>(
        initialData || { type: "math_series", parts: [{ title: '', video_url: '', description: '' }] }
    );

    const addPart = () => {
        setData(prev => ({
            ...prev,
            parts: [...prev.parts, { title: '', video_url: '', description: '' }]
        }));
    };

    const removePart = (idx: number) => {
        if (data.parts.length === 1) {
            window.addToast("يجب أن يحتوي الدرس على قسم واحد على الأقل", "info");
            return;
        }
        setData(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== idx)
        }));
    };

    const updatePart = (idx: number, field: keyof MathPart, value: string) => {
        const newParts = [...data.parts];
        newParts[idx] = { ...newParts[idx], [field]: value };
        setData(prev => ({ ...prev, parts: newParts }));
    };

    const movePart = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === data.parts.length - 1) return;
        const newParts = [...data.parts];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        [newParts[idx], newParts[targetIdx]] = [newParts[targetIdx], newParts[idx]];
        setData(prev => ({ ...prev, parts: newParts }));
    };

    const INPUT_STYLE = "w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-brand outline-none transition-all shadow-inner font-bold";

    return (
        <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
            <div className="bg-brand/10 p-6 rounded-3xl border border-brand/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ListPlus className="text-brand" size={24}/>
                    <h2 className="text-xl font-black text-white">منظم دروس الرياضيات المتقدم</h2>
                </div>
                <button onClick={onCancel} className="p-2 text-gray-500 hover:text-white transition-colors"><X/></button>
            </div>

            <div className="space-y-6">
                {data.parts.map((part, idx) => (
                    <div key={idx} className="bg-neutral-900/60 p-6 sm:p-8 rounded-[2.5rem] border border-white/5 relative group shadow-2xl">
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
                            <button onClick={() => movePart(idx, 'up')} className="p-2 bg-neutral-800 rounded-full text-brand border border-white/5"><ChevronUp size={20}/></button>
                            <button onClick={() => movePart(idx, 'down')} className="p-2 bg-neutral-800 rounded-full text-brand border border-white/5"><ChevronDown size={20}/></button>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand text-black flex items-center justify-center font-black text-sm shadow-xl">{idx + 1}</div>
                                <h3 className="text-lg font-black text-gray-200">القسم الدراسي</h3>
                            </div>
                            <button onClick={() => removePart(idx)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-4">عنوان القسم (مثلاً: تعريف المتتالية)</label>
                                <input 
                                    value={part.title} 
                                    onChange={e => updatePart(idx, 'title', e.target.value)} 
                                    className={INPUT_STYLE} 
                                    placeholder="اكتب عنوان الفقرة..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-red-400 font-black uppercase tracking-widest mr-4 flex items-center gap-1">
                                    <Youtube size={12}/> رابط اليوتيوب (إلزامي) *
                                </label>
                                <input 
                                    value={part.video_url} 
                                    onChange={e => updatePart(idx, 'video_url', e.target.value)} 
                                    className={INPUT_STYLE + " border-red-500/20 focus:border-red-500"} 
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-4">شرح الفقرة (اختياري)</label>
                                <textarea 
                                    value={part.description} 
                                    onChange={e => updatePart(idx, 'description', e.target.value)} 
                                    className={INPUT_STYLE + " h-32 leading-relaxed"} 
                                    placeholder="اكتب شرحاً كتابياً أو قوانين إضافية للفقرة هنا..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={addPart} 
                className="w-full py-5 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl text-gray-400 font-black hover:bg-brand/5 hover:border-brand/50 hover:text-brand transition-all flex items-center justify-center gap-3"
            >
                <Plus size={24}/> إضافة فقرة جديدة للدرس
            </button>

            <div className="fixed bottom-10 left-10 right-10 flex gap-4 z-50">
                <button 
                    onClick={() => {
                        const hasEmptyVideo = data.parts.some(p => !p.video_url);
                        if (hasEmptyVideo) {
                            window.addToast("يرجى وضع روابط الفيديوهات لجميع الأقسام", "error");
                            return;
                        }
                        onSave(data);
                    }} 
                    className="flex-1 py-5 bg-brand text-black font-black rounded-3xl shadow-[0_10px_30px_rgba(255,198,51,0.4)] hover:scale-[1.02] active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
                >
                    <Save size={24}/> نشر درس الرياضيات المطور
                </button>
            </div>
        </div>
    );
};

export default MathLessonEditor;
