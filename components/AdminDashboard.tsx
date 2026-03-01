
import React, { useState, useEffect, useRef } from 'react';
import { Question, AdminMessage, LessonContent, User, LessonBlock, Exam, Notification, CurriculumStatus, PhilosophyStructuredContent, PhilosophyTextAnalysisContent, MathLessonStructuredContent } from '../types';
import { 
  Trash2, Loader2, Save, Sparkles, Inbox, 
  Database, Gamepad2, CheckCircle, LogOut, Home, FileText, Plus, Edit, 
  ChevronUp, ChevronDown, Filter, ImageIcon, Send, Bell, FileCheck, Layers, Eye, X, Palette, Type, Search, Link as LinkIcon, ExternalLink, User as UserIcon, Menu, PlayCircle, Video, Music, Volume2, Calendar, ClipboardList,
  Clock, Upload, AlertTriangle, Youtube, CheckCircle2, MessageSquare, Star, PlusCircle, Check, Maximize, BookOpen, Terminal, Code, Info, ShieldCheck, HelpCircle, Cpu, FileCode, Workflow, Boxes, Settings, Activity,
  Smartphone, Map as MapIcon, GraduationCap, Users, BrainCircuit, PenTool, History, Zap, Award, Scroll, Calculator, Globe, Server, Database as DbIcon, Lock, Mail, ArrowUp, ArrowDown, RefreshCw, HelpCircle as HelpIcon, ShieldAlert, ListOrdered, Map, MessageCircle, Maximize2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
    LESSON_FORMAT_PROMPT, MATH_FORMAT_PROMPT, ALL_SUBJECTS_LIST, SUBJECT_SECTIONS_MAP, PHILOSOPHY_ARTICLE_PROMPT, PHILOSOPHY_TEXT_ANALYSIS_PROMPT
} from '../constants';
import { initGemini } from '../lib/gemini';
import PhilosophyLessonEditor from './PhilosophyLessonEditor';
import PhilosophyTextAnalysisEditor from './PhilosophyTextAnalysisEditor';
import GenericLessonEditor from './GenericLessonEditor';
import MathLessonEditor from './MathLessonEditor';

