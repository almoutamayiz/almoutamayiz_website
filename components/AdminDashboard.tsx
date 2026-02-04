import React, { useState, useEffect, useRef } from 'react';
import { Question, AdminMessage, LessonContent, User, Exam, Notification, CurriculumStatus, PhilosophyStructuredContent, PhilosophyTextAnalysisContent, MathLessonStructuredContent, AnalyticsSummary } from '../types';
import { 
  Trash2, Loader2, Save, Sparkles, Inbox, 
  Database, FileText, Plus, Edit, 
  ImageIcon, Send, Bell, FileCheck, Layers, Eye, X, Type, Link as LinkIcon, User as UserIcon, Menu, Youtube, PlusCircle, BookOpen, Settings,
  Map as MapIcon, GraduationCap, Users, History, Zap, ClipboardList,
  BarChart2, Circle, Search, Maximize2, RefreshCw, PenTool, CheckCircle, AlertTriangle, ArrowUp, ArrowDown
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
  { q: "كيف يتم التعامل مع قواعد البيانات؟", a: "نستخدم Supabase كخدمة Backend-as-a-Service. يتم الاتصال بها مباشرة من الواجهة الأمامية باستخدام مكتبة @supabase/supabase-js مع تفعيل Row Level Security (RLS) لحماية البيانات." },
  { q: "كيف يعمل الذكاء الاصطناعي في التطبيق؟", a: "نستخدم Gemini 1.5 Flash عبر API Google Generative AI. يتم إرسال النصوص (إعراب، تصحيح مقالات) مع 'System Instructions' صارمة لضمان دقة الإجابة المنهجية." },
  { q: "ما هي آلية تخزين الصور؟", a: "يتم تخزين الصور في Supabase Storage (Buckets). يتم رفع الصورة، الحصول على الرابط العام (Public URL)، ثم تخزين هذا الرابط في قاعدة البيانات (PostgreSQL)." },
];

type AdminTab = 'lessons' | 'add_lesson' | 'exams' | 'inbox' | 'notifications' | 'curriculum' | 'platform_guide' | 'analytics';
type AnalyticsSubTab = 'overview' | 'pages' | 'users';

