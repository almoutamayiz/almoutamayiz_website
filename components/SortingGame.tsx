
import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, CheckCircle, Clock } from 'lucide-react';

const SortingGame: React.FC = () => {
    return (
        <div className="p-10 text-center bg-neutral-900 rounded-[2rem] border border-white/10 animate-fadeIn">
            <Clock size={48} className="mx-auto text-brand mb-4" />
            <h2 className="text-xl font-black text-white">لعبة الترتيب الزمني</h2>
            <p className="text-gray-500 text-sm mt-2">هذه اللعبة قيد التطوير حالياً، انتظرونا في التحديث القادم!</p>
        </div>
    );
};

export default SortingGame;
