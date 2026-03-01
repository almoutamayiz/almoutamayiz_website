
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    Send, ArrowLeft, MoreVertical, Loader2, Image as ImageIcon, Trash2, GraduationCap
} from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';
import { initGemini, formatGeminiError } from '../lib/gemini';
import { playClickSound, playMessageSentSound, playSuccessSound } from '../utils/audio';

interface SubjectConfig {
    id: string;
    name: string;
    icon: string;
    db_keys: string[];
    color: string;
    glow: string;
}

const CHAT_SUBJECTS: SubjectConfig[] = [
    { 
        id: 'arabic', 
        name: 'اللغة العربية', 
        icon: '📚', 
        db_keys: ['arabic'],
        color: 'bg-teal-500',
        glow: 'shadow-teal-500/20'
    },
    { 
        id: 'philosophy', 
        name: 'الفلسفة', 
        icon: '🤔', 
        db_keys: ['philosophy'],
        color: 'bg-cyan-500',
        glow: 'shadow-cyan-500/20'
    },
    { 
        id: 'social', 
        name: 'الاجتماعيات', 
        icon: '🌍', 
        db_keys: ['history', 'geography'],
        color: 'bg-amber-500',
        glow: 'shadow-amber-500/20'
    },
    { 
        id: 'islamic', 
        name: 'العلوم الإسلامية', 
        icon: '🕌', 
        db_keys: ['islamic'],
        color: 'bg-emerald-500',
        glow: 'shadow-emerald-500/20'
    },
];

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    image?: string;
}

interface TeachersScreenProps {
  user: UserType;
}

