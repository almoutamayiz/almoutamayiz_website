
import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Heart, Lock } from 'lucide-react';

interface SmartOwlProps {
  message: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'thinking' | 'excited' | 'grateful';
  visible: boolean;
  isTrapped?: boolean; // New prop for Cage Mode
}

const SmartOwl: React.FC<SmartOwlProps> = ({ message, mood = 'neutral', visible, isTrapped = false }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 140 }); // Adjusted position
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const owlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && message) {
      setDisplayedMessage('');
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedMessage(message.substring(0, i + 1));
        i++;
        if (i === message.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [message, visible]);

  // Dragging Logic
  const handleStart = (clientX: number, clientY: number) => {
      if (owlRef.current) {
          isDragging.current = true;
          const rect = owlRef.current.getBoundingClientRect();
          offset.current = {
              x: clientX - rect.left,
              y: clientY - rect.top
          };
      }
  };

  const handleMove = (clientX: number, clientY: number) => {
      if (isDragging.current) {
          setPosition({
              x: clientX - offset.current.x,
              y: clientY - offset.current.y
          });
      }
  };

  const handleEnd = () => {
      isDragging.current = false;
  };

  useEffect(() => {
      const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
      const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const onUp = () => handleEnd();

      if (visible) {
          window.addEventListener('touchmove', onTouchMove);
          window.addEventListener('touchend', onUp);
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onUp);
      }

      return () => {
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onUp);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onUp);
      };
  }, [visible]);

  if (!visible) return null;

  // 3D CSS Styles
  const bodyGradient = 'radial-gradient(circle at 30% 30%, #444, #000)';
  const bellyGradient = 'radial-gradient(circle at 50% 0%, #fbbf24, #d97706)'; // Amber-400 to Amber-600
  const eyeGradient = 'radial-gradient(circle at 30% 30%, #fff, #e5e5e5)';
  const pupilGradient = 'radial-gradient(circle at 30% 30%, #333, #000)';
  
  // Mood Styles
  const getEyeStyle = () => {
    if (isTrapped) return 'scale-y-75 translate-y-0.5'; // Sad/Trapped eyes
    switch (mood) {
      case 'happy': return 'scale-y-50 translate-y-1'; 
      case 'sad': return 'rotate-12 translate-y-1 bg-blue-900'; 
      case 'thinking': return 'translate-x-1';
      case 'excited': return 'scale-110';
      case 'grateful': return 'scale-110';
      default: return '';
    }
  };

  const getBrowStyle = () => {
      if (isTrapped) return 'rotate-[15deg] translate-y-1';
      switch(mood) {
          case 'sad': return 'rotate-[20deg] translate-y-1';
          case 'excited': return '-translate-y-1';
          case 'thinking': return 'rotate-[10deg]';
          default: return '';
      }
  };

  return (
    <div 
        ref={owlRef}
        style={{ left: position.x, top: position.y, position: 'fixed' }}
        className="z-[100] flex flex-col items-center gap-1 transition-opacity duration-500 animate-fadeIn cursor-grab active:cursor-grabbing select-none"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
    >
      
      {/* Speech Bubble */}
      <div className={`bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md text-slate-900 dark:text-white p-3 rounded-xl rounded-bl-none shadow-xl border border-yellow-500/50 max-w-[150px] mb-1 transform transition-all duration-300 ${isTyping ? 'scale-105' : 'scale-100'}`}>
         {mood === 'excited' && !isTrapped && <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-4 h-4 animate-spin-slow" />}
         {mood === 'grateful' && !isTrapped && <Heart className="absolute -top-2 -right-2 text-red-500 w-4 h-4 animate-bounce" />}
         <p className="text-[10px] sm:text-xs font-bold leading-relaxed font-cairo text-center">
             {displayedMessage}
             {isTyping && <span className="animate-pulse text-yellow-500">|</span>}
         </p>
      </div>

      {/* 3D Owl Character (Reduced Size by approx 50%) */}
      {/* Original w-24 h-28 -> Now w-12 h-14 */}
      <div className="relative w-12 h-14 filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105">
        
        {/* Cage Bars (If Trapped) */}
        {isTrapped && (
            <div className="absolute -inset-2 z-50 pointer-events-none">
                {/* Vertical Bars */}
                <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-neutral-400 rounded-full shadow-sm"></div>
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-neutral-400 rounded-full shadow-sm"></div>
                <div className="absolute top-0 bottom-0 right-[20%] w-0.5 bg-neutral-400 rounded-full shadow-sm"></div>
                {/* Horizontal Bars */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-500 rounded-full shadow-sm"></div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-500 rounded-full shadow-sm"></div>
                {/* Lock */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-1 rounded border border-neutral-600 shadow-md">
                    <Lock className="w-3 h-3 text-red-500" />
                </div>
            </div>
        )}

        {/* Ears/Tufts */}
        <div className="absolute -top-1 left-0.5 w-3 h-4 bg-black rounded-full rotate-[-20deg]" style={{background: bodyGradient}}></div>
        <div className="absolute -top-1 right-0.5 w-3 h-4 bg-black rounded-full rotate-[20deg]" style={{background: bodyGradient}}></div>

        {/* Body */}
        <div className="absolute inset-0 rounded-[1.25rem] shadow-inner" style={{ background: bodyGradient }}>
           {/* Belly */}
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-9 rounded-[0.75rem] opacity-90 shadow-inner" style={{ background: bellyGradient }}>
               <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           </div>
        </div>

        {/* Face Area */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 flex justify-between items-center z-10 px-0.5">
            
            {/* Left Eye */}
            <div className="w-4 h-4 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)] relative overflow-hidden ring-2 ring-black" style={{background: eyeGradient}}>
                {mood === 'grateful' && !isTrapped ? (
                    <Heart className="w-2.5 h-2.5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse fill-red-500" />
                ) : (
                    <>
                        <div className={`w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${getEyeStyle()}`} style={{background: pupilGradient}}>
                            <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-0.5 right-0.5 opacity-80"></div>
                        </div>
                        <div className={`absolute top-0 w-full bg-black transition-all duration-300 ${getBrowStyle()}`} style={{height: mood === 'sad' || isTrapped ? '40%' : '0%'}}></div>
                    </>
                )}
            </div>

            {/* Beak */}
            <div className="w-2 h-2 bg-orange-500 rotate-45 rounded-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.4)] transform translate-y-1 z-20 border border-orange-600"></div>

            {/* Right Eye */}
            <div className="w-4 h-4 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)] relative overflow-hidden ring-2 ring-black" style={{background: eyeGradient}}>
                {mood === 'grateful' && !isTrapped ? (
                    <Heart className="w-2.5 h-2.5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse fill-red-500" />
                ) : (
                    <>
                        <div className={`w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${getEyeStyle()}`} style={{background: pupilGradient}}>
                            <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-0.5 right-0.5 opacity-80"></div>
                        </div>
                        <div className={`absolute top-0 w-full bg-black transition-all duration-300 ${getBrowStyle()}`} style={{height: mood === 'sad' || isTrapped ? '40%' : '0%'}}></div>
                    </>
                )}
            </div>
        </div>

        {/* Wings */}
        <div className={`absolute top-6 -left-1.5 w-3 h-7 rounded-l-full transform -rotate-12 shadow-lg transition-transform origin-top-right ${mood === 'excited' && !isTrapped ? 'animate-wing-flap' : ''}`} style={{background: bodyGradient}}></div>
        <div className={`absolute top-6 -right-1.5 w-3 h-7 rounded-r-full transform rotate-12 shadow-lg transition-transform origin-top-left ${mood === 'excited' && !isTrapped ? 'animate-wing-flap' : ''}`} style={{background: bodyGradient}}></div>

        {/* Feet */}
        <div className="absolute -bottom-0.5 left-3 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
        <div className="absolute -bottom-0.5 right-3 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>

      </div>
    </div>
  );
};

export default SmartOwl;
