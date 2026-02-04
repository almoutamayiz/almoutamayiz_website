
import React from 'react';
import { 
    ArrowRight, BookOpen, BrainCircuit, Gamepad2, Users, GraduationCap, 
    Calculator, Ticket, Sparkles, PenTool, FileText, Palette, Search,
    Layout, CheckCircle2, ChevronLeft, Map, PlayCircle, Trophy, Zap
} from 'lucide-react';

interface UserGuideProps {
    onBack: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onBack }) => {
    const sections = [
        {
            title: 'الأدوات الذكية (AI)',
            icon: BrainCircuit,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            steps: [
                { name: 'المعرب الذكي', path: 'الرئيسية ← ركن الأدوات ← المعرب', desc: 'لإعراب الجمل والمفردات منهجياً.' },
                { name: 'منشئ المقالات', path: 'الدروس ← فلسفة ← ركن الذكاء الاصطناعي', desc: 'لتحويل المعلومات إلى مقال فلسفي متكامل.' },
                { name: 'المصحح المنهجي', path: 'الرئيسية ← المصحح المنهجي', desc: 'قارن مقالك بالدرس الرسمي واحصل على علامة.' },
                { name: 'الصور البيانية', path: 'الرئيسية ← الصور البيانية', desc: 'تحديد نوع الصورة البيانية وشرح أثرها البلاغي.' }
            ]
        },
        {
            title: 'الدروس والملخصات',
            icon: BookOpen,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            steps: [
                { name: 'تصفح المواد', path: 'شريط التنقل ← الدروس ← اختر المادة', desc: 'ملخصات منظمة في شكل بطاقات تفاعلية.' },
                { name: 'بنك المواضيع', path: 'الدروس ← المادة ← بنك المواضيع', desc: 'تحميل مواضيع البكالوريا الرسمية بصيغة PDF.' },
                { name: 'مؤشر الإنجاز', path: 'داخل قائمة الدروس ← دائرة الإكمال', desc: 'اضغط على الدائرة بجانب أي درس لتمييزه كـ "تمت المراجعة".' }
            ]
        },
        {
            title: 'ساحة الألعاب',
            icon: Gamepad2,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            steps: [
                { name: 'تحدي المليون', path: 'شريط التنقل ← الألعاب ← رحلة البكالوريا', desc: 'مسابقة الـ 15 سؤالاً المنهجية لترسيخ المعلومات.' },
                { name: 'لعبة المطابقة', path: 'شريط التنقل ← الألعاب ← تحدي الذاكرة', desc: 'اربط بين التواريخ، الشخصيات، والمفاهيم بسرعة.' }
            ]
        },
        {
            title: 'المجتمع والأساتذة',
            icon: Users,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            steps: [
                { name: 'غرف النقاش', path: 'شريط التنقل ← المجتمع ← اختر المادة', desc: 'ناقش زملاءك في مادة محددة داخل شات حي.' },
                { name: 'طلب استشارة', path: 'شريط التنقل ← الأساتذة ← طلب استشارة', desc: 'اطرح سؤالاً مع صورة وسيجيبك أستاذ متخصص.' }
            ]
        },
        {
            title: 'المسابقات والجوائز',
            icon: Trophy,
            color: 'text-brand',
            bg: 'bg-brand/10',
            steps: [
                { name: 'نظام الإحالات', path: 'الملف الشخصي ← نظام الإحالات', desc: 'ادعُ أصدقاءك بكودك الخاص لتحصل على 50 نقطة.' },
                { name: 'المسابقة الكبرى', path: 'داخل صفحة الإحالات ← لائحة الأوائل', desc: 'صاحب أعلى XP سيفوز بجائزة كبرى يوم النتائج.' }
            ]
        }
    ];

    return (
        <div className="h-full overflow-y-auto bg-black text-white p-4 sm:p-6 animate-fadeIn pb-32 font-cairo custom-scrollbar scroll-container">
            <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
                <button onClick={onBack} className="p-3 bg-neutral-900 rounded-2xl hover:bg-white/5 transition-all border border-white/5 active:scale-90">
                    <ArrowRight size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-white uppercase tracking-widest">مرشد المتميز</h1>
                    <p className="text-[9px] text-brand font-bold uppercase tracking-widest mt-1">كيف تستغل المنصة للنجاح؟</p>
                </div>
                <div className="w-12"></div>
            </div>

            <div className="max-w-2xl mx-auto space-y-10">
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <div key={idx} className="animate-slideIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className={`p-2.5 rounded-xl ${section.bg} ${section.color} border border-white/5`}>
                                    <Icon size={20} />
                                </div>
                                <h2 className="text-lg font-black text-white">{section.title}</h2>
                            </div>

                            <div className="grid gap-3">
                                {section.steps.map((step, sIdx) => (
                                    <div key={sIdx} className="bg-neutral-900/40 border border-white/5 rounded-3xl p-5 hover:border-white/20 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-black text-sm text-gray-200 group-hover:text-brand transition-colors">{step.name}</h3>
                                            <div className="bg-black/40 px-2 py-0.5 rounded text-[8px] font-black text-gray-500 uppercase tracking-tighter">خطوات الوصول</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-brand font-black mb-3 bg-brand/5 p-2 rounded-xl border border-brand/10">
                                            <Search size={12} />
                                            <span>{step.path}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="bg-gradient-to-br from-brand/20 to-neutral-900 p-8 rounded-[2.5rem] border border-brand/30 text-center shadow-xl">
                    <Zap className="text-brand mx-auto mb-4" size={32} fill="currentColor" />
                    <h3 className="text-lg font-black text-white mb-2">هل لديك سؤال آخر؟</h3>
                    <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">إذا لم تجد ما تبحث عنه في الدليل، يمكنك دائماً مراسلة الإدارة عبر "تواصل معنا" في الصفحة الرئيسية.</p>
                    <button onClick={onBack} className="w-full py-4 bg-brand text-black font-black rounded-2xl shadow-lg active:scale-95 transition-all">بدء الاستخدام الآن</button>
                </div>
            </div>
        </div>
    );
};

export default UserGuide;
