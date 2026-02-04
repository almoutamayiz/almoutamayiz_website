
import { MoneyTier, Question, User } from './types';

export const TEACHER_EMAILS: Record<string, string> = {
    'arabic': 'arabicadmin@almoutamayiz.com',
    'philosophy': 'philosophyadmin@almoutamayiz.com',
    'history': 'socialadmin@almoutamayiz.com',
    'geography': 'socialadmin@almoutamayiz.com'
};

export const PHILOSOPHER_IMAGES: Record<string, string> = {
  'سقراط': 'https://i.ibb.co/4wNYKS7R/IMG-20260108-WA0002.jpg',
  'أفلاطون': 'https://i.ibb.co/S47tksz8/IMG-20260108-WA0001.jpg',
  'افلاطون': 'https://i.ibb.co/S47tksz8/IMG-20260108-WA0001.jpg',
  'رينيه ديكارت': 'https://i.ibb.co/4wNYKS7R/IMG-20260108-WA0002.jpg',
  'ديكارت': 'https://i.ibb.co/4wNYKS7R/IMG-20260108-WA0002.jpg',
  'آلان': 'https://i.ibb.co/C5cqSgsL/IMG-20260108-WA0004.jpg',
  'إميل أوغست شارتييه': 'https://i.ibb.co/C5cqSgsL/IMG-20260108-WA0004.jpg',
  'أرسطو': 'https://i.ibb.co/rGyGBb4F/Aristotle-Altemps-Inv8575.jpg',
  'ارسطو': 'https://i.ibb.co/rGyGBb4F/Aristotle-Altemps-Inv8575.jpg',
  'جون لوك': 'https://i.ibb.co/39PS6KF5/IMG-20260108-WA0005.jpg',
  'لوك': 'https://i.ibb.co/39PS6KF5/IMG-20260108-WA0005.jpg',
  'جون ستيوارت ميل': 'https://i.ibb.co/k2msG06L/IMG-20260108-WA0006.jpg',
  'ستيوارت ميل': 'https://i.ibb.co/k2msG06L/IMG-20260108-WA0006.jpg',
  'ديفيد هيوم': 'https://i.ibb.co/Kz0M9t36/IMG-20260109-WA0000.jpg',
  'هيوم': 'https://i.ibb.co/Kz0M9t36/IMG-20260109-WA0000.jpg',
  'كورت كوفكا': 'https://i.ibb.co/Kz0M9t36/IMG-20260109-WA0000.jpg',
  'كوفكا': 'https://i.ibb.co/Kz0M9t36/IMG-20260109-WA0000.jpg',
  'فولفغانغ كوهلر': 'https://i.ibb.co/BHsWwDNB/IMG-20260109-WA0002.jpg',
  'كوهلر': 'https://i.ibb.co/BHsWwDNB/IMG-20260109-WA0002.jpg',
  'بول غيوم': 'https://i.ibb.co/C3Sh6MJv/IMG-20260109-WA0003.jpg',
  'إدموند هوسرل': 'https://i.ibb.co/pvqPXj2v/IMG-20260109-WA0005.jpg',
  'هوسرل': 'https://i.ibb.co/pvqPXj2v/IMG-20260109-WA0005.jpg',
  'موريس ميرلو بونتي': 'https://i.ibb.co/Kj16D6d6/IMG-20260109-WA0006-1.jpg',
  'ميرلوبونتي': 'https://i.ibb.co/Kj16D6d6/IMG-20260109-WA0006-1.jpg',
  'جان بياجي': 'https://i.ibb.co/hxm8B551/IMG-20260109-WA0007.jpg',
  'جون بياجي': 'https://i.ibb.co/hxm8B551/IMG-20260109-WA0007.jpg',
  'بياجي': 'https://i.ibb.co/hxm8B551/IMG-20260109-WA0007.jpg',
  'جورج فيلهلم فريدريش هيجل': 'https://i.ibb.co/RG9rQyqN/IMG-20260109-WA0008.jpg',
  'هيجل': 'https://i.ibb.co/RG9rQyqN/IMG-20260108-WA0008.jpg',
  'لويس لافيل': 'https://i.ibb.co/sMKMzBw/IMG-20260109-WA0010-1.jpg',
  'لافيل': 'https://i.ibb.co/sMKMzBw/IMG-20260109-WA0010-1.jpg',
  'هنري برغسون': 'https://i.ibb.co/rfHGQ1Kg/IMG-20260109-WA0011.jpg',
  'برغسون': 'https://i.ibb.co/rfHGQ1Kg/IMG-20260109-WA0011.jpg',
  'بول فاليري': 'https://i.ibb.co/s9f8QgBc/IMG-20260109-WA0012.jpg',
  'فاليري': 'https://i.ibb.co/s9f8QgBc/IMG-20260109-WA0012.jpg',
  'غاليليو غاليلي': 'https://i.ibb.co/jZPGB3dx/IMG-20260109-WA0013.jpg',
  'ڨاليلي ڨاليلو': 'https://i.ibb.co/jZPGB3dx/IMG-20260109-WA0013.jpg',
  'رومان جاكوبسون': 'https://i.ibb.co/LzWRbspy/IMG-20260109-WA0014.jpg',
  'جاكوبسون': 'https://i.ibb.co/LzWRbspy/IMG-20260109-WA0014.jpg',
  'أوغست كونت': 'https://i.ibb.co/RpjycXVM/IMG-20260109-WA0015-1.jpg',
  'أوغست كونط': 'https://i.ibb.co/RpjycXVM/IMG-20260109-WA0015-1.jpg',
  'كونت': 'https://i.ibb.co/RpjycXVM/IMG-20260109-WA0015-1.jpg',
  'جوليا كريستيفا': 'https://i.ibb.co/XfGWn9pQ/IMG-20260109-WA0016.jpg',
  'كريستيفا': 'https://i.ibb.co/XfGWn9pQ/IMG-20260109-WA0016.jpg',
  'إيمانويل كانت': 'https://i.ibb.co/d4t37MqC/IMG-20260109-WA0017.jpg',
  'إيمانويل كانط': 'https://i.ibb.co/d4t37MqC/IMG-20260109-WA0017.jpg',
  'كانط': 'https://i.ibb.co/d4t37MqC/IMG-20260109-WA0017.jpg',
  'كانت': 'https://i.ibb.co/d4t37MqC/IMG-20260109-WA0017.jpg',
  'سيغموند فرويد': 'https://i.ibb.co/p60HVs6s/IMG-20260109-WA0018.jpg',
  'فرويد': 'https://i.ibb.co/p60HVs6s/IMG-20260109-WA0018.jpg',
  'فيكتور دي بران': 'https://i.ibb.co/p60HVs6s/IMG-20260109-WA0018.jpg',
  'دي بران': 'https://i.ibb.co/p60HVs6s/IMG-20260109-WA0018.jpg',
  'هنري بوانكاريه': 'https://i.ibb.co/MkwvJWWN/IMG-20260109-WA0020.jpg',
  'بوانكاريه': 'https://i.ibb.co/MkwvJWWN/IMG-20260109-WA0020.jpg',
  'كارل ماركس': 'https://i.ibb.co/jvMbPXDy/IMG-20260109-WA0021-1.jpg',
  'ماركس': 'https://i.ibb.co/jvMbPXDy/IMG-20260109-WA0021-1.jpg',
  'إميل دوركايم': 'https://i.ibb.co/fYhRH4XT/IMG-20260109-WA0022.jpg',
  'دوركايم': 'https://i.ibb.co/fYhRH4XT/IMG-20260109-WA0022.jpg',
  'ابن خلدون': 'https://i.ibb.co/Xf8FXW5F/IMG-20260109-WA0023.jpg',
  'توماس هوبز': 'https://i.ibb.co/vxk47zTJ/IMG-20260109-WA0024.jpg',
  'هوبز': 'https://i.ibb.co/vxk47zTJ/IMG-20260109-WA0024.jpg',
  'ماركوس توليوس شيشرون': 'https://i.ibb.co/j9SVWGrX/IMG-20260109-WA0025.jpg',
  'شيشرون': 'https://i.ibb.co/j9SVWGrX/IMG-20260109-WA0025.jpg',
  'شرشرون': 'https://i.ibb.co/j9SVWGrX/IMG-20260109-WA0025.jpg',
  'باروخ سبينوزا': 'https://i.ibb.co/pjDNbLHF/IMG-20260109-WA0026.jpg',
  'سبينوزا': 'https://i.ibb.co/pjDNbLHF/IMG-20260109-WA0026.jpg',
  'شبينوزا': 'https://i.ibb.co/pjDNbLHF/IMG-20260109-WA0026.jpg',
  'مالك بن نبي': 'https://i.ibb.co/F4TjtYmx/IMG-20260109-WA0027.jpg',
  'الشاعر القروي': 'https://i.ibb.co/21hpQcBr/IMG-20260109-WA0028.jpg',
  'رابعة العدوية': 'https://i.ibb.co/JRqHxm2k/IMG-20260109-WA0029.jpg',
  'هنري مودسلي': 'https://i.ibb.co/ZR7ZyxQw/IMG-20260109-WA0030.jpg',
  'مودسلي': 'https://i.ibb.co/ZR7ZyxQw/IMG-20260109-WA0030.jpg',
  'جلال الدين السيوطي': 'https://i.ibb.co/VYSVGhnN/IMG-20260109-WA0031-1.jpg',
  'السيوطي': 'https://i.ibb.co/VYSVGhnN/IMG-20260109-WA0031-1.jpg',
  'آرثر شوبنهاور': 'https://i.ibb.co/zHZWm4CJ/IMG-20260109-WA0032.jpg',
  'شوبنهاور': 'https://i.ibb.co/zHZWm4CJ/IMG-20260109-WA0032.jpg',
  'جان بول سارتر': 'https://i.ibb.co/rRXc5L9G/IMG-20260109-WA0033.jpg',
  'sارتر': 'https://i.ibb.co/rRXc5L9G/IMG-20260109-WA0033.jpg',
  'جان جاك روسو': 'https://i.ibb.co/fVKWjb0r/IMG-20260108-WA0007.jpg',
  'روسو': 'https://i.ibb.co/fVKWjb0r/IMG-20260108-WA0007.jpg',
  'فريدريك نيتشه': 'https://i.ibb.co/CKGHD7xK/IMG-20260109-WA0034.jpg',
  'نيتشه': 'https://i.ibb.co/CKGHD7xK/IMG-20260109-WA0034.jpg',
  'سولي برودوم': 'https://i.ibb.co/m5PSG04D/IMG-20260109-WA0037.jpg',
  'برودوم': 'https://i.ibb.co/m5PSG04D/IMG-20260109-WA0037.jpg',
  'ميشال فوكو': 'https://i.ibb.co/ynD7X7YN/IMG-20260109-WA0038.jpg',
  'فوكو': 'https://i.ibb.co/ynD7X7YN/IMG-20260109-WA0038.jpg',
  'القديس أوغسطين': 'https://i.ibb.co/prjc694h/IMG-20260109-WA0039.jpg',
  'أوغسطين': 'https://i.ibb.co/prjc694h/IMG-20260109-WA0039.jpg',
  'تيودول ريبو': 'https://i.ibb.co/Txznkmyq/IMG-20260109-WA0040.jpg',
  'ريبو': 'https://i.ibb.co/Txznkmyq/IMG-20260109-WA0040.jpg',
  'ابن سينا': 'https://i.ibb.co/q3r7tQvx/IMG-20260109-WA0041.jpg',
  'بيار جاني': 'https://i.ibb.co/NhQtLrp/IMG-20260109-WA0042.jpg',
  'جاني': 'https://i.ibb.co/NhQtLrp/IMG-20260109-WA0042.jpg',
  'ابن رشد': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Averroes.jpg/220px-Averroes.jpg',
  'الغزالي': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Al_Ghazali.jpg/220px-Al_Ghazali.jpg',
  'باشلار': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Gaston_Bachelard_1962.jpg/220px-Gaston_Bachelard_1962.jpg'
};

