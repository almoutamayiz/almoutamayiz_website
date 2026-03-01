
import React, { useState, useEffect } from 'react';
import { User, GameState } from '../types';
import { Settings, LogOut, Bell, Shield, ChevronDown, Timer, Calculator, Users, Coins, HelpCircle, BookOpen, Smartphone } from 'lucide-react';

interface HeaderProps {
    user: User;
    appLogo: string;
    hasUnreadNotifs: boolean;
    unrepliedMessagesCount?: number;
    onOpenNotifications: () => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    onNavigate: (state: GameState) => void;
}

const Header: React.FC<HeaderProps> = ({ user, appLogo, hasUnreadNotifs, unrepliedMessagesCount = 0, onOpenNotifications, onOpenSettings, onLogout, onNavigate }) => {
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const targetDate = new Date("2026-06-10T08:00:00").getTime();
            const now = new Date().getTime();
            const diff = targetDate - now;
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000),
                });
            }
        };
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, []);

    const isAdminOrTeacher = user.role === 'admin' || user.role.startsWith('teacher_');
    const referralPoints = (user.referral_count || 0) * 50;

    return (
        <header className="fixed top-0 w-full bg-black/40 backdrop-blur-md z-40 border-b border-white/5 px-4 h-16 flex justify-between items-center">
            <div className="relative">
                <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-brand-dim flex items-center justify-center text-black font-bold shadow-lg overflow-hidden relative">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar"/> : 'M'}
                        {unrepliedMessagesCount > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse"></div>}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                        <span className="font-bold text-xs leading-tight">{user.name}</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">طالب متميز</span>
                    </div>
                    <ChevronDown size={12} className={`text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)}></div>
                        <div className="absolute top-10 right-0 w-72 bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden z-50 animate-fadeIn">
                            <div className="p-4 bg-gradient-to-br from-brand/20 to-neutral-900 border-b border-white/5">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="bg-brand text-black px-3 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-brand/20">
                                        <Coins size={14} />
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">نقاط الإحالة</span>
                                            <span className="text-xs font-black">{referralPoints}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-[8px] text-blue-300 font-black uppercase flex items-center gap-1 mb-1"><Timer size={10} /> البكالوريا</p>
                                        <div className="flex gap-1 text-white font-mono text-[10px]">
                                            <div className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5"><span className="text-brand font-black">{timeLeft.days}</span> يوم</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-1.5 text-white font-mono scale-90">
                                    <div className="flex flex-col items-center bg-black/40 rounded-lg p-1.5 w-11 border border-white/5"><span className="font-bold text-sm text-brand">{timeLeft.days}</span><span className="text-[7px] text-gray-400">يوم</span></div>
                                    <div className="flex flex-col items-center bg-black/40 rounded-lg p-1.5 w-11 border border-white/5"><span className="font-bold text-sm">{timeLeft.hours}</span><span className="text-[7px] text-gray-400">سا</span></div>
                                    <div className="flex flex-col items-center bg-black/40 rounded-lg p-1.5 w-11 border border-white/5"><span className="font-bold text-sm">{timeLeft.minutes}</span><span className="text-[7px] text-gray-400">د</span></div>
                                    <div className="flex flex-col items-center bg-black/40 rounded-lg p-1.5 w-11 border border-white/5"><span className="font-bold text-sm text-red-400">{timeLeft.seconds}</span><span className="text-[7px] text-gray-400">ث</span></div>
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                <button onClick={() => { onNavigate(GameState.GUIDE); setShowUserDropdown(false); }} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-xs text-gray-400 font-bold transition-colors"><BookOpen size={14} className="text-gray-500" /><span>دليل الاستخدام</span></button>
                                <button onClick={() => { onNavigate(GameState.CALCULATOR); setShowUserDropdown(false); }} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-xs text-gray-400 font-bold transition-colors"><Calculator size={14} className="text-gray-500" /><span>حساب المعدل</span></button>
                                <button onClick={() => { onNavigate(GameState.REFERRALS); setShowUserDropdown(false); }} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-xs text-gray-400 font-bold transition-colors"><Users size={14} className="text-gray-500" /><span>نظام الإحالات</span></button>
                                <a 
                                    href="https://www.mediafire.com/file/50co5p4tpizd7ch/almoutamayiz.apk/file" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-brand/10 flex items-center gap-3 text-xs text-brand font-bold transition-colors"
                                >
                                    <Smartphone size={14} className="text-brand" />
                                    <span>تحميل التطبيق</span>
                                </a>
                                {isAdminOrTeacher && (
                                    <button onClick={() => { onNavigate(GameState.ADMIN); setShowUserDropdown(false); }} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs text-gray-400 font-bold transition-colors group/adm">
                                        <div className="flex items-center gap-3"><Shield size={14} className="text-gray-500" /><span>الإدارة العامة</span></div>
                                        {unrepliedMessagesCount > 0 && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>}
                                    </button>
                                )}
                                <button onClick={() => { onOpenSettings(); setShowUserDropdown(false); }} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-xs text-gray-400 font-bold transition-colors"><Settings size={14} className="text-gray-500" /><span>الإعدادات</span></button>
                                <div className="h-px bg-white/5 my-1"></div>
                                <button onClick={onLogout} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-red-500/10 flex items-center gap-3 text-xs text-red-500 font-bold transition-colors"><LogOut size={14}/><span>خروج</span></button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10">
                <img src="https://i.ibb.co/bjLDwBbd/IMG-20250722-114332.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>

            <button onClick={onOpenNotifications} className="relative p-2 text-gray-400 hover:text-white transition-colors group">
                <Bell size={22} className={`transition-all duration-500 ${hasUnreadNotifs ? 'animate-[wiggle_1s_ease-in-out_infinite] text-brand' : ''}`} />
                {hasUnreadNotifs && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand shadow-[0_0_10px_rgba(255,198,51,0.8)]"></span>
                    </span>
                )}
            </button>
        </header>
    );
};

export default Header;
