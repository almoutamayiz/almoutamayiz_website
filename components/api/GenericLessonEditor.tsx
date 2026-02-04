
import React, { useState } from 'react';
import { LessonBlock } from '../types';
import { 
    Trash2, Plus, Save, X, Type, List, Layout, Book, ArrowUp, ArrowDown, GripVertical
} from 'lucide-react';

interface GenericLessonEditorProps {
    initialBlocks: LessonBlock[];
    onSave: (blocks: LessonBlock[]) => void;
    onCancel: () => void;
}

const GenericLessonEditor: React.FC<GenericLessonEditorProps> = ({ initialBlocks, onSave, onCancel }) => {
    const [blocks, setBlocks] = useState<LessonBlock[]>(initialBlocks.length > 0 ? initialBlocks : [{ id: '1', type: 'paragraph', text: '' }]);

    const updateBlock = (idx: number, updates: Partial<LessonBlock>) => {
        const newBlocks = [...blocks];
        newBlocks[idx] = { ...newBlocks[idx], ...updates };
        setBlocks(newBlocks);
    };

    const addBlock = (idx: number) => {
        const newBlocks = [...blocks];
        newBlocks.splice(idx + 1, 0, { id: Date.now().toString(), type: 'paragraph', text: '' });
        setBlocks(newBlocks);
    };

    const removeBlock = (idx: number) => {
        if (blocks.length === 1) return;
        setBlocks(blocks.filter((_, i) => i !== idx));
    };

    const moveBlock = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === blocks.length - 1) return;
        const newBlocks = [...blocks];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        [newBlocks[idx], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[idx]];
        setBlocks(newBlocks);
    };

    const BLOCK_TYPES = [
        { id: 'title', label: 'عنوان كبيـر', icon: Type, color: 'text-[#a855f7]' },
        { id: 'subtitle', label: 'عنوان فرعي', icon: Layout, color: 'text-[#ffc633]' },
        { id: 'paragraph', label: 'عنصر / فقرة', icon: List, color: 'text-[#c0c0c0]' },
        { id: 'term_entry', label: 'تعريف مصطلح', icon: Book, color: 'text-brand' },
    ];

    return (
        <div className="space-y-6 animate-fadeIn pb-32" dir="rtl">
            <div className="bg-neutral-800 p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/20 rounded-lg text-brand"><Layout size={20}/></div>
                    <h2 className="font-black text-white text-lg">منظم محتوى الدرس اليدوي</h2>
                </div>
                <button onClick={onCancel} className="p-2 text-gray-500 hover:text-white transition-all"><X size={24}/></button>
            </div>

            <div className="space-y-4">
                {blocks.map((block, idx) => {
                    const currentType = BLOCK_TYPES.find(t => t.id === block.type) || BLOCK_TYPES[2];
                    return (
                        <div key={block.id || idx} className="bg-neutral-900/60 border border-white/5 rounded-3xl p-4 sm:p-6 group relative">
                            {/* التحكم في الترتيب */}
                            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
                                <button onClick={() => moveBlock(idx, 'up')} className="p-2 bg-neutral-800 rounded-full hover:text-brand transition-colors"><ArrowUp size={16}/></button>
                                <button onClick={() => moveBlock(idx, 'down')} className="p-2 bg-neutral-800 rounded-full hover:text-brand transition-colors"><ArrowDown size={16}/></button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* اختيار النوع */}
                                <div className="w-full sm:w-48 shrink-0 space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mr-2">نوع الحاوية</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                                        {BLOCK_TYPES.map(type => (
                                            <button 
                                                key={type.id}
                                                onClick={() => updateBlock(idx, { type: type.id })}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-black border transition-all ${block.type === type.id ? 'bg-brand/10 border-brand text-brand shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:bg-neutral-800'}`}
                                            >
                                                <type.icon size={14}/>
                                                <span>{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* النص */}
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mr-2">المحتوى الكتابي</label>
                                    <textarea 
                                        value={block.text}
                                        onChange={e => updateBlock(idx, { text: e.target.value })}
                                        className={`w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-brand transition-all resize-none shadow-inner h-24 ${currentType.color}`}
                                        placeholder="اكتب النص هنا..."
                                    />
                                    
                                    {block.type === 'term_entry' && (
                                        <div className="mt-2 animate-slideIn">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest block mr-2 mb-1">شرح المصطلح (اختياري)</label>
                                            <textarea 
                                                value={block.extra_1 || ''}
                                                onChange={e => updateBlock(idx, { extra_1: e.target.value })}
                                                className="w-full bg-brand/5 border border-brand/20 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-brand h-20"
                                                placeholder="ضع الشرح التفصيلي للمصطلح هنا..."
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* أزرار الحذف والإضافة */}
                                <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                    <button onClick={() => addBlock(idx)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all shadow-lg"><Plus size={20}/></button>
                                    <button onClick={() => removeBlock(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-10 left-10 right-10 flex gap-4 z-50">
                <button 
                    onClick={() => onSave(blocks)}
                    className="flex-1 py-5 bg-brand text-black font-black rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
                >
                    <Save size={24}/> اعتماد وتنسيق الدرس
                </button>
            </div>
        </div>
    );
};

export default GenericLessonEditor;
