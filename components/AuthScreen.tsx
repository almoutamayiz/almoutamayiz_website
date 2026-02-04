
import React, { useState } from 'react';
import { 
    ShieldAlert, Loader2, BookOpen, FileCheck, FileText, 
    Gamepad2, Eye, EyeOff, Ticket, Sparkles
} from 'lucide-react';
import PrivacyModal from './PrivacyModal';
import SmartParser from './SmartParser';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string, refCode?: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (password.length < 6) throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        await onRegister(name, email, password, referralCode);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "حدث خطأ غير متوقع";
      if (msg.includes("Invalid login credentials")) msg = "البيانات غير صحيحة";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const features = [
    { title: 'ملخصات', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'بنك المواضيع', icon: FileCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'تصحيح مقالات', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'ألعاب تعليمية', icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    // استخدام fixed inset-0 لضمان ملء الشاشة بالكامل دون الاعتماد على هيكلية الـ body
    <div className="fixed inset-0 z-50 bg-[#020202] font-cairo overflow-y-auto overflow-x-hidden custom-scrollbar touch-pan-y">
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      
      {/* --- طبقة الخلفية الثابتة --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
          {/* Animated Glow Blobs */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/10 blur-[80px] rounded-full animate-float-slow"></div>
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-brand/5 blur-[60px] rounded-full animate-float-slow" style={{ animationDelay: '-5s' }}></div>
          
          {/* Background Waves (SVGs) */}
          <div className="absolute bottom-0 left-0 w-full opacity-[0.08] animate-wave-move whitespace-nowrap">
              <svg className="inline-block w-full h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="#ffc633" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
          </div>
          
          <div className="absolute top-0 left-0 w-full opacity-[0.03] rotate-180">
              <svg className="w-full h-96" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="#ffc633" d="M0,160L60,176C120,192,240,224,360,229.3C480,235,600,213,720,176C840,139,960,85,1080,85.3C1200,85,1320,139,1380,165.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
              </svg>
          </div>
      </div>

      {/* --- طبقة المحتوى القابلة للتمرير --- */}
      <div className="relative z-10 w-full min-h-full flex flex-col items-center justify-start px-4 sm:px-6">
        
        {/* فاصل علوي صريح لدفع المحتوى بعيداً عن النوتش */}
        <div className="w-full h-24 shrink-0"></div>

        <div className="w-full max-w-md flex flex-col gap-8 pb-10">
            {/* Header Section */}
            <div className="text-center animate-fadeIn">
                <div className="relative inline-block mb-4">
                    <img src="https://i.ibb.co/bjLDwBbd/IMG-20250722-114332.png" alt="Logo" className="relative w-28 h-28 object-contain mx-auto drop-shadow-[0_0_25px_rgba(255,198,51,0.4)] transition-transform hover:scale-105 duration-500" />
                    <div className="absolute -inset-2 bg-brand/20 blur-xl rounded-full animate-pulse z-[-1]"></div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">المتميز <span className="text-brand">التعليمي</span></h1>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] opacity-60">بوابة النجاح الذكية</p>
            </div>

            {/* Auth Card */}
            <div className="w-full bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-2xl rounded-full -translate-y-16 translate-x-16 group-hover:bg-brand/10 transition-colors"></div>
                
                <div className="flex bg-black/60 p-1 rounded-2xl mb-8 border border-white/5 shadow-inner relative z-10">
                    <button type="button" onClick={() => { setIsLogin(true); setErrorMsg(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${isLogin ? 'bg-brand text-black shadow-lg scale-[1.03]' : 'text-gray-500 hover:text-gray-300'}`}>دخول</button>
                    <button type="button" onClick={() => { setIsLogin(false); setErrorMsg(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!isLogin ? 'bg-brand text-black shadow-lg scale-[1.03]' : 'text-gray-500 hover:text-gray-300'}`}>تسجيل جديد</button>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3 animate-shake">
                        <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] text-red-400 font-bold leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-gray-500 font-black uppercase mr-2 tracking-widest">الاسم الكامل</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-6 text-sm font-bold text-white outline-none focus:border-brand/40 transition-all shadow-inner flex-shrink-0" required={!isLogin} />
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] text-gray-500 font-black uppercase mr-2 tracking-widest">البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-6 text-sm font-bold text-white outline-none focus:border-brand/40 transition-all shadow-inner flex-shrink-0" required />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] text-gray-500 font-black uppercase mr-2 tracking-widest">كلمة المرور</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-6 text-sm font-bold text-white outline-none focus:border-brand/40 transition-all shadow-inner flex-shrink-0" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="flex flex-col gap-2 animate-slideIn">
                            <label className="text-[9px] text-brand font-black uppercase mr-2 tracking-widest flex items-center gap-1.5"><Ticket size={12}/> كود الإحالة (اختياري)</label>
                            <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="كود صديقك لربح النقاط..." className="w-full bg-brand/5 border border-brand/10 rounded-xl py-3.5 px-6 text-brand text-sm font-black outline-none focus:border-brand/30 transition-all uppercase tracking-widest flex-shrink-0" />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brand-light text-black font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] disabled:opacity-30 transition-all text-sm mt-4 flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <span className="uppercase tracking-widest">{isLogin ? 'دخول للمنصة' : 'إنشاء حسابي'}</span>}
                    </button>
                </form>
            </div>

            {/* Smart Parser Demo */}
            <div className="w-full space-y-4 animate-slideUp relative z-10">
                <div className="text-center px-4">
                    <div className="inline-flex items-center gap-2 bg-brand/10 px-3 py-1 rounded-full border border-brand/10 mb-2">
                        <Sparkles size={12} className="text-brand" />
                        <span className="text-[8px] font-black text-brand uppercase tracking-widest">ميزة الذكاء الاصطناعي</span>
                    </div>
                    <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
                        جرب <span className="text-brand">المعرب الذكي</span>
                    </h2>
                    <p className="text-gray-500 text-[10px] font-bold mt-1">اكتب أي جملة واحصل على إعرابها فوراً</p>
                </div>
                
                <div className="w-full bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden">
                    <SmartParser compact={true} />
                </div>
            </div>

            {/* Features Section */}
            <div className="w-full space-y-6 pt-4 relative z-10">
                <h2 className="text-lg font-black text-white text-center uppercase tracking-tighter">لماذا المتميز؟</h2>
                <div className="grid grid-cols-2 gap-3 w-full">
                    {features.map((f, i) => (
                        <div key={i} className="bg-neutral-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col items-center gap-3 text-center shadow-lg group hover:border-brand/20 transition-all duration-500">
                            <div className={`p-3 rounded-xl ${f.bg} transition-all duration-500 group-hover:scale-110`}>
                                <f.icon size={22} className={f.color}/>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-tight">{f.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full mt-6 pt-10 border-t border-white/5 flex flex-col items-center gap-6 pb-6 relative z-10">
                <div className="bg-white/5 px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm shadow-xl">
                    <p className="text-xs font-black text-gray-400">
                        تم تطويره بكل فخر بواسطة <span className="text-brand font-serif italic mx-1">GH.A</span>
                    </p>
                </div>
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-[9px] text-gray-600 hover:text-brand transition-colors font-black uppercase tracking-widest">
                    سياسة الخصوصية وشروط الاستخدام
                </button>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