const TECHNICAL_QUESTIONS = [
  { q: "ما هي البنية الهيكلية الأساسية للتطبيق؟", a: "التطبيق يعتمد على نظام Single Page Application (SPA) باستخدام React 19، مع إدارة الحالة عبر الـ Hooks ونظام Enumerated States للتحكم في مسار اللعبة." },
  { q: "كيف يتم التعامل مع عمليات المصادقة (Auth)؟", a: "نستخدم Supabase Auth عبر بروتوكول JWT، حيث يتم تخزين الجلسة مشفرة في LocalStorage وتحديثها تلقائياً عند انتهاء الصلاحية." },
  { q: "كيف تضمن استمرارية خدمات الذكاء الاصطناعي عند ضغط المستخدمين؟", a: "ابتكرنا نظام Round-robin Key Rotation في ملف gemini.ts، حيث يتم تدوير الطلبات بين 20 مفتاحاً مختلفاً لتوزيع الحصة المجانية وتجنب الـ Rate Limiting." },
  { q: "ما هو المحرك المسؤول عن 'المعرب الذكي'؟", a: "نستخدم نموذج gemini-3-flash-preview مع Prompt تقني صارم (System Instruction) يوجه المودل للتعامل مع قواعد النحو العربي الجزائري حصراً." },
  { q: "كيف يتم تنفيذ نظام الإشعارات الفورية؟", a: "نستخدم Supabase Real-time Channels التي تعتمد على WebSockets للاستماع لجدول notifications وتنبيه المستخدم بمجرد إضافة سجل جديد." },
  { q: "لماذا تم اختيار Tailwind CSS بدلاً من CSS التقليدي؟", a: "لتسريع عملية التطوير وضمان الـ Responsiveness الكامل باستخدام Utility-first approach، مع استغلال الـ JIT Compiler لتقليل حجم ملف الـ CSS النهائي." },
  { q: "كيف يعمل نظام الصوت في التطبيق برمجياً؟", a: "نستخدم Web Audio API لبناء Oscillators مخصصة تولد نغمات النجاح والفشل ديناميكياً دون الحاجة لملفات MP3 خارجية كبيرة الحجم." },
  { q: "ما هي استراتيجية حماية البيانات من الوصول غير المصرح به؟", a: "نطبق Row Level Security (RLS) في قاعدة بيانات PostgreSQL، بحيث لا يمكن لأي مستخدم القراءة أو الكتابة إلا في السجلات التي يملك معرفها (UUID)." },
  { q: "كيف يتم تحويل النصوص الخام إلى دروس منسقة تلقائياً؟", a: "نرسل النص إلى Gemini مع برومبت هيكلي (LESSON_FORMAT_PROMPT) يطلب الرد بصيغة JSON محددة (Block-based)، ثم نقوم بفرزها (Parsing) داخل الواجهة." },
  { q: "ما هي التقنية المستخدمة في قراءة النصوص (TTS)؟", a: "نستخدم Gemini 2.5 Flash Native Audio، حيث يتم إرسال النص واستقبال Raw PCM Data ثم فك تشفيرها وتشغيلها عبر AudioBufferSourceNode." },
  { q: "كيف يتم منع تكرار الحصول على مكافآت الإحالة؟", a: "نقوم بتوليد Device Fingerprint فريد لكل جهاز (Base64 لبيانات الـ UserAgent ودقة الشاشة) ونخزنه في عمود custom_id لمنع إنشاء حسابات متعددة لنفس الجهاز." },
  { q: "لماذا تظهر الدروس أحياناً كـ 'بطاقات زجاجية'؟", a: "هذا يعتمد على تفعيل خاصية Backdrop-blur و Glassmorphism عبر CSS، مما يعطي إيحاءً بالتطبيقات الأصلية (Native Apps) على الهواتف." },
  { q: "كيف يتم تتبع تقدم التلميذ في الدروس برمجياً؟", a: "يتم تخزين كل عملية إكمال في جدول user_progress، ونستخدم Set Data Structure في الـ Frontend لمقارنة الـ IDs وضمان سرعة التظليل." },
  { q: "كيف تتعامل مع الأخطاء غير المتوقعة في الـ API؟", a: "يوجد نظام Global Toast System موحد مرتبط بالنافذة (Window Object)، يلتقط الـ Catch blocks ويعرض رسائل خطأ صديقة للمستخدم." },
  { q: "ما هو دور ملف types.ts في المشروع؟", a: "يعمل كـ Single Source of Truth لجميع الـ Interfaces والـ Enums، مما يضمن الـ Type Safety ويقلل الأخطاء المنطقية أثناء التطوير." },
  { q: "كيف يتم تحسين أداء التمرير (Scrolling) في القوائم الكبيرة؟", a: "نستخدم خصائص content-visibility: auto و transform-gpu لإجبار المتصفح على استخدام معالج الرسوميات (GPU) في رندرة القوائم." },
  { q: "كيف يتم حساب المعدل بدقة في التطبيق؟", a: "تم بناء Object برمجي يحتوي على المعاملات الرسمية للبكالوريا، ويتم إجراء عملية Reduce على مصفوفة النقاط لضرب كل علامة في معاملها وقسمتها على المجموع." },
  { q: "ما هي التقنية المستخدمة في البحث داخل الدروس؟", a: "نستخدم استعلامات Supabase Full-Text Search (fts) التي تسمح بالبحث باللغة العربية مع تجاهل التشكيل والهمزات." },
  { q: "كيف يتم التعامل مع الصور الرمزية (Avatars)؟", a: "يتم تخزين روابط الـ Memojis الافتراضية في ثابت كوني، بينما يتم رفع الصور المخصصة إلى Supabase Storage بترميز فريد." },
  { q: "ما هي ميزة 'المواجهة البرمجية'؟", a: "هي منطقة اختبار تقني صممت لإثبات ملكية المطور للأكواد، حيث تحتوي على أسرار بناء النظام التي لا يعرفها إلا من كتب الكود سطراً بسطر." },
  { q: "كيف يتم توليد أسئلة مسابقة المليون؟", a: "نستخدم RAG (Retrieval-Augmented Generation) مبسط، حيث نمرر محتوى الدرس كـ Context لمودل Gemini ليقوم بتوليد JSON يحتوي على 15 سؤالاً متدرج الصعوبة." },
  { q: "كيف يتم تأمين لوحة الإدارة (Admin Panel)؟", a: "يتم التحقق من البريد الإلكتروني (Whitelisting) عند تحميل الـ User Profile، فإذا لم يكن ضمن قائمة ADMIN_EMAILS يتم حجب الواجهة برمجياً." },
  { q: "ما هو الـ Prompt Engineering المستخدم في 'المصحح المنهجي'؟", a: "برومبت مقارن (Few-shot prompting) يزود المودل بالدرس الأصلي ومقالة الطالب ويطلب منه التحليل بناءً على معايير المنهجية الجزائرية." },
  { q: "كيف يتم منع 'الطرطرة' والثرثرة في ردود الذكاء الاصطناعي؟", a: "تم وضع قيود صارمة في الـ System Instructions تمنع المودل من كتابة أي جمل افتتاحية أو ختامية (No-preamble policy)." },
  { q: "لماذا تم استخدام Lucide React للأيقونات؟", a: "لأنها أيقونات Vector مبنية على SVG، خفيفة الوزن، وتسمح بالتحكم الكامل في الألوان والسماكة (Stroke Width) عبر Props." },
  { q: "كيف يتم التحكم في مستويات الصوت عالمياً؟", a: "عبر متغير globalVolume في ملف audio.ts يتم تحديثه من شاشة الإعدادات، ويؤثر فوراً على كل الـ Gain Nodes النشطة." },
  { q: "كيف يعمل نظام الإحالات (Referral) من الناحية البرمجية؟", a: "عند التسجيل بكود، يتم إجراء RPC (Remote Procedure Call) في قاعدة البيانات يضمن زيادة نقاط الداعي والمدعو في عملية واحدة (Atomic Transaction)." },
  { q: "ما هي تحديات التعامل مع اللغة العربية في الـ UI؟", a: "التحدي الأكبر هو المحاذاة (RTL)، وتم حلها باستخدام توجيه dir='rtl' في الـ HTML الرئيسي مع تخصيص خط Cairo لضمان وضوح الحروف." },
  { q: "كيف يتم تخزين الدروس الفلسفية المعقدة؟", a: "يتم تخزينها كـ JSON Object غني (Nested Object) يحتوي على مصفوفات للفلاسفة، الحجج، والنقد، ليتم رندرتها بشكل منفصل." },
  { q: "ما هي الخطوات المتبعة عند تحديث التطبيق؟", a: "يتم دفع الكود إلى مستودع GitHub، حيث يقوم نظام CI/CD (مثل Netlify) بناء نسخة الإنتاج (Production Build) وضغط الأصول." },
  { q: "كيف يتم ضمان استجابة الأزرار للمس في الهواتف؟", a: "نستخدم -webkit-tap-highlight-color: transparent مع إضافة Active States تعتمد على الـ Scale لإعطاء انطباع ملموس (Haptic-like)." },
  { q: "ما هو دور الـ useEffect في مزامنة الرسائل? ", a: "يقوم بإنشاء Subscription حي لقاعدة البيانات عند فتح الدردشة، ويقوم بـ Cleanup (إغلاق القناة) عند مغادرة المستخدم لمنع تسرب الذاكرة." },
  { q: "كيف يتم التحقق من صحة روابط اليوتيوب؟", a: "نستخدم Regex (Regular Expression) لاستخراج المعرف (Video ID) المكون من 11 حرفاً لضمان تحميل الـ Thumbnails بشكل صحيح." },
  { q: "لماذا تم استخدام PostgreSQL بدلاً من NoSQL؟", a: "بسبب طبيعة البيانات التعليمية المترابطة (Relational Data) والحاجة لقوة الـ SQL في عمليات الفلترة والترتيب المعقدة." },
  { q: "ما هي الرؤية المستقبلية لتطوير كود المنصة؟", a: "الانتقال إلى نظام Micro-frontends وتطوير نماذج AI محلية (On-device AI) لتقليل الاعتماد على الـ Cloud APIs." }
];

type AdminTab = 'lessons' | 'add_lesson' | 'exams' | 'inbox' | 'notifications' | 'curriculum' | 'platform_guide';

