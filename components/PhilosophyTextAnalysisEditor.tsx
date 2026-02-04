
import React, { useState } from 'react';
import { PhilosophyTextAnalysisContent } from '../types';
import { 
    Save, X, Lightbulb, User, Book, Layers, Shield, Sparkles, Plus, Trash2, Globe, Clock, History, CheckCircle2
} from 'lucide-react';

interface PhilosophyTextAnalysisEditorProps {
    initialData: PhilosophyTextAnalysisContent;
    onSave: (updatedData: PhilosophyTextAnalysisContent) => void;
    onCancel: () => void;
}

const PhilosophyTextAnalysisEditor: React.FC<PhilosophyTextAnalysisEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [data, setData] = useState<PhilosophyTextAnalysisContent>(initialData);

    const updateField = (path: string, value: any) => {
        const newData = { ...data };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setData(newData);
    };

    const addArgument = () => {
        const newArgs = [...data.arguments, { content: '', explanation: '', type: 'عقلية' }];
        updateField('arguments', newArgs);
    };

    const removeArgument = (idx: number) => {
        const newArgs = data.arguments.filter((_, i) => i !== idx);
        updateField('arguments', newArgs);
    };

    const INPUT_STYLE = "w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-brand outline-none transition-all shadow-inner";

    return (
        <div className="space-y-10 animate-fadeIn text-right pb-32" dir="rtl">
            <div className="bg-brand/10 p-6 rounded-3xl border border-brand/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History className="text-brand"/>
                    <h2 className="text-xl font-black text-white">محرر تحليل النصوص الفلسفية</h2>
                </div>
                <button onClick={onCancel} className="p-2 text-gray-500 hover:text-white transition-colors"><X/></button>
            </div>

            {/* 1. التمهيد */}
            <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <h3 className="text-brand font-black flex items-center gap-2"><Lightbulb size={20}/> 1. التمهيد (المقدمة)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">اسم الإشكالية</label>
                        <input value={data.tamheed.problemName} onChange={e => updateField('tamheed.problemName', e.target.value)} className={INPUT_STYLE} placeholder="مثال: إشكالية إدراك العالم الخارجي" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">موضوع النص</label>
                        <input value={data.tamheed.topic} onChange={e => updateField('tamheed.topic', e.target.value)} className={INPUT_STYLE} placeholder="ما الذي يعالجه النص؟" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black mr-2">تعريف الموضوع</label>
                    <textarea value={data.tamheed.definition} onChange={e => updateField('tamheed.definition', e.target.value)} className={INPUT_STYLE + " h-24"} placeholder="تعريف منهجي دقيق للموضوع..." />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black mr-2">اسم صاحب النص</label>
                    <input value={data.tamheed.authorName} onChange={e => updateField('tamheed.authorName', e.target.value)} className={INPUT_STYLE} placeholder="اسم الفيلسوف..." />
                </div>
            </div>

            {/* 2. التعريف بالصاحب والسياق */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <h3 className="text-blue-400 font-black flex items-center gap-2"><User size={20}/> 2. التعريف بصاحب النص</h3>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">الأصل (عربي/غربي/مسلم)</label>
                        <input value={data.authorInfo.origin} onChange={e => updateField('authorInfo.origin', e.target.value)} className={INPUT_STYLE} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">المؤلفات والمصدر</label>
                        <textarea value={data.authorInfo.bookSource} onChange={e => updateField('authorInfo.bookSource', e.target.value)} className={INPUT_STYLE + " h-24"} placeholder="المؤلفات والكتاب المأخوذ منه..." />
                    </div>
                </div>
                <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <h3 className="text-emerald-400 font-black flex items-center gap-2"><Globe size={20}/> 3. السياق (الفلسفي والتاريخي)</h3>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">المجال (معرفة/قيم/وجود)</label>
                        <input value={data.context.philosophicalType} onChange={e => updateField('context.philosophicalType', e.target.value)} className={INPUT_STYLE} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">الدوافع التاريخية</label>
                        <textarea value={data.context.motives} onChange={e => updateField('context.motives', e.target.value)} className={INPUT_STYLE + " h-24"} placeholder="جدال/صراع بين الفلاسفة..." />
                    </div>
                </div>
            </div>

            {/* 3. طرح السؤال والموقف */}
            <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <h3 className="text-purple-400 font-black flex items-center gap-2"><Sparkles size={20}/> 4 & 5. السؤال والموقف</h3>
                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black mr-2">طرح السؤال</label>
                    <input value={data.question} onChange={e => updateField('question', e.target.value)} className={INPUT_STYLE} placeholder="صياغة التساؤل الإشكالي..." />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black mr-2">شرح الموقف</label>
                    <textarea value={data.authorPosition.explanation} onChange={e => updateField('authorPosition.explanation', e.target.value)} className={INPUT_STYLE + " h-32"} placeholder="شرح موقف الفيلسوف بأسلوب خاص..." />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black mr-2">العبارة الدالة من النص</label>
                    <input value={data.authorPosition.quoteFromText} onChange={e => updateField('authorPosition.quoteFromText', e.target.value)} className={INPUT_STYLE} placeholder="اقتباس من النص..." />
                </div>
            </div>

            {/* 4. الحجج */}
            <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-amber-400 font-black flex items-center gap-2"><Layers size={20}/> 6. الحجج والبراهين</h3>
                    <button onClick={addArgument} className="p-2 bg-amber-400 text-black rounded-full hover:scale-110 transition-all"><Plus size={18}/></button>
                </div>
                <div className="space-y-4">
                    {data.arguments.map((arg, idx) => (
                        <div key={idx} className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4 relative">
                            <button onClick={() => removeArgument(idx)} className="absolute top-4 left-4 text-red-500/50 hover:text-red-500"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black mr-2">نوع الحجة (عقلية/واقعية...)</label>
                                    <input value={arg.type} onChange={e => {
                                        const newArgs = [...data.arguments];
                                        newArgs[idx].type = e.target.value;
                                        updateField('arguments', newArgs);
                                    }} className={INPUT_STYLE} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black mr-2">نص الحجة</label>
                                    <input value={arg.content} onChange={e => {
                                        const newArgs = [...data.arguments];
                                        newArgs[idx].content = e.target.value;
                                        updateField('arguments', newArgs);
                                    }} className={INPUT_STYLE} />
                                </div>
                            </div>
                            <textarea value={arg.explanation} onChange={e => {
                                const newArgs = [...data.arguments];
                                newArgs[idx].explanation = e.target.value;
                                updateField('arguments', newArgs);
                            }} className={INPUT_STYLE + " h-20"} placeholder="شرح الحجة..." />
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. النقد والرأي والخاتمة */}
            <div className="space-y-8">
                <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <h3 className="text-red-400 font-black flex items-center gap-2"><Shield size={20}/> 7. التقييم والنقد</h3>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">نقاط التوفيق</label>
                        <textarea value={data.evaluation.successPoints} onChange={e => updateField('evaluation.successPoints', e.target.value)} className={INPUT_STYLE + " h-24"} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black mr-2">نقاط النقد والضعف</label>
                        <textarea value={data.evaluation.weakPoints} onChange={e => updateField('evaluation.weakPoints', e.target.value)} className={INPUT_STYLE + " h-24"} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                        <h3 className="text-cyan-400 font-black flex items-center gap-2"><Book size={20}/> 8. الرأي الشخصي</h3>
                        <textarea value={data.personalOpinion.myView} onChange={e => updateField('personalOpinion.myView', e.target.value)} className={INPUT_STYLE + " h-48"} placeholder="الرأي الشخصي المعلل..." />
                    </div>
                    <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                        <h3 className="text-green-400 font-black flex items-center gap-2"><CheckCircle2 size={20}/> 9. الخاتمة</h3>
                        <textarea value={data.conclusion} onChange={e => updateField('conclusion', e.target.value)} className={INPUT_STYLE + " h-48"} placeholder="خلاصة التحليل والإجابة..." />
                    </div>
                </div>
            </div>

            <div className="fixed bottom-10 left-10 right-10 flex gap-4 z-50">
                <button 
                    onClick={() => onSave(data)} 
                    className="flex-1 py-5 bg-brand text-black font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
                >
                    <Save size={24}/> حفظ ونشر التحليل
                </button>
            </div>
        </div>
    );
};

export default PhilosophyTextAnalysisEditor;
