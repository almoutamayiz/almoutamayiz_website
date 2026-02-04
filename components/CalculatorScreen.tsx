
import React, { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface CalculatorScreenProps {
  onBack: () => void;
}

const BAC_SUBJECTS = [
  { id: 'arabic', name: 'الأدب العربي', coef: 6 },
  { id: 'philosophy', name: 'الفلسفة', coef: 6 },
  { id: 'history', name: 'التاريخ والجغرافيا', coef: 4 },
  { id: 'french', name: 'اللغة الفرنسية', coef: 3 },
  { id: 'english', name: 'اللغة الإنجليزية', coef: 3 },
  { id: 'islamic', name: 'العلوم الإسلامية', coef: 2 },
  { id: 'math', name: 'الرياضيات', coef: 2 },
];

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ onBack }) => {
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [hasSport, setHasSport] = useState(false);
  const [hasAmazigh, setHasAmazigh] = useState(false);

  const calculateAverage = () => {
    let totalPoints = 0;
    let totalCoef = 0;

    BAC_SUBJECTS.forEach(sub => {
        const mark = parseFloat(marks[sub.id]) || 0;
        const validMark = Math.min(20, Math.max(0, mark));
        totalPoints += validMark * sub.coef;
        totalCoef += sub.coef;
    });

    if (hasSport) {
        const mark = parseFloat(marks['sport']) || 0;
        const validMark = Math.min(20, Math.max(0, mark));
        totalPoints += validMark * 1;
        totalCoef += 1;
    }

    if (hasAmazigh) {
        const mark = parseFloat(marks['amazigh']) || 0;
        const validMark = Math.min(20, Math.max(0, mark));
        totalPoints += validMark * 2;
        totalCoef += 2;
    }

    if (totalCoef === 0) return "0.00";
    return (totalPoints / totalCoef).toFixed(2);
  };

  const handleMarkChange = (id: string, val: string) => {
      if (val === '' || /^\d*\.?\d*$/.test(val)) {
          if (parseFloat(val) > 20) return; 
          setMarks(prev => ({ ...prev, [id]: val }));
      }
  };

  const resetCalculator = () => {
      if(confirm('هل تريد تصفير جميع النقاط؟')) {
          setMarks({});
      }
  };

  const average = calculateAverage();
  const numAvg = parseFloat(average);
  
  let gradeColor = 'text-white';
  let gradeMessage = 'أدخل النقاط';
  
  if (numAvg >= 10) {
      if (numAvg >= 16) { gradeColor = 'text-green-400'; gradeMessage = 'امتياز! 🌟'; }
      else if (numAvg >= 14) { gradeColor = 'text-green-300'; gradeMessage = 'جيد جداً! 👏'; }
      else if (numAvg >= 12) { gradeColor = 'text-yellow-300'; gradeMessage = 'جيد 👍'; }
      else { gradeColor = 'text-yellow-500'; gradeMessage = 'مقبول ✅'; }
  } else if (Object.keys(marks).length > 0) {
      gradeColor = 'text-red-400'; gradeMessage = 'للأسف راسب ❌';
  }

  return (
    <div className="h-full overflow-y-auto bg-black text-white p-4 sm:p-6 animate-fadeIn pb-24 custom-scrollbar scroll-container">
      <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-3 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors border border-neutral-800">
              <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">حساب المعدل الدراسي</h1>
          <button onClick={resetCalculator} className="p-3 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors border border-neutral-800 text-gray-400 hover:text-white">
              <RefreshCw size={20} />
          </button>
      </div>

      <div className="max-w-md mx-auto space-y-6">
          <div className="bg-neutral-900 rounded-3xl p-8 text-center border-2 border-neutral-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <p className="text-gray-400 text-sm font-bold mb-2">المعدل التقديري</p>
              <div className={`text-6xl font-black font-mono mb-2 ${gradeColor} drop-shadow-lg`}>
                  {average}
              </div>
              <p className={`text-sm font-bold ${gradeColor} opacity-80`}>{gradeMessage}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setHasSport(!hasSport)}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${hasSport ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-neutral-900 border-neutral-800 text-gray-500'}`}
              >
                  <span className="font-bold text-xs">التربية البدنية (م:1)</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${hasSport ? 'bg-blue-500' : 'bg-neutral-700'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hasSport ? 'left-1' : 'right-1'}`}></div>
                  </div>
              </button>

              <button 
                onClick={() => setHasAmazigh(!hasAmazigh)}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${hasAmazigh ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400' : 'bg-neutral-900 border-neutral-800 text-gray-500'}`}
              >
                  <span className="font-bold text-xs">الأمازيغية (م:2)</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${hasAmazigh ? 'bg-yellow-500' : 'bg-neutral-700'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hasAmazigh ? 'left-1' : 'right-1'}`}></div>
                  </div>
              </button>
          </div>

          <div className="space-y-3 bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800">
              {BAC_SUBJECTS.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 bg-black p-3 rounded-2xl border border-neutral-800">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center font-bold text-gray-400 text-xs shadow-inner shrink-0">
                          {sub.coef}x
                      </div>
                      <div className="flex-1 text-right">
                          <p className="font-bold text-gray-200 text-sm">{sub.name}</p>
                      </div>
                      <input 
                          type="number" 
                          inputMode="decimal"
                          placeholder="00"
                          value={marks[sub.id] || ''}
                          onChange={(e) => handleMarkChange(sub.id, e.target.value)}
                          className={`w-20 h-12 bg-neutral-900 border border-neutral-700 rounded-xl text-center text-lg font-bold outline-none focus:border-green-500 transition-colors ${marks[sub.id] && parseFloat(marks[sub.id]) >= 10 ? 'text-green-400' : 'text-white'}`}
                      />
                  </div>
              ))}

              {hasSport && (
                  <div className="flex items-center gap-3 bg-black p-3 rounded-2xl border border-neutral-800 animate-slideIn">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center font-bold text-gray-400 text-xs shadow-inner shrink-0">
                          1x
                      </div>
                      <div className="flex-1 text-right">
                          <p className="font-bold text-gray-200 text-sm">التربية البدنية</p>
                      </div>
                      <input 
                          type="number" 
                          inputMode="decimal"
                          placeholder="00"
                          value={marks['sport'] || ''}
                          onChange={(e) => handleMarkChange('sport', e.target.value)}
                          className={`w-20 h-12 bg-neutral-900 border border-neutral-700 rounded-xl text-center text-lg font-bold outline-none focus:border-green-500 transition-colors ${marks['sport'] && parseFloat(marks['sport']) >= 10 ? 'text-green-400' : 'text-white'}`}
                      />
                  </div>
              )}

              {hasAmazigh && (
                  <div className="flex items-center gap-3 bg-black p-3 rounded-2xl border border-neutral-800 animate-slideIn">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center font-bold text-gray-400 text-xs shadow-inner shrink-0">
                          2x
                      </div>
                      <div className="flex-1 text-right">
                          <p className="font-bold text-gray-200 text-sm">اللغة الأمازيغية</p>
                      </div>
                      <input 
                          type="number" 
                          inputMode="decimal"
                          placeholder="00"
                          value={marks['amazigh'] || ''}
                          onChange={(e) => handleMarkChange('amazigh', e.target.value)}
                          className={`w-20 h-12 bg-neutral-900 border border-neutral-700 rounded-xl text-center text-lg font-bold outline-none focus:border-green-500 transition-colors ${marks['amazigh'] && parseFloat(marks['amazigh']) >= 10 ? 'text-green-400' : 'text-white'}`}
                      />
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default CalculatorScreen;