const TeachersScreen: React.FC<TeachersScreenProps> = ({ user }) => {
  const [activeSubject, setActiveSubject] = useState<SubjectConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lessonContext, setLessonContext] = useState<string>('');
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
      if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [messages, isTyping, activeSubject]);

  // عند اختيار مادة، نقوم بجلب المحتوى الخاص بها
  useEffect(() => {
      if (activeSubject) {
          fetchSubjectContext(activeSubject.db_keys);
          playSuccessSound();
          setMessages([{
              id: 'welcome',
              role: 'ai',
              content: `مرحباً. أنا أستاذ مادة ${activeSubject.name} في تطبيق المتميز. تفضل بطرح سؤالك مباشرة.`,
              timestamp: new Date()
          }]);
      }
  }, [activeSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubjectContext = async (subjects: string[]) => {
      setIsLoadingContext(true);
      try {
          // جلب كل الدروس ثم الفلترة (أكثر أماناً لتجنب مشاكل الفلاتر المعقدة)
          const { data: allLessons } = await supabase
            .from('lessons_content')
            .select('title, content, section_id');

          if (allLessons) {
              const filtered = allLessons.filter(l => {
                  return subjects.some(subKey => l.section_id && l.section_id.startsWith(subKey));
              });
              
              // تقليص حجم النص إذا كان كبيراً جداً لتجنب تجاوز الحدود
              const contextText = filtered.map(l => `[عنوان الدرس: ${l.title}]\n${l.content}`).join('\n\n----------------\n\n').substring(0, 200000);
              setLessonContext(contextText);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingContext(false);
      }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if ((!inputText.trim() && !imageFile) || !activeSubject) return;

      const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: inputText,
          image: imagePreview || undefined,
          timestamp: new Date()
      };

      setMessages(prev => [...prev, userMsg]);
      playMessageSentSound();
      setInputText('');
      setImageFile(null);
      setImagePreview(null);
      setIsTyping(true);

      try {
          const ai = initGemini();
          
          // بناء سجل المحادثة القصير للحفاظ على السياق القريب
          const historyText = messages.slice(-4).map(m => `${m.role === 'user' ? 'الطالب' : 'الأستاذ'}: ${m.content}`).join('\n');

          const prompt = `
          أنت أستاذ موظف رسمياً في تطبيق "المتميز" لمادة ${activeSubject.name}.
          مهمتك: الإجابة على استفسارات الطلبة بناءً "حصراً" على محتوى الدروس المقدم لك أدناه.

          قواعد صارمة للإجابة (يمنع مخالفتها):
          1. **الأسلوب:** كن مختصراً، مباشراً، ومحترماً. يمنع منعاً باتاً استخدام عبارات المدح المبالغ فيها (مثل "أيها الطالب الرائع"، "الجميل"، "العبقري"). ادخل في صلب الإجابة فوراً.
          2. **المصدر الوحيد:** مرجعيتك هي "محتوى الدروس" المرفق في الأسفل فقط.
             - ابحث عن الكلمات المفتاحية في المحتوى.
             - إذا وجدت الإجابة: استخرجها كما هي (عناصر مرتبة، تعريف دقيق، أقوال كما وردت). لا تزد ولا تنقص من عندك.
             - إذا لم تجد الإجابة في المحتوى: قل حرفياً "عذراً، لا أملك حالياً المعلومة الأكيدة في الدروس المتوفرة، يرجى إعادة المحاولة لاحقاً." (يمنع منعاً باتاً التأليف أو الاجتهاد من معلوماتك الخارجية).
          3. **الخروج عن النص:** إذا سألك الطالب عن موضوع خارج الدراسة (رياضة، سياسة، دردشة عامة)، قل بحزم: "أنا أستاذ آلي مبرمج للإجابة على الأسئلة الخاصة بمادة ${activeSubject.name} فقط."
          4. **التحديث:** أنت تواكب الدروس المضافة حديثاً الموجودة في السياق أدناه.

          محتوى الدروس (قاعدة بياناتك الحالية):
          ${lessonContext || "لا يوجد دروس متاحة حالياً."}

          سياق المحادثة الأخيرة:
          ${historyText}

          سؤال الطالب الجديد:
          ${userMsg.content}
          `;

          let responseText = '';
          
          if (userMsg.image && imageFile) {
               const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve((reader.result as string).split(',')[1]);
                  reader.readAsDataURL(imageFile);
               });
               
               const res = await ai.models.generateContent({
                   model: 'gemini-2.5-flash-image',
                   contents: { parts: [
                       { inlineData: { mimeType: imageFile.type, data: base64 } },
                       { text: prompt }
                   ]}
               });
               responseText = res.text || '';
          } else {
              const res = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: [{ parts: [{ text: prompt }] }]
              });
              responseText = res.text || '';
          }

          setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: responseText,
              timestamp: new Date()
          }]);

      } catch (err: any) {
          window.addToast(formatGeminiError(err), "error");
          setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: "حدث خطأ في الاتصال، حاول مرة أخرى.",
              timestamp: new Date()
          }]);
      } finally {
          setIsTyping(false);
      }
  };

  // --- القائمة الرئيسية للمواد (التصميم الجديد) ---
  if (!activeSubject) {
      return (
        <div className="p-6 animate-fadeIn pb-32 min-h-screen flex flex-col items-center">
            <div className="text-center mb-8 mt-4 relative">
                <div className="w-20 h-20 mx-auto bg-brand/10 rounded-full flex items-center justify-center mb-4 border border-brand/20 shadow-[0_0_30px_rgba(255,198,51,0.1)]">
                    <GraduationCap className="w-10 h-10 text-brand" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">غرفة الاستشارات</h2>
                <p className="text-gray-400 text-sm font-bold">تحدث مع أستاذك الخاص فوراً</p>
            </div>

            <div className="w-full max-w-md space-y-6">
                {CHAT_SUBJECTS.map(sub => (
                    <button 
                        key={sub.id}
                        onClick={() => setActiveSubject(sub)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 group hover:border-white/20 transition-all duration-300 relative overflow-hidden shadow-2xl active:scale-[0.98]"
                    >
                        {/* الخلفية العلوية الملونة الخفيفة */}
                        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        {/* الدائرة الملونة */}
                        <div className={`w-24 h-24 rounded-full ${sub.color} flex items-center justify-center text-5xl shadow-2xl ${sub.glow} group-hover:scale-110 transition-transform duration-500 relative z-10 ring-4 ring-black/50`}>
                            {sub.icon}
                        </div>

                        {/* النص والمؤشر */}
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <h3 className="text-2xl font-black text-white tracking-wide">{sub.name}</h3>
                            <div className={`w-12 h-1.5 ${sub.color} rounded-full shadow-lg`}></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // --- واجهة المحادثة (Portal Full Screen) ---
  return createPortal(
      <div className="fixed inset-0 z-[200] bg-black flex flex-col h-[100dvh] w-full touch-auto">
          
          {/* 1. Header (Fixed Top) */}
          <div className="h-16 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0 shadow-md relative z-10 safe-area-top">
              <div className="flex items-center gap-3">
                  <button onClick={() => { setActiveSubject(null); playClickSound(); }} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                      <ArrowLeft size={20}/>
                  </button>
                  <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border border-black/20 ${activeSubject.color} text-black shadow-lg`}>
                          {activeSubject.icon}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
                  </div>
                  <div>
                      <h3 className="font-black text-white text-sm">أستاذ {activeSubject.name}</h3>
                      <p className="text-[10px] text-green-400 font-bold">متاح الآن</p>
                  </div>
              </div>
              <button className="text-gray-500 p-2"><MoreVertical size={20}/></button>
          </div>

          {/* 2. Messages Area (Flexible & Scrollable) */}
          <div className="flex-1 overflow-y-auto bg-black/50 custom-scrollbar p-4 space-y-4 relative">
              {isLoadingContext && (
                  <div className="flex justify-center py-4">
                      <span className="text-[10px] text-gray-500 bg-neutral-900 px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                          <Loader2 className="animate-spin" size={10}/> جاري تحضير ملفات الدروس...
                      </span>
                  </div>
              )}
              
              {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          
                          {msg.role === 'ai' && (
                              <span className="text-[10px] text-gray-500 font-bold mr-2 mb-1">الأستاذ</span>
                          )}

                          <div className={`px-5 py-3 rounded-2xl text-sm font-bold leading-relaxed shadow-md whitespace-pre-wrap ${
                              msg.role === 'user' 
                              ? `${activeSubject.color} text-black rounded-br-none` 
                              : 'bg-neutral-800 text-gray-200 rounded-bl-none border border-white/5'
                          }`}>
                              {msg.image && (
                                  <img src={msg.image} className="max-w-full rounded-lg mb-2 border border-black/20" alt="uploaded" />
                              )}
                              {msg.content}
                          </div>
                          <span className="text-[9px] text-gray-600 px-1">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                      </div>
                  </div>
              ))}

              {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                      <div className="bg-neutral-800 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                  </div>
              )}
              {/* عنصر وهمي لضمان التمرير للأسفل */}
              <div ref={chatEndRef} className="h-4" />
          </div>

          {/* 3. Input Area (Fixed Bottom) */}
          <div className="p-3 bg-neutral-900 border-t border-white/5 shrink-0 pb-safe">
              {imagePreview && (
                  <div className="flex items-center gap-2 mb-2 bg-black/40 p-2 rounded-xl w-fit border border-white/10 animate-slideIn">
                      <img src={imagePreview} className="w-10 h-10 object-cover rounded-lg" alt="preview" />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-500 p-1 bg-white/5 rounded-full"><Trash2 size={14}/></button>
                  </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-black/50 p-1.5 rounded-[1.5rem] border border-white/10 shadow-inner">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white transition-colors bg-transparent">
                      <ImageIcon size={20} />
                  </button>
                  
                  <textarea 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="اكتب استشارتك هنا..."
                      className="flex-1 bg-transparent text-white text-sm font-bold p-3 outline-none resize-none max-h-32 custom-scrollbar"
                      rows={1}
                  />
                  
                  <button 
                      type="submit" 
                      disabled={!inputText.trim() && !imageFile}
                      className={`p-3 rounded-full transition-all ${inputText.trim() || imageFile ? `${activeSubject.color} text-black shadow-lg rotate-0` : 'bg-neutral-800 text-gray-600 rotate-90 opacity-50'}`}
                  >
                      <Send size={20} className={inputText.trim() || imageFile ? 'rtl:-rotate-90' : ''} />
                  </button>
              </form>
          </div>
      </div>,
      document.body
  );
};

export default TeachersScreen;
