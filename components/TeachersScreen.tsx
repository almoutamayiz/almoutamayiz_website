
import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, X, ArrowLeft, MoreVertical, Bot, User, Loader2, Image as ImageIcon, Trash2
} from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';
import { initGemini, formatGeminiError } from '../lib/gemini';

// تحديد المواد المتاحة للاستشارة فقط
const CHAT_SUBJECTS = [
    { id: 'arabic', name: 'اللغة العربية', icon: '📚', db_keys: ['arabic'] },
    { id: 'philosophy', name: 'الفلسفة', icon: '🤔', db_keys: ['philosophy'] },
    { id: 'social', name: 'الاجتماعيات', icon: '🌍', db_keys: ['history', 'geography'] }, // دمج التاريخ والجغرافيا
    { id: 'islamic', name: 'العلوم الإسلامية', icon: '🕌', db_keys: ['islamic'] },
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
  const [activeSubject, setActiveSubject] = useState<{id: string, name: string, db_keys: string[]} | null>(null);
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
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // عند اختيار مادة، نقوم بجلب المحتوى الخاص بها (Context)
  useEffect(() => {
      if (activeSubject) {
          fetchSubjectContext(activeSubject.db_keys);
          setMessages([{
              id: 'welcome',
              role: 'ai',
              content: `مرحباً بك يا ${user.name.split(' ')[0]}. أنا أستاذ مادة ${activeSubject.name}. تفضل بطرح أي سؤال أو استشارة في المقرر وسأجيبك فوراً.`,
              timestamp: new Date()
          }]);
      }
  }, [activeSubject]);

  const fetchSubjectContext = async (subjects: string[]) => {
      setIsLoadingContext(true);
      try {
          // جلب الدروس للمواد المحددة (مثلاً اجتماعيات تجلب تاريخ + جغرافيا)
          const { data, error } = await supabase
              .from('lessons_content')
              .select('title, content, subject')
              .in('subject', subjects.map(s => {
                  // تحويل الأكواد إلى الأسماء العربية المخزنة في قاعدة البيانات إذا لزم الأمر
                  // هنا نفترض أن العمود subject في الداتابيز يخزن الـ ID مثل 'history' أو الاسم العربي.
                  // للتوافق، سنبحث بناءً على الـ ID إذا كان مخزناً كذلك، أو نحتاج مابينغ.
                  // الافتراض الحالي: العمود subject يخزن الـ ID (arabic, history...) أو الاسم.
                  // سنقوم بفلترة ما بعد الجلب لضمان الدقة أو استخدام `in` بذكاء.
                  return s; 
              }));

          // ملاحظة: بما أن أسماء المواد في قاعدة البيانات قد تكون بالعربية، قد نحتاج لـ Mapping.
          // سأقوم بعمل بحث واسع ثم الفلترة أو الاعتماد على أن `subject` في DB يطابق keys.
          // الحل الأضمن هو جلب الكل ثم الفلترة في الذاكرة إذا كانت الداتا ليست ضخمة جداً، أو استخدام استعلام ذكي.
          
          // البديل: جلب كل الدروس وفلترتها بناءً على الـ section_id الذي يبدأ عادة بـ subject id
          // مثال: history_t1_lessons
          
          const { data: allLessons } = await supabase
            .from('lessons_content')
            .select('title, content, section_id');

          if (allLessons) {
              const filtered = allLessons.filter(l => {
                  return subjects.some(subKey => l.section_id.startsWith(subKey));
              });
              
              const contextText = filtered.map(l => `[درس: ${l.title}]\n${l.content}`).join('\n\n');
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
      setInputText('');
      setImageFile(null);
      setImagePreview(null);
      setIsTyping(true); // إظهار مؤشر الكتابة

      try {
          const ai = initGemini();
          
          // بناء سجل المحادثة (Chat History) لتوفيره للمودل
          const historyText = messages.slice(-6).map(m => `${m.role === 'user' ? 'التلميذ' : 'الأستاذ'}: ${m.content}`).join('\n');

          const prompt = `
          أنت أستاذ خبير لمادة ${activeSubject.name} في المنهاج الجزائري.
          اسمك: الأستاذ المتميز.
          
          السياق التعليمي (الدروس المقررة):
          ${lessonContext ? lessonContext.substring(0, 40000) : "لا يوجد محتوى دروس متاح حالياً، اعتمد على معلوماتك العامة في المادة."}

          تعليمات صارمة للشخصية:
          1. أنت تتحدث في دردشة (Chat) مباشرة، اجعل ردودك ودودة، مختصرة ومفيدة، وكأنك تراسل التلميذ عبر ماسنجر.
          2. مرجعيتك الأولى هي "السياق التعليمي" أعلاه.
          3. إذا سأل التلميذ عن أي موضوع خارج مادة ${activeSubject.name} (مثلاً رياضة، طبخ، سياسة، أو مادة أخرى)، يجب أن ترفض بلطف وتقول: "عذراً يا بني، أنا مصمم للإجابة على الأسئلة الخاصة بـ ${activeSubject.name} فقط."
          4. لا تخرج عن الشخصية أبداً. لا تقل "أنا ذكاء اصطناعي". تصرف كأستاذ حقيقي.
          5. إذا حياك التلميذ، رد التحية.

          تاريخ المحادثة السابقة:
          ${historyText}

          سؤال التلميذ الجديد:
          ${userMsg.content}
          `;

          // التعامل مع الصور إذا وجدت
          let responseText = '';
          if (userMsg.image && imageFile) {
               // تحويل الصورة لـ Base64 للمعالجة
               const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve((reader.result as string).split(',')[1]);
                  reader.readAsDataURL(imageFile);
               });
               
               const res = await ai.models.generateContent({
                   model: 'gemini-2.5-flash-image', // مودل الصور
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

  // --- القائمة الرئيسية للمواد ---
  if (!activeSubject) {
      return (
        <div className="p-4 sm:p-6 animate-fadeIn pb-32 min-h-screen flex flex-col items-center justify-center">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 mb-2">غرفة الاستشارات</h2>
                <p className="text-gray-400 text-sm font-bold">اختر المادة للتحدث مع أستاذك الخاص</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {CHAT_SUBJECTS.map(sub => (
                    <button 
                        key={sub.id}
                        onClick={() => setActiveSubject(sub)}
                        className="bg-neutral-900/60 border border-white/10 hover:border-teal-500/50 p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:scale-105 hover:shadow-2xl group"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform">{sub.icon}</span>
                        <span className="font-black text-white text-sm">{sub.name}</span>
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // --- واجهة المحادثة (Chat UI) ---
  return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
          {/* Header */}
          <div className="h-16 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                  <button onClick={() => setActiveSubject(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400"><ArrowLeft size={20}/></button>
                  <div className="relative">
                      <div className="w-10 h-10 bg-teal-600/20 rounded-full flex items-center justify-center text-xl border border-teal-500/30">
                          {activeSubject.icon}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                  </div>
                  <div>
                      <h3 className="font-black text-white text-sm">أستاذ {activeSubject.name}</h3>
                      <p className="text-[10px] text-green-400 font-bold">متصل الآن</p>
                  </div>
              </div>
              <button className="text-gray-500"><MoreVertical size={20}/></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 custom-scrollbar">
              {isLoadingContext && (
                  <div className="flex justify-center py-4">
                      <span className="text-[10px] text-gray-500 bg-neutral-900 px-3 py-1 rounded-full flex items-center gap-2">
                          <Loader2 className="animate-spin" size={10}/> جاري تحضير ملفات الدروس...
                      </span>
                  </div>
              )}
              
              {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          
                          {/* Avatar for AI */}
                          {msg.role === 'ai' && (
                              <span className="text-[10px] text-gray-500 font-bold mr-2 mb-1">الأستاذ</span>
                          )}

                          <div className={`px-5 py-3 rounded-2xl text-sm font-bold leading-relaxed shadow-md whitespace-pre-wrap ${
                              msg.role === 'user' 
                              ? 'bg-teal-600 text-white rounded-br-none' 
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

              {/* Typing Indicator */}
              {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                      <div className="bg-neutral-800 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-neutral-900 border-t border-white/5">
              {imagePreview && (
                  <div className="flex items-center gap-2 mb-2 bg-black/40 p-2 rounded-xl w-fit border border-white/10">
                      <img src={imagePreview} className="w-10 h-10 object-cover rounded-lg" />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-500 p-1"><Trash2 size={14}/></button>
                  </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-black/50 p-1.5 rounded-[1.5rem] border border-white/10 shadow-inner">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-teal-400 transition-colors bg-transparent">
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
                      className={`p-3 rounded-full transition-all ${inputText.trim() || imageFile ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 rotate-0' : 'bg-neutral-800 text-gray-600 rotate-90 opacity-50'}`}
                  >
                      <Send size={20} className={inputText.trim() || imageFile ? 'rtl:-rotate-90' : ''} />
                  </button>
              </form>
          </div>
      </div>
  );
};

export default TeachersScreen;
