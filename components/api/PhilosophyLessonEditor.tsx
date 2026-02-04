
import React, { useState } from 'react';
import { PhilosophyStructuredContent, PhilosophyPosition, PhilosophyPhilosopher } from '../types';
import { 
    BookOpen, Sparkles, User, Quote, Edit3, PlusCircle, Trash2, Save, X, 
    ChevronLeft, Video, Lightbulb, MessageCircle, Layers, CheckCircle, Plus
} from 'lucide-react';

interface PhilosophyLessonEditorProps {
    lessonId: number;
    initialData: PhilosophyStructuredContent;
    onSave: (updatedData: PhilosophyStructuredContent) => void;
    onCancel: () => void;
    videoUrl: string;
}

const PhilosophyLessonEditor: React.FC<PhilosophyLessonEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [data, setData] = useState<PhilosophyStructuredContent>(initialData);

    const handleTextChange = (field: keyof PhilosophyStructuredContent, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handlePositionChange = (posIndex: number, field: keyof PhilosophyPosition, value: string) => {
        const newPositions = [...data.positions];
        (newPositions[posIndex] as any)[field] = value;
        setData(prev => ({ ...prev, positions: newPositions }));
    };

    const handlePhiloChange = (posIdx: number, philoIdx: number, field: keyof PhilosophyPhilosopher, value: string) => {
        const newPositions = [...data.positions];
        const philo = newPositions[posIdx].theories[0].philosophers[philoIdx];
        (philo as any)[field] = value;
        setData(prev => ({ ...prev, positions: newPositions }));
    };

    // Fix for missing 'nationality' property error
    const addPhilosopher = (posIdx: number) => {
        const newPositions = [...data.positions];
        newPositions[posIdx].theories[0].philosophers.push({ 
            name: '', 
            nationality: '', // Added nationality to comply with interface
            idea: '', 
            quote: '', 
            example: '' 
        });
        setData(prev => ({ ...prev, positions: newPositions }));
    };

    const removePhilosopher = (posIdx: number, phIdx: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الفيلسوف؟')) {
            const newPositions = [...data.positions];
            newPositions[posIdx].theories[0].philosophers.splice(phIdx, 1);
            setData(prev => ({ ...prev, positions: newPositions }));
        }
    };

    const INPUT_STYLE = "w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-brand outline-none transition-all shadow-inner";

    return (
        <div className="space-y-10 animate-fadeIn text-right pb-32" dir="rtl">
            <div className="bg-brand/10 p-6 rounded-3xl border border-brand/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Edit3 className="text-brand"/>
                    <h2 className="text-xl font-black text-white">محرر المقالات المنهجي</h2>
                </div>
                <button onClick={onCancel} className="p-2 text-gray-500 hover:text-white transition-colors"><X/></button>
            </div>

            {/* 1. المقدمة */}
            <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                <h3 className="text-brand font-black flex items-center gap-2"><Lightbulb size={20}/> طرح المشكلة (المقدمة)</h3>
                <textarea 
                    value={data.problem} 
                    onChange={e => handleTextChange('problem', e.target.value)} 
                    className={INPUT_STYLE + " h-48"} 
                    placeholder="اكتب نص التمهيد، العناد الفلسفي، والأسئلة..." 
                />
            </div>

            {/* 2. المواقف */}
            {data.positions.map((pos, pIdx) => (
                <div key={pIdx} className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/10 space-y-8 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers className="text-brand" size={24}/>
                            <input 
                                value={pos.title} 
                                onChange={e => handlePositionChange(pIdx, 'title', e.target.value)} 
                                className="bg-transparent text-2xl font-black text-brand border-none w-full focus:ring-0 p-0" 
                                placeholder="عنوان الموقف..."
                            />
                        </div>
                    </div>
                    
                    <div className="grid gap-6">
                        {pos.theories[0].philosophers.map((philo, phIdx) => (
                            <div key={phIdx} className="bg-black/40 p-8 rounded-[2rem] border border-white/5 space-y-5 relative group border-r-4 border-brand/30">
                                <button 
                                    onClick={() => removePhilosopher(pIdx, phIdx)} 
                                    className="absolute top-4 left-4 text-red-500/30 hover:text-red-500 transition-all p-2 bg-red-500/5 rounded-xl"
                                >
                                    <Trash2 size={18}/>
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black mr-2 uppercase tracking-widest">اسم الفيلسوف</label>
                                        <input value={philo.name} onChange={e => handlePhiloChange(pIdx, phIdx, 'name', e.target.value)} className={INPUT_STYLE} placeholder="مثال: ريني ديكارت" />
                                    </div>
                                    <div className="space-y-2">
                                        {/* Added nationality input to fix missing data binding */}
                                        <label className="text-[10px] text-gray-500 font-black mr-2 uppercase tracking-widest">الجنسية/العصر</label>
                                        <input value={philo.nationality} onChange={e => handlePhiloChange(pIdx, phIdx, 'nationality', e.target.value)} className={INPUT_STYLE} placeholder="مثال: فيلسوف يوناني" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-bold mr-2 uppercase tracking-widest">الفكرة العامة</label>
                                        <input value={philo.idea} onChange={e => handlePhiloChange(pIdx, phIdx, 'idea', e.target.value)} className={INPUT_STYLE} placeholder="جوهر الحجة في جملة..." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-bold mr-2 uppercase tracking-widest">القول المأثور</label>
                                    <textarea value={philo.quote} onChange={e => handlePhiloChange(pIdx, phIdx, 'quote', e.target.value)} className={INPUT_STYLE + " h-24"} placeholder="يقول الفيلسوف: ..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-bold mr-2 uppercase tracking-widest">المثال الواقعي</label>
                                    <input value={philo.example} onChange={e => handlePhiloChange(pIdx, phIdx, 'example', e.target.value)} className={INPUT_STYLE} placeholder="مثال تدعيمي من الواقع..." />
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => addPhilosopher(pIdx)} 
                            className="w-full py-4 bg-brand/5 border-2 border-dashed border-brand/20 rounded-2xl text-brand text-sm font-black hover:bg-brand hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18}/> إضافة فيلسوف للموقف {pIdx + 1}
                        </button>
                    </div>

                    <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10">
                        <label className="text-[10px] text-red-400 font-black mb-3 block uppercase tracking-widest">نقد الموقف {pIdx === 0 ? 'الأول' : 'الثاني'}</label>
                        <textarea 
                            value={pos.critique} 
                            onChange={e => handlePositionChange(pIdx, 'critique', e.target.value)} 
                            className={INPUT_STYLE + " h-32 border-red-500/20 focus:border-red-500"} 
                            placeholder="اكتب نقد الموقف شكلاً ومضموناً..." 
                        />
                    </div>
                </div>
            ))}

            {/* 3. التركيب والخاتمة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-purple-400 font-black flex items-center gap-2"><Sparkles size={20}/> التركيب</h3>
                        <select 
                            value={data.synthesisType} 
                            onChange={e => handleTextChange('synthesisType', e.target.value)} 
                            className="bg-black text-[10px] font-black border border-white/10 rounded-lg p-2"
                        >
                            <option value="reconciliation">توفيق</option>
                            <option value="predominance">تغليب</option>
                            <option value="transcending">تجاوز</option>
                        </select>
                    </div>
                    <textarea value={data.synthesis} onChange={e => handleTextChange('synthesis', e.target.value)} className={INPUT_STYLE + " h-48"} placeholder="نص التركيب والموقف الشخصي..." />
                </div>
                <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <h3 className="text-green-500 font-black flex items-center gap-2"><CheckCircle size={20}/> الخاتمة (حل المشكلة)</h3>
                    <textarea value={data.conclusion} onChange={e => handleTextChange('conclusion', e.target.value)} className={INPUT_STYLE + " h-48 border-green-500/20 focus:border-green-500"} placeholder="الاستنتاج النهائي الجامع..." />
                </div>
            </div>
            
            <div className="fixed bottom-10 left-10 right-10 flex gap-4 z-50">
                <button 
                    onClick={() => onSave(data)} 
                    className="flex-1 py-5 bg-brand text-black font-black rounded-3xl shadow-[0_10px_30px_rgba(255,198,51,0.4)] hover:scale-[1.02] active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
                >
                    <Save size={24}/> حفظ وتحديث المقالة
                </button>
            </div>
        </div>
    );
};

export default PhilosophyLessonEditor;
