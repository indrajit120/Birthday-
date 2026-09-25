import { Volume2, VolumeX, Share2 } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import InstructionOverlay from './InstructionOverlay';
import { motion, AnimatePresence } from 'motion/react';

interface TopUIProps {
  isPlaying: boolean;
  toggleMusic: () => void;
  stage: number;
  setStage: (stage: number) => void;
  currentSceneName?: string;
}

export default function TopUI({ isPlaying, toggleMusic, stage, setStage, currentSceneName = 'intro' }: TopUIProps) {
  const { config, interpolate } = useConfig();
  const navigate = useNavigate();

  const [showInstructions, setShowInstructions] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  
  const HOLD_DURATION = 2000;

  const clearHoldTimers = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimerRef.current = null;
    holdIntervalRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      clearHoldTimers();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    clearHoldTimers();
    setIsHolding(true);
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      clearHoldTimers();
      navigate('/admin');
    }, HOLD_DURATION);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isHolding) return;
    
    // If moved outside the button bounds significantly, cancel
    const rect = e.currentTarget.getBoundingClientRect();
    const margin = 20;
    if (
      e.clientX < rect.left - margin ||
      e.clientX > rect.right + margin ||
      e.clientY < rect.top - margin ||
      e.clientY > rect.bottom + margin
    ) {
      clearHoldTimers();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (isHolding) {
      const elapsed = Date.now() - holdStartTimeRef.current;
      clearHoldTimers();
      
      // If it was a short tap, show instructions
      if (elapsed < HOLD_DURATION) {
        setShowInstructions(true);
      }
    }
  };

  const handleShare = async () => {
    if (!config) return;
    const shareData = {
      title: interpolate(config.shareSettings?.title) || `🎂 A Birthday Surprise for ${config.name}`,
      text: interpolate(config.shareSettings?.description) || "Someone made a little birthday surprise for you ❤️",
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      // Fallback
      alert("Link copied! ❤️");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-6 pt-safe z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setStage(Math.max(1, stage - 1))}
            className={`pointer-events-auto flex items-center space-x-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm active:scale-95 transition-all ${stage > 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
          >
            <span className="text-sm font-medium opacity-80">← Back</span>
          </button>
        </div>
        <div className="hidden sm:flex pointer-events-auto bg-white/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm">
          <span className="text-xs tracking-widest font-bold uppercase opacity-60">👀 PREVIEW MODE</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleMusic}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-lg rounded-full border border-white/50 shadow-sm active:scale-95 transition-all text-[#4A4A4A]"
          >
            {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={handleShare}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-lg rounded-full border border-white/50 shadow-sm active:scale-95 transition-all text-[#4A4A4A]"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center justify-center">
        <AnimatePresence>
          {isHolding && (
            <motion.svg
              className="absolute pointer-events-none"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#fbcfe8"
                strokeWidth="4"
                className="opacity-30"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#ec4899"
                strokeWidth="4"
                strokeDasharray="175.93"
                strokeDashoffset={175.93 - (175.93 * holdProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-75"
                transform="rotate(-90 32 32)"
              />
            </motion.svg>
          )}
        </AnimatePresence>
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={clearHoldTimers}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
          className="w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-lg rounded-full border border-white/50 shadow-sm hover:scale-110 active:scale-95 transition-transform text-xl relative z-10 select-none"
          title="Info"
        >
          🎀
        </button>
      </div>
      <InstructionOverlay 
        sceneName={currentSceneName}
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </>
  );
}
