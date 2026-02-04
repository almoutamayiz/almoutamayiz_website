
import React, { useState, useRef } from 'react';
import { GraduationCap, Clock, Send, X, ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Trash2, Bot, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { User, LessonContent } from '../types';
import { supabase } from '../lib/supabase';
import { initGemini } from '../lib/gemini';
import { ALL_SUBJECTS_LIST } from '../constants';

const CONSULTATION_SUBJECTS = [
    { id: 'arabic', name: 'اللغة العربية', icon: '📜' },
    { id: 'philosophy', name: 'الفلسفة', icon: '🤔' },
    { id: 'social', name: 'الاجتماعيات', icon: '🌍' },
    { id: 'islamic', name: 'العلوم الإسلامية', icon: '🕌' }
];

const SEARCH_STOP_WORDS = ['ما', 'هو', 'هي', 'تعريف', 'شرح', 'درس', 'في', 'من', 'على', 'عن', 'كيف', 'متى', 'لماذا', 'هل', 'اريد', 'السؤال', 'الجواب', 'ممكن', 'ماهي', 'ماذا'];

interface TeachersScreenProps {
  user: User;
}

const TeachersScreen: React.FC<TeachersScreenProps> = ({ user }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // AI Teacher States
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [foundContextLesson, setFoundContextLesson] = useState<string | null>(null);
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 2 * 1024 * 1024) {
              window.addToast("حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت.", "error");
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

      if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}.${fileExt}`;
          const { data, error: uploadError } = await supabase.storage
              .from('consultations')
              .upload(fileName, imageFile);
          
          if (uploadError) console.error("Upload error", uploadError); 
          imagePath = data?.path;
      }

      const payload = {
          text: questionText,
          imagePath: imagePath,
          subject: selectedSubject
      };

      // Save initial message (unreplied for now)
      const { data, error } = await supabase.from('admin_messages').insert({
        user_id: user.id,
        user_name: user.name,
        content: JSON.stringify(payload),
        is_replied: false,
        created_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;
      if (data) setCurrentMessageId(data.id);

      // Show success but immediately trigger AI flow logic
      setShowAiPrompt(true);

    } catch (error: any) {
      window.addToast("فشل الإرسال: " + (error.message || "يرجى التحقق من الاتصال"), "error");
    } finally {
      setIsSending(false);
    }
  };

  const parseLessonContentToText = (content: string, type: string): string => {
      try {
          const parsed = JSON.parse(content);
          if (parsed.type === 'philosophy_structured') {
              let text = `[عنوان الدرس أو المشكلة]: ${parsed.problem}\n`;
              parsed.positions.forEach((pos: any, idx: number) => {
                  text += `[الموقف ${idx+1}]: ${pos.title}\n`;
                  pos.theories.forEach((th: any) => {
                      th.philosophers.forEach((ph: any) => {
                          text += `فيلسوف: ${ph.name}. `;
                          text += `فكرته: ${ph.idea}. `;
                          text += `قوله: "${ph.quote}". `;
                          text += `مثال: ${ph.example}.\n`;
                      });
                  });
                  text += `[نقد الموقف ${idx+1}]: ${pos.critique}\n`;
              });
              text += `[التركيب]: ${parsed.synthesis}\n`;
              text += `[الخاتمة]: ${parsed.conclusion}`;
              return text;
          }
          if (parsed.type === 'philosophy_text_analysis') {
              let text = `تحليل نص لـ: ${parsed.tamheed?.authorName}.\n`;
              text += `الموضوع: ${parsed.tamheed?.topic}.\n`;
              text += `الموقف: ${parsed.authorPosition?.explanation}.\n`;
              text += `العبارة الدالة: ${parsed.authorPosition?.quoteFromText}.\n`;
              text += `الحجج: ${parsed.arguments?.map((a:any) => `${a.type}: ${a.content} (${a.explanation})`).join(' | ')}.\n`;
              return text;
          }
          if (parsed.type === 'math_series') {
              return parsed.parts?.map((p: any) => `${p.title}: ${p.description}`).join('\n') || "";
          }
          if (Array.isArray(parsed)) {
              return parsed.map((b: any) => (b.text || '') + (b.extra_1 ? ` (${b.extra_1})` : '')).join('\n');
          } else if (parsed.blocks) {
              return parsed.blocks.map((b: any) => (b.text || '') + (b.extra_1 ? ` (${b.extra_1})` : '')).join('\n');
          }
          return content; 
      } catch (e) {
          return content; 
      }
  };

  const handleAskAiTeacher = async () => {
      setIsAiThinking(true);
      try {
          const rawWords = questionText.replace(/[؟،.:"']/g, '').split(/\s+/);
          const keywords = rawWords.filter(w => w.length > 2 && !SEARCH_STOP_WORDS.includes(w));
          
          if (keywords.length === 0) throw new Error("السؤال قصير جداً");

          let targetSubjects: string[] = [];
          if (selectedSubject === 'الاجتماعيات') {
              targetSubjects = ['التاريخ', 'الجغرافيا'];
          } else {
              targetSubjects = [selectedSubject || ''];
          }

          const { data: allLessons } = await supabase
            .from('lessons_content')
            .select('title, content, section_id, subject')
            .in('subject', targetSubjects);

          if (!allLessons || allLessons.length === 0) {
              setAiResponse("عذراً، لم أجد أي دروس مسجلة في قاعدة البيانات لهذه المادة حتى الآن.");
              setIsAiThinking(false);
              return;
          }

          let bestMatches: any[] = [];
          
          for (const lesson of allLessons) {
              const rawContent = parseLessonContentToText(lesson.content, '');
              const searchableContent = rawContent.toLowerCase();
              const title = lesson.title.toLowerCase();
              
              let score = 0;
              
              keywords.forEach(kw => {
                  const keyword = kw.toLowerCase();
                  if (title.includes(keyword)) score += 15;
                  if (searchableContent.includes(keyword)) score += 5;
              });

              if (score > 0) {
                  bestMatches.push({ ...lesson, cleanText: rawContent, score });
              }
          }

          bestMatches.sort((a, b) => b.score - a.score);

          let contextContent = "";
          let contextTitles = "";

          if (bestMatches.length > 0) {
              contextContent += `--- الدرس الأول: ${bestMatches[0].title} ---\n${bestMatches[0].cleanText}\n\n`;
              contextTitles += bestMatches[0].title;

              if (bestMatches.length > 1 && bestMatches[1].score > 5) {
                   contextContent += `--- الدرس الثاني (ذات صلة): ${bestMatches[1].title} ---\n${bestMatches[1].cleanText}\n\n`;
                   contextTitles += " و " + bestMatches[1].title;
              }
              setFoundContextLesson(contextTitles);
          } else {
               setAiResponse("بحثت بدقة في جميع الدروس ولم أجد تطابقاً حرفياً مع سؤالك. يرجى التأكد من المصطلحات.");
               setFoundContextLesson(null);
               setIsAiThinking(false);
               return;
          }

          const ai = initGemini();
          const prompt = `
          أنت أستاذ "المتميز" الذكي.
          المهمة: الإجابة على سؤال التلميذ باستخدام "المحتوى المرجعي" المرفق **حصراً**.
          المحتوى المرجعي (من دروس: ${contextTitles}):
          ${contextContent}
          سؤال الطالب: "${questionText}"
          التعليمات الصارمة:
          1. ابدأ إجابتك فوراً بـ: "مرحبا عزيزي الطالب أنا الأستاذ المتميز AI وإجابة سؤالك هي: "
          2. ابحث عن الإجابة في النص المرفق.
          3. إذا وجدت الإجابة، صغها بوضوح.
          4. لا تضف معلومات خارجية.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: [{ parts: [{ text: prompt }] }]
          });

          const finalAnswer = response.text || "عذراً، لم أستطع استخراج الإجابة.";
          setAiResponse(finalAnswer);

          // Update the message in DB to mark it as replied by AI
          if (currentMessageId) {
              await supabase.from('admin_messages').update({
                  is_replied: true,
                  response: finalAnswer + "\n\n(تم الرد آلياً بناءً على المنهج الدراسي)"
              }).eq('id', currentMessageId);
          }

      } catch (e) {
          console.error(e);
          setAiResponse("حدث خطأ تقني أثناء البحث في الدروس.");
      } finally {
          setIsAiThinking(false);
      }
  };

  const closeAiModal = () => {
      setShowAiPrompt(false);
      setAiResponse(null);
      setQuestionText('');
      setImageFile(null);
      setImagePreview(null);
      setSelectedSubject(null);
      setCurrentMessageId(null);
  };

  return (
    <div className="p-4 sm:p-6 animate-fadeIn pb-32 relative">
        {showAiPrompt && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-neutral-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
                    <div className="p-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-lg relative">
                            <Bot className="text-cyan-300 w-7 h-7" />
                            <Sparkles className="absolute -top-1 -right-1 text-yellow-400 w-4 h-4 animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">المعلم الذكي</h3>
                            <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest">خبير المنهاج الجزائري</p>
                        </div>
                    </div>
                    <div className="p-8 text-center space-y-6">
                        {!aiResponse ? (
                            <>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-start gap-3 text-right">
                                    <Clock className="text-yellow-500 shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="text-yellow-200 font-bold text-sm mb-1">تم استلام سؤالك</p>
                                        <p className="text-gray-400 text-xs leading-relaxed">هل تريد أن يقوم المعلم الذكي بمسح جميع الدروس (شامل التاريخ والجغرافيا والمقالات الفلسفية) واستخراج الإجابة بدقة 100% فوراً؟</p>
                                    </div>
                                </div>
                                {isAiThinking ? (
                                    <div className="py-8 flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center"><Bot size={24} className="text-cyan-400"/></div>
                                        </div>
                                        <p className="text-xs font-black text-cyan-400 animate-pulse">جاري التنقيب في الدروس والمقالات...</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 mt-4">
                                        <button onClick={handleAskAiTeacher} className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                                            <Sparkles size={18} /> نعم، أجبني الآن
                                        </button>
                                        <button onClick={closeAiModal} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl font-bold transition-all">
                                            لاحقاً
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6 text-right animate-slideIn">
                                {foundContextLesson && (
                                    <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full w-fit mx-auto border border-green-500/20">
                                        <BookOpen size={12} />
                                        <span>المصدر: {foundContextLesson}</span>
                                    </div>
                                )}
                                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                    <p className="text-gray-200 text-sm font-bold leading-loose whitespace-pre-wrap">{aiResponse}</p>
                                </div>
                                <button onClick={closeAiModal} className="w-full py-4 bg-brand text-black rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    فهمت، شكراً لك
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="text-center mb-8 mt-4">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 mb-2">منصة الاستشارات</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">اطرح سؤالك على أساتذة متخصصين في المواد الأساسية واحصل على إجابة موثوقة.</p>
        </div>

        {!selectedSubject ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {CONSULTATION_SUBJECTS.map(sub => (
                    <button 
                        key={sub.id}
                        onClick={() => setSelectedSubject(sub.name)}
                        className="group relative overflow-hidden rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-2 shadow-2xl backdrop-blur-md bg-teal-900/20 border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-900/30 flex flex-col items-center justify-center min-h-[180px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-tr from-teal-600 to-cyan-500 text-white`}>
                            {sub.icon}
                        </div>
                        <h3 className="font-bold text-white text-lg tracking-wide mb-2">{sub.name}</h3>
                        <div className="w-8 h-1 bg-teal-500/50 mx-auto rounded-full group-hover:w-16 transition-all duration-300"></div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="max-w-xl mx-auto bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.15)] animate-slideIn relative">
                <button onClick={() => setSelectedSubject(null)} className="absolute top-6 left-6 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
                <div className="text-center mb-6">
                    <h3 className="font-black text-2xl text-white mb-1">طلب استشارة</h3>
                    <p className="text-teal-400 font-bold">{selectedSubject}</p>
                </div>
                <textarea 
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    className="w-full h-32 bg-black/50 border border-neutral-700 rounded-2xl p-5 text-white placeholder:text-gray-600 focus:border-teal-500 outline-none resize-none mb-4 transition-colors shadow-inner text-base leading-relaxed"
                    placeholder="اكتب سؤالك هنا بوضوح..."
                />
                <div className="mb-6">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                    {!imagePreview ? (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-gray-500 hover:text-white hover:border-teal-500 transition-colors flex items-center justify-center gap-2 text-sm">
                            <ImageIcon size={18} /><span>إرفاق صورة (اختياري)</span>
                        </button>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-teal-500/30">
                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-600 transition-colors">
                                    <Trash2 size={12} /> حذف الصورة
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={handleStudentSubmit} disabled={isSending || !questionText.trim()} className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSending ? <Loader2 className="animate-spin"/> : <Send size={20} className="rtl:-rotate-90"/>}
                    <span className="text-lg">إرسال الاستشارة</span>
                </button>
                <div className="mt-6 bg-teal-900/20 p-3 rounded-xl border border-teal-500/10">
                    <p className="text-[10px] text-teal-200/80 text-center flex items-center justify-center gap-2">
                        <CheckCircle size={12} /> سيتم توجيه السؤال آلياً للإدارة وللأستاذ المختص.
                    </p>
                </div>
            </div>
        )}
    </div>
  );
};

export default TeachersScreen;
