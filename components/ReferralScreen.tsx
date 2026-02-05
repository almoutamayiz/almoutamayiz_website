
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
    ArrowRight, Gift, Users, Copy, CheckCircle2, Share2, 
    Sparkles, Coins, Trophy, Medal, Star, Loader2, Crown, Zap, Gem, Home, Timer, ShieldAlert
} from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { supabase } from '../lib/supabase';

interface ReferralScreenProps {
    user: User;
    onBack: () => void;
}

const REFERRAL_TIERS = [
    {
        name: 'مبادر',
        range: '1 - 5 إحالات',
        reward: '50 نقطة لكل إحالة',
        icon: Medal,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10'
    },
    {
        name: 'نشط',
        range: '6 - 15 إحالة',
        reward: '50 نقطة لكل إحالة',
        icon: Star,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    {
        name: 'طالب سفير',
        range: 'أكثر من 15 إحالة',
        reward: '50 نقطة لكل إحالة',
        icon: Trophy,
        color: 'text-brand',
        bg: 'bg-brand/10'
    }
];

const ReferralScreen: React.FC<ReferralScreenProps> = ({ user, onBack }) => {
    const [activeTab, setActiveTab] = useState<'my_referrals' | 'leaderboard'>('my_referrals');
    const [copied, setCopied] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            // Ranking based on XP (cumulative points)
            // CRITICAL: Filter out Admins from the competition
            const { data, error } = await supabase
                .from('profiles')
                .select('name, avatar, referral_count, xp, role')
                .neq('role', 'admin') // استثناء المدراء نهائياً من القائمة
                .order('xp', { ascending: false })
                .limit(25);
            
            if (error) throw error;
            setLeaderboard(data || []);
        } catch (e) {
            console.error("Leaderboard fetch error:", e);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleCopy = () => {
        if (!user.referral_code) return;
        navigator.clipboard.writeText(user.referral_code);
        setCopied(true);
        playClickSound();
        window.addToast("تم نسخ كود الإحالة", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (!user.referral_code) return;
        const text = `انضم إلي في تطبيق المتميز التعليمي واستخدم كودي الخاص (${user.referral_code}) للحصول على 30 نقطة ترحيبية فوراً! 🚀📚`;
        if (navigator.share) {
            navigator.share({ title: 'المتميز التعليمي', text: text, url: window.location.href });
        } else {
            handleCopy();
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-black text-white p-4 sm:p-6 animate-fadeIn pb-24 font-cairo custom-scrollbar scroll-container">
            <div className="flex items-center justify-between mb-8 max-w-lg mx-auto">
                <button onClick={onBack} className="p-3 bg-neutral-900 rounded-2xl hover:bg-white/5 transition-all border border-white/5 active:scale-90">
                    <ArrowRight size={24} />
                </button>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-yellow-500 uppercase tracking-widest">المسابقة الكبرى</h1>
                <div className="w-12"></div>
            </div>

            {/* Grand Prize Announcement */}
            <div className="max-w-lg mx-auto mb-8 bg-gradient-to-br from-indigo-900/60 to-purple-900/40 p-6 rounded-[2.5rem] border border-brand/30 shadow-[0_0_30px_rgba(255,198,51,0.15)] relative overflow-hidden group animate-slideIn">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-brand text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 shadow-lg">
                        <Crown size={12}/> المسابقة السنوية للمتميز
                    </div>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">الجائزة الكبرى <Sparkles className="text-brand" size={20}/></h2>
                    <p className="text-gray-300 text-xs font-bold leading-relaxed mb-4">
                        سيتم الإعلان عن الطالب المتميز الفائز (صاحب أعلى XP) في يوم إعلان نتائج البكالوريا 2026. الجائزة قيمة جداً وسيتم تسليمها يدوياً <span className="text-brand font-black underline">إلى باب منزلك!</span> 🏠🎁
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-brand/70 uppercase tracking-tighter">
                        <Timer size={12}/> ترقبوا المفاجأة يوم النتائج
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="max-w-lg mx-auto mb-8 bg-neutral-900/60 p-1.5 rounded-[1.5rem] border border-white/5 flex gap-2">
                <button 
                    onClick={() => { setActiveTab('my_referrals'); playClickSound(); }}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'my_referrals' ? 'bg-brand text-black shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Gift size={16} />
                    <span>إحالاتي و XP</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('leaderboard'); playClickSound(); }}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'leaderboard' ? 'bg-brand text-black shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Trophy size={16} />
                    <span>لائحة الأوائل</span>
                </button>
            </div>

            <div className="max-w-lg mx-auto space-y-8">
                {activeTab === 'my_referrals' ? (
                    <>
                        {/* XP Dashboard */}
                        <div className="bg-neutral-900/40 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl"></div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">خبرتك القتالية</p>
                                    <h3 className="text-2xl font-black text-white flex items-center gap-2">مستوى XP <Zap className="text-brand fill-brand" size={20}/></h3>
                                </div>
                                <div className="text-5xl font-black text-brand drop-shadow-[0_0_15px_rgba(255,198,51,0.3)]">{user.xp || 0}</div>
                            </div>
                            <div className="w-full h-3 bg-black/60 rounded-full border border-white/5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 via-brand to-yellow-400 animate-pulse transition-all duration-1000" style={{ width: `${Math.min(100, ((user.xp || 0) / 1000) * 100)}%` }}></div>
                            </div>
                            <p className="text-[9px] text-gray-500 font-bold mt-4 text-center leading-relaxed">
                                <span className="text-brand">ملاحظة:</span> الـ XP هو مجموع كل النقاط التي حصلت عليها. لا ينقص أبداً حتى لو استخدمت النقاط في الذكاء الاصطناعي، وهو المعيار الوحيد للفوز بالجائزة الكبرى.
                            </p>
                        </div>

                        {/* Reward Card */}
                        <div className="bg-gradient-to-br from-indigo-900/40 via-neutral-900 to-black rounded-[3rem] p-10 text-center border border-brand/20 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] opacity-5"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mb-6 border border-brand/30">
                                    <Gift size={40} className="text-brand" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">ادعُ أصدقاءك واربح!</h2>
                                <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8">
                                    احصل على <span className="text-brand">50 نقطة (+50 XP)</span> عن كل شخص يسجل بكودك، وسيحصل صديقك على <span className="text-blue-400">30 نقطة</span> ترحيبية.
                                </p>

                                <div className="w-full bg-black/60 rounded-[2rem] border-2 border-dashed border-brand/30 p-6 relative">
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 px-4 text-[10px] font-black text-brand uppercase tracking-widest">كودك الخاص</span>
                                    <div className="text-5xl font-black tracking-[0.3em] text-white font-mono mb-4 drop-shadow-[0_0_10px_rgba(255,198,51,0.3)]">
                                        {user.referral_code}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleCopy}
                                            className={`flex-1 py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-brand text-black hover:bg-brand-light'}`}
                                        >
                                            {copied ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
                                            <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
                                        </button>
                                        <button 
                                            onClick={handleShare}
                                            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white"
                                        >
                                            <Share2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-900/40 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-xl">
                                <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                                    <Users size={16}/>
                                    <span className="text-[10px] font-black uppercase tracking-widest">إجمالي المدعوين</span>
                                </div>
                                <div className="text-3xl font-black text-white">{user.referral_count || 0}</div>
                            </div>
                            <div className="bg-neutral-900/40 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-xl">
                                <div className="flex items-center justify-center gap-2 text-brand mb-2">
                                    <Coins size={16}/>
                                    <span className="text-[10px] font-black uppercase tracking-widest">رصيدك الحالي</span>
                                </div>
                                <div className="text-3xl font-black text-white">{user.totalEarnings || 0}</div>
                            </div>
                        </div>

                        {/* Tiers Section */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 px-2">
                                <Gem className="text-brand" size={20} />
                                <h3 className="text-lg font-black text-white">تسعيرات الرتب</h3>
                            </div>
                            <div className="grid gap-3">
                                {REFERRAL_TIERS.map((tier, idx) => {
                                    const Icon = tier.icon;
                                    return (
                                        <div key={idx} className="bg-neutral-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-5 group hover:border-brand/20 transition-all relative overflow-hidden">
                                            <div className={`w-14 h-14 rounded-2xl ${tier.bg} flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-105`}>
                                                <Icon className={tier.color} size={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className={`font-black text-sm ${tier.color}`}>{tier.name}</h4>
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">{tier.range}</span>
                                                </div>
                                                <p className="text-gray-300 text-[11px] font-bold flex items-center gap-1.5">
                                                    <Zap size={10} className="text-yellow-500"/>
                                                    {tier.reward}
                                                </p>
                                            </div>
                                            <div className="absolute top-0 right-0 w-1 h-full opacity-20" style={{ backgroundColor: 'currentColor' }}></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="animate-fadeIn space-y-4">
                        <div className="bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5 text-center mb-6">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">فرسان المتميز الأوائل</p>
                            <h3 className="text-lg font-black text-brand flex items-center justify-center gap-2"><Crown size={18} fill="currentColor"/> متصدرو قائمة الـ XP</h3>
                            <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase">الترتيب حسب مجموع الخبرة التراكمية</p>
                        </div>

                        {/* Competition Rules Note */}
                        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 mb-6">
                            <ShieldAlert className="text-red-500 shrink-0" size={18} />
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                <span className="text-red-400 font-black">تنويه هام:</span> هذه المسابقة مخصصة للطلاب فقط. المدراء والمعلمون في المنصة غير معنيين بالتنافس ولا تظهر أسماؤهم في هذه القائمة لضمان الشفافية.
                            </p>
                        </div>

                        {loadingLeaderboard ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin text-brand mx-auto" size={32}/></div>
                        ) : leaderboard.length === 0 ? (
                            <div className="py-20 text-center opacity-30"><Users size={48} className="mx-auto mb-4"/><p className="text-sm font-bold uppercase tracking-widest">لا يوجد نشاط إحالات حالياً</p></div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((item, idx) => {
                                    const isTop3 = idx < 3;
                                    const rankColor = idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500';
                                    const RankIcon = idx === 0 ? Trophy : Medal;

                                    return (
                                        <div key={idx} className={`bg-neutral-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:border-brand/30 group animate-slideIn relative overflow-hidden`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                            {isTop3 && <div className="absolute top-0 left-0 w-1 h-full bg-brand opacity-30 group-hover:opacity-100 transition-opacity"></div>}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-white/5 shadow-inner ${isTop3 ? 'bg-brand/10' : 'bg-black/40'}`}>
                                                {isTop3 ? <RankIcon className={rankColor} size={20} /> : <span className="text-gray-600">{idx + 1}</span>}
                                            </div>
                                            
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-neutral-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                                {item.avatar ? (
                                                    <img src={item.avatar} className="w-full h-full object-cover" alt={item.name} />
                                                ) : (
                                                    <span className="text-xs font-black text-brand uppercase">{item.name?.charAt(0)}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-sm text-gray-200 truncate">{item.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Users size={10}/> {item.referral_count} إحالة</p>
                                                    <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                                                    <p className="text-[10px] text-brand font-black uppercase flex items-center gap-1">المستوى {Math.floor((item.xp || 0) / 100)}</p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-lg font-black text-brand">{item.xp || 0}</span>
                                                    <Zap size={14} className="text-brand fill-brand" />
                                                </div>
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">إجمالي XP</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralScreen;