export const DEFAULT_AVATARS = [
  "https://i.ibb.co/601CGSvj/IMG-20250715-134727.png",
  "https://i.ibb.co/whk1cFWb/IMG-20250715-134656.png",
  "https://i.ibb.co/qScjTrs/images-2.png",
  "https://i.ibb.co/jvx9kb7k/memoji-emoji-bel-homme-souriant-fond-blanc-826801-6987.png"
];

export const MONEY_LADDER: MoneyTier[] = [
  { level: 15, amount: "1,000,000", value: 1000000, isSafeHaven: true },
  { level: 14, amount: "500,000", value: 500000, isSafeHaven: false },
  { level: 13, amount: "250,000", value: 250000, isSafeHaven: false },
  { level: 12, amount: "125,000", value: 125000, isSafeHaven: false },
  { level: 11, amount: "64,000", value: 64000, isSafeHaven: false },
  { level: 10, amount: "32,000", value: 32000, isSafeHaven: true },
  { level: 9, amount: "16,000", value: 16000, isSafeHaven: false },
  { level: 8, amount: "8,000", value: 8000, isSafeHaven: false },
  { level: 7, amount: "4,000", value: 4000, isSafeHaven: false },
  { level: 6, amount: "2,000", value: 2000, isSafeHaven: false },
  { level: 5, amount: "1,000", value: 1000, isSafeHaven: true },
  { level: 4, amount: "500", value: 500, isSafeHaven: false },
  { level: 3, amount: "300", value: 300, isSafeHaven: false },
  { level: 2, amount: "200", value: 200, isSafeHaven: false },
  { level: 1, amount: "100", value: 100, isSafeHaven: false },
];

