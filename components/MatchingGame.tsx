
import React, { useState, useEffect, useRef } from 'react';
import { User, MatchingGameData, MatchItem } from '../types';
import { ArrowLeft, Volume2, VolumeX, Medal, Loader2, Trophy, Shield, Zap, Lightbulb, Frown, RefreshCw, Scroll, Anchor, Sword, ArrowRight, Minus, Plus, GripVertical } from 'lucide-react';
import { playClickSound, playCorrectSound, playWrongSound, playVictorySound, playLifelineSound } from '../utils/audio';

const BGM_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=adventure-cinematic-113063.mp3";

interface MatchingGameProps {
    user: User;
    onExit: () => void;
    onUpdateScore: (points: number) => void;
    gameConfig: MatchingGameData | null;
}

const ITEMS_PER_LEVEL = 5; 

const MatchingGame: React.FC<MatchingGameProps> = ({ user, onExit, onUpdateScore, gameConfig }) => {
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'level_complete' | 'victory' | 'game_over'>('loading');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
    const [rightItems, setRightItems] = useState<MatchItem[]>([]);
    const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);
    const [selectedRight, setSelectedRight] = useState<MatchItem | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [isMusicEnabled, setIsMusicEnabled] = useState(true);
    const [scale, setScale] = useState(0.85);

    const containerRef = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);
    const controlPosition = useRef({ x: 20, y: window.innerHeight - 150 });
    const isDraggingControl = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        if (!gameConfig) return;
        initializeLevel(0);
        audioRef.current = new Audio(BGM_URL);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        return () => { if (audioRef.current) { audioRef.current.pause(); } };
    }, [gameConfig]);

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

    const initializeLevel = (levelIndex: number) => {
        if (!gameConfig) return;
        const startIndex = levelIndex * ITEMS_PER_LEVEL;
        const levelItems = gameConfig.items.slice(startIndex, startIndex + ITEMS_PER_LEVEL);
        if (levelItems.length === 0) { setGameState('victory'); playVictorySound(); return; }
        setLeftItems([...levelItems].sort(() => 0.5 - Math.random()));
        setRightItems([...levelItems].sort(() => 0.5 - Math.random()));
        setMatchedPairs([]);
        setGameState('playing');
    };

    const handleItemClick = (item: MatchItem, side: 'left' | 'right') => {
        if (gameState !== 'playing' || matchedPairs.includes(item.id)) return;
        playClickSound();
        if (side === 'left') setSelectedLeft(item);
        else setSelectedRight(item);
    };

    useEffect(() => {
        if (selectedLeft && selectedRight) {
            if (selectedLeft.id === selectedRight.id) {
                playCorrectSound();
                setFeedback('correct');
                setMatchedPairs(prev => [...prev, selectedLeft.id]);
                setTimeout(() => {
                    setSelectedLeft(null); setSelectedRight(null); setFeedback(null);
                    if (matchedPairs.length + 1 === leftItems.length) {
                        const nextIdx = currentLevelIndex + 1;
                        if (nextIdx * ITEMS_PER_LEVEL >= gameConfig!.items.length) { setGameState('victory'); playVictorySound(); }
                        else { setGameState('level_complete'); }
                        setCurrentLevelIndex(nextIdx);
                    }
                }, 600);
            } else {
                playWrongSound();
                setFeedback('wrong');
                setTimeout(() => { setSelectedLeft(null); setSelectedRight(null); setFeedback(null); }, 600);
            }
        }
    }, [selectedLeft, selectedRight]);

    if (gameState === 'loading' || !gameConfig) return <div className="flex h-full items-center justify-center bg-[#2d1b15]"><Loader2 className="animate-spin text-[#ffca28]" size={48}/></div>;

    return (
        <div className={`flex flex-col h-full bg-[#2d1b15] font-serif relative overflow-hidden ${feedback === 'wrong' ? 'bg-red-950' : ''}`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
            
            <div 
                ref={controlRef}
                style={{ left: controlPosition.current.x, top: controlPosition.current.y, touchAction: 'none' }}
                className="fixed z-[120] flex items-center bg-white/10 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-lg cursor-move opacity-60 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; }}
                onTouchStart={(e) => { isDraggingControl.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
            >
                <div className="p-1 text-gray-400 mr-0.5"><GripVertical size={12}/></div>
                <button onClick={() => setScale(prev => Math.max(0.6, prev - 0.05))} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white"><Minus size={12} /></button>
                <div className="px-1.5 min-w-[30px] text-center"><span className="text-[8px] font-black text-[#ffca28]">{Math.round(scale * 100)}%</span></div>
                <button onClick={() => setScale(prev => Math.min(1.2, prev + 0.05))} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white"><Plus size={12} /></button>
            </div>

            <div className="flex justify-between items-center p-4 z-20 bg-[#3e2723] border-b-[6px] border-[#271c19] relative">
                <span className="bg-[#5d4037] px-4 py-1 rounded text-xs text-[#ffecb3]">اللوح {currentLevelIndex + 1}</span>
                <button onClick={onExit} className="p-2 bg-[#5d4037] rounded border-2 border-[#3e2723]"><ArrowLeft size={20}/></button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className="grid grid-cols-2 gap-8 sm:gap-20 w-full max-w-4xl p-6">
                    <div className="flex flex-col gap-3">
                        {leftItems.map(item => (
                            <button key={item.id} onClick={() => handleItemClick(item, 'left')} className={`min-h-[70px] p-4 rounded-sm border-2 transition-all ${matchedPairs.includes(item.id) ? 'opacity-0 scale-50 pointer-events-none' : selectedLeft?.id === item.id ? 'bg-[#8d6e63] border-[#ffca28] scale-105' : 'bg-[#5d4037] border-[#3e2723] text-[#d7ccc8]'}`}><span className="text-xs font-bold">{item.left}</span></button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        {rightItems.map(item => (
                            <button key={item.id} onClick={() => handleItemClick(item, 'right')} className={`min-h-[70px] p-4 rounded-sm border-2 transition-all ${matchedPairs.includes(item.id) ? 'opacity-0 scale-50 pointer-events-none' : selectedRight?.id === item.id ? 'bg-[#ffe082] border-[#ffca28] scale-105 text-black' : 'bg-[#d7ccc8] border-[#a1887f] text-[#3e2723]'}`}><span className="text-xs font-bold">{item.right}</span></button>
                        ))}
                    </div>
                </div>
            </div>

            {gameState === 'level_complete' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#4e342e] p-8 rounded-xl border-4 border-[#8d6e63] text-center">
                        <Medal size={48} className="text-[#ffca28] mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-[#ffecb3] mb-6">اكتمل اللوح!</h2>
                        <button onClick={() => initializeLevel(currentLevelIndex)} className="w-full py-4 bg-[#ffca28] text-[#3e2723] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"><ArrowRight size={20}/> اللوح التالي</button>
                    </div>
                </div>
            )}

            {gameState === 'victory' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#2d1b15]"><div className="text-center"><Trophy size={80} className="text-[#ffca28] mx-auto mb-6 animate-bounce"/><h2 className="text-4xl font-black text-[#ffca28] mb-8">نصرٌ منهجي!</h2><button onClick={onExit} className="px-12 py-4 bg-[#6d4c41] text-[#ffecb3] rounded-xl font-bold border-2 border-[#8d6e63]">العودة للقائمة</button></div></div>
            )}
        </div>
    );
};

export default MatchingGame;
