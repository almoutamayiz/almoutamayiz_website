
import React, { useEffect, useState } from 'react';
import { User, PointHistoryItem } from '../types';
import { ArrowRight, History, Zap, Calendar, Gamepad2, BookOpen, Star } from 'lucide-react';

interface PointsHistoryScreenProps {
    user: User;
    onBack: () => void;
}

const PointsHistoryScreen: React.FC<PointsHistoryScreenProps> = ({ user, onBack }) => {
    const [history, setHistory] = useState<PointHistoryItem[]>([]);

    useEffect(() => {
        const key = `points_log_${user.id}`;
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load history");
        }
    }, [user.id]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'bonus': return <Star size={18} className="text-yellow-400" />;
            case 'game': return <Gamepad2 size={18} className="text-purple-400" />;
            case 'lesson': return <BookOpen size={18} className="text-green-400" />;
            default: return <Zap size={18} className="text-blue-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 animate-fadeIn pb-20">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-3 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors border border-neutral-800 active:scale-95">
                    <ArrowRight size={20} />
                </button>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">سجل النقاط</h1>
                <div className="w-12"></div>
            </div>

            <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-neutral-900 to-black p-6 rounded-3xl border border-neutral-800 shadow-2xl mb-6 text-center">
                    <p className="text-gray-400 text-sm mb-1">الرصيد الحالي</p>
                    <h2 className="text-4xl font-black text-white flex justify-center items-center gap-2">
                        {user.totalEarnings} <Zap className="text-yellow-500 fill-yellow-500" />
                    </h2>
                </div>

                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>لا يوجد سجل للنقاط بعد.</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between hover:bg-neutral-800 transition-colors animate-slideIn">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shadow-inner">
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-gray-200">{item.reason}</span>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(item.date).toLocaleDateString('en-GB')} - {new Date(item.date).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-green-400 text-lg">+{item.amount}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PointsHistoryScreen;