export const ALL_SUBJECTS_LIST = [
  { id: 'arabic', name: 'اللغة العربية' },
  { id: 'philosophy', name: 'الفلسفة' },
  { id: 'history', name: 'التاريخ' },
  { id: 'geography', name: 'الجغرافيا' },
  { id: 'islamic', name: 'العلوم الإسلامية' },
  { id: 'math', name: 'الرياضيات' },
  { id: 'english', name: 'اللغة الإنجليزية' },
  { id: 'french', name: 'اللغة الفرنسية' }
];

export const SUBJECT_SECTIONS_MAP: Record<string, { id: string; label: string; icon_key?: string }[]> = {
    'arabic': [
        { id: 'criticism', label: 'التقاويم النقدية' },
        { id: 'linguistic', label: 'البناء اللغوي' },
    ],
    'philosophy': [
        { id: 'philosophy_article', label: 'المقالات الفلسفية' },
    ],
    'history': [
        { id: 'lessons', label: 'الدروس' },
        { id: 'dates', label: 'التواريخ' },
        { id: 'characters', label: 'الشخصيات' },
        { id: 'terms', label: 'المصطلحات' },
    ],
    'geography': [
        { id: 'lessons', label: 'الدروس' },
        { id: 'terms', label: 'المصطلحات' },
        { id: 'maps', label: 'الخرائط (Maps)' },
    ],
    'math': [
        { id: 'math_law', label: 'القوانين' },
        { id: 'lessons', label: 'الدروس' },
    ],
    'english': [
        { id: 'lessons', label: 'Leçons (الدروس)' },
        { id: 'grammar', label: 'Grammar (القواعد)' },
        { id: 'terms', label: 'Vocabulary (مصطلحات)' },
    ],
    'french': [
        { id: 'lessons', label: 'Leçons (الدروس)' },
        { id: 'grammar', label: 'Grammaire (القواعد)' },
        { id: 'terms', label: 'Lexique (مصطلحات)' },
    ],
    'islamic': [
        { id: 'lessons', label: 'الدروس' },
        { id: 'definitions', label: 'المصطلحات' },
    ]
};

