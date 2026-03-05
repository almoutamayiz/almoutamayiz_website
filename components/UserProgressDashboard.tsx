import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { User, LessonBlock, PhilosophyStructuredContent } from '../types';
import { ALL_SUBJECTS_LIST } from '../constants';
import { initGemini } from '../lib/gemini';
import { Loader2, Award, BrainCircuit, BookOpen, ArrowRight } from 'lucide-react';

interface ProgressStats {
  [subjectId: string]: {
    completed: number;
    total: number;
    name: string;
    color: string;
  };
}

const getTrackableIdsCount = (content: string): number => {
    try {
        const parsed = JSON.parse(content);
        if (parsed.type === 'philosophy_structured') {
            const philoContent = parsed as PhilosophyStructuredContent;
            let count = 3;
            philoContent.positions.forEach((pos) => {
                count++;
                if (pos.critique) count++;
                pos.theories.forEach(theory => { count += theory.philosophers.length; });
            });
            return count;
        } else {
            const blocks: LessonBlock[] = Array.isArray(parsed) ? parsed : parsed.blocks || [];
            return blocks.length;
        }
    } catch (e) { return 0; }
};

const CircularProgress: React.FC<{ percentage: number; color: string }> = ({ percentage, color }) => {
    const sqSize = 140;
    const strokeWidth = 12;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * percentage) / 100;
  
    return (
      <div className="relative" style={{ width: sqSize, height: sqSize }}>
        <svg width={sqSize} height={sqSize} viewBox={viewBox}>
          <circle className="fill-none stroke-white/5" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} />
          <circle
            className="fill-none transition-all duration-1000 ease-in-out"
            stroke={color}
            cx={sqSize / 2} cy={sqSize / 2} r={radius}
            strokeWidth={`${strokeWidth}px`} transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
            style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{`${Math.round(percentage)}%`}</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">منجز</span>
        </div>
      </div>
    );
};

interface UserProgressDashboardProps {
    user: User;
    onBack: () => void;
}
  
