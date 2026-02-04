
import React, { useState, useRef } from 'react';
import { GraduationCap, Clock, Send, X, ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

const CONSULTATION_SUBJECTS = [
    { id: 'arabic', name: 'اللغة العربية', icon: '📚' },
    { id: 'philosophy', name: 'الفلسفة', icon: '🤔' },
    { id: 'history', name: 'الاجتماعيات', icon: '🌍' } // Social Studies
];

interface TeachersScreenProps {
  user: User;
}

const TeachersScreen: React.FC<TeachersScreenProps> = ({ user }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Limit size to 2MB to save storage
          if (file.size > 2 * 1024 * 1024) {
              alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.");
              return;
          }
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleStudentSubmit = async () => {
    if (!selectedSubject || !questionText.trim() || !user) return;
    setIsSending(true);

    try {
      let imagePath = null;

      // 1. Upload Image if exists
      if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}.${fileExt}`;
          const { data, error: uploadError } = await supabase.storage
              .from('consultations') // Make sure this bucket exists in Supabase
              .upload(fileName, imageFile);
          
          if (uploadError) {
              // If bucket doesn't exist or other error, try to create bucket or just fail gracefully
              console.error("Upload error", uploadError);
              throw new Error("فشل رفع الصورة. تأكد من إعدادات التخزين.");
          }
          imagePath = data?.path;
      }

      // 2. Construct Message Content (JSON string to include image path)
      const payload = {
          text: questionText,
          imagePath: imagePath,
          subject: selectedSubject
      };

      const messageContent = JSON.stringify(payload);
      
      const { error } = await supabase.from('admin_messages').insert({
        user_id: user.id,
        user_name: user.name,
        content: messageContent, // Store as JSON string
        is_replied: false,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      window.addToast("تم إرسال الاستشارة بنجاح", 'success');
      alert("✅ تم استلام استشارتك!\n\nسيتم حذف الصورة تلقائياً بعد أن يرد الأستاذ وتقرأ الإجابة للحفاظ على المساحة.");
      
      setQuestionText('');
      setSelectedSubject(null);
      setImageFile(null);
      setImagePreview(null);

    } catch (error: any) {
      alert("فشل الإرسال: " + (error.message || "يرجى التحقق من الاتصال بالإنترنت"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 animate-fadeIn pb-32">
        <div className="text-center mb-8 mt-4">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 mb-2">منصة الاستشارات</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">اطرح سؤالك على أساتذة متخصصين في المواد الأساسية واحصل على إجابة موثوقة.</p>
        </div>

        {!selectedSubject ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {CONSULTATION_SUBJECTS.map(sub => (
                    <button 
                        key={sub.id}
                        onClick={() => setSelectedSubject(sub.name)}
                        className="group relative overflow-hidden rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 shadow-2xl backdrop-blur-md bg-teal-900/20 border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-900/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-tr from-teal-600 to-cyan-500 text-white`}>
                            {sub.icon}
                        </div>
                        <h3 className="font-bold text-white text-xl tracking-wide mb-2">{sub.name}</h3>
                        <div className="w-12 h-1 bg-teal-500/50 mx-auto rounded-full group-hover:w-20 transition-all duration-300"></div>
                        <p className="text-xs text-teal-200/70 mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">اضغط لطلب استشارة خاصة</p>
                    </button>
                ))}
            </div>
        ) : (
            <div className="max-w-xl mx-auto bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.15)] animate-slideIn relative">
                <button onClick={() => setSelectedSubject(null)} className="absolute top-6 left-6 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
                
                <div className="text-center mb-6">
                    <h3 className="font-black text-2xl text-white mb-1">
                        طلب استشارة
                    </h3>
                    <p className="text-teal-400 font-bold">{selectedSubject}</p>
                </div>
                
                <textarea 
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    className="w-full h-32 bg-black/50 border border-neutral-700 rounded-2xl p-5 text-white placeholder:text-gray-600 focus:border-teal-500 outline-none resize-none mb-4 transition-colors shadow-inner text-base leading-relaxed"
                    placeholder="اكتب سؤالك هنا بوضوح..."
                />

                {/* Image Upload Area */}
                <div className="mb-6">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageSelect} 
                    />
                    {!imagePreview ? (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-gray-500 hover:text-white hover:border-teal-500 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <ImageIcon size={18} />
                            <span>إرفاق صورة (اختياري)</span>
                        </button>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-teal-500/30">
                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <button 
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    className="bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={12} /> حذف الصورة
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleStudentSubmit}
                    disabled={isSending || !questionText.trim()}
                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? <Loader2 className="animate-spin"/> : <Send size={20} className="rtl:-rotate-90"/>}
                    <span className="text-lg">إرسال الاستشارة</span>
                </button>
                
                <div className="mt-6 bg-teal-900/20 p-3 rounded-xl border border-teal-500/10">
                    <p className="text-[10px] text-teal-200/80 text-center flex items-center justify-center gap-2">
                        <CheckCircle size={12} /> 
                        سيتم توجيه السؤال آلياً للإدارة وللأستاذ المختص.
                    </p>
                </div>
            </div>
        )}
    </div>
  );
};

export default TeachersScreen;