export const GAME_THEMES: Record<string, { icon: string; gradient: string; primaryColor: string; shadowColor: string }> = {
    'arabic': { icon: '📜', gradient: 'from-emerald-700 to-emerald-900', primaryColor: '#10b981', shadowColor: 'shadow-emerald-500/50' },
    'philosophy': { icon: '⚖️', gradient: 'from-purple-700 to-purple-900', primaryColor: '#a855f7', shadowColor: 'shadow-purple-500/50' },
    'history': { icon: '🏰', gradient: 'from-amber-700 to-amber-900', primaryColor: '#f59e0b', shadowColor: 'shadow-amber-500/50' },
    'geography': { icon: '🗺️', gradient: 'from-blue-700 to-blue-900', primaryColor: '#3b82f6', shadowColor: 'shadow-blue-500/50' },
    'default': { icon: '📚', gradient: 'from-neutral-700 to-neutral-900', primaryColor: '#71717a', shadowColor: 'shadow-neutral-500/50' }
};

// --- AI Prompts ---

export const GRAMMAR_PROMPT = `أنت أستاذ لغة عربية خبير في المنهاج الجزائري. قم بالإعراب فوراً وبشكل تقني مباشر دون أي مقدمات.

قواعد إعراب الجمل:
1. جمل لها محل:
- صفة، حال، خبر (لمبتدأ أو كان/إن)، مضاف إليه (بعد الظروف و "إذا").
- مفعول به: عادي (يريد الطالب أن ينجح) أو مقول القول (قال الطالب: سأنجح).
2. جمل لا محل لها:
- ابتدائية (تفتح فكرة جديدة)، اعتراضية (بين شرطتين)، تفسيرية (بعد أي، بمعنى)، استئنافية (امتداد لفكرة)، جواب شرط (بعد إذا، لولا، أما، لما)، جواب قسم، صلة موصول، معطوفة.

قواعد إعراب المفردات:
1. لولا / لوما:
- قبل المبتدأ: "حرف شرط غير جازم حرف امتناع لوجود مبني على السكون لا محل له من الاعراب". المبتدأ بعده: "مبتدأ لخبر محذوف وجوبا تقديره كائن أو موجود".
- قبل المضارع (تحضيض/عرض): "حرف شرط غير جازم حرف تحضيض/عرض مبني على السكون لا محل له من الاعراب".
- مع ضمير (لولاك): لولا حرف جر، الكاف ضمير متصل في محل جر اسم مجرور.
2. لو:
- قبل الماضي: "حرف شرط غير جازم حرف امتناع لامتناع مبني على السكون لا محل له من الاعراب".
- بعد فعل مصدري (يود لو..): "حرف شرط غير جازم حرف مصدري مبني على السكون لا محل له من الاعراب".
- للتقليل: "حرف شرط غير جازم حرف تقليل مبني على السكون لا محل له من الاعراب".
3. البدل: اسم معرف بال مرفوع بعد اسم الإشارة.
4. الحال والتمييز:
- التمييز: جامد، يزيل غموض (تفضيل، عدد، مساحة، كيل).
- الحال: مشتق، يصف هيئة، مؤقت، يمكن تحويله لجملة.
5. نون الوقاية: حرف مبني على الكسر لا محل له من الإإعراب. الياء بعدها مفعول به (مع الأفعال) أو اسم الحرف (مع إن وأخواتها).
6. إذا / إذ / حينئذ:
- إذا: ظرفية شرطية (ظرف لما يستقبل من الزمن.. مفعول فيه وهو مضاف)، فجائية (حرف فجاءة)، تفسيرية (حرف تفسير).
- إذ: ظرفية (ظرف لما مضى من الزمن.. مفعول فيه وهو مضاف)، فجائية، تعليلية.
- حينئذ: حين (ظرف زمان منصوب مفعول فيه وهو مضاف)، ئذ (ظرف لما مضى من الزمن مبني على السكون المقدر.. في محل جر مضاف إليه).
7. إما / أما:
- أما: حرف شرط وتفصيل وتوكيد. بعدها مرفوع (مبتدأ)، منصوب (مفعول به).
- إما: حرف تفصيل وتخيير. ما بعدها يعرب حسب موقعه.

الإعراب التقديري:
- ا / ى: منع من ظهورها التعذر.
- ي / و: منع من ظهورها الثقل.
- ياء المتكلم: منع من ظهورها اشتغال المحل بالحركة المناسبة لياء المتكلم.

ابدأ الإجابة بـ "إعراب:" فوراً.`;