interface AdminDashboardProps {
    currentUser: User;
    onPlay: () => void;
    onLogout: () => void;
    onUpdateCounts?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onPlay, onLogout, onUpdateCounts }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('lessons');
  const [loading, setLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [guideSubTab, setGuideSubTab] = useState<'admin' | 'technical'>('admin');

  // Filters
  const [filterSub, setFilterSub] = useState('arabic');
  const [filterTri, setFilterTri] = useState('t1');
  const [filterType, setFilterType] = useState('lessons');
  const [orderChanged, setOrderChanged] = useState(false);

  // Data
  const [lessons, setLessons] = useState<LessonContent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumStatus[]>([]);
  
  // Analytics State
  const [analyticsSubTab, setAnalyticsSubTab] = useState<AnalyticsSubTab>('overview');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showOnlineUsersModal, setShowOnlineUsersModal] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
      totalUsers: 0, activeToday: 0, onlineNow: 0, activeWeek: 0, newUsersToday: 0, totalPageViewsToday: 0, topPages: [], userList: []
  });
  
  // Add/Edit Lesson State
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
  
  // Exam State
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [examSubject, setExamSubject] = useState('اللغة العربية');
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [examPdfUrl, setExamPdfUrl] = useState('');

  // Inbox & Notification State
  const [inboxSubTab, setInboxSubTab] = useState<'consultations' | 'admin_messages'>('consultations');
  const [replyingMsgId, setReplyingMsgId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newNotif, setNewNotif] = useState({ title: '', content: '', link: '' });
  
  // AI Answer Correction State
  const [correctingMsgId, setCorrectingMsgId] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState('');

  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Counts
  const unrepliedCount = messages.filter(m => !m.is_replied).length; 
  
  const checkIsConsultation = (msg: AdminMessage) => {
      try {
          const parsed = JSON.parse(msg.content);
          return !!parsed.subject || parsed.type === 'consultation';
      } catch { return false; }
  };

  const unrepliedAdminMsgs = messages.filter(m => !m.is_replied && !checkIsConsultation(m)).length;

  useEffect(() => {
    fetchData(); 
  }, [activeTab, filterSub, filterTri, filterType]);

  const fetchData = async () => {
    setLoading(true);
    try {
        switch(activeTab) {
            case 'analytics': await fetchAnalytics(); break;
            case 'lessons':
                const sectionId = `${filterSub}_${filterTri}_${filterType}`;
                const { data: les } = await supabase.from('lessons_content').select('*').eq('section_id', sectionId).order('order_index', { ascending: true });
                if (les) setLessons(les);
                break;
            case 'exams':
                const { data: exm } = await supabase.from('exams').select('*').order('year', { ascending: false });
                if (exm) setExams(exm);
                break;
            case 'inbox':
                const { data: msgs } = await supabase.from('admin_messages').select('*').order('created_at', { ascending: false }).limit(100);
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
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
      try {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString();
          const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          const { count: activeToday } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', todayStr);
          const { count: onlineNow } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', new Date(now.getTime() - (5 * 60 * 1000)).toISOString());
          const { count: newUsersToday } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStr);
          const { count: activeWeek } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', weekAgo);
          const { data: pageStats } = await supabase.from('analytics_logs').select('screen_name, views_count').eq('date', todayStr).order('views_count', { ascending: false }).limit(10);
          const totalPageViewsToday = pageStats?.reduce((sum, item) => sum + item.views_count, 0) || 0;
          const { data: userList } = await supabase.from('profiles').select('id, name, email, last_active_at, role, avatar').order('last_active_at', { ascending: false }).limit(50);
          setAnalytics({ totalUsers: totalUsers || 0, newUsersToday: newUsersToday || 0, activeToday: activeToday || 0, onlineNow: onlineNow || 0, activeWeek: activeWeek || 0, totalPageViewsToday: totalPageViewsToday, topPages: pageStats || [], userList: userList || [] });
      } catch (e) {}
  };

  const handleSendReply = async (msg: AdminMessage) => {
      if (!replyText.trim()) return;
      setLoading(true);
      try {
          await supabase.from('admin_messages').update({ is_replied: true, response: replyText }).eq('id', msg.id);
          await supabase.from('notifications').insert({
              user_id: msg.user_id,
              title: "رد الإدارة على رسالتك",
              content: JSON.stringify({ type: 'general_reply', content: replyText, original_msg: msg.content })
          });
          window.addToast("تم إرسال الرد", "success");
          setReplyingMsgId(null); setReplyText('');
          if (onUpdateCounts) onUpdateCounts();
          fetchData();
      } catch (e) { console.error(e); }
      setLoading(false);
  };

  const handleCorrectAiResponse = async (msg: AdminMessage) => {
      if (!correctionText.trim()) return;
      setLoading(true);
      try {
          await supabase.from('admin_messages').update({ response: correctionText }).eq('id', msg.id);
          let originalQuestionText = "";
          let subjectTag = "";
          try {
              const parsed = JSON.parse(msg.content);
              originalQuestionText = parsed.text || parsed.content || msg.content;
              subjectTag = parsed.subject || "";
          } catch(e) { originalQuestionText = msg.content; }

          await supabase.from('notifications').insert({
              user_id: msg.user_id,
              title: "تصحيح إجابة من الأستاذ",
              content: JSON.stringify({ type: 'consultation_reply', question: originalQuestionText, answer: correctionText, responder: "الأستاذ المصحح", subject: subjectTag })
          });
          window.addToast("تم تصحيح الإجابة وإعلام الطالب", "success");
          setCorrectingMsgId(null); setCorrectionText('');
          fetchData();
      } catch (e) { console.error(e); window.addToast("فشل الحفظ", "error"); }
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
      setLessonSub(sParts[0]); setLessonTri(sParts[1]);
      if (parsed.type === 'philosophy_structured') { setLessonType('philosophy_article'); setPhiloData(parsed); setBlocks([]); setPhiloAnalysisData(null); setMathData(null); } 
      else if (parsed.type === 'philosophy_text_analysis') { setLessonType('philosophy_text_analysis'); setPhiloAnalysisData(parsed); setPhiloData(null); setBlocks([]); setMathData(null); }
      else if (parsed.type === 'math_series') { setLessonType('lessons'); setMathData(parsed); setPhiloData(null); setPhiloAnalysisData(null); setBlocks([]); } 
      else if (parsed.blocks) { setLessonType(sParts[2] || 'lessons'); setBlocks(parsed.blocks); setPhiloData(null); setPhiloAnalysisData(null); setMathData(null); }
      else { setLessonType(sParts[2] || 'lessons'); setMathData(null); }
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

  const handleAiProcess = async () => {
    if (!rawText.trim()) return;
    setIsProcessingAI(true);
    try {
        const ai = initGemini();
        let prompt = LESSON_FORMAT_PROMPT;
        let effectiveType = lessonType;
        if (lessonSub === 'philosophy') {
            if (lessonType === 'philosophy_text_analysis') { prompt = PHILOSOPHY_TEXT_ANALYSIS_PROMPT; } 
            else { prompt = PHILOSOPHY_ARTICLE_PROMPT; effectiveType = 'philosophy_article'; setLessonType('philosophy_article'); }
        } else if (lessonSub === 'math') { prompt = MATH_FORMAT_PROMPT; effectiveType = 'lessons'; setLessonType('lessons'); } 
        else if (lessonType === 'philosophy_article') { prompt = PHILOSOPHY_ARTICLE_PROMPT; } 
        else if (lessonType === 'philosophy_text_analysis') { prompt = PHILOSOPHY_TEXT_ANALYSIS_PROMPT; }

        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ parts: [{ text: prompt + "\n\n" + rawText }] }] });
        const jsonStr = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
        if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            if (lessonSub === 'math') { setMathData(parsed); setPhiloData(null); setPhiloAnalysisData(null); setBlocks([]); } 
            else if (effectiveType === 'philosophy_article' || (lessonSub === 'philosophy' && !effectiveType.includes('analysis'))) { setPhiloData({...parsed, video_url: videoUrl}); setBlocks([]); setPhiloAnalysisData(null); setMathData(null); } 
            else if (effectiveType === 'philosophy_text_analysis') { setPhiloAnalysisData({...parsed, video_url: videoUrl}); setPhiloData(null); setBlocks([]); setMathData(null); } 
            else { setBlocks(Array.isArray(parsed) ? parsed : (parsed.blocks || [])); setPhiloData(null); setPhiloAnalysisData(null); setMathData(null); }
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
        if (lessonSub === 'math' && lessonType === 'lessons') { finalContent = structuredData || mathData; }
        else if (lessonType === 'maps') {
            let imageUrl = mapPreview;
            if (mapFile) {
                const fileName = `map_${Date.now()}_${mapFile.name.replace(/\s+/g, '_')}`;
                await supabase.storage.from('lessons_media').upload(fileName, mapFile);
                const { data: publicUrlData } = supabase.storage.from('lessons_media').getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
            }
            finalContent = { imageUrl, video_url: videoUrl };
        } else if (lessonType === 'philosophy_article' || (lessonSub === 'philosophy' && philoData)) { finalContent = { ...(structuredData || philoData), video_url: videoUrl }; } 
        else if (lessonType === 'philosophy_text_analysis') { finalContent = { ...(structuredData || philoAnalysisData), video_url: videoUrl }; } 
        else { finalContent = { blocks: structuredData || blocks, video_url: videoUrl }; }

        const sectionId = `${lessonSub}_${lessonTri}_${lessonType}`;
        let nextOrder = 0;
        if (!editingId) {
            const { data: existing } = await supabase.from('lessons_content').select('order_index').eq('section_id', sectionId).order('order_index', { ascending: false }).limit(1);
            nextOrder = (existing?.[0]?.order_index ?? -1) + 1;
        }
        const payload: any = { title: lessonTitle, section_id: sectionId, content: JSON.stringify(finalContent), subject: ALL_SUBJECTS_LIST.find(s => s.id === lessonSub)?.name || '', user_id: currentUser.id };
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
      
      {/* Expanded Image Modal */}
      {expandedImage && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
              <button className="absolute top-10 right-10 p-3 bg-white/10 rounded-full text-white"><X size={32}/></button>
              <img src={expandedImage} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg" />
              <div className="mt-6 flex gap-4">
                  <a href={expandedImage} target="_blank" download className="bg-brand text-black px-8 py-3 rounded-full font-black text-sm">تحميل الصورة</a>
              </div>
          </div>
      )}

      {/* Online Users Modal */}
      {showOnlineUsersModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowOnlineUsersModal(false)}>
              <div className="bg-neutral-900 w-full max-w-lg rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h3 className="text-xl font-black text-brand">المستخدمون النشطون الآن</h3>
                      <button onClick={() => setShowOnlineUsersModal(false)}><X/></button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                      {analytics.userList.filter(u => new Date(u.last_active_at).getTime() > Date.now() - 5 * 60 * 1000).length === 0 ? 
                          <p className="text-center text-gray-500 py-10">لا يوجد مستخدمون نشطون في آخر 5 دقائق</p>
                      : analytics.userList.filter(u => new Date(u.last_active_at).getTime() > Date.now() - 5 * 60 * 1000).map(u => (
                          <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all">
                              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 relative">
                                  {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover"/> : <span className="text-xs font-black">{u.name.charAt(0)}</span>}
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900"></div>
                              </div>
                              <div>
                                  <h4 className="font-bold text-sm text-white">{u.name}</h4>
                                  <p className="text-[10px] text-gray-500">{u.role === 'admin' ? 'مدير النظام' : 'طالب متميز'}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <aside className={`fixed lg:relative inset-y-0 right-0 w-64 bg-neutral-900 border-l border-white/5 flex flex-col z-50 transition-transform duration-300 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h1 className="text-2xl font-black text-brand">الإشراف</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white"><X size={24} /></button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              <SidebarItem id="analytics" active={activeTab === 'analytics'} icon={<BarChart2 size={18}/>} label="مركز الإحصائيات" onClick={() => handleTabChange('analytics')} />
              <SidebarItem id="lessons" active={activeTab === 'lessons'} icon={<Database size={18}/>} label="أرشيف الدروس" onClick={() => handleTabChange('lessons')} />
              <SidebarItem id="add_lesson" active={activeTab === 'add_lesson'} icon={<Plus size={18}/>} label="إضافة مادة" onClick={() => { setEditingId(null); setLessonTitle(''); setVideoUrl(''); setPhiloData(null); setPhiloAnalysisData(null); setMathData(null); setBlocks([]); setRawText(''); handleTabChange('add_lesson'); }} />
              <SidebarItem id="exams" active={activeTab === 'exams'} icon={<FileCheck size={18}/>} label="بنك المواضيع" onClick={() => handleTabChange('exams')} />
              <SidebarItem id="inbox" active={activeTab === 'inbox'} icon={<Inbox size={18}/>} label="البريد الوارد" onClick={() => handleTabChange('inbox')} badgeCount={unrepliedAdminMsgs} />
              <SidebarItem id="notifications" active={activeTab === 'notifications'} icon={<Bell size={18}/>} label="الإشعارات" onClick={() => handleTabChange('notifications')} />
              <SidebarItem id="curriculum" active={activeTab === 'curriculum'} icon={<ClipboardList size={18}/>} label="إدارة المنهج" onClick={() => handleTabChange('curriculum')} />
              <SidebarItem id="platform_guide" active={activeTab === 'platform_guide'} icon={<Settings size={18}/>} label="فهم التطبيق" onClick={() => handleTabChange('platform_guide')} />
              <div className="h-px bg-white/5 my-4"></div>
              <button onClick={onPlay} className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white"><ClipboardList size={18}/> <span className="text-xs">الرئيسية</span></button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={18}/> <span className="text-xs">خروج</span></button>
          </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-black shadow-inner border-r border-white/5">
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-neutral-900/50 shrink-0">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-brand"><Menu size={24} /></button>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{activeTab === 'platform_guide' ? 'فهم التطبيق' : activeTab === 'analytics' ? 'الإحصائيات والنمو' : activeTab}</h2>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-black text-xs relative">
                    A
                    {unrepliedCount > 0 && <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse"></div>}
                 </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar pb-40 relative bg-black min-h-screen">
              
              {activeTab === 'analytics' && (
                  <div className="space-y-8 animate-fadeIn">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-neutral-900/60 p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2">
                              <span className="text-gray-500 text-xs font-bold uppercase">إجمالي المستخدمين</span>
                              <span className="text-3xl font-black text-white">{analytics.totalUsers}</span>
                          </div>
                          <div onClick={() => setShowOnlineUsersModal(true)} className="bg-neutral-900/60 p-6 rounded-3xl border border-brand/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800 transition-colors relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full m-3 animate-pulse"></div>
                              <span className="text-brand text-xs font-bold uppercase">نشط الآن</span>
                              <span className="text-3xl font-black text-white">{analytics.onlineNow}</span>
                          </div>
                          <div className="bg-neutral-900/60 p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2">
                              <span className="text-gray-500 text-xs font-bold uppercase">نشط اليوم</span>
                              <span className="text-3xl font-black text-white">{analytics.activeToday}</span>
                          </div>
                          <div className="bg-neutral-900/60 p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2">
                              <span className="text-gray-500 text-xs font-bold uppercase">تصفح الصفحات</span>
                              <span className="text-3xl font-black text-white">{analytics.totalPageViewsToday}</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5">
                              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><Eye size={18} className="text-blue-400"/> الصفحات الأكثر زيارة اليوم</h3>
                              <div className="space-y-3">
                                  {analytics.topPages.map((page, i) => (
                                      <div key={i} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                                          <span className="text-xs font-bold text-gray-300">{page.screen_name}</span>
                                          <span className="text-xs font-black text-brand bg-brand/10 px-2 py-1 rounded-lg">{page.views_count}</span>
                                      </div>
                                  ))}
                                  {analytics.topPages.length === 0 && <p className="text-center text-gray-500 text-xs">لا توجد بيانات كافية</p>}
                              </div>
                          </div>
                          <div className="bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5">
                              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><Users size={18} className="text-purple-400"/> آخر المسجلين</h3>
                              <div className="space-y-3">
                                  {analytics.userList.slice(0, 5).map(u => (
                                      <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all">
                                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-black">{u.name.charAt(0)}</div>
                                          <div>
                                              <h4 className="font-bold text-xs text-white">{u.name}</h4>
                                              <p className="text-[9px] text-gray-500">{new Date(u.last_active_at).toLocaleDateString()}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'lessons' && (
                  <div className="animate-fadeIn space-y-8">
                      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                          {ALL_SUBJECTS_LIST.map(sub => (
                              <button key={sub.id} onClick={() => setFilterSub(sub.id)} className={`px-6 py-3 rounded-full text-xs font-black whitespace-nowrap transition-all ${filterSub === sub.id ? 'bg-brand text-black shadow-lg' : 'bg-neutral-900 text-gray-500'}`}>{sub.name}</button>
                          ))}
                      </div>
                      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                          {['t1', 't2', 't3'].map(t => <button key={t} onClick={() => setFilterTri(t)} className={`px-6 py-3 rounded-full text-xs font-black whitespace-nowrap transition-all ${filterTri === t ? 'bg-white text-black' : 'bg-neutral-900 text-gray-500'}`}>{t === 't1' ? 'فصل 1' : t === 't2' ? 'فصل 2' : 'فصل 3'}</button>)}
                      </div>
                      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                          {(SUBJECT_SECTIONS_MAP[filterSub] || []).map(sec => (
                              <button key={sec.id} onClick={() => setFilterType(sec.id)} className={`px-6 py-3 rounded-full text-xs font-black whitespace-nowrap transition-all ${filterType === sec.id ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-gray-500'}`}>{sec.label}</button>
                          ))}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-black text-white">الأرشيف ({lessons.length})</h3>
                          {orderChanged && <button onClick={handleSaveOrder} disabled={isSavingOrder} className="bg-green-600 text-white px-6 py-2 rounded-full font-black text-xs shadow-lg animate-bounceIn">{isSavingOrder ? 'جاري الحفظ...' : 'حفظ الترتيب الجديد'}</button>}
                      </div>

                      <div className="space-y-3">
                          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-brand" size={40}/></div> : lessons.length === 0 ? <div className="py-20 text-center text-gray-500 font-bold">لا يوجد محتوى في هذا القسم</div> : lessons.map((l, idx) => (
                              <div key={l.id} className="bg-neutral-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand/30 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="flex flex-col gap-1">
                                          <button onClick={() => handleMoveLesson(idx, 'up')} className="text-gray-600 hover:text-white"><ArrowUp size={14}/></button>
                                          <button onClick={() => handleMoveLesson(idx, 'down')} className="text-gray-600 hover:text-white"><ArrowDown size={14}/></button>
                                      </div>
                                      <span className="font-bold text-sm text-gray-300">{l.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <button onClick={() => handleEditLesson(l)} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16}/></button>
                                      <button onClick={async () => { if(confirm('حذف نهائي؟')) { await supabase.from('lessons_content').delete().eq('id', l.id); fetchData(); } }} className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'add_lesson' && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="space-y-4 lg:col-span-1">
                              <div className="bg-neutral-900/60 p-6 rounded-[2rem] border border-white/5 space-y-4">
                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">المادة</label>
                                  <select value={lessonSub} onChange={e => { setLessonSub(e.target.value); setLessonType('lessons'); }} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-brand">
                                      {ALL_SUBJECTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                  
                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">الفصل</label>
                                  <div className="grid grid-cols-3 gap-2">
                                      {['t1', 't2', 't3'].map(t => <button key={t} onClick={() => setLessonTri(t)} className={`py-2 rounded-lg text-[10px] font-black border ${lessonTri === t ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>{t.toUpperCase()}</button>)}
                                  </div>

                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">النوع</label>
                                  <select value={lessonType} onChange={e => setLessonType(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-brand">
                                      {(SUBJECT_SECTIONS_MAP[lessonSub] || []).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                  </select>
                              </div>

                              {!canShowEditor && (
                                  <div className="bg-brand/10 p-6 rounded-[2rem] border border-brand/20 text-center">
                                      <Sparkles className="mx-auto text-brand mb-2" size={24}/>
                                      <h3 className="font-black text-white text-sm mb-2">المعالج الذكي</h3>
                                      <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">ألصق النص الخام ليقوم الذكاء الاصطناعي بتنسيقه.</p>
                                      <button onClick={handleAiProcess} disabled={isProcessingAI || !rawText.trim()} className="w-full py-3 bg-brand text-black rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                          {isProcessingAI ? <Loader2 className="animate-spin"/> : <Zap size={14}/>} <span>معالجة وتنسيق</span>
                                      </button>
                                  </div>
                              )}
                          </div>

                          <div className="lg:col-span-2 space-y-6">
                              <div className="bg-neutral-900/60 p-6 rounded-[2rem] border border-white/5 space-y-4">
                                  <input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full bg-transparent text-2xl font-black text-white placeholder:text-gray-700 outline-none border-b border-white/10 pb-2 focus:border-brand transition-all" placeholder="عنوان الدرس الرئيسي..." />
                                  <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                                      <Youtube className="text-red-500 shrink-0" size={20}/>
                                      <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full bg-transparent text-xs font-bold text-gray-300 outline-none" placeholder="رابط فيديو يوتيوب (اختياري)..." />
                                  </div>
                              </div>

                              {!canShowEditor ? (
                                  <div className="bg-neutral-900/60 p-6 rounded-[2rem] border border-white/5 h-96 flex flex-col">
                                      <textarea value={rawText} onChange={e => setRawText(e.target.value)} className="flex-1 w-full bg-transparent text-sm font-medium text-gray-300 outline-none resize-none placeholder:text-gray-700" placeholder="الصق النص الخام هنا ليتم تحليله..." />
                                      {lessonType === 'maps' && (
                                          <div className="mt-4 pt-4 border-t border-white/5">
                                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if(file) { setMapFile(file); setMapPreview(URL.createObjectURL(file)); }
                                              }} />
                                              <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-brand/50 hover:text-white transition-all">
                                                  {mapPreview ? <img src={mapPreview} className="h-32 object-contain rounded-lg"/> : <><ImageIcon size={24}/><span className="text-xs font-bold mt-2">رفع صورة الخريطة</span></>}
                                              </button>
                                              <button onClick={() => handleSaveLesson()} className="w-full mt-4 py-3 bg-brand text-black rounded-xl font-black">حفظ الخريطة</button>
                                          </div>
                                      )}
                                  </div>
                              ) : (
                                  <div className="animate-slideIn">
                                      {lessonSub === 'math' && lessonType === 'lessons' && mathData ? (
                                          <MathLessonEditor initialData={mathData} onSave={handleSaveLesson} onCancel={() => { setMathData(null); }} />
                                      ) : lessonType === 'philosophy_article' && philoData ? (
                                          <PhilosophyLessonEditor lessonId={editingId || 0} initialData={philoData} onSave={handleSaveLesson} onCancel={() => setPhiloData(null)} videoUrl={videoUrl} />
                                      ) : lessonType === 'philosophy_text_analysis' && philoAnalysisData ? (
                                          <PhilosophyTextAnalysisEditor initialData={philoAnalysisData} onSave={handleSaveLesson} onCancel={() => setPhiloAnalysisData(null)} />
                                      ) : (
                                          <GenericLessonEditor initialBlocks={blocks} onSave={handleSaveLesson} onCancel={() => setBlocks([])} />
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'exams' && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                      <div className="flex justify-between items-center bg-neutral-900/60 p-6 rounded-3xl border border-white/5">
                          <h2 className="text-xl font-black text-white">بنك المواضيع</h2>
                          <button onClick={() => setShowExamForm(!showExamForm)} className="bg-brand text-black px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"><Plus size={16}/> إضافة موضوع</button>
                      </div>

                      {showExamForm && (
                          <div className="bg-neutral-800 p-6 rounded-3xl border border-white/10 space-y-4 animate-slideIn">
                              <div className="grid grid-cols-2 gap-4">
                                  <select value={examSubject} onChange={e => setExamSubject(e.target.value)} className="bg-black p-3 rounded-xl text-xs font-bold text-white border border-white/10 outline-none focus:border-brand">{ALL_SUBJECTS_LIST.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
                                  <input type="number" value={examYear} onChange={e => setExamYear(parseInt(e.target.value))} className="bg-black p-3 rounded-xl text-xs font-bold text-white border border-white/10 outline-none focus:border-brand" placeholder="السنة (2024)" />
                              </div>
                              <input type="text" value={examPdfUrl} onChange={e => setExamPdfUrl(e.target.value)} className="w-full bg-black p-3 rounded-xl text-xs font-bold text-white border border-white/10 outline-none focus:border-brand" placeholder="رابط PDF المباشر..." />
                              <button onClick={handleSaveExam} disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-xs shadow-lg">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'حفظ الموضوع'}</button>
                          </div>
                      )}

                      <div className="space-y-3">
                          {exams.map(ex => (
                              <div key={ex.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand/30 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs">{ex.year}</div>
                                      <div><h4 className="font-bold text-sm text-white">{ex.subject}</h4><a href={ex.pdf_url} target="_blank" className="text-[10px] text-blue-400 hover:underline truncate max-w-[200px] block">{ex.pdf_url}</a></div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => { setEditingExamId(ex.id); setExamSubject(ex.subject); setExamYear(ex.year); setExamPdfUrl(ex.pdf_url); setShowExamForm(true); }} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg"><Edit size={14}/></button>
                                      <button onClick={async () => { if(confirm('حذف؟')) { await supabase.from('exams').delete().eq('id', ex.id); fetchData(); } }} className="p-2 bg-red-600/10 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'inbox' && (
                  <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                      <div className="flex bg-neutral-900/60 p-2 rounded-2xl border border-white/5 mb-8">
                          <button onClick={() => setInboxSubTab('consultations')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${inboxSubTab === 'consultations' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}>
                            المراجعة: استشارات مجابة (AI)
                          </button>
                          <button onClick={() => setInboxSubTab('admin_messages')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${inboxSubTab === 'admin_messages' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}>
                            رسائل الإدارة (يدوي)
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
                                  <div key={msg.id} className={`bg-neutral-900/40 p-6 rounded-[2.5rem] border transition-all ${!msg.is_replied ? 'border-brand shadow-xl' : 'border-white/5 opacity-80'}`}>
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
                                              </div>
                                          )}
                                      </div>

                                      {/* AI Reply Handling */}
                                      {inboxSubTab === 'consultations' && msg.is_replied && (
                                          <div className="space-y-4">
                                              <div className="bg-brand/5 p-4 rounded-2xl border border-brand/10">
                                                  <p className="text-[10px] text-brand font-black mb-2 uppercase flex items-center gap-2"><Sparkles size={12}/> الرد الآلي (AI):</p>
                                                  <p className="text-gray-300 text-xs font-bold leading-relaxed whitespace-pre-wrap">{msg.response}</p>
                                              </div>
                                              
                                              {correctingMsgId === msg.id ? (
                                                  <div className="space-y-3 animate-slideIn">
                                                      <textarea 
                                                          value={correctionText}
                                                          onChange={e => setCorrectionText(e.target.value)}
                                                          className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-brand h-24 text-white"
                                                          placeholder="اكتب التصحيح هنا..."
                                                      />
                                                      <div className="flex gap-2">
                                                          <button onClick={() => handleCorrectAiResponse(msg)} className="flex-1 py-3 bg-brand text-black rounded-xl font-black text-xs">حفظ وإرسال التصحيح</button>
                                                          <button onClick={() => setCorrectingMsgId(null)} className="px-6 py-3 bg-white/5 rounded-xl font-black text-xs text-gray-400">إلغاء</button>
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <button onClick={() => { setCorrectingMsgId(msg.id); setCorrectionText(msg.response || ''); }} className="text-brand text-xs font-black underline flex items-center gap-1 hover:text-white transition-colors">
                                                      <Edit size={12}/> تصحيح الإجابة (إشعار الطالب)
                                                  </button>
                                              )}
                                          </div>
                                      )}

                                      {/* Manual Reply Handling (General Messages) */}
                                      {inboxSubTab === 'admin_messages' && (
                                          msg.is_replied ? (
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
                                                      <Send size={14}/> إرسال الرد
                                                  </button>
                                              </div>
                                          )
                                      )}
                                  </div>
                              );
                          })}
                          {messages.length === 0 && <p className="text-center text-gray-500 text-xs py-10">البريد فارغ حالياً</p>}
                      </div>
                  </div>
              )}

              {/* ... (Other tabs: Notifications, Curriculum, etc. kept same) ... */}
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
                          {notifications.map(n => (
                              <div key={n.id} className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center"><div><h4 className="font-bold text-white text-sm">{n.title}</h4></div><button onClick={async () => { if(confirm('حذف الإشعار؟')) { await supabase.from('notifications').delete().eq('id', n.id); fetchData(); } }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={16}/></button></div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'curriculum' && (
                  <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                      {curriculum.map(c => (
                          <div key={c.id} className="bg-neutral-900/60 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                              <h4 className="font-bold text-white">{c.subject}</h4>
                              <div className="flex gap-2">
                                  <input type="text" defaultValue={c.last_lesson} onBlur={async (e) => { await supabase.from('curriculum_status').update({ last_lesson: e.target.value }).eq('id', c.id); window.addToast("تم التحديث", "success"); }} className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-brand" />
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {activeTab === 'platform_guide' && (
                  <div className="max-w-4xl mx-auto animate-fadeIn">
                      <div className="flex bg-neutral-900/60 p-1 rounded-2xl border border-white/5 mb-8">
                          <button onClick={() => setGuideSubTab('admin')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${guideSubTab === 'admin' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}>دليل الإدارة</button>
                          <button onClick={() => setGuideSubTab('technical')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${guideSubTab === 'technical' ? 'bg-brand text-black shadow-lg' : 'text-gray-500'}`}>المواصفات التقنية</button>
                      </div>
                      {guideSubTab === 'technical' ? (
                          <div className="grid gap-4">
                              {TECHNICAL_QUESTIONS.map((item, idx) => (
                                  <div key={idx} className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5">
                                      <h3 className="text-brand font-black text-sm mb-2">{item.q}</h3>
                                      <p className="text-gray-400 text-xs font-bold leading-relaxed">{item.a}</p>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <div className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5">
                                  <h3 className="text-white font-black text-sm mb-2">كيفية إضافة درس جديد؟</h3>
                                  <p className="text-gray-400 text-xs leading-relaxed">اذهب لتبويب "إضافة مادة"، اختر المادة والفصل والنوع. الصق النص الخام في المحرر، ثم اضغط "معالجة وتنسيق". سيقوم الذكاء الاصطناعي بتحويل النص إلى كتل تفاعلية يمكنك تعديلها قبل الحفظ.</p>
                              </div>
                              <div className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5">
                                  <h3 className="text-white font-black text-sm mb-2">كيفية إدارة الاستشارات؟</h3>
                                  <p className="text-gray-400 text-xs leading-relaxed">في تبويب "البريد الوارد"، ستجد قسم "المراجعة". هنا تظهر الأسئلة التي أجاب عليها الذكاء الاصطناعي نيابة عنك. يمكنك مراجعة الإجابة، وإذا وجدت خطأ، اضغط "تصحيح الإجابة" لتعديلها وإرسال إشعار للطالب.</p>
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