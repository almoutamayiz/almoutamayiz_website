
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, User, Volume2, Save, Upload, LogOut, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';
import { setGameVolume, playClickSound } from '../utils/audio';
import { DEFAULT_AVATARS } from '../constants';
import { supabase } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onResetProgress: () => void;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpdateUser, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [volume, setVolume] = useState(user.volume ?? 80);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setName(user.name);
        setAvatar(user.avatar || '');
        setVolume(user.volume ?? 80);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
        // 1. تحديث البيانات في Supabase لضمان الحفظ الدائم
        const { error } = await supabase
            .from('profiles')
            .update({ 
                name: name, 
                avatar: avatar, 
                volume: volume 
            })
            .eq('id', user.id);

        if (error) throw error;

        // 2. تحديث حالة التطبيق المحلية (Redux-like state)
        onUpdateUser({ ...user, name, volume, avatar });
        
        playClickSound();
        window.addToast("تم حفظ تغييراتك بنجاح", "success");
        onClose();
    } catch (err: any) {
        console.error("Save Profile Error:", err);
        window.addToast("حدث خطأ أثناء الاتصال بالخادم", "error");
    } finally {
        setIsSaving(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseInt(e.target.value);
      setVolume(vol);
      setGameVolume(vol);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من حجم الصورة (تجنب الصور الضخمة جداً في قاعدة البيانات)
      if (file.size > 1024 * 1024) { // 1MB
          window.addToast("الصورة كبيرة جداً، يفضل اختيار صورة أصغر", "error");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectDefaultAvatar = (url: string) => {
      playClickSound();
      setAvatar(url);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-slideIn">
      
      <div className="h-16 flex items-center justify-between px-6 bg-neutral-900 border-b border-white/5 shrink-0">
         <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><ArrowRight size={24} /></button>
         <h2 className="text-xl font-black uppercase tracking-tighter">إعدادات الحساب</h2>
         <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-lg mx-auto w-full custom-scrollbar">
          {/* Main Profile Info */}
          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl flex flex-col items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand/20 shadow-2xl bg-neutral-800 flex items-center justify-center transition-transform hover:scale-105">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Avatar" /> : <User className="w-12 h-12 text-gray-600" />}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <div className="w-full text-center">
                <label className="text-[10px] text-gray-500 font-black mb-1 block uppercase tracking-widest">اسمك الذي يظهر للآخرين</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full text-center text-2xl font-black bg-transparent border-b-2 border-white/10 pb-2 focus:border-brand outline-none text-white transition-all" 
                />
            </div>
          </div>

          {/* Default Avatars Section */}
          <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 px-2 uppercase tracking-widest text-center">اختر Memoji رسمي للمتميز</h3>
              <div className="bg-white/5 rounded-[2rem] border border-white/10 p-6 flex flex-wrap justify-center gap-4">
                  {DEFAULT_AVATARS.map((url, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => selectDefaultAvatar(url)}
                        className={`relative w-16 h-16 rounded-2xl overflow-hidden border-4 transition-all hover:scale-110 active:scale-95 ${avatar === url ? 'border-brand shadow-[0_0_15px_rgba(255,198,51,0.5)]' : 'border-white/5 hover:border-white/20'}`}
                      >
                          <img src={url} className="w-full h-full object-cover" alt={`Avatar ${idx}`} />
                          {avatar === url && (
                              <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                                  <div className="bg-brand text-black rounded-full p-0.5"><Check size={12} strokeWidth={4} /></div>
                              </div>
                          )}
                      </button>
                  ))}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-2xl border-4 border-dashed border-white/10 flex items-center justify-center text-gray-600 hover:text-gray-400 hover:border-white/20 transition-all cursor-pointer"
                  >
                      <Upload size={20} />
                  </div>
              </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-gray-500 px-2 uppercase tracking-widest text-center">الصوت والتجربة</h3>
             <div className="bg-white/5 rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand/10 text-brand"><Volume2 size={24} /></div><span className="font-black text-lg">صوت التطبيق</span></div>
                    <span className="font-mono text-brand font-bold">{volume}%</span>
                </div>
                <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-full accent-brand h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer" />
             </div>
          </div>

          <button onClick={onLogout} className="w-full flex items-center justify-between p-6 bg-red-600/5 hover:bg-red-600/10 border border-red-500/20 rounded-[2rem] transition-all group active:scale-95">
              <div className="flex items-center gap-4 text-red-500"><LogOut size={24} /><span className="font-black text-lg">تسجيل الخروج</span></div>
              <ChevronLeft size={20} className="text-red-500/50 group-hover:translate-x-[-4px] transition-transform" />
          </button>
      </div>

      <div className="p-6 bg-neutral-900 border-t border-white/5 shrink-0 pb-safe">
        <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full bg-brand hover:bg-brand-light text-black font-black py-5 rounded-[1.5rem] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xl disabled:opacity-50"
        >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            <span>{isSaving ? 'جاري الحفظ...' : 'تثبيت وحفظ التعديلات'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