export const RHETORIC_PROMPT = `أنت خبير بلاغة. حدد الصورة البيانية المطلوبة فوراً دون أي مقدمات أو كلام زائد.

التنسيق المطلوب للإجابة (والتزم به حرفياً):
- النوع: [اسم الصورة بدقة]
- الشرح: [شرح منهجي مختصر جداً]
- الأثر البلاغي: [تقوية المعنى وتوضيحه أو تشخيصه...]

ممنوع كتابة أي جمل افتتاحية مثل "بناءً على طلبك" أو "هذه هي الصورة". ابدأ بالنوع مباشرة.`;

export const ESSAY_CORRECTION_PROMPT = `أنت أستاذ مصحح فلسفة خبير. مهمتك تقييم مقالة الطالب بمقارنتها بـ "المرجع الرسمي" المرفق.

معايير التقييم الصارمة:
1- المطابقة المنهجية (90%): هل اتبع الطالب الخطوات المنهجية المطلوبة (جدلية، مقارنة، استقصاء، أو تحليل نص)؟ (مقدمة، عرض المواقف، نقد، تركيب، خاتمة).
2- المطابقة المعرفية: هل تدور المقالة حول الموضوع الصحيح? هل الحجج والأقوال المستعملة متوافقة مع الدرس الأصلي? (يُسمح للطالب باستخدام حجج إضافية صحيحة شرط عدم الخروج عن الموضوع).

سأزودك بـ:
- المرجع الرسمي (الدرس).
- مقالة الطالب.

المطلوب:
1. ملاحظات تفصيلية حول الأخطاء المنهجية أو المعرفية.
2. علامة تقديرية نهائية من 20.
3. كن دقيقاً جداً في التقييم.`;

