
import React from 'react';
import { X, ShieldCheck, ScrollText } from 'lucide-react';
import { PRIVACY_POLICY } from '../constants';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fadeIn">
            <div className="bg-neutral-900 w-full max-w-2xl max-h-[85vh] rounded-[3rem] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand/20 rounded-2xl text-brand">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">سياسة الخصوصية</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">شروط الاستخدام الموحدة</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5 mb-6">
                            <div className="flex items-center gap-3 text-brand mb-4">
                                <ScrollText size={18} />
                                <span className="font-black text-sm uppercase">اتفاقية المستخدم</span>
                            </div>
                            <pre className="whitespace-pre-wrap font-cairo text-sm leading-loose text-gray-300 text-right">
                                {PRIVACY_POLICY}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-black/40 border-t border-white/5">
                    <button onClick={onClose} className="w-full py-4 bg-brand text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        فهمت وأوافق على هذه الشروط
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