const UserProgressDashboard: React.FC<UserProgressDashboardProps> = ({ user, onBack }) => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [aiAdvice, setAiAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);

  const subjectColors: Record<string, string> = {
    arabic: '#22c55e', philosophy: '#a855f7', history: '#f97316',
    geography: '#3b82f6', islamic: '#14b8a6', math: '#06b6d4',
    english: '#ef4444', french: '#6366f1',
  };

  useEffect(() => {
    const fetchAllProgress = async () => {
      setLoading(true);
      const { data: progressData } = await supabase.from('user_progress').select('subject, sub_item_id, item_id, item_type').eq('user_id', user.id);
      const completedCounts = (progressData || []).reduce((acc, item) => {
        if (item.subject) acc[item.subject] = (acc[item.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const { data: allLessons } = await supabase.from('lessons_content').select('section_id, content');
      const { data: allExams } = await supabase.from('exams').select('subject');

      const totalCounts: Record<string, number> = {};
      (allLessons || []).forEach(lesson => {
          const subjectId = lesson.section_id.split('_')[0];
          if (subjectId) totalCounts[subjectId] = (totalCounts[subjectId] || 0) + getTrackableIdsCount(lesson.content);
      });
      const subjectNameToId = ALL_SUBJECTS_LIST.reduce((acc, sub) => { acc[sub.name] = sub.id; return acc; }, {} as Record<string, string>);
      (allExams || []).forEach(exam => {
          const subjectId = subjectNameToId[exam.subject];
          if (subjectId) totalCounts[subjectId] = (totalCounts[subjectId] || 0) + 1;
      });

      const finalStats: ProgressStats = {};
      ALL_SUBJECTS_LIST.forEach(subject => {
        const total = totalCounts[subject.id] || 0;
        if (total > 0) {
          finalStats[subject.id] = {
            completed: completedCounts[subject.id] || 0,
            total: total,
            name: subject.name,
            color: subjectColors[subject.id] || '#71717a',
          };
        }
      });
      setStats(finalStats);
      setLoading(false);
    };
    fetchAllProgress();
  }, [user.id]);

  useEffect(() => {
    const getAdvice = async () => {
      if (!stats || Object.keys(stats).length === 0) return;
      setLoadingAi(true);
      let summary = "بيانات تقدم الطالب:\n";
      let totalProgress = 0; let totalItems = 0;
      for (const subjectId in stats) {
        const { completed, total, name } = stats[subjectId];
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        summary += `- ${name}: ${completed}/${total} (${Math.round(percentage)}%)\n`;
        totalProgress += completed; totalItems += total;
      }
      const overallPercentage = totalItems > 0 ? (totalProgress / totalItems) * 100 : 0;
      if (overallPercentage < 5) {
        setAiAdvice("ابدأ رحلتك الدراسية الآن! استطلع الدروس وحدد ما تنجزه لنرسم لك خطة نجاح ذكية عبر تطبيق المتميز.");
        setLoadingAi(false);
        return;
      }
      const prompt = `أنت مستشار دراسي ذكي ومحفز للطلاب في تطبيق "المتميز". بناءً على بيانات التقدم التالية، قدم نصيحة موجزة في 3 نقاط حول المواد التي تتطلب تركيزاً أكبر. كن مشجعاً. ${summary}`;
      try {
        const aiInstance = initGemini();
        const response = await aiInstance.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        setAiAdvice(response.text || 'ركز على الدروس المتبقية لتحقيق أفضل النتائج.');
      } catch (error) { setAiAdvice('استمر في التقدم، أنت تبلي بلاءً حسناً مع المتميز.'); }
      finally { setLoadingAi(false); }
    };
    if (!loading) getAdvice();
  }, [stats, loading]);

  const overallProgress = useMemo(() => {
    if (!stats) return { completed: 0, total: 0, percentage: 0 };
    const completed = Object.keys(stats).reduce((sum, id) => sum + (stats as ProgressStats)[id].completed, 0);
    const total = Object.keys(stats).reduce((sum, id) => sum + (stats as ProgressStats)[id].total, 0);
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black">
        <Loader2 className="w-16 h-16 animate-spin text-brand mb-6" />
        <p className="text-xl font-black text-gray-400">جاري تحليل مسارك الدراسي...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 animate-fadeIn pb-32">
      <div className="flex items-center justify-between mb-10 max-w-4xl mx-auto">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 active:scale-90"><ArrowRight size={24} /></button>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 uppercase tracking-widest">لوحة الإنجاز</h1>
          <div className="w-12"></div>
      </div>

      <div className="space-y-10 max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 text-center border border-white/10 shadow-[0_0_80px_rgba(20,184,166,0.1)] relative overflow-hidden">
            <h2 className="text-4xl font-black text-white mb-4">تقدمك الدراسي الشامل</h2>
            <div className="mt-8 bg-black/40 p-8 rounded-[2rem] border border-brand/20 inline-block px-12 shadow-2xl">
                <p className="text-6xl font-black text-brand font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,198,51,0.3)]">{Math.round(overallProgress.percentage)}%</p>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest">{overallProgress.completed} عنصر منجز</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats && Object.entries(stats).map(([id, data]) => {
                const d = data as ProgressStats[string];
                return (
                <div key={id} className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-all group active:scale-95 shadow-xl">
                    <CircularProgress percentage={d.total > 0 ? (d.completed / d.total) * 100 : 0} color={d.color} />
                    <h4 className="font-black text-white text-xl mt-6 group-hover:text-brand transition-colors">{d.name}</h4>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">{d.completed} من {d.total}</p>
                </div>
            )})}
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border-r-8 border-teal-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl"></div>
            <h3 className="font-black text-2xl text-teal-400 mb-6 flex items-center gap-3"><BrainCircuit size={28} /> نصيحة المتميز</h3>
            {loadingAi ? (
                <div className="flex items-center gap-3 text-gray-500 font-bold"><Loader2 className="w-5 h-5 animate-spin" /> جاري التحليل...</div>
            ) : (
                <div className="text-gray-200 text-lg leading-relaxed whitespace-pre-line font-medium">{aiAdvice}</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProgressDashboard;