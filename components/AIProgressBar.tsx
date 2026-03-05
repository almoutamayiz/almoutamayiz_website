
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AIProgressBarProps {
  isLoading: boolean;
  taskSize?: number; // e.g., text length
  label?: string;
  onComplete?: () => void;
}

const AIProgressBar: React.FC<AIProgressBarProps> = ({ isLoading, taskSize = 100, label = "جاري المعالجة الذكية...", onComplete }) => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      progressRef.current = 0;
      
      // Calculate duration based on task size
      // Minimum 3 seconds, Maximum 15 seconds
      const estimatedDuration = Math.min(Math.max(taskSize * 20, 3000), 15000);
      const intervalTime = 50; // Update every 50ms
      const increment = (100 / (estimatedDuration / intervalTime));

      timerRef.current = setInterval(() => {
        if (progressRef.current < 99) {
          const nextProgress = Math.min(99, progressRef.current + increment);
          progressRef.current = nextProgress;
          setProgress(nextProgress);
        }
      }, intervalTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Jump to 100 when loading finishes
      if (progressRef.current > 0) {
        setProgress(100);
        progressRef.current = 100;
        if (onComplete) setTimeout(onComplete, 500);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, taskSize, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full space-y-3 py-4"
        >
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-brand uppercase tracking-widest animate-pulse">{label}</span>
            <span className="text-[10px] font-black text-white/60">{Math.round(progress)}%</span>
          </div>
          
          {/* 3D Shiny Progress Bar Container */}
          <div className="relative h-4 bg-black/40 rounded-full border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* The Progress Fill */}
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand via-yellow-300 to-brand shadow-[0_0_15px_rgba(255,198,51,0.6)]"
              style={{ width: `${progress}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            >
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50"></div>
              
              {/* Animated Shine Effect */}
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
              />
            </motion.div>
          </div>
          
          <p className="text-center text-[9px] font-bold text-white/30 italic">
            {progress < 40 ? "بدء المحرك الذكي..." : progress < 80 ? "تحليل البيانات العميقة..." : "تنسيق النتائج النهائية..."}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIProgressBar;