export const PHILOSOPHER_PROMPT = `أنت أستاذ فلسفة خبير ومصحح في البكالوريا الجزائرية. مهمتك تحويل محتوى الدرس المرفق إلى مقالة فلسفية **ضخمة وتفصيلية**، مع الالتزام الصارم بالمنهجية التالية:

1. **المقدمة (طرح المشكلة) - البناء التدريجي:**
   - **التمهيد العام:** ابدأ بمدخل عام للموضوع في سطرين (الإطار العام).
   - **التمهيد الخاص:** انتقل للموضوع بخصيص في سطرين (الإطار الخاص).
   - **التعريف:** ضع تعريف الموضوع *كما هو في الدرس حرفياً* (ثابت).
   - **العناد الفلسفي:** أبرز الاختلاف بين الفلاسفة بوضوح.
   - **طرح الإشكال:** صغ السؤال بدقة.

2. **التحليل (محاولة حل المشكلة) - التوسع الأقصى:**
   - **قاعدة ذهبية:** اشرح كل حجة شرحاً مفصلاً ومملاً. لا تختصر أبداً.
   - تعامل مع كل فكرة فيلسوف وكأنك تشرحها لطالب مبتدئ (أسلوب المعلم الذكي).
   - **الأمثلة والقصص:** إذا وردت قصة أو مثال في الدرس، اكتبها كاملة ولا تكتفِ بالإشارة إليها.
   - **الأقوال:** ضع القول، ثم اشرحه، ثم بين مغزاه.
   - يجب أن يكون حجم "عرض الحجج" ضخماً جداً مقارنة بباقي الأجزاء.

3. **النقد والمناقشة - التسلسل المنهجي:**
   - **النقد الإيجابي (التثمين):** ابدأ أولاً بذكر صحة الموقف وقوته في سطرين (نعم، لقد أصابوا في...).
   - **الانتقال الانسيابي:** انتقل بذكاء (لكن، ورغم ذلك...) إلى النقد السلبي.
   - **النقد السلبي:** اذكر عيوب الموقف والمبالغات كما وردت في الدرس.

4. **الخاتمة (حل المشكلة):**
   - **ممنوع منعاً باتاً إنهاء الخاتمة بسؤال.** هذا خطأ منهجي فادح.
   - الخاتمة هي "حل للنزاع" وتأكيد لما ورد في التركيب.
   - يجب أن تنتهي الخاتمة بحكم نهائي أو استنتاج يؤكد الترابط أو التغليب أو التجاوز المذكور سابقاً.
   - استنتاج ينسجم مع التحليل والتركيب الموجود في الدرس.

المرجع الأساسي هو النص المرفق. لا تأتِ بمعلومات من خارج الدرس إلا للضرورة القصوى للربط اللغوي.`;

export const LESSON_FORMAT_PROMPT = `أنت خبير تدوين دروس تعليمية. قم بتحويل النص الملصق إلى قائمة JSON من الكتل (Blocks).
تحذير هام جداً وقواعد صارمة للتنسيق:
1. ميز بين "التعريف" و "الشرح العادي": التعريف هو وصف محدد لمصطلح، ضعه في نوع (term_entry). الشرح العام أو التحليل ضعه في نوع (paragraph).
2. ميز بين "العنصر" و "العنوان الفرعي": إذا كان النص طويلاً أو يمثل فكرة فرعية كبرى، ضعه في نوع (subtitle). إذا كان نقطة ضمن قائمة أو شرحاً بسيطاً، ضعه في نوع (paragraph).
3. تنسيق القوائم والعناصر: إذا احتوت الفقرة على عناصر مرقمة (مثل 1-، 2-) أو نقاط، يجب حتماً وضع كل عنصر في سطر جديد داخل الكتلة باستخدام رمز (\\n). لا تضع العناصر بجانب بعضها البعض أبداً بشكل أفقي.
4. الأنواع المسموحة: 
   - title (العنوان الأكبر للموضوع - لون بنفسجي فاخر #a855f7).
   - subtitle (عنوان فرعي - لون أصفر #ffc633).
   - term_entry (مصطلح مع تعريف - يظهر في بطاقة زجاجية).
   - paragraph (عناصر، شرح، أو نقاط - لون رمادي فضي #c0c0c0).

بنية الـ JSON المطلوبة: [{"type": "title", "text": "..."}]`;

