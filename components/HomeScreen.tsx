
import React, { useEffect, useState, useRef } from 'react';
import { User, CurriculumStatus } from '../types';
import { 
    Calendar, Edit3, Save, X, Quote, BrainCircuit, PenTool, Sparkles, ArrowRight, 
    MessageSquare, Send, Loader2, Copy, CheckCircle2, Palette, Image as ImageIcon, Trash2 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SmartParser from './SmartParser';
import EssayBuilder from './EssayBuilder';
import EssayCorrector from './EssayCorrector';
import RhetoricTool from './RhetoricTool';

const QUOTES = [
  "من لم يذق مرّ التعلم ساعة، تجرّع ذلّ الجهل طول حياته",
  "طلب العلم أفضل من صلاة النافلة",
  "هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لا يَعْلَمُونَ",
  "العلم في الصغر كالنقش على الحجر",
  "اطلبوا العلم من المهد إلى اللحد",
  "من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة",
  "لا يولد المرء عالماً، فالعالم بالتعلّم",
  "التفكير هو حوار الروح مع نفسها"
];

interface HomeScreenProps {
    user: User;
    onUpdateUser: (u: User) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onUpdateUser }) => {
  const [curriculum, setCurriculum] = useState<CurriculumStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [activeTool, setActiveTool] = useState<'parser' | 'corrector' | 'builder' | 'rhetoric' | null>(null);
  const [adminMsg, setAdminMsg] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCurriculum();
    const interval = setInterval(() => {
        setIsQuoteVisible(false);
        setTimeout(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
            setIsQuoteVisible(true);
        }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurriculum = async () => {
    const { data } = await supabase.from('curriculum_status').select('*').order('id');
    if (data) setCurriculum(data);
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 2 * 1024 * 1024) {
              window.addToast("الصورة كبيرة جداً (الحد الأقصى 2 ميجا)", "error");
              return;
          }
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminMsg.trim()) return;
      setIsSendingMsg(true);
      try {
          let imagePath = null;
          if (imageFile) {
              const fileName = `admin_mail/${user.id}_${Date.now()}.${imageFile.name.split('.').pop()}`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('consultations')
                  .upload(fileName, imageFile);
              
              if (uploadError) throw uploadError;
              imagePath = uploadData?.path;
          }

          const payload = {
              text: adminMsg,
              imagePath: imagePath,
              type: 'admin_contact'
          };

          const { error } = await supabase.from('admin_messages').insert({ 
              user_id: user.id, 
              user_name: user.name, 
              content: JSON.stringify(payload) 
          });

          if (error) throw error;
          window.addToast("تم إرسال رسالتك للإدارة بنجاح", "success");
          setAdminMsg('');
          setImageFile(null);
          setImagePreview(null);
      } catch (err) {
          console.error(err);
          window.addToast("فشل إرسال الرسالة، تحقق من الاتصال", "error");
      } finally {
          setIsSendingMsg(false);
      }
  };

  if (activeTool) {
      return (
          <div className="p-4 sm:p-6 pb-24 animate-fadeIn min-h-screen">
              <button onClick={() => setActiveTool(null)} className="mb-6 flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10 text-sm font-bold text-white transition-all active:scale-95 shadow-lg mx-auto block">
                  <ArrowRight className="w-4 h-4" /> <span>عودة للرئيسية</span>
              </button>
              {activeTool === 'parser' && <SmartParser user={user} onUpdateUser={onUpdateUser} />}
              {activeTool === 'corrector' && <EssayCorrector user={user} onUpdateUser={onUpdateUser} />}
              {activeTool === 'builder' && <EssayBuilder user={user} onUpdateUser={onUpdateUser} />}
              {activeTool === 'rhetoric' && <RhetoricTool user={user} onUpdateUser={onUpdateUser} />}
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 pb-24 animate-fadeIn space-y-8 max-w-4xl mx-auto flex flex-col items-center">
      <section className="w-full transform-gpu will-change-transform">
        <div className="w-full rounded-[2.5rem] p-8 text-center relative overflow-hidden border border-white/5 bg-neutral-900/40 backdrop-blur-3xl shadow-2xl min-h-[160px] flex flex-col justify-center transition-all duration-700">
            <div className="absolute top-4 right-8 opacity-20"><Quote size={40} className="text-brand" /></div>
            <div className={`transition-all duration-700 transform ${isQuoteVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                <p className="text-white text-lg md:text-2xl leading-relaxed font-black italic drop-shadow-lg px-4">
                "{QUOTES[quoteIndex]}"
                </p>
            </div>
            <div className="mt-4 flex justify-center gap-1.5">
                {QUOTES.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-1000 ${i === quoteIndex ? 'w-6 bg-brand' : 'w-2 bg-white/10'}`}></div>
                ))}
            </div>
        </div>
      </section>

      <section className="w-full optimize-scrolling">
        <div className="w-full bg-neutral-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand/5 blur-[100px] rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 relative z-10 tracking-tight">مرحباً بك أيها الطالب المتميز</h2>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto text-sm font-bold relative z-10 opacity-90 text-center">
                مرحبًا بك عزيزي الطالب في منصة "المتميز" رفيقك المتطور في رحلتك نحو المعرفة ، حيث الدروس والأساتذة والأدوات التقنية والألعاب التعليمية.
                استغل كل الميزات المتوفرة في رحلتك نحو الباكالوريا، فبسيرك برفقتنا لا نعدك فقط بالنجاح، بل نعدك بالتميز.
            </p>
        </div>
      </section>

      <section className="w-full text-center optimize-scrolling">
        <h2 className="text-lg font-black text-white mb-6 flex items-center justify-center gap-2"><Sparkles className="w-5 h-5 text-brand"/> ركن الأدوات المتطورة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div onClick={() => setActiveTool('parser')} className="group relative overflow-hidden rounded-[2rem] p-6 shadow-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center cursor-pointer h-40 active:scale-95 text-center">
                <BrainCircuit className="w-8 h-8 text-blue-500 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <h3 className="text-sm font-black text-white leading-tight">المعرب الذكي</h3>
                <p className="text-blue-400/70 text-[9px] font-black uppercase tracking-widest mt-1">5 نقاط</p>
            </div>
            <div onClick={() => setActiveTool('rhetoric')} className="group relative overflow-hidden rounded-[2rem] p-6 shadow-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center cursor-pointer h-40 active:scale-95 text-center">
                <Palette className="w-8 h-8 text-emerald-500 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <h3 className="text-sm font-black text-white leading-tight">الصور البيانية</h3>
                <p className="text-emerald-400/70 text-[9px] font-black uppercase tracking-widest mt-1">3 نقاط</p>
            </div>
            <div onClick={() => setActiveTool('corrector')} className="group relative overflow-hidden rounded-[2rem] p-6 shadow-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-brand/50 transition-all flex flex-col items-center justify-center cursor-pointer h-40 active:scale-95 text-center">
                <Sparkles className="w-8 h-8 text-brand mb-2 drop-shadow-[0_0_15px_rgba(255,198,51,0.5)]" />
                <h3 className="text-sm font-black text-white leading-tight">المصحح المنهجي</h3>
                <p className="text-brand/70 text-[9px] font-black uppercase tracking-widest mt-1">15 نقطة</p>
            </div>
            <div onClick={() => setActiveTool('builder')} className="group relative overflow-hidden rounded-[2rem] p-6 shadow-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center cursor-pointer h-40 active:scale-95 text-center">
                <BrainCircuit className="w-8 h-8 text-purple-500 mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                <h3 className="text-sm font-black text-white leading-tight">منشئ المقالات</h3>
                <p className="text-purple-400/70 text-[9px] font-black uppercase tracking-widest mt-1">10 نقاط</p>
            </div>
        </div>
      </section>

      <section className="w-full optimize-scrolling">
         <h2 className="text-lg font-black text-white text-center mb-6 flex items-center justify-center gap-2">مستجدات المنهج <Calendar className="text-purple-500 w-5 h-5"/></h2>
         <div className="bg-neutral-900/60 backdrop-blur-md rounded-[2rem] border border-white/5 p-6 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {curriculum.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand group-hover:scale-125 transition-transform shrink-0"></div>
                            <span className="font-black text-sm text-gray-200 truncate">{item.subject}</span>
                        </div>
                        <span className="bg-brand/10 text-brand text-[10px] font-black px-4 py-2 rounded-xl border border-brand/20 whitespace-nowrap">
                            {item.last_lesson || 'قريباً'}
                        </span>
                    </div>
                ))}
            </div>
         </div>
      </section>

      <section className="w-full optimize-scrolling">
        <div className="w-full bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 mt-4 shadow-xl text-center">
            <h3 className="font-black text-white text-lg mb-4 flex items-center justify-center gap-2"><MessageSquare className="text-brand" /> تواصل مع الإدارة</h3>
            <form onSubmit={handleSendAdminMessage} className="relative w-full space-y-4">
                <textarea 
                    value={adminMsg} 
                    onChange={(e) => setAdminMsg(e.target.value)} 
                    placeholder="اكتب اقتراحك أو انشغالك هنا..." 
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-[1.5rem] p-5 text-sm font-bold focus:border-brand outline-none text-white text-center transition-all resize-none shadow-inner" 
                />
                
                <div className="flex flex-col items-center">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                    {!imagePreview ? (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
                            <ImageIcon size={16} /> <span>إرفاق صورة للمشكلة (اختياري)</span>
                        </button>
                    ) : (
                        <div className="relative w-full max-w-[200px] rounded-xl overflow-hidden border border-brand/30 shadow-lg">
                            <img src={imagePreview} className="w-full h-32 object-cover opacity-80" />
                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1 bg-red-600 rounded-lg text-white">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={isSendingMsg || !adminMsg.trim()} 
                    className="w-full py-4 bg-brand text-black rounded-2xl hover:bg-brand-light disabled:opacity-50 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-black"
                >
                    {isSendingMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    <span>إرسال الرسالة</span>
                </button>
            </form>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
