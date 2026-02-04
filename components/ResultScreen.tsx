

import React, { useEffect } from 'react';
import { RefreshCcw, Trophy, Frown } from 'lucide-react';
import { playVictorySound, playWrongSound } from '../utils/audio';

interface ResultScreenProps {
  amountWon: string;
  isVictory: boolean;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ amountWon, isVictory, onRestart }) => {
  
  useEffect(() => {
    if (isVictory) {
        playVictorySound();
    } else {
        // Short delay to not clash with the wrong answer sound from game screen if any
        setTimeout(() => playWrongSound(), 500);
    }
  }, [isVictory]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-fadeIn text-center">
      
      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 
        ${isVictory 
            ? 'bg-blue-500 dark:bg-yellow-500 border-blue-200 dark:border-yellow-200 shadow-blue-500/50 dark:shadow-yellow-500/50' 
            : 'bg-slate-200 dark:bg-neutral-800 border-slate-300 dark:border-neutral-600'}`}>
        {isVictory ? (
            <Trophy className="w-16 h-16 text-white dark:text-black" />
        ) : (
            <Frown className="w-16 h-16 text-slate-400 dark:text-gray-400" />
        )}
      </div>

      <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">
        {isVictory ? "أنت مليونير!" : "انتهت اللعبة"}
      </h2>
      
      <p className="text-slate-500 dark:text-gray-400 mb-8 text-lg">
        {isVictory ? "مبروك! لقد أجبت على جميع الأسئلة ببراعة." : "حظاً أوفر في المرة القادمة. مراجعة الدروس مفتاح النجاح!"}
      </p>

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-8 mb-10 w-full max-w-sm relative overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 dark:via-yellow-500 to-transparent"></div>
        <p className="text-slate-400 dark:text-gray-500 text-sm mb-2 uppercase tracking-widest">المبلغ المكتسب</p>
        <p className="text-4xl md:text-5xl font-black text-blue-600 dark:text-yellow-400 font-mono">{amountWon} <span className="text-lg">دينار</span></p>
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-3 px-10 py-5 bg-white text-black font-bold rounded-2xl border-b-[6px] border-slate-300 hover:bg-slate-50 active:border-b-0 active:translate-y-[6px] transition-all shadow-md"
      >
        <RefreshCcw className="w-5 h-5" />
        <span>العب مرة أخرى</span>
      </button>

    </div>
  );
};

export default ResultScreen;