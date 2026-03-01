
import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface AdOverlayProps {
  isOpen: boolean;
  onReward: () => void;
  onClose: () => void;
  actionName: string; 
}

const AD_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const AdOverlay: React.FC<AdOverlayProps> = ({ isOpen, onReward, onClose, actionName }) => {
  const [timeLeft, setTimeLeft] = useState(5); 
  const [canSkip, setCanSkip] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      setCanSkip(false);
      setVideoEnded(false);
      setHasError(false);
      setIsMuted(true);
      
      if (videoRef.current) {
        videoRef.current.load();
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay was prevented by browser.");
            });
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || videoEnded || hasError) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, videoEnded, hasError]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setCanSkip(true);
    setTimeout(() => {
        onReward();
    }, 500); 
  };

  const toggleMute = () => {
      if (videoRef.current) {
          videoRef.current.muted = !isMuted;
          setIsMuted(!isMuted);
      }
  };

  const handleVideoError = (e: any) => {
      // إذا فشل الجلب (Failed to fetch)، يتم السماح للمستخدم بالمتابعة فوراً
      setHasError(true);
      setCanSkip(true);
      setTimeLeft(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fadeIn">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="bg-black/50 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-2">
            <span className="text-white text-xs font-bold">إعلان تعليمي</span>
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
        </div>
        
        <div className="flex items-center gap-2">
            {!canSkip ? (
                <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center bg-black/40 backdrop-blur">
                    <span className="text-white font-mono text-sm">{timeLeft}</span>
                </div>
            ) : (
                <button 
                    onClick={hasError ? handleVideoEnd : onClose} 
                    className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-colors flex items-center gap-2 px-4"
                >
                    <X className="text-white w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      <div className="relative w-full max-w-lg aspect-[9/16] sm:aspect-video bg-neutral-900 rounded-lg overflow-hidden shadow-2xl border border-white/10">
        {!hasError ? (
            <>
                <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    onEnded={handleVideoEnd}
                    onError={handleVideoError}
                    playsInline
                    muted={isMuted}
                >
                    <source src={AD_VIDEO_URL} type="video/mp4" />
                </video>
                <button 
                    onClick={toggleMute}
                    className="absolute bottom-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20 text-white"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </>
        ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <AlertCircle className="w-12 h-12 text-yellow-500 mb-2" />
                <p className="text-white font-bold">تعذر تحميل المحتوى الإعلاني</p>
                <button 
                    onClick={handleVideoEnd}
                    className="bg-brand text-black px-6 py-2 rounded-full font-bold text-sm"
                >
                    تخطي ومتابعة العملية
                </button>
            </div>
        )}
        
        {videoEnded && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center animate-fadeIn z-30">
                <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
                <h3 className="text-white text-xl font-black mb-2">تم تأكيد المشاهدة</h3>
                <p className="text-gray-400 text-xs">{actionName}...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdOverlay;