interface AdminDashboardProps {
    currentUser: User;
    onPlay: () => void;
    onLogout: () => void;
    onUpdateCounts?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onPlay, onLogout, onUpdateCounts }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
      try {
          const saved = sessionStorage.getItem('admin_active_tab') as AdminTab;
          const validTabs: AdminTab[] = ['lessons', 'add_lesson', 'exams', 'inbox', 'notifications', 'curriculum', 'platform_guide'];
          return (saved && validTabs.includes(saved)) ? saved : 'lessons';
      } catch { return 'lessons'; }
  });
  
  const [loading, setLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [guideSubTab, setGuideSubTab] = useState<'admin' | 'technical'>('admin');

  const [filterSub, setFilterSub] = useState('arabic');
  const [filterTri, setFilterTri] = useState('t1');
  const [filterType, setFilterType] = useState('lessons');
  const [orderChanged, setOrderChanged] = useState(false);

  const [lessons, setLessons] = useState<LessonContent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumStatus[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSub, setLessonSub] = useState('arabic');
  const [lessonTri, setLessonTri] = useState('t1');
  const [lessonType, setLessonType] = useState('lessons');
  const [videoUrl, setVideoUrl] = useState(''); 
  const [blocks, setBlocks] = useState<any[]>([]);
  const [philoData, setPhiloData] = useState<PhilosophyStructuredContent | null>(null);
  const [philoAnalysisData, setPhiloAnalysisData] = useState<PhilosophyTextAnalysisContent | null>(null);
  const [mathData, setMathData] = useState<MathLessonStructuredContent | null>(null);
  const [rawText, setRawText] = useState('');
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [examSubject, setExamSubject] = useState('اللغة العربية');
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [examPdfUrl, setExamPdfUrl] = useState('');

  const [inboxSubTab, setInboxSubTab] = useState<'consultations' | 'admin_messages'>('consultations');
  const [replyingMsgId, setReplyingMsgId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newNotif, setNewNotif] = useState({ title: '', content: '', link: '' });
  
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const unrepliedCount = messages.filter(m => !m.is_replied).length;
  
  const checkIsConsultation = (msg: AdminMessage) => {
      try {
          const parsed = JSON.parse(msg.content);
          return !!parsed.subject || parsed.type === 'consultation';
      } catch { return false; }
  };

  const unrepliedConsultations = messages.filter(m => !m.is_replied && checkIsConsultation(m)).length;
  const unrepliedAdminMsgs = messages.filter(m => !m.is_replied && !checkIsConsultation(m)).length;

  useEffect(() => {
    sessionStorage.setItem('admin_active_tab', activeTab);
    setOrderChanged(false);
    fetchData(); 
  }, [activeTab, filterSub, filterTri, filterType]);

  const fetchData = async () => {
    setLoading(true);
    try {
        switch(activeTab) {
            case 'lessons':
                const sectionId = `${filterSub}_${filterTri}_${filterType}`;
                const { data: les } = await supabase
                    .from('lessons_content')
                    .select('*')
                    .eq('section_id', sectionId)
                    .order('order_index', { ascending: true });
                if (les) setLessons(les);
                break;
            case 'exams':
                const { data: exm } = await supabase.from('exams').select('*').order('year', { ascending: false });
                if (exm) setExams(exm);
                break;
            case 'inbox':
                const { data: msgs } = await supabase.from('admin_messages').select('*').order('created_at', { ascending: false });
                if (msgs) setMessages(msgs);
                break;
            case 'notifications':
                const { data: ntf } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
                if (ntf) setNotifications(ntf);
                break;
            case 'curriculum':
                const { data: cur } = await supabase.from('curriculum_status').select('*').order('id');
                if (cur) setCurriculum(cur);
                break;
        }
        if (activeTab !== 'inbox') {
             const { data: msgs } = await supabase.from('admin_messages').select('*').eq('is_replied', false);
             if (msgs) setMessages(msgs);
        }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleMoveLesson = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === lessons.length - 1) return;
      const newLessons = [...lessons];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newLessons[index];
      newLessons[index] = newLessons[targetIndex];
      newLessons[targetIndex] = temp;
      setLessons(newLessons);
      setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
      setIsSavingOrder(true);
      try {
          for (let i = 0; i < lessons.length; i++) {
              await supabase.from('lessons_content').update({ order_index: i }).eq('id', lessons[i].id);
          }
          window.addToast("تم حفظ الترتيب النهائي بنجاح", "success");
          setOrderChanged(false);
          fetchData();
      } catch (err) { window.addToast("فشل حفظ الترتيب", "error"); }
      finally { setIsSavingOrder(false); }
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleEditLesson = (l: LessonContent) => {
      setEditingId(l.id);
      setLessonTitle(l.title);
      
      const parsed = JSON.parse(l.content);
      const sParts = l.section_id.split('_');
      setLessonSub(sParts[0]);
      setLessonTri(sParts[1]);
      
      if (parsed.type === 'philosophy_structured') {
          setLessonType('philosophy_article');
          setPhiloData(parsed);
          setBlocks([]);
          setPhiloAnalysisData(null);
          setMathData(null);
      } else if (parsed.type === 'philosophy_text_analysis') {
          setLessonType('philosophy_text_analysis');
          setPhiloAnalysisData(parsed);
          setPhiloData(null);
          setBlocks([]);
          setMathData(null);
      } else if (parsed.type === 'math_series') {
          setLessonType('lessons'); 
          setMathData(parsed);
          setPhiloData(null);
          setPhiloAnalysisData(null);
          setBlocks([]);
      } else if (parsed.blocks) {
          setLessonType(sParts[2] || 'lessons');
          setBlocks(parsed.blocks);
          setPhiloData(null);
          setPhiloAnalysisData(null);
          setMathData(null);
      } else {
          setLessonType(sParts[2] || 'lessons');
          setMathData(null);
      }
      
      setVideoUrl(parsed.video_url || '');
      handleTabChange('add_lesson');
  };

  const handleSaveExam = async () => {
      if (!examPdfUrl) return window.addToast("أدخل رابط الموضوع أولاً", "error");
      setLoading(true);
      try {
          const payload = { subject: examSubject, year: examYear, pdf_url: examPdfUrl };
          if (editingExamId) await supabase.from('exams').update(payload).eq('id', editingExamId);
          else await supabase.from('exams').insert(payload);
          window.addToast("تم حفظ الموضوع في البنك", "success");
          setEditingExamId(null); setExamPdfUrl(''); setShowExamForm(false);
          fetchData();
      } catch (e) { console.error(e); }
      setLoading(false);
  };

  const handleSendReply = async (msg: AdminMessage) => {
      if (!replyText.trim()) return;
      setLoading(true);
      try {
          await supabase.from('admin_messages').update({ is_replied: true, response: replyText }).eq('id', msg.id);
          
          let isConsultation = false;
          let subjectTag = "";
          let originalQuestionText = "";
          let hasImage = false;

          try {
              const parsed = JSON.parse(msg.content);
              isConsultation = !!parsed.subject;
              subjectTag = parsed.subject || "";
              originalQuestionText = parsed.text || parsed.content || msg.content;
              hasImage = !!parsed.imagePath;
          } catch(e) {
              originalQuestionText = msg.content;
          }

          // تحسين نص السؤال في الإشعار: نص فقط + تنويه بصورة
          const cleanQuestionForUser = originalQuestionText + (hasImage ? " [ + صورة مرفقة]" : "");

          const notificationTitle = isConsultation ? `وصلك رد على سؤالك في ${subjectTag}` : `وصلك رد على رسالتك إلى الإدارة`;
          
          await supabase.from('notifications').insert({
              user_id: msg.user_id,
              title: notificationTitle,
              content: JSON.stringify({ 
                  type: 'consultation_reply', 
                  question: cleanQuestionForUser, 
                  answer: replyText, 
                  responder: currentUser.name, 
                  subject: subjectTag || "الإدارة" 
              })
          });
          
          window.addToast("تم إرسال الرد وتنبيه التلميذ", "success");
          setReplyingMsgId(null); setReplyText('');
          if (onUpdateCounts) onUpdateCounts();
          fetchData();
      } catch (e) { console.error(e); }
      setLoading(false);
  };

  const handleAiProcess = async () => {
    if (!rawText.trim()) return;
    setIsProcessingAI(true);
    try {
        const ai = initGemini();
        
        let prompt = LESSON_FORMAT_PROMPT;
        let effectiveType = lessonType;

        if (lessonSub === 'philosophy') {
            if (lessonType === 'philosophy_text_analysis') {
                prompt = PHILOSOPHY_TEXT_ANALYSIS_PROMPT;
            } else {
                prompt = PHILOSOPHY_ARTICLE_PROMPT;
                effectiveType = 'philosophy_article';
                setLessonType('philosophy_article');
            }
        } else if (lessonSub === 'math') {
            prompt = MATH_FORMAT_PROMPT;
            effectiveType = 'lessons'; 
            setLessonType('lessons');
        } else if (lessonType === 'philosophy_article') {
            prompt = PHILOSOPHY_ARTICLE_PROMPT;
        } else if (lessonType === 'philosophy_text_analysis') {
            prompt = PHILOSOPHY_TEXT_ANALYSIS_PROMPT;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: [{ parts: [{ text: prompt + "\n\n" + rawText }] }]
        });
        const jsonStr = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
        if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            if (lessonSub === 'math') {
                setMathData(parsed);
                setPhiloData(null);
                setPhiloAnalysisData(null);
                setBlocks([]);
            } else if (effectiveType === 'philosophy_article' || (lessonSub === 'philosophy' && !effectiveType.includes('analysis'))) {
                setPhiloData({...parsed, video_url: videoUrl});
                setBlocks([]);
                setPhiloAnalysisData(null);
                setMathData(null);
            } else if (effectiveType === 'philosophy_text_analysis') {
                setPhiloAnalysisData({...parsed, video_url: videoUrl});
                setPhiloData(null);
                setBlocks([]);
                setMathData(null);
            } else {
                setBlocks(Array.isArray(parsed) ? parsed : (parsed.blocks || []));
                setPhiloData(null);
                setPhiloAnalysisData(null);
                setMathData(null);
            }
            window.addToast("تم التحليل المنهجي بنجاح", "success");
        }
    } catch (e) { window.addToast("فشل في معالجة النص", "error"); }
    finally { setIsProcessingAI(false); }
  };

  const handleSaveLesson = async (structuredData?: any) => {
    if (!lessonTitle) return window.addToast("أدخل العنوان أولاً", "error");
    setLoading(true);
    try {
        let finalContent: any = {};
        if (lessonSub === 'math' && lessonType === 'lessons') {
            finalContent = structuredData || mathData;
        }
        else if (lessonType === 'maps') {
            let imageUrl = mapPreview;
            if (mapFile) {
                const fileName = `map_${Date.now()}_${mapFile.name.replace(/\s+/g, '_')}`;
                await supabase.storage.from('lessons_media').upload(fileName, mapFile);
                const { data: publicUrlData } = supabase.storage.from('lessons_media').getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
            }
            finalContent = { imageUrl, video_url: videoUrl };
        } else if (lessonType === 'philosophy_article' || (lessonSub === 'philosophy' && philoData)) {
            finalContent = { ...(structuredData || philoData), video_url: videoUrl };
        } else if (lessonType === 'philosophy_text_analysis') {
            finalContent = { ...(structuredData || philoAnalysisData), video_url: videoUrl };
        } else {
            finalContent = { blocks: structuredData || blocks, video_url: videoUrl };
        }

        const sectionId = `${lessonSub}_${lessonTri}_${lessonType}`;
        let nextOrder = 0;
        if (!editingId) {
            const { data: existing } = await supabase.from('lessons_content').select('order_index').eq('section_id', sectionId).order('order_index', { ascending: false }).limit(1);
            nextOrder = (existing?.[0]?.order_index ?? -1) + 1;
        }

        const payload: any = { 
            title: lessonTitle, section_id: sectionId, content: JSON.stringify(finalContent), 
            subject: ALL_SUBJECTS_LIST.find(s => s.id === lessonSub)?.name || '',
            user_id: currentUser.id 
        };
        if (!editingId) payload.order_index = nextOrder;

        if (editingId) await supabase.from('lessons_content').update(payload).eq('id', editingId);
        else await supabase.from('lessons_content').insert(payload);
        
        window.addToast("تم الحفظ بنجاح", "success");
        setEditingId(null); handleTabChange('lessons'); fetchData();
    } catch (err: any) { window.addToast("حدث خطأ أثناء الحفظ", "error"); } 
    finally { setLoading(false); }
  };

  const SidebarItem = ({ id, active, icon, label, onClick, badgeCount }: { id: AdminTab; active: boolean; icon: any; label: string; onClick: () => void; badgeCount?: number }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all relative ${active ? 'bg-brand text-black shadow-lg shadow-brand/20 scale-[1.02]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3 relative">
            <div className="relative">
                {icon}
                {badgeCount !== undefined && badgeCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black/20 shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse">
                        {badgeCount}
                    </div>
                )}
            </div>
            <span className="text-xs">{label}</span>
        </div>
    </button>
  );

  const canShowEditor = philoData || philoAnalysisData || (blocks && blocks.length > 0) || (lessonSub === 'math' && lessonType === 'lessons' && mathData);

  return (
    <div className="flex h-screen bg-black text-white font-cairo overflow-hidden relative">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      
      {expandedImage && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
              <button className="absolute top-10 right-10 p-3 bg-white/10 rounded-full text-white"><X size={32}/></button>
              <img src={expandedImage} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg" />
              <div className="mt-6 flex gap-4">
                  <a href={expandedImage} target="_blank" download className="bg-brand text-black px-8 py-3 rounded-full font-black text-sm">تحميل الصورة</a>
              </div>
          </div>
      )}

      <aside className={`fixed lg:relative inset-y-0 right-0 w-64 bg-neutral-900 border-l border-white/5 flex flex-col z-50 transition-transform duration-300 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h1 className="text-2xl font-black text-brand">الإشراف</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white"><X size={24} /></button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              <SidebarItem id="lessons" active={activeTab === 'lessons'} icon={<Database size={18}/>} label="أرشيف الدروس" onClick={() => handleTabChange('lessons')} />
              <SidebarItem id="add_lesson" active={activeTab === 'add_lesson'} icon={<Plus size={18}/>} label="إضافة مادة" onClick={() => { 
                setEditingId(null); setLessonTitle(''); setVideoUrl(''); setPhiloData(null); setPhiloAnalysisData(null); setMathData(null); setBlocks([]); setRawText(''); 
                handleTabChange('add_lesson'); 
              }} />
              <SidebarItem id="exams" active={activeTab === 'exams'} icon={<FileCheck size={18}/>} label="بنك المواضيع" onClick={() => handleTabChange('exams')} />
              <SidebarItem id="inbox" active={activeTab === 'inbox'} icon={<Inbox size={18}/>} label="البريد الوارد" onClick={() => handleTabChange('inbox')} badgeCount={unrepliedCount} />
              <SidebarItem id="notifications" active={activeTab === 'notifications'} icon={<Bell size={18}/>} label="الإشعارات" onClick={() => handleTabChange('notifications')} />
              <SidebarItem id="curriculum" active={activeTab === 'curriculum'} icon={<ClipboardList size={18}/>} label="إدارة المنهج" onClick={() => handleTabChange('curriculum')} />
              <SidebarItem id="platform_guide" active={activeTab === 'platform_guide'} icon={<HelpIcon size={18}/>} label="فهم التطبيق" onClick={() => handleTabChange('platform_guide')} />
              <div className="h-px bg-white/5 my-4"></div>
              <button onClick={onPlay} className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white"><Home size={18}/> <span className="text-xs">الرئيسية</span></button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl"><LogOut size={18}/> <span className="text-xs">خروج</span></button>
          </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-black shadow-inner border-r border-white/5">
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-neutral-900/50 shrink-0">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-brand"><Menu size={24} /></button>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{activeTab === 'platform_guide' ? 'فهم التطبيق' : activeTab}</h2>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-black text-xs relative">
                    A
                    {unrepliedCount > 0 && <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse"></div>}
                 </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar pb-40 relative bg-black min-h-screen">
              
              {activeTab === 'lessons' && (
                  <div className="animate-fadeIn space-y-8">
                      <div className="bg-neutral-900/60 p-6 rounded-[2rem] border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl">
                          <div className="space-y-1">
                              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest mr-2">المادة</label>
                              <select 
                                value={filterSub} 
                                onChange={e => { 
                                    const sub = e.target.value;
                                    setFilterSub(sub); 
                                    const sections = SUBJECT_SECTIONS_MAP[sub] || [];
                                    setFilterType(sections[0]?.id || 'lessons'); 
                                }} 
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white"
                              >
                                {ALL_SUBJECTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest mr-2">الفصل</label>
                              <select value={filterTri} onChange={e => setFilterTri(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white"><option value="t1">الفصل الأول</option><option value="t2">الفصل الثاني</option><option value="t3">الفصل الثالث</option></select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest mr-2">القسم</label>
                              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white">{SUBJECT_SECTIONS_MAP[filterSub]?.map(sec => <option key={sec.id} value={sec.id}>{sec.label}</option>)}</select>
                          </div>
                      </div>
                      {orderChanged && (
                          <div className="flex justify-center animate-slideIn">
                             <button onClick={handleSaveOrder} disabled={isSavingOrder} className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">{isSavingOrder ? <Loader2 className="animate-spin" /> : <Save size={20}/>}<span>حفظ الترتيب الجديد في المنهج</span></button>
                          </div>
                      )}
                      {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin text-brand mx-auto" size={40}/></div> : lessons.length === 0 ? <div className="py-20 text-center opacity-20"><Database size={64} className="mx-auto mb-4"/><p className="font-black text-xs uppercase tracking-widest">لا توجد دروس في هذا القسم حالياً</p></div> : (
                          <div className="space-y-3 max-w-4xl mx-auto">
                              {lessons.map((l, idx) => (
                                  <div key={l.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-brand/30 transition-all">
                                      <div className="flex flex-col gap-1 shrink-0">
                                          <button disabled={idx === 0} onClick={() => handleMoveLesson(idx, 'up')} className={`p-1.5 rounded-lg transition-all ${idx === 0 ? 'opacity-10 grayscale' : 'bg-brand/10 text-brand hover:bg-brand hover:text-black'}`}><ArrowUp size={16} /></button>
                                          <button disabled={idx === lessons.length - 1} onClick={() => handleMoveLesson(idx, 'down')} className={`p-1.5 rounded-lg transition-all ${idx === lessons.length - 1 ? 'opacity-10 grayscale' : 'bg-brand/10 text-brand hover:bg-brand hover:text-black'}`}><ArrowDown size={16} /></button>
                                      </div>
                                      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-black text-[10px] text-gray-500 shrink-0 border border-white/5">{idx + 1}</div>
                                      <div className="flex-1 min-w-0"><h4 className="font-bold text-gray-200 text-sm truncate">{l.title}</h4></div>
                                      <div className="flex gap-2 shrink-0">
                                          <button onClick={() => handleEditLesson(l)} className="p-2 text-blue-400 bg-blue-400/10 rounded-xl hover:bg-blue-400 hover:text-white transition-all"><Edit size={16}/></button>
                                          <button onClick={async () => { if(confirm('حذف الدرس نهائياً؟')) { await supabase.from('lessons_content').delete().eq('id', l.id); fetchData(); } }} className="p-2 text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400 hover:text-white transition-all"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'add_lesson' && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                      <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
                          <div className="grid grid-cols-3 gap-4">
                              <select 
                                value={lessonSub} 
                                onChange={e => { 
                                    const sub = e.target.value;
                                    setLessonSub(sub); 
                                    setPhiloData(null); 
                                    setPhiloAnalysisData(null); 
                                    setMathData(null); 
                                    setBlocks([]); 
                                    if (sub === 'philosophy') {
                                        setLessonType('philosophy_article');
                                    } else {
                                        const sections = SUBJECT_SECTIONS_MAP[sub] || [];
                                        setLessonType(sections[0]?.id || 'lessons');
                                    }
                                }} 
                                className="bg-brand border border-white/10 rounded-xl p-3 text-xs font-bold text-white"
                              >
                                {ALL_SUBJECTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <select value={lessonTri} onChange={e => setLessonTri(e.target.value)} className="bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white"><option value="t1">فصل 1</option><option value="t2">فصل 2</option><option value="t3">فصل 3</option></select>
                              <select value={lessonType} onChange={e => { setLessonType(e.target.value); setPhiloData(null); setPhiloAnalysisData(null); setMathData(null); setBlocks([]); }} className="bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white">{SUBJECT_SECTIONS_MAP[lessonSub]?.map(sec => <option key={sec.id} value={sec.id}>{sec.label}</option>)}</select>
                          </div>
                          <div className="space-y-4">
                            <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="عنوان الدرس الجديد..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-lg font-black text-center outline-none focus:border-brand text-white" />
                            {lessonSub !== 'math' && <div className="relative"><Youtube className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20}/><input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="رابط فيديو شرح يوتيوب (اختياري)..." className="w-full bg-black border border-white/10 rounded-xl py-4 pr-12 pl-4 text-xs font-bold outline-none focus:border-red-500 text-white" /></div>}
                          </div>
                          
                          {!canShowEditor && (
                             <div className="space-y-4 animate-slideIn">
                                  {lessonType === 'maps' ? (
                                      <div onClick={() => fileInputRef.current?.click()} className="h-80 bg-black border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-brand/50">
                                          {mapPreview ? <img src={mapPreview} className="h-full w-full object-contain p-4" /> : <ImageIcon size={64} className="text-gray-800 mx-auto mb-4"/>}
                                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { setMapFile(file); const reader = new FileReader(); reader.onload = () => setMapPreview(reader.result as string); reader.readAsDataURL(file); } }} />
                                      </div>
                                  ) : (
                                      <>
                                          <textarea value={rawText} onChange={e => setRawText(e.target.value)} className="w-full h-48 bg-black border border-white/10 rounded-2xl p-4 text-sm outline-none font-bold text-white" placeholder={lessonSub === 'philosophy' ? "الصق نص المقالة الخام هنا وسيقوم الذكاء الاصطناعي بتقسيمها إلى (مقدمة، مواقف، نقد، تركيب، وخاتمة) تلقائياً..." : lessonSub === 'math' ? "الصق قوانين وتمارين الرياضيات هنا ليقوم الذكاء الاصطناعي بتحويلها إلى صيغ رياضية (LaTeX) دقيقة ومنظمة..." : "الصق النص هنا ليقوم الذكاء الاصطناعي بتنظيمه وتنسيقه تلقائياً..."} />
                                          <button onClick={handleAiProcess} disabled={isProcessingAI} className="w-full py-4 bg-fuchsia-600 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-white">{isProcessingAI ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>}<span>تنسيق ذكي بواسطة AI</span></button>
                                      </>
                                  )}
                                  <button onClick={() => handleSaveLesson()} disabled={loading} className="w-full py-5 bg-brand text-black rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">{loading ? <Loader2 className="animate-spin"/> : <Save size={24}/>}<span>نشر المادة مباشرة</span></button>
                              </div>
                          )}
                      </div>
                      
                      {lessonSub === 'math' && lessonType === 'lessons' && mathData && <div className="animate-slideIn"><MathLessonEditor initialData={mathData} onSave={(d) => handleSaveLesson(d)} onCancel={() => setMathData(null)} /></div>}
                      {lessonType === 'philosophy_article' && philoData && <div className="animate-slideIn"><PhilosophyLessonEditor initialData={philoData} lessonId={editingId || 0} onSave={(d) => handleSaveLesson(d)} onCancel={() => setPhiloData(null)} videoUrl={videoUrl} /></div>}
                      {lessonType === 'philosophy_text_analysis' && philoAnalysisData && <div className="animate-slideIn"><PhilosophyTextAnalysisEditor initialData={philoAnalysisData} onSave={(d) => handleSaveLesson(d)} onCancel={() => setPhiloAnalysisData(null)} /></div>}
                      {blocks && blocks.length > 0 && <div className="animate-slideIn"><GenericLessonEditor initialBlocks={blocks} onSave={(d) => handleSaveLesson(d)} onCancel={() => setBlocks([])} /></div>}
                  </div>
              )}

              {activeTab === 'exams' && (
                  <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                      <button onClick={() => setShowExamForm(!showExamForm)} className="w-full py-4 bg-brand text-black rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg mb-8">{showExamForm ? <X size={20}/> : <PlusCircle size={20}/>}<span>{showExamForm ? 'إلغاء' : 'إضافة موضوع بكالوريا جديد'}</span></button>
                      {showExamForm && (
                          <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/10 space-y-4 mb-8 shadow-2xl">
                              <div className="grid grid-cols-2 gap-4">
                                  <select value={examSubject} onChange={e => setExamSubject(e.target.value)} className="bg-black border border-white/10 rounded-xl p-4 text-xs font-bold text-white">{ALL_SUBJECTS_LIST.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
                                  <input type="number" value={examYear} onChange={e => setExamYear(parseInt(e.target.value))} className="bg-black border border-white/10 rounded-xl p-4 text-xs font-bold text-center text-white" />
                              </div>
                              <input type="text" value={examPdfUrl} onChange={e => setExamPdfUrl(e.target.value)} placeholder="رابط ملف الـ PDF..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-brand text-white" />
                              <button onClick={handleSaveExam} className="w-full py-4 bg-green-600 rounded-xl font-black shadow-lg hover:bg-green-500 text-white">حفظ الموضوع</button>
                          </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {exams.map(ex => (
                              <div key={ex.id} className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                                  <div className="flex items-center gap-4"><div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-brand"><FileText size={24}/></div><div><h4 className="font-bold text-sm text-white">{ex.subject}</h4><p className="text-[10px] text-gray-500 font-bold">دورة {ex.year}</p></div></div>
                                  <button onClick={async () => { if(confirm('حذف الموضوع؟')) { await supabase.from('exams').delete().eq('id', ex.id); fetchData(); } }} className="p-2 text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400 hover:text-white transition-all"><Trash2 size={16}/></button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'inbox' && (
                  <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                      <div className="flex bg-neutral-900/60 p-2 rounded-2xl border border-white/5 mb-8">
                          <button onClick={() => setInboxSubTab('consultations')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${inboxSubTab === 'consultations' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}>
                            الاستشارات التعليمية
                            {unrepliedConsultations > 0 && <span className="bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-pulse">{unrepliedConsultations}</span>}
                          </button>
                          <button onClick={() => setInboxSubTab('admin_messages')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${inboxSubTab === 'admin_messages' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}>
                            رسائل الإدارة العامة
                            {unrepliedAdminMsgs > 0 && <span className="bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-pulse">{unrepliedAdminMsgs}</span>}
                          </button>
                      </div>
                      <div className="space-y-4">
                          {messages.filter(m => { 
                              const isConsult = checkIsConsultation(m);
                              return inboxSubTab === 'consultations' ? isConsult : !isConsult; 
                          }).map(msg => {
                              let contentDisplay = msg.content; 
                              let subjectTag = ""; 
                              let imageUrl = null;
                              try { 
                                  const parsed = JSON.parse(msg.content); 
                                  contentDisplay = parsed.text || parsed.content || msg.content; 
                                  subjectTag = parsed.subject || ""; 
                                  if (parsed.imagePath) {
                                      const { data: publicUrl } = supabase.storage.from('consultations').getPublicUrl(parsed.imagePath);
                                      imageUrl = publicUrl.publicUrl;
                                  }
                              } catch(e) {}
                              return (
                                  <div key={msg.id} className={`bg-neutral-900/40 p-6 rounded-[2.5rem] border transition-all ${msg.is_replied ? 'border-white/5 opacity-60' : 'border-brand/20 shadow-xl'}`}>
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center text-brand font-black text-xs">{msg.user_name?.charAt(0)}</div>
                                              <div>
                                                  <h4 className="font-bold text-white text-sm">{msg.user_name}</h4>
                                                  <p className="text-[9px] text-gray-500">{new Date(msg.created_at).toLocaleString('ar-DZ')}</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              {imageUrl && <ImageIcon className="text-brand animate-pulse" size={16}/>}
                                              {subjectTag && <span className="bg-brand text-black px-3 py-1 rounded-full text-[9px] font-black">{subjectTag}</span>}
                                          </div>
                                      </div>
                                      
                                      <div className="space-y-4 mb-6">
                                          <p className="text-gray-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">{contentDisplay}</p>
                                          
                                          {imageUrl && (
                                              <div className="relative group max-w-[200px] cursor-zoom-in" onClick={() => setExpandedImage(imageUrl)}>
                                                  <img src={imageUrl} className="w-full h-auto rounded-xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform" alt="مرفق" />
                                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                                                      <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      {msg.is_replied ? (
                                          <div className="bg-green-600/10 p-4 rounded-xl border border-green-600/20">
                                              <p className="text-green-400 text-xs font-bold leading-relaxed">تم الرد: {msg.response}</p>
                                          </div>
                                      ) : (
                                          <div className="space-y-3">
                                              <textarea 
                                                value={replyingMsgId === msg.id ? replyText : ''} 
                                                onChange={e => { setReplyingMsgId(msg.id); setReplyText(e.target.value); }} 
                                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-brand h-24 text-white" 
                                                placeholder="اكتب ردك هنا..." 
                                              />
                                              <button onClick={() => handleSendReply(msg)} className="w-full py-3 bg-brand text-black rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95">
                                                  <Send size={14}/> إرسال الرد وتنبيه التلميذ
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {activeTab === 'notifications' && (
                  <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
                      <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-4 shadow-2xl mb-10">
                          <h3 className="text-brand font-black flex items-center gap-2 mb-4"><Bell size={20}/> إرسال إشعار عام للجميع</h3>
                          <input type="text" value={newNotif.title} onChange={e => setNewNotif({...newNotif, title: e.target.value})} placeholder="عنوان الإشعار..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand text-white" />
                          <textarea value={newNotif.content} onChange={e => setNewNotif({...newNotif, content: e.target.value})} placeholder="نص الرسالة..." className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand text-white" />
                          <div className="relative">
                            <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18}/>
                            <input type="text" value={newNotif.link} onChange={e => setNewNotif({...newNotif, link: e.target.value})} placeholder="رابط اختياري (URL)..." className="w-full bg-black border border-white/10 rounded-xl py-4 pr-12 pl-4 text-xs font-bold outline-none focus:border-brand text-white" />
                          </div>
                          <button onClick={async () => { 
                            if(!newNotif.title || !newNotif.content) return; 
                            setLoading(true); 
                            const payload = { 
                                type: 'general_broadcast', 
                                title: newNotif.title, 
                                content: newNotif.content, 
                                link: newNotif.link || null 
                            };
                            await supabase.from('notifications').insert({ 
                                title: newNotif.title, 
                                content: JSON.stringify(payload) 
                            }); 
                            window.addToast("تم بث الإشعار بنجاح", "success"); 
                            setNewNotif({ title: '', content: '', link: '' }); 
                            fetchData(); 
                          }} className="w-full py-4 bg-brand text-black rounded-xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95"><Send size={18}/> بث التنبيه</button>
                      </div>
                      <div className="space-y-4">
                          {notifications.map(n => {
                              let displayContent = n.content;
                              try {
                                  const parsed = JSON.parse(n.content);
                                  displayContent = parsed.content || n.content;
                              } catch(e) {}
                              return (
                                <div key={n.id} className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center"><div><h4 className="font-bold text-white text-sm">{n.title}</h4><p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{displayContent}</p></div><button onClick={async () => { if(confirm('حذف الإشعار؟')) { await supabase.from('notifications').delete().eq('id', n.id); fetchData(); } }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={16}/></button></div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {activeTab === 'curriculum' && (
                  <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                      <div className="bg-neutral-900/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                          <h3 className="text-xl font-black text-brand mb-8 flex items-center gap-3"><ClipboardList size={24}/> المنهج الدراسي الحالي</h3>
                          <div className="grid gap-4">
                              {curriculum.map(item => (
                                  <div key={item.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"><span className="font-black text-white w-32">{item.subject}</span><div className="flex-1 w-full relative"><input type="text" value={item.last_lesson} onChange={e => { const newCur = curriculum.map(c => c.id === item.id ? { ...c, last_lesson: e.target.value } : c); setCurriculum(newCur); }} className="w-full bg-black border border-white/10 rounded-xl py-3 px-10 text-xs font-bold outline-none focus:border-brand text-white" placeholder="اسم آخر درس تم رفعه..." /><BookOpen size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" /></div><button onClick={async () => { setLoading(true); await supabase.from('curriculum_status').update({ last_lesson: item.last_lesson }).eq('id', item.id); window.addToast(`تم تحديث منهج ${item.subject}`, "success"); setLoading(false); }} className="bg-brand text-black px-6 py-3 rounded-xl font-black text-xs shadow-md active:scale-95 transition-all">حفظ التحديث</button></div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'platform_guide' && (
                  <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
                      <div className="flex bg-neutral-900/60 p-2 rounded-2xl border border-white/5 mb-8 sticky top-0 z-10 backdrop-blur-md">
                          <button onClick={() => setGuideSubTab('admin')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${guideSubTab === 'admin' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}><Workflow size={18}/> المرشد الإداري</button>
                          <button onClick={() => setGuideSubTab('technical')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${guideSubTab === 'technical' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-500'}`}><ShieldAlert size={18}/> المواجهة البرمجية (35)</button>
                      </div>

                      {guideSubTab === 'admin' ? (
                          <div className="space-y-12 pb-20">
                              <header className="text-center">
                                  <h3 className="text-3xl font-black text-brand mb-4 flex items-center justify-center gap-3"><Settings size={32}/> الدليل التشغيلي للمدير</h3>
                                  <p className="text-gray-500 font-bold max-w-lg mx-auto">هذا القسم موجه لك يا زميلي المدير الثاني، لضمان إدارة المنصة دون أخطاء تقنية.</p>
                              </header>

                              <div className="grid gap-8">
                                  <div className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6 relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                      <div className="flex items-center gap-4"><div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><Plus size={24}/></div><h4 className="text-xl font-black text-white">إضافة دروس ومقالات منهجية</h4></div>
                                      <div className="space-y-4 text-sm font-bold text-gray-300">
                                          <p className="flex gap-3"><span className="text-blue-400">1.</span> اذهب لتبويب "إضافة مادة" من القائمة الجانبية اليمنى.</p>
                                          <p className="flex gap-3"><span className="text-blue-400">2.</span> اختر (المادة، الفصل، والقسم). <span className="text-brand text-[10px]">ملاحظة: اختر قسم 'المقالات' للفلسفة أو 'الدروس' للبقية.</span></p>
                                          <p className="flex gap-3"><span className="text-blue-400">3.</span> اكتب عنوان الدرس في الحقل الكبير العلوي.</p>
                                          <p className="flex gap-3"><span className="text-blue-400">4.</span> الصق النص "الخام" غير المنسق في منطقة الكتابة الكبيرة.</p>
                                          <p className="flex gap-3"><span className="text-blue-400">5.</span> انقر على الزر البنفسجي "تنسيق ذكي بواسطة AI". انتظر ثواني حتى يحول الذكاء الاصطناعي النص لبطاقات.</p>
                                          <p className="flex gap-3"><span className="text-blue-400">6.</span> ستظهر لك معاينة؛ يمكنك تعديل الأخطاء يدوياً ثم انقر على "نشر المادة".</p>
                                      </div>
                                  </div>

                                  <div className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6 relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                      <div className="flex items-center gap-4"><div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Map size={24}/></div><h4 className="text-xl font-black text-white">رفع الخرائط (خاص بالجغرافيا)</h4></div>
                                      <div className="space-y-4 text-sm font-bold text-gray-300">
                                          <p className="flex gap-3"><span className="text-emerald-400">1.</span> من تبويب "إضافة مادة"، اختر مادة "الجغرافيا".</p>
                                          <p className="flex gap-3"><span className="text-emerald-400">2.</span> في قائمة "القسم"، اختر "الخرائط (Maps)".</p>
                                          <p className="flex gap-3"><span className="text-emerald-400">3.</span> سيتحول مربع النص تلقائياً إلى "مربع رفع صور".</p>
                                          <p className="flex gap-3"><span className="text-emerald-400">4.</span> انقر على المربع، اختر صورة الخريطة من جهازك، ثم انقر "نشر المادة".</p>
                                      </div>
                                  </div>

                                  <div className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6 relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 w-2 h-full bg-brand opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                      <div className="flex items-center gap-4"><div className="p-3 bg-brand/20 rounded-2xl text-brand"><ListOrdered size={24}/></div><h4 className="text-xl font-black text-white">تعديل ترتيب ظهور الدروس للطلاب</h4></div>
                                      <div className="space-y-4 text-sm font-bold text-gray-300">
                                          <p className="flex gap-3"><span className="text-brand">1.</span> ادخل لتبويب "أرشيف الدروس".</p>
                                          <p className="flex gap-3"><span className="text-brand">2.</span> استخدم الفلاتر العلوية للوصول للقسم الذي تريد ترتيبه (مثلاً: تاريخ، فصل 1، دروس).</p>
                                          <p className="flex gap-3"><span className="text-brand">3.</span> ستظهر قائمة الدروس؛ استخدم الأسهم (أعلى/أسفل) بجانب كل درس لتحريكه.</p>
                                          <p className="flex gap-3 font-black text-white"><span className="text-brand">4.</span> (هام جداً): بعد الانتهاء من التحريك، سيظهر زر أخضر كبير "حفظ الترتيب الجديد"، انقر عليه لتثبيت التغيير.</p>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 space-y-4">
                                          <h4 className="text-lg font-black text-red-400 flex items-center gap-2"><Bell size={20}/> بث إشعار عام</h4>
                                          <p className="text-xs text-gray-400 font-bold leading-relaxed">
                                              1. اذهب لتبويب "الإشعارات".<br/>
                                              2. اكتب عنواناً جذاباً ورسالة تشجيعية.<br/>
                                              3. اضغط "بث التنبيه" ليصل فوراً لجميع الهواتف المشتركة.
                                          </p>
                                      </div>
                                      <div className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 space-y-4">
                                          <h4 className="text-lg font-black text-purple-400 flex items-center gap-2"><ClipboardList size={20}/> تحديث المنهج</h4>
                                          <p className="text-xs text-gray-400 font-bold leading-relaxed">
                                              1. اذهب لتبويب "إدارة المنهج".<br/>
                                              2. ستجد كل مادة؛ اكتب اسم "آخر درس" تم رفعه.<br/>
                                              3. اضغط "حفظ التحديث" لتغيير حالة المادة في واجهة الطالب الرئيسية.
                                          </p>
                                      </div>
                                  </div>

                                  <div className="bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6 relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                      <div className="flex items-center gap-4"><div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400"><MessageCircle size={24}/></div><h4 className="text-xl font-black text-white">الرد على استشارات التلاميذ</h4></div>
                                      <div className="space-y-4 text-sm font-bold text-gray-300">
                                          <p className="flex gap-3"><span className="text-cyan-400">1.</span> اذهب لتبويب "البريد الوارد".</p>
                                          <p className="flex gap-3"><span className="text-cyan-400">2.</span> اختر "الاستشارات التعليمية" من الأزرار العلوية.</p>
                                          <p className="flex gap-3"><span className="text-cyan-400">3.</span> اقرأ السؤال، ثم اكتب إجابتك الوافية في المربع المخصص.</p>
                                          <p className="flex gap-3 font-black text-brand"><span className="text-cyan-400">4.</span> إذا أرفق الطالب صورة، ستجدها تحت النص، اضغط عليها لتكبيرها وفهم سؤاله بوضوح.</p>
                                          <p className="flex gap-3"><span className="text-cyan-400">5.</span> انقر "إرسال الرد"؛ سيصل تنبيه للطالب وسيرى اسمك كمدير مجيب.</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-6">
                              <div className="bg-fuchsia-900/10 p-6 rounded-2xl border border-fuchsia-500/20 mb-10 text-center"><p className="text-fuchsia-400 text-xs font-bold leading-relaxed italic">"أنت الآن في منطقة الدفاع التقني. هذه 35 سؤالاً مفخخاً تغطي هندسة بناء هذا التطبيق بالكامل. اختبر نفسك لترى إن كنت حقاً المطور الحقيقي لهذا الإنجاز."</p></div>
                              <div className="grid gap-4">
                                  {TECHNICAL_QUESTIONS.map((item, idx) => (
                                      <div key={idx} className="bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5 group hover:border-fuchsia-500/30 transition-all">
                                          <div className="flex gap-4">
                                              <div className="w-8 h-8 rounded-full bg-fuchsia-600/20 text-fuchsia-500 flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                                              <div className="space-y-4 flex-1">
                                                  <h4 className="text-fuchsia-400 font-black text-sm">{item.q}</h4>
                                                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-gray-400 text-xs font-bold leading-loose">{item.a}</div>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

          </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
