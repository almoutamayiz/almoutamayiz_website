
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const SortingGameSelectionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="p-6">
            <button onClick={onBack} className="p-3 bg-neutral-900 rounded-xl mb-10"><ArrowLeft /></button>
            <h1 className="text-2xl font-black text-center">اختر مسار الترتيب الزمني</h1>
        </div>
    );
};

export default SortingGameSelectionScreen;
