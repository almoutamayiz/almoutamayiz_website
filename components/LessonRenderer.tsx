
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LessonBlock, PhilosophyStructuredContent, PhilosophyPhilosopher, PhilosophyTextAnalysisContent, MathLessonStructuredContent } from '../types';
import { 
  BrainCircuit, Loader2, Lightbulb, ZoomIn, ZoomOut, Maximize2, X, Move,
  Quote, Sparkles, AlertCircle, CheckCircle2, Layers, Search,
  Plus, Minus, GripVertical, PlayCircle, Clock, Book, User as UserIcon, Shield, History, Globe,
  Volume2
} from 'lucide-react';
import { initGemini } from '../lib/gemini';
import { PHILOSOPHER_IMAGES } from '../constants';
import { Modality } from '@google/genai';
import katex from 'katex';
import { playClickSound, playSuccessSound, playTabChangeSound } from '../utils/audio';

interface LessonRendererProps {
  lessonId: number;
  content: string;
  completedSubItems: Set<string>;
  onToggle: (lessonId: number, subItemId: string, subjectId: string) => void;
  subjectId: string;
  sectionId?: string;
}

function decodeBase64(base64: string) {
  try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  } catch (e) {
      return new Uint8Array();
  }
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MathText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    const formula = part.slice(2, -2);
                    try {
                        const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
                        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="block my-4" />;
                    } catch (e) { return <span key={i} className="text-red-500">{part}</span>; }
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    const formula = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
                        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="inline-block" />;
                    } catch (e) { return <span key={i} className="text-red-500">{part}</span>; }
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

const LessonRenderer: React.FC<LessonRendererProps> = ({ lessonId, content, subjectId, sectionId }) => {
    const [scale, setScale] = useState(1.0);
    const [explainingId, setExplainingId] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<Record<string, string>>({});
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

    const controlRef = useRef<HTMLDivElement>(null);
    const controlPosition = useRef({ x: 20, y: window.innerHeight - 200 });
    const isDraggingControl = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // منطق سحب أداة القياس
    useEffect(() => {
        const moveHandler = (e: MouseEvent | TouchEvent) => {
            if (!isDraggingControl.current || !controlRef.current) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - lastPos.current.x;
            const deltaY = clientY - lastPos.current.y;
            controlPosition.current.x = Math.max(0, Math.min(window.innerWidth - 80, controlPosition.current.x + deltaX));
            controlPosition.current.y = Math.max(0, Math.min(window.innerHeight - 80, controlPosition.current.y + deltaY));
            controlRef.current.style.left = `${controlPosition.current.x}px`;
            controlRef.current.style.top = `${controlPosition.current.y}px`;
            lastPos.current = { x: clientX, y: clientY };
        };
        const stopHandler = () => { isDraggingControl.current = false; };
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', stopHandler);
        window.addEventListener('touchmove', moveHandler, { passive: false });
        window.addEventListener('touchend', stopHandler);
        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', stopHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('touchend', stopHandler);
        };
    }, []);

    // التحقق مما إذا كانت المادة هي لغة أجنبية (انجليزية أو فرنسية)
    const isForeignLang = subjectId === 'english' || subjectId === 'french';
    const direction = isForeignLang ? 'ltr' : 'rtl';
    const textAlign = isForeignLang ? 'text-left' : 'text-right';
    const borderClass = isForeignLang ? 'border-l-4' : 'border-r-4';
    const paddingClass = isForeignLang ? 'pl-3' : 'pr-3';
    const innerPaddingClass = isForeignLang ? 'pl-5' : 'pr-5';

    const parsed = useMemo(() => {
        try { return JSON.parse(content); } catch (e) { return null; }
    }, [content]);

    if (!parsed) {
        return (
            <div className="p-10 text-center bg-red-500/10 border border-red-500/20 rounded-3xl">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
                <p className="text-red-500 font-bold">عذراً، محتوى هذا الدرس غير صالح للعرض.</p>
            </div>
        );
    }

    const getPhilosopherImage = (name: string): string => {
        if (!name) return `https://ui-avatars.com/api/?name=P&background=ffc633&color=000&size=128`;
        if (PHILOSOPHER_IMAGES[name]) return PHILOSOPHER_IMAGES[name];
        const keys = Object.keys(PHILOSOPHER_IMAGES);
        const match = keys.find(k => name.includes(k) || k.includes(name));
        if (match) return PHILOSOPHER_IMAGES[match];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffc633&color=000&size=128`;
    };

    const getYoutubeId = (url?: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSpeak = async (text: string, lang: 'french' | 'english') => {
        if (isSpeaking) return;
        setIsSpeaking(text);
        try {
            const ai = initGemini();
            const voiceName = lang === 'french' ? 'Charon' : 'Puck'; 
            const langLabel = lang === 'french' ? 'French' : 'English';
            const prompt = `Task: Say ONLY the ${langLabel} words found in the following text. 
            CRITICAL: Completely ignore and do NOT pronounce any Arabic characters, words, or translations. 
            Text to process: "${text}"`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                // Use a shared context or ensure cleanup
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const buffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
                const src = ctx.createBufferSource();
                src.buffer = buffer;
                src.connect(ctx.destination);
                src.onended = () => {
                    setIsSpeaking(null);
                    ctx.close(); // Close the context to free resources
                };
                src.start();
            } else setIsSpeaking(null);
        } catch (e) { setIsSpeaking(null); }
    };

    const handleExplain = async (philo: PhilosophyPhilosopher) => {
        const id = philo.name;
        if (explanation[id]) { setExplainingId(id === explainingId ? null : id); return; }
        setExplainingId(id);
        try {
            const ai = initGemini();
            const prompt = `اشرح باختصار فكرة ${philo.name}: ${philo.idea}`;
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: [{ parts: [{ text: prompt }] }] 
            });
            setExplanation(prev => ({ ...prev, [id]: response.text || "لا يوجد شرح." }));
        } catch (e) {
            window.addToast("فشل الاتصال.", "error");
            setExplainingId(null);
        }
    };

    const VideoCard = ({ url, title }: { url?: string, title?: string }) => {
        const vid = getYoutubeId(url);
        if (!vid) return null;
        return (
            <div className="mx-1 mb-4">
                {title && <h4 className={`text-brand font-black text-sm mb-3 ${isForeignLang ? 'border-l-4 pl-3' : 'border-r-4 pr-3'} border-brand`}>{title}</h4>}
                <a href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-3xl overflow-hidden border-2 border-brand/20 shadow-2xl">
                    <img src={`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`} className="w-full h-full object-cover" alt="Video" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-16 h-16 bg-brand text-black rounded-full flex items-center justify-center shadow-2xl"><PlayCircle size={32} fill="currentColor" /></div>
                    </div>
                </a>
            </div>
        );
    };

    const containerStyle = { transform: `scale(${scale})`, transformOrigin: 'top center', width: '100%' };

    if (parsed.type === 'math_series') {
        const data = parsed as MathLessonStructuredContent;
        return (
            <div className="animate-fadeIn w-full overflow-x-hidden pb-40 px-2" dir="rtl">
                {/* أداة التحكم في الحجم */}
                <div 
                    ref={controlRef}
                    style={{ left: controlPosition.current.x, top: controlPosition.current.y, touchAction: 'none' }}
                    className="fixed z-[120] flex items-center bg-white/10 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-lg cursor-move select-none opacity-60 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; }}
                    onTouchStart={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                >
                    <div className="p-1 text-gray-400 mr-0.5"><GripVertical size={12}/></div>
                    <button onClick={() => { setScale(prev => Math.max(0.6, prev - 0.05)); playClickSound(); }} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Minus size={12} /></button>
                    <div className="px-1.5 min-w-[30px] text-center"><span className="text-[8px] font-black text-brand">{Math.round(scale * 100)}%</span></div>
                    <button onClick={() => { setScale(prev => Math.min(1.2, prev + 0.05)); playClickSound(); }} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Plus size={12} /></button>
                </div>

                <div style={containerStyle} className="space-y-8">
                    {data.parts.map((part, idx) => (
                        <div key={idx} className="bg-neutral-900/40 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                            <h3 className="text-xl font-black text-white mb-5 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs">{idx + 1}</span>
                                {part.title}
                            </h3>
                            <VideoCard url={part.video_url} />
                            {part.description && (
                                <div className="mt-6 bg-black/40 p-6 rounded-2xl border border-white/5">
                                    <div className="text-gray-200 font-bold leading-relaxed text-base whitespace-pre-wrap">
                                        <MathText text={part.description} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (parsed.type === 'philosophy_structured') {
        const data = parsed as PhilosophyStructuredContent;
        return (
            <div className="animate-fadeIn w-full overflow-x-hidden pb-40" dir="rtl">
                {/* أداة التحكم في الحجم */}
                <div 
                    ref={controlRef}
                    style={{ left: controlPosition.current.x, top: controlPosition.current.y, touchAction: 'none' }}
                    className="fixed z-[120] flex items-center bg-white/10 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-lg cursor-move select-none opacity-60 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; }}
                    onTouchStart={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                >
                    <div className="p-1 text-gray-400 mr-0.5"><GripVertical size={12}/></div>
                    <button onClick={() => { setScale(prev => Math.max(0.6, prev - 0.05)); playClickSound(); }} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Minus size={12} /></button>
                    <div className="px-1.5 min-w-[30px] text-center"><span className="text-[8px] font-black text-brand">{Math.round(scale * 100)}%</span></div>
                    <button onClick={() => { setScale(prev => Math.min(1.2, prev + 0.05)); playClickSound(); }} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Plus size={12} /></button>
                </div>

                <div style={containerStyle} className="space-y-4">
                    <VideoCard url={data.video_url} />
                    <div className="bg-neutral-900/80 p-5 rounded-2xl border border-brand/20 relative mx-1">
                        <h3 className="text-lg font-black text-brand mb-3 flex items-center gap-2"><Lightbulb size={18}/> طرح المشكلة</h3>
                        <div className="text-gray-200 leading-relaxed font-bold text-sm text-justify whitespace-pre-wrap">{data.problem}</div>
                    </div>
                    {(data.positions || []).map((pos, pIdx) => (
                        <div key={pIdx} className="space-y-4">
                            <div className="bg-brand text-black px-5 py-2 rounded-xl font-black text-sm shadow-md inline-block mr-2"> {pos.title}</div>
                            {(pos.theories?.[0]?.philosophers || []).map((philo, phIdx) => (
                                <div key={phIdx} className="bg-neutral-900/40 border border-white/5 rounded-3xl p-5 space-y-4 shadow-lg mx-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full border border-brand/20 overflow-hidden bg-black shrink-0 shadow-xl">
                                            <img src={getPhilosopherImage(philo.name)} className="w-full h-full object-cover" alt={philo.name} />
                                        </div>
                                        <div><h4 className="text-base font-black text-white">{philo.name}</h4><p className="text-brand text-[8px] font-black uppercase">{philo.nationality}</p></div>
                                    </div>
                                    <div className="p-3 bg-black/40 rounded-xl text-xs text-gray-300 font-bold whitespace-pre-wrap">{philo.idea}</div>
                                    <div className="p-5 bg-brand/5 border border-brand/10 rounded-2xl text-white italic font-black text-sm whitespace-pre-wrap">"{philo.quote}"</div>
                                    <button onClick={() => { handleExplain(philo); playSuccessSound(); }} className="w-full py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2">
                                        <Sparkles size={14}/> {explainingId === philo.name && !explanation[philo.name] ? 'جاري التحميل...' : 'المعلم الذكي'}
                                    </button>
                                    {explainingId === philo.name && explanation[philo.name] && <div className="p-5 bg-white text-black rounded-2xl font-bold text-sm border-2 border-brand whitespace-pre-wrap">{explanation[philo.name]}</div>}
                                </div>
                            ))}
                            <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/20 mx-1">
                                <h3 className="text-base font-black text-red-400 mb-2 flex items-center gap-2"><AlertCircle size={16}/> نقد الموقف</h3>
                                <p className="text-gray-300 font-bold text-xs leading-relaxed whitespace-pre-wrap">{pos.critique}</p>
                            </div>
                        </div>
                    ))}
                    <div className="bg-neutral-900/60 p-5 rounded-2xl border border-purple-500/20 mx-1">
                        <h3 className="text-lg font-black text-purple-400 mb-2">التركيب</h3>
                        <p className="text-gray-200 text-sm leading-relaxed font-bold whitespace-pre-wrap">{data.synthesis}</p>
                    </div>
                    <div className="bg-neutral-900/90 p-6 rounded-3xl border border-green-500/30 mx-1 shadow-2xl">
                        <h3 className="text-lg font-black text-green-400 mb-2">الخاتمة</h3>
                        <p className="text-white text-sm leading-relaxed font-black whitespace-pre-wrap">{data.conclusion}</p>
                    </div>
                </div>
            </div>
        );
    }

    const blocks: LessonBlock[] = Array.isArray(parsed) ? parsed : (parsed.blocks || []);
    return (
        <div className="animate-fadeIn w-full overflow-x-hidden pb-40 px-2" dir={direction}>
            {/* أداة التحكم في الحجم */}
            <div 
                ref={controlRef}
                style={{ left: controlPosition.current.x, top: controlPosition.current.y, touchAction: 'none' }}
                className="fixed z-[120] flex items-center bg-white/10 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-lg cursor-move select-none opacity-60 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; }}
                onTouchStart={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
            >
                <div className="p-1 text-gray-400 mr-0.5"><GripVertical size={12}/></div>
                <button onClick={() => { setScale(prev => Math.max(0.6, prev - 0.05)); playClickSound(); }} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Minus size={12} /></button>
                <div className="px-1.5 min-w-[30px] text-center"><span className="text-[8px] font-black text-brand">{Math.round(scale * 100)}%</span></div>
                <button onClick={() => { setScale(prev => Math.min(1.2, prev + 0.05)); playClickSound(); }} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Plus size={12} /></button>
            </div>

            <div style={containerStyle} className="space-y-6">
                <VideoCard url={parsed.video_url} />
                {blocks.map((block, idx) => (
                    <div key={idx} className="mx-1">
                        {block.type === 'title' && <h1 className="text-2xl font-black text-[#a855f7] mb-6 text-center">{block.text}</h1>}
                        {block.type === 'subtitle' && <h2 className={`text-lg font-black text-[#ffc633] mb-4 ${borderClass} border-[#ffc633] ${paddingClass}`}>{block.text}</h2>}
                        {block.type === 'paragraph' && <div className={`text-gray-300 font-bold text-sm leading-relaxed mb-4 ${textAlign} whitespace-pre-wrap`}><MathText text={block.text} /></div>}
                        {block.type === 'term_entry' && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] mb-4 shadow-xl flex flex-col gap-3">
                                <div className={`flex items-center justify-between gap-3 ${isForeignLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`flex items-center gap-3 ${isForeignLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="w-2 h-8 bg-brand rounded-full"></div>
                                        <h4 className="text-brand font-black text-base">{block.text}</h4>
                                    </div>
                                    {(subjectId === 'french' || subjectId === 'english') && (
                                        <button onClick={() => handleSpeak(block.text, subjectId as any)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-brand"><Volume2 size={20} /></button>
                                    )}
                                </div>
                                {block.extra_1 && <div className={`text-gray-400 text-sm font-bold leading-relaxed ${innerPaddingClass} whitespace-pre-wrap`}><MathText text={block.extra_1} /></div>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LessonRenderer;
