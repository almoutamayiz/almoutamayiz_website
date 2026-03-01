
import React, { useState, useEffect, useRef } from 'react';
import { Question, Lifelines, MoneyTier } from '../types';
import { Users, Phone, XCircle, Timer as TimerIcon, Trophy, Sparkles, BookOpen, Star, X, Minus, Plus, GripVertical } from 'lucide-react';
import { playClickSound, playCorrectSound, playLifelineSound, playWrongSound } from '../utils/audio';
import { MONEY_LADDER } from '../constants';

interface GameScreenProps {
  questions: Question[];
  onGameOver: (amountWon: string, numericValue: number) => void;
  onVictory: (amountWon: string, numericValue: number) => void;
  onExit: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ questions, onGameOver, onVictory, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lifelines, setLifelines] = useState<Lifelines>({ fiftyFifty: true, askAudience: true, callFriend: true });
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [timer, setTimer] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [showLadder, setShowLadder] = useState(false);
  const [scale, setScale] = useState(0.9); // الافتراضي 90% للهواتف
  const [activeLifeline, setActiveLifeline] = useState<'audience' | 'friend' | null>(null);
  const [audienceData, setAudienceData] = useState<number[]>([]);

  const controlRef = useRef<HTMLDivElement>(null);
  const controlPosition = useRef({ x: 20, y: window.innerHeight - 150 });
  const isDraggingControl = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const question = questions[currentIdx] || questions[0];

  useEffect(() => {
    if (revealed || isPaused) return;
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { handleWrong(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [currentIdx, revealed, isPaused]);

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

  const handleWrong = () => {
    playWrongSound();
    let safeLevel = 0;
    if (currentIdx >= 10) safeLevel = 10;
    else if (currentIdx >= 5) safeLevel = 5;
    const wonTier = MONEY_LADDER.find(t => t.level === safeLevel);
    onGameOver(wonTier ? wonTier.amount : "0", safeLevel);
  };

  const onSelect = (idx: number) => {
    if (revealed || disabledOptions.includes(idx) || selected !== null) return;
    playClickSound();
    setSelected(idx);
    setTimeout(() => {
      setRevealed(true);
      if (idx === question.correctAnswerIndex) {
        playCorrectSound();
        setTimeout(() => {
          if (currentIdx < 14) {
            setCurrentIdx(prev => prev + 1);
            setSelected(null);
            setRevealed(false);
            setDisabledOptions([]);
            setTimer(60);
          } else { onVictory("1,000,000", 1000000); }
        }, 2500);
      } else { setTimeout(handleWrong, 2000); }
    }, 2000);
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col font-cairo overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_100%)] opacity-90"></div>
      
      {/* أداة التحكم في الحجم (للهواتف) */}
      <div 
            ref={controlRef}
            style={{ left: controlPosition.current.x, top: controlPosition.current.y, touchAction: 'none' }}
            className="fixed z-[120] flex items-center bg-white/10 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-lg cursor-move select-none opacity-60 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; }}
            onTouchStart={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        >
            <div className="p-1 text-gray-400 mr-0.5"><GripVertical size={12}/></div>
            <button onClick={() => setScale(prev => Math.max(0.6, prev - 0.05))} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Minus size={12} /></button>
            <div className="px-1.5 min-w-[30px] text-center"><span className="text-[8px] font-black text-brand">{Math.round(scale * 100)}%</span></div>
            <button onClick={() => setScale(prev => Math.min(1.2, prev + 0.05))} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white active:scale-90"><Plus size={12} /></button>
        </div>

      <header className="p-4 flex justify-between items-center z-20 bg-black/40 border-b border-white/5 backdrop-blur-xl shrink-0">
        <button onClick={onExit} className="p-3 bg-red-900/10 text-red-500 rounded-2xl border border-red-500/20"><XCircle size={24}/></button>
        <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 px-8 py-2 rounded-full border-2 transition-all ${timer <= 15 ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-brand bg-black/60'}`}>
                <TimerIcon className={timer <= 15 ? 'text-red-500' : 'text-brand'} size={20}/><span className="text-2xl font-black font-mono tracking-tighter">{timer}</span>
            </div>
        </div>
        <button onClick={() => setShowLadder(!showLadder)} className="bg-brand/10 px-6 py-2 rounded-2xl border border-brand/20 shadow-xl min-w-[140px]">
            <p className="text-[9px] text-brand font-black uppercase tracking-widest mb-0.5 flex items-center justify-center gap-1"><Trophy size={10}/> الجائزة</p>
            <p className="text-sm font-black text-white">{MONEY_LADDER[14 - currentIdx].amount}</p>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', width: '100%', maxWidth: '1024px' }} className="flex flex-col items-center justify-center p-4 space-y-8">
              <div className="w-full bg-gradient-to-b from-[#1e1b4b] to-[#020617] border-x-[6px] border-brand p-8 text-center rounded-[4rem] shadow-2xl relative animate-fadeIn group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand text-black px-6 py-1.5 rounded-full text-[11px] font-black shadow-xl">سؤال المليون رقم {currentIdx + 1}</div>
                  <h2 className="text-xl md:text-3xl font-black leading-snug text-gray-100">{question.text}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {question.options.map((opt, i) => {
                      let statusCls = "bg-black/40 border-white/10 text-gray-400";
                      if (selected === i) statusCls = "bg-brand/40 border-brand text-white ring-4 ring-brand/20 animate-pulse";
                      if (revealed) {
                          if (i === question.correctAnswerIndex) statusCls = "bg-green-600 border-green-400 text-white scale-105 z-20 shadow-[0_0_30px_rgba(34,197,94,0.5)]";
                          else if (selected === i) statusCls = "bg-red-600 border-red-400 text-white";
                      }
                      if (disabledOptions.includes(i)) statusCls = "opacity-10 pointer-events-none grayscale";
                      return (
                          <button key={i} onClick={() => onSelect(i)} disabled={revealed || disabledOptions.includes(i)} className={`p-4 border-2 rounded-[2rem] text-right font-black transition-all flex items-center gap-4 h-20 sm:h-24 ${statusCls}`}>
                              <div className={`w-10 h-10 rounded-2xl bg-black/60 flex items-center justify-center text-brand font-black border border-white/5 ${selected === i ? 'bg-brand text-black' : ''}`}>{['أ', 'ب', 'ج', 'د'][i]}</div>
                              <span className="text-sm md:text-lg flex-1 line-clamp-2">{opt}</span>
                          </button>
                      );
                  })}
              </div>

              <footer className="flex gap-6 mt-4">
                  <button 
                    onClick={() => { 
                        if(!lifelines.fiftyFifty || revealed) return; 
                        playLifelineSound(); 
                        const wrongIndices = [0,1,2,3].filter(i => i !== question.correctAnswerIndex);
                        const toDisable = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
                        setDisabledOptions(toDisable); 
                        setLifelines({...lifelines, fiftyFifty: false}); 
                    }} 
                    disabled={!lifelines.fiftyFifty || revealed} 
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-black transition-all ${!lifelines.fiftyFifty ? 'opacity-20 grayscale' : 'bg-brand/5 border-brand text-brand hover:bg-brand hover:text-black'}`}
                  >
                    <span className="text-xs">50:50</span>
                  </button>

                  <button 
                    onClick={() => { 
                        if(!lifelines.askAudience || revealed) return; 
                        playLifelineSound(); 
                        // توليد بيانات تصويت الجمهور
                        const data = [0, 0, 0, 0];
                        const correctWeight = 60 + Math.random() * 30; // 60-90% للإجابة الصحيحة
                        data[question.correctAnswerIndex] = Math.round(correctWeight);
                        let remaining = 100 - data[question.correctAnswerIndex];
                        const others = [0, 1, 2, 3].filter(i => i !== question.correctAnswerIndex);
                        others.forEach((idx, i) => {
                            if (i === others.length - 1) data[idx] = remaining;
                            else {
                                const val = Math.floor(Math.random() * remaining);
                                data[idx] = val;
                                remaining -= val;
                            }
                        });
                        setAudienceData(data);
                        setActiveLifeline('audience');
                        setLifelines({...lifelines, askAudience: false}); 
                    }} 
                    disabled={!lifelines.askAudience || revealed} 
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${!lifelines.askAudience ? 'opacity-20 grayscale' : 'bg-blue-600/5 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'}`}
                  >
                    <Users size={24}/>
                  </button>

                  <button 
                    onClick={() => { 
                        if(!lifelines.callFriend || revealed) return; 
                        playLifelineSound(); 
                        setActiveLifeline('friend');
                        setLifelines({...lifelines, callFriend: false}); 
                    }} 
                    disabled={!lifelines.callFriend || revealed} 
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${!lifelines.callFriend ? 'opacity-20 grayscale' : 'bg-purple-600/5 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'}`}
                  >
                    <BookOpen size={24}/>
                  </button>
              </footer>
          </div>
      </main>

      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#020617]/95 backdrop-blur-2xl border-r border-white/10 z-50 transition-transform duration-500 flex flex-col ${showLadder ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 border-b border-white/5 flex justify-between items-center"><h3 className="text-brand font-black uppercase text-xs flex items-center gap-2"><Trophy size={16}/> سلم المليون</h3><button onClick={() => setShowLadder(false)}><X size={20}/></button></div>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
              {MONEY_LADDER.map((tier, idx) => {
                  const isActive = 15 - tier.level === currentIdx;
                  return (
                      <div key={idx} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black border flex items-center justify-between gap-4 transition-all ${isActive ? 'bg-brand text-black border-brand scale-105' : 'bg-white/5 border-white/5 text-gray-500 opacity-60'}`}>
                          <span className="w-6">{tier.level}</span><span className="flex-1 text-right">{tier.amount}</span>{tier.isSafeHaven && <Star size={12} fill="currentColor" />}
                      </div>
                  );
              })}
          </div>
      </aside>

      {/* Lifeline Overlays */}
      {activeLifeline === 'audience' && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
              <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <h3 className="text-xl font-black text-white mb-8 text-center flex items-center justify-center gap-3">
                      <Users className="text-blue-500" /> تصويت الجمهور
                  </h3>
                  <div className="flex justify-around items-end h-48 gap-4 px-4">
                      {audienceData.map((val, i) => (
                          <div key={i} className="flex flex-col items-center flex-1 gap-2">
                              <div className="text-[10px] font-black text-blue-400">{val}%</div>
                              <div 
                                className="w-full bg-blue-500/20 border border-blue-500/30 rounded-t-xl transition-all duration-1000" 
                                style={{ height: `${val}%` }}
                              ></div>
                              <div className="text-xs font-black text-white">{['أ', 'ب', 'ج', 'د'][i]}</div>
                          </div>
                      ))}
                  </div>
                  <button 
                    onClick={() => setActiveLifeline(null)} 
                    className="w-full mt-8 py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all"
                  >
                    فهمت، شكراً للجمهور
                  </button>
              </div>
          </div>
      )}

      {activeLifeline === 'friend' && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
              <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                  <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                          <BookOpen className="text-purple-500 w-10 h-10" />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-white mb-1">نصيحة الأستاذ</h3>
                          <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">مكالمة مع خبير</p>
                      </div>
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 w-full italic text-gray-300 font-bold">
                          "أهلاً بك يا بني، لقد راجعت السؤال جيداً.. بناءً على المنهج، أنا متأكد بنسبة كبيرة أن الإجابة الصحيحة هي: <span className="text-brand font-black not-italic">{question.options[question.correctAnswerIndex]}</span>"
                      </div>
                      <button 
                        onClick={() => setActiveLifeline(null)} 
                        className="w-full py-4 bg-purple-500 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all"
                      >
                        شكراً يا أستاذ
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GameScreen;
