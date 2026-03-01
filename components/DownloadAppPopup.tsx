
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface DownloadAppPopupProps {
    currentTab: string;
    user: User | null;
}

const DownloadAppPopup: React.FC<DownloadAppPopupProps> = ({ currentTab, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastUserId, setLastUserId] = useState<string | null>(null);
    
    const DOWNLOAD_URL = "https://www.mediafire.com/file/50co5p4tpizd7ch/almoutamayiz.apk/file";
    const LOGO_URL = "https://i.ibb.co/XfH1FghM/IMG-20260111-172954.jpg";

    useEffect(() => {
        if (user && user.id !== lastUserId) {
            // New login detected
            setLastUserId(user.id);
            setIsOpen(true);
            // Reset session flag for new user
            sessionStorage.removeItem('popup_shown_session');
        }
    }, [user, lastUserId]);

    useEffect(() => {
        if (currentTab === 'home') {
            // 1. التحقق من الجلسة الحالية
            const hasShownThisSession = sessionStorage.getItem('popup_shown_session');
            
            // 2. التحقق من عدد الزيارات الإجمالي
            const rawCount = localStorage.getItem('home_visit_count');
            let count = rawCount ? parseInt(rawCount, 10) : 0;
            count += 1;
            localStorage.setItem('home_visit_count', count.toString());

            let shouldShow = false;

            if (!hasShownThisSession) {
                shouldShow = true;
                sessionStorage.setItem('popup_shown_session', 'true');
            } else if (count % 7 === 0) {
                shouldShow = true;
            }

            if (shouldShow) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentTab]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative"
                >
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl mb-6 border-2 border-brand/20">
                            <img src={LOGO_URL} alt="almoutamayiz" className="w-full h-full object-cover" />
                        </div>
                        
                        <h2 className="text-2xl font-black text-white mb-2">almoutamayiz</h2>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8">
                            للحصول على تجربة أسرع وأفضل، قم بتحميل تطبيق المنصة الرسمي على هاتفك الآن!
                        </p>

                        <div className="space-y-3 w-full">
                            <a 
                                href={DOWNLOAD_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-brand text-black rounded-2xl font-black shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Download size={20} />
                                <span>تحميل التطبيق (APK)</span>
                            </a>
                            
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 text-gray-500 text-xs font-bold hover:text-white transition-colors"
                            >
                                ربما لاحقاً، سأكمل عبر المتصفح
                            </button>
                        </div>
                    </div>

                    <div className="bg-brand/5 p-4 flex items-center justify-center gap-2 border-t border-white/5">
                        <Smartphone size={14} className="text-brand" />
                        <span className="text-[10px] text-brand font-black uppercase tracking-widest">متوفر الآن للأندرويد</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DownloadAppPopup;
