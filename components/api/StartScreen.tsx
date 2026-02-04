
import React, { useState } from 'react';
import { Play, BookOpen, Trophy, LogOut, Settings, User } from 'lucide-react';
import { User as UserType } from '../types';
import SettingsModal from './SettingsModal';

interface StartScreenProps {
  onStart: () => void;
  currentUser: UserType;
  isAdmin: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
  onUpdateUser: (u: UserType) => void;
  onResetProgress: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ 
    onStart, 
    currentUser, 
    isAdmin, 
    onAdminPanel, 
    onLogout,
    onUpdateUser,
    onResetProgress
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const canAccessAdmin = isAdmin || ['teacher_arabic', 'teacher_philosophy', 'teacher_social'].includes(currentUser.role);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center animate-fadeIn relative">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={currentUser} onUpdateUser={onUpdateUser} onResetProgress={onResetProgress} onLogout={onLogout} />

      <div className="absolute top-4 right-4 md:right-8 flex items-center gap-4 z-20">
        <div onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-3 bg-neutral-900/80 backdrop-blur pl-4 pr-2 py-2 rounded-full border border-neutral-700 cursor-pointer shadow-lg">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand bg-neutral-800 flex items-center justify-center">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
            </div>
            <div className="flex flex-col items-start mr-1">
                <span className="text-sm font-bold text-gray-200 leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-brand font-bold uppercase">طالب متميز</span>
            </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 md:left-8 flex gap-3 z-20">
        {canAccessAdmin && <button onClick={onAdminPanel} className="p-3 bg-neutral-900 border-b-4 border-neutral-950 rounded-xl text-brand active:translate-y-1 transition-all"><Settings className="w-6 h-6" /></button>}
        <button onClick={onLogout} className="p-3 bg-red-900/20 border-b-4 border-red-900 rounded-xl text-red-500 active:translate-y-1 transition-all"><LogOut className="w-6 h-6" /></button>
      </div>

      <div className="mb-8 relative mt-24 md:mt-0">
        <div className="absolute -inset-4 bg-brand/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-brand to-brand-dim w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 border-brand-light transform hover:rotate-12 transition-transform duration-300">
          <BookOpen className="w-16 h-16 text-black drop-shadow-lg" />
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-light to-brand mb-4">المراجعة المليونية</h1>
      <p className="text-gray-400 text-lg md:text-xl max-w-md mb-12 leading-relaxed">منصة تعليمية تفاعلية لمرافقتك نحو النجاح.</p>

      <button onClick={onStart} className="group relative px-12 py-6 bg-brand hover:bg-brand-light rounded-2xl border-b-[6px] border-brand-dark shadow-lg active:translate-y-[6px] active:border-b-0 transition-all">
        <div className="flex items-center gap-3 text-2xl font-black text-black"><Play className="fill-black w-8 h-8" /><span>ابدأ المسابقة</span></div>
      </button>

      <div className="mt-16 grid grid-cols-2 gap-8 text-gray-500 text-sm">
        <div className="flex flex-col items-center gap-2 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800"><Trophy className="w-6 h-6 text-brand" /><span>بيئة تنافسية</span></div>
        <div className="flex flex-col items-center gap-2 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800"><BookOpen className="w-6 h-6 text-brand" /><span>مراجعة شاملة</span></div>
      </div>
    </div>
  );
};

export default StartScreen;
