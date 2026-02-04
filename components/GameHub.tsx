
import React from 'react';
import { Play, Trophy, Star, Zap, Brain, Link, Sparkles, Coins, Layers, Medal, Crown, Anchor, Tent, Sun, Map } from 'lucide-react';
import { User } from '../types';

interface GameHubProps {
  onStart: () => void;
  onStartMatchingGame: () => void;
  user: User;
}

const GameHub: React.FC<GameHubProps> = ({ onStart, onStartMatchingGame, user }) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] p-4 sm:p-6 text-center animate-fadeIn pb-32">
      
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">ساحة التحديات</h1>
        <p className="text-gray-500 text-sm mt-2">اختر نظام اللعب واختبر معلوماتك</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl px-2">
          
          <div className="relative group">
             <button
                onClick={onStart}
                className="relative w-full h-full min-h-[300px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] border-[6px] border-[#78350f] rounded-[2rem] p-1 shadow-[0_10px_0_#451a03] transform transition-all duration-200 active:translate-y-2 active:shadow-none overflow-hidden"
             >
                 <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]"></div>
                 <div className="relative z-10 flex flex-col h-full justify-between bg-black/10 backdrop-blur-[2px] rounded-[1.8rem] p-6 border-2 border-white/20">
                     <div className="flex justify-between items-start">
                         <div className="bg-[#fffbeb] p-3 rounded-2xl shadow-lg border-2 border-[#d97706]"><Tent className="w-8 h-8 text-[#d97706]" /></div>
                         <div className="bg-[#78350f] text-[#ffecb3] px-4 py-1 rounded-full font-black text-xs border border-[#92400e] flex items-center gap-2"><Sun size={12} className="text-yellow-400" /> رحلة الصحراء</div>
                     </div>
                     <div className="mt-6 text-center">
                         <h2 className="text-4xl md:text-5xl font-black text-[#fffbeb] drop-shadow-[2px_2px_0_#78350f] mb-1">رحلة<br/><span className="text-[#fcd34d] text-5xl md:text-6xl">البكالوريا</span></h2>
                         <p className="text-[#451a03] font-bold text-sm bg-white/40 inline-block px-4 py-1 rounded-lg mt-3 shadow-inner">اكتشف كنز المعرفة</p>
                     </div>
                     <div className="mt-8 flex justify-center">
                         <div className="w-full bg-[#78350f] hover:bg-[#92400e] text-[#ffecb3] border-b-[4px] border-black/30 px-8 py-4 rounded-xl font-black text-xl shadow-xl flex items-center justify-center gap-3">
                             <Map className="w-6 h-6" /><span>ابدأ المسابقة</span>
                         </div>
                     </div>
                 </div>
             </button>
          </div>

          <div className="relative pt-12 group">
             <button
                onClick={onStartMatchingGame}
                className="relative w-full min-h-[300px] bg-[#3e2723] rounded-lg p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-300"
             >
                 <div className="w-full h-full bg-[#5d4037] border-[6px] border-[#3e2723] rounded-lg relative overflow-hidden flex flex-col p-6">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-multiply"></div>
                     <div className="relative z-10 flex flex-col h-full justify-between items-center text-center">
                         <div className="bg-[#d7ccc8] text-[#3e2723] px-6 py-2 rounded-sm shadow-md border border-[#a1887f] transform -rotate-2 mb-4">
                             <span className="font-black text-xs tracking-widest uppercase">تحدي الذاكرة</span>
                         </div>
                         <div className="mb-4">
                             <h2 className="text-4xl md:text-5xl font-black text-[#ffecb3] drop-shadow-[2px_4px_0_#3e2723] mb-2 font-serif">لعبة المطابقة</h2>
                             <p className="text-[#d7ccc8] text-sm font-bold opacity-90 max-w-xs mx-auto">اربط بين المفاهيم، التواريخ، والشخصيات في أجواء كلاسيكية.</p>
                         </div>
                         <div className="mt-6 w-full">
                             <div className="bg-[#4e342e] text-[#ffecb3] w-full py-3 rounded border-2 border-[#3e2723] font-bold text-lg shadow-[0_4px_0_#271c19] flex items-center justify-center gap-2 group-hover:bg-[#5d4037]">
                                 <Anchor className="w-5 h-5" /><span>دخول التحدي</span>
                             </div>
                         </div>
                     </div>
                 </div>
             </button>
          </div>
      </div>

      <div className="mt-16 text-gray-500 font-bold text-xs flex items-center gap-2 bg-neutral-900/50 px-6 py-2 rounded-full border border-white/5">
          <Brain className="w-4 h-4 text-brand" />
          ملاحظة: الألعاب وسيلة تعليمية لترسيخ المعلومات وتطوير المهارات.
      </div>
    </div>
  );
};

export default GameHub;