export const MATH_FORMAT_PROMPT = `أنت خبير في هيكلة دروس الرياضيات. قم بتحويل النص الملصق إلى هيكلية JSON من نوع (math_series).
قواعد هامة جداً للقوانين الرياضية:
1. أي قانون أو صيغة رياضية يجب أن تكتب بلغة LaTeX حصراً وتوضع بين علامتي دولار مزدوجة $$...$$.
2. استخدم: \\frac{a}{b} للكسور، \\sqrt{x} للجذور، x^{n} للأسس، \\lim_{x \\to \\infty} للنهايات، u_{n} للمتتاليات.
3. تأكد من أن الرموز تظهر بشكل احترافي ومنظم.
4. التقسيم يكون إلى أجزاء (parts)، كل جزء له عنوان ورابط فيديو وشرح.

بنية الـ JSON المطلوبة:
{
  "type": "math_series",
  "parts": [
    { "title": "عنوان الفقرة", "video_url": "رابط يوتيوب", "description": "الشرح مع القوانين بصيغة LaTeX" }
  ]
}`;

export const PHILOSOPHY_ARTICLE_PROMPT = `أنت خبير منهجية فلسفية. قم بتحويل النص إلى هيكلية مقالة JSON دقيقة تتبع المنهجية الجدلية (الافتراضية).

يجب أن تتضمن الهيكلية:
- المقدمة (problem): تمهيد شامل، تعريف ذكي، العناد الفلسفي، وصياغة الإشكال.
- المواقف (positions): 
  1. الموقف الأول: مسلمات، فلاسفة (اسم، جنسية، فكرة، قول، مثال)، ونقد الموقف (شكلاً ومضموناً).
  2. الموقف الثاني: مسلمات، فلاسفة (اسم، جنسية، فكرة، قول، مثال)، ونقد الموقف.
- التركيب (synthesis): الترابط، الجمع، أو التجاوز.
- الخاتمة (conclusion): خلاصة المقال، الرأي الشخصي، وفتح آفاق بسؤال جديد.

المطلوب JSON بهذا الشكل:
{
  "type": "philosophy_structured",
  "problem": "...",
  "positions": [
    {
      "title": "الموقف الأول",
      "theories": [{ "philosophers": [{"name": "...", "nationality": "...", "idea": "...", "quote": "...", "example": "..."}] }],
      "critique": "نقد الموقف الأول..."
    },
    {
      "title": "الموقف الثاني",
      "theories": [{ "philosophers": [{"name": "...", "nationality": "...", "idea": "...", "quote": "...", "example": "..."}] }],
      "critique": "نقد الموقف الثاني..."
    }
  ],
  "synthesisType": "reconciliation",
  "synthesis": "...",
  "conclusion": "..."
}`;

export const PHILOSOPHY_TEXT_ANALYSIS_PROMPT = `أنت خبير منهجية تحليل النصوص الفلسفية. قم بتحليل النص المرفق وتحويله إلى هيكلية JSON دقيقة تتبع المنهجية الجزائرية الموضحة في القواعد التالية حرفياً:

1. التمهيد (tamheed): الإنسان فضولي بطبعه... ذكر اسم الإشكالية، موضوع النص، تعريفه، وصاحب النص.
2. التعريف بصاحب النص (authorInfo): مف مفكر (عربي/غربي/مسلم)، ذكر المؤلفات والكتاب المأخوذ منه النص.
3. السياق الفلسفي والتاريخي (context): تحديد المجال (المعرفة/القيم/الوجود)، وذكر الدوافع التاريخية (جدال/صراع/إيضاح).
4. طرح السؤال (question): صياغة تساؤل بناءً على الإجابة الموجودة في السطر 1 أو 2.
5. موقف صاحب النص (authorPosition): شرح الموقف بأسلوب خاص دقيق، مع ذكر عبارة دالة من النص في الأسطر الأربعة الأولى.
6. الحجج والبراهين (arguments): قائمة بالحجج مع تحديد نوعها (عقلية/واقعية/منطقية/تاريخية) وشرح كل حجة.
7. التقييم والنقد (evaluation): ذكر نقاط التوفيق (الموافقة) ثم النقد (المبالغة/الإهمال) مع ذكر فلاسفة معارضين.
8. الرأي الشخصي (personalOpinion): فكرة عامة موضوعية ثم الرأي الشخصي المعلل.
9. الخاتمة (conclusion): خلاصة تحليلية تجيب على السؤال المطروح.

المطلوب JSON بهذا الشكل:
{
  "type": "philosophy_text_analysis",
  "tamheed": { "problemName": "...", "topic": "...", "definition": "...", "authorName": "..." },
  "authorInfo": { "origin": "...", "bookSource": "..." },
  "context": { "philosophicalType": "...", "motives": "..." },
  "question": "...",
  "authorPosition": { "explanation": "...", "quoteFromText": "..." },
  "arguments": [ { "content": "...", "explanation": "...", "type": "..." } ],
  "evaluation": { "successPoints": "...", "weakPoints": "...", "opposingPhilosophers": ["...", "..."] },
  "personalOpinion": { "generalIdea": "...", "myView": "..." },
  "conclusion": "..."
}`;

export const PHILOSOPHY_SUMMARIZATION_PROMPT = `حول النص إلى قائمة JSON من 10 أزواج (left, right) تصلح للمطابقة.
بصيغة: [{"id": "1", "left": "...", "right": "..."}]`;

export const PRIVACY_POLICY = `سياسة الخصوصية وشروط الاستخدام - تطبيق المتميز التعليمي

مرحباً بك في تطبيق "المتميز التعليمي". نحن نولي خصوصيتك وحماية بياناتك أهمية قصوى. تهدف هذه الوثيقة إلى توضيح الشروط القانونية لاستخدام التطبيق وكيفية تعاملنا مع معلوماتك بما يتوافق مع معايير متجر Google Play والقوانين الدولية حماية البيانات.

1. حقوق الملكية الفكرية ( Intellectual Property):
- جميع المحتويات المتوفرة في هذا التطبيق، بما في ذلك على سبيل المثال لا الحصر: (النصوص البرمجية، التصاميم الواجهية، ملخصات الدروس المنهجية، الخرائط التعليمية، الأسئلة، الخوارزميات الذكية، والشعارات) هي ملكية حصرية وحقوق طبع ونشر محفوظة لمالك التطبيق والمطور (GH.A).
- يمنع منعاً باتاً نسخ، أو إعادة نشر، أو تعديل، أو هندسة عكسية، أو بيع، أو استخدام أي جزء من المحتوى خارج إطار الاستخدام الشخصي التعليمي دون إذن خطي مسبق من المالك.
- أي محاولة لسرقة المحتوى أو استغلاله تجارياً ستعرض صاحبها للملاحقة القانونية وإغلاق الحساب بشكل نهائي.

2. جمع البيانات واستخدامها:
- نجمع الحد الأدنى من البيانات الضرورية لتوفير تجربة تعليمية مخصصة، مثل (الاسم، البريد الإلكتروني، والصورة الرمزية).
- يتم استخدام هذه البيانات حصراً لتحسين أدائك الدراسي، وتتبع تقدمك في الدروس، وربطك بمجتمع المتميز والأساتذة.
- نحن لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة لأغراض تسويقية.

3. حماية المستخدمين (Data Protection):
- نستخدم بروتوكولاًت تشفير متقدمة لحماية بياناتك من الوصول غير المصرح به.
- يتم تخزين البيانات بشكل آمن عبر خدمات سحابية عالمية (مثل Supabase) تتبع أعلى معايير الأمان الرقمي.

4. الخدمات الخارجية والذكاء الاصطناعي:
- يستخدم التطبيق تقنيات متطورة لمعالجة النصوص وتقديم شروحات ذكية. باستخدامك لهذه الميزات، أنت تدرك أن هذه التقنيات هي أدوات مساعدة ولا تعوض المراجعة المنهجية الرسمية.

5. شروط الاستخدام والسلوك العام:
- يلتزم المستخدم بسلوك لائق داخل قسم "المجتمع" والاستشارات؛ يمنع نشر محتوى غير أخلاقي، سياسي، أو تحريضي.
- يحق للإدارة حظر أي حساب ينتهك شروط الاستخدام أو يحاول العبث بأمن التطبيق.

6. إخلاء المسؤولية:
- تطبيق المتميز هو أداة تعليمية تكميلية؛ المالك غير مسؤول عن النتائج الدراسية النهائية للطلاب، حيث يعتمد النجاح على مجهود الطالب الشخصي واتباع المنهجيات الرسمية.

7. التغييرات في السياسة:
- يحق لنا تحديث هذه السياسة دورياً لمواكبة التغييرات التقنية أو القانونية. سيتم إشعارك داخل التطبيق عند حدوث أي تحديث جوهري.

باستخدامك لتطبيق المتميز التعليمي، أنت تقر بقراءتك لهذه الشروط وموافقتك الكاملة عليها.
تاريخ التحديث: جانفي 2026`;
