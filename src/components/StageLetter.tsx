import { useState, useEffect, useRef, useMemo } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

const customStyles = `
  
  
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    10%, 30% { transform: scale(1.15); }
    20% { transform: scale(1); }
  }
  .animate-heartbeat {
    animation: heartbeat 2.5s infinite ease-in-out;
    display: inline-block;
  }

  @keyframes slParticleFloat {
    0% { transform: translateY(0) scale(1); opacity: 0; }
    20% { opacity: 0.6; }
    80% { opacity: 0.6; }
    100% { transform: translateY(-80vh) scale(1.5); opacity: 0; }
  }
  @keyframes pulseBtn {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(236,72,153, 0.4); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(236,72,153, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(236,72,153, 0); }
  }
`;

function ParticleBackground() {
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{customStyles}</style>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `slParticleFloat ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}

const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const heartEmojis = ['❤️', '💖', '💗', '💓', '💕', '🤍', '🤎', '💜', '💙', '💚', '💛', '🧡', '✨'];

export default function StageLetter({ onComplete }: { onComplete?: () => void }) {
  const { config, interpolate } = useConfig();
  
  const [phase, setPhase] = useState<'envelope' | 'opening' | 'reading'>('envelope');
  const [isFinished, setIsFinished] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  const greeting = `Dear ${config?.name || 'You'},`;
  const messageText = interpolate(config?.finalMessage) || "";
  const signatureLine1 = "With all my love,";
  const signatureLine2 = `— ${config?.senderName || 'Me'}`;

  const lines = useMemo(() => messageText.split('\n'), [messageText]);

  const timing = useMemo(() => {
    const greetingDelay = 0.5;
    let currentDelay = greetingDelay + 1.2;
    
    const lineDelays = lines.map(line => {
      const delay = currentDelay;
      if (line.trim().length > 0) {
        currentDelay += 0.9;
      }
      return delay;
    });

    const signatureDelay = currentDelay + 0.5;
    const totalTime = signatureDelay + 2.0;

    return { greetingDelay, lineDelays, signatureDelay, totalTime };
  }, [lines]);

  useEffect(() => {
    if (phase === 'reading') {
      timerRef.current = window.setTimeout(() => {
        setIsFinished(true);
      }, timing.totalTime * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, timing]);

  const handleOpenEnvelope = () => {
    if (phase !== 'envelope') return;
    setPhase('opening');
    setTimeout(() => {
      setPhase('reading');
    }, 1800);
  };

  const handleContinue = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onComplete) onComplete();
  };

  const renderTextWithEffects = (text: string, baseDelay: number) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return parts.map((part, i) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const isItalic = part.startsWith('*') && part.endsWith('*');
      
      let content = part;
      if (isBold) content = part.slice(2, -2);
      else if (isItalic) content = part.slice(1, -1);
      
      const subParts = content.split(emojiRegex);
      
      return (
        <span key={i} className={`${isBold || isItalic ? 'text-yellow-700 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] font-semibold' : ''}`}>
          {subParts.map((sub, j) => {
            if (sub.match(emojiRegex)) {
              const isHeart = heartEmojis.includes(sub);
              return (
                <motion.span 
                  key={j}
                  className={`inline-block mx-0.5 ${isHeart ? 'animate-heartbeat' : ''}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={phase === 'reading' ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: baseDelay + 0.4, duration: 0.6, type: 'spring', bounce: 0.5 }}
                >
                  {sub}
                </motion.span>
              );
            }
            return <span key={j}>{sub}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 perspective-[1200px] overflow-hidden">
      <ParticleBackground />
      
      <AnimatePresence>
        {phase !== 'reading' && (
          <motion.div
            key="envelope-container"
            className="absolute w-[320px] h-[220px] md:w-[360px] md:h-[240px] cursor-pointer z-40"
            animate={
              phase === 'envelope' ? { y: [-8, 8, -8], transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' } } :
              { y: 400, opacity: 0, transition: { delay: 1.0, duration: 0.8, ease: [0.5, 0, 1, 1] } }
            }
            whileTap={phase === 'envelope' ? { scale: 0.96 } : {}}
            onClick={handleOpenEnvelope}
          >
            {/* Back */}
            <div className="absolute inset-0 bg-[#cbb49e] rounded-lg shadow-2xl overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
            </div>

            {/* Dummy Letter */}
            <motion.div
              className="absolute top-3 left-4 right-4 bottom-3 bg-[#FFFDF8] rounded-[12px] z-20 shadow-inner overflow-hidden flex flex-col p-5"
              animate={
                phase === 'opening' ? { 
                  y: -150, 
                  opacity: [1, 1, 0],
                  transition: { delay: 0.4, duration: 0.6, ease: 'easeOut', times: [0, 0.8, 1] } 
                } : {}
              }
            >
              <div className="w-1/3 h-2.5 bg-yellow-900/10 rounded-full mb-6" />
              <div className="w-full h-2 bg-yellow-900/5 rounded-full mb-3" />
              <div className="w-5/6 h-2 bg-yellow-900/5 rounded-full mb-3" />
              <div className="w-4/6 h-2 bg-yellow-900/5 rounded-full" />
            </motion.div>

            {/* Front Flaps */}
            <div className="absolute inset-0 z-30 pointer-events-none drop-shadow-xl flex items-end">
              <svg className="w-full h-full" viewBox="0 0 360 240" preserveAspectRatio="none">
                <path d="M0,0 L180,130 L0,240 Z" fill="#dfccb8" />
                <path d="M360,0 L180,130 L360,240 Z" fill="#dfccb8" />
                <path d="M0,240 L180,130 L360,240 Z" fill="#e6d5c3" />
                <path d="M0,240 L180,130 L360,240" fill="none" stroke="#f0e4d8" strokeWidth="1.5" />
                <path d="M0,0 L180,130 L0,240" fill="none" stroke="#cbb49e" strokeWidth="1" />
                <path d="M360,0 L180,130 L360,240" fill="none" stroke="#cbb49e" strokeWidth="1" />
              </svg>
            </div>

            {/* Top Flap */}
            <motion.div
              className="absolute top-0 left-0 w-full h-[145px] origin-top z-40 drop-shadow-lg"
              initial={{ rotateX: 0 }}
              animate={
                phase === 'opening' ? { rotateX: 180, zIndex: 10, transition: { duration: 0.6, ease: 'easeInOut' } } : {}
              }
            >
              <svg className="w-full h-full" viewBox="0 0 360 145" preserveAspectRatio="none">
                <path d="M0,0 L360,0 L180,145 Z" fill="#ebdacc" />
                <path d="M0,0 L360,0 L180,145" fill="none" stroke="#f4e8df" strokeWidth="1.5" />
              </svg>
              
              {/* Wax Seal */}
              <motion.div 
                className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-14 h-14 z-50 flex items-center justify-center"
                animate={phase === 'opening' ? { opacity: 0, scale: 0, transition: { duration: 0.3 } } : {}}
              >
                 <div className="absolute inset-0 bg-red-700 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.4)] border border-red-800" />
                 <div className="absolute inset-1 bg-red-600 rounded-full shadow-inner" />
                 <Heart size={20} className="text-red-900 relative z-10" fill="currentColor" />
              </motion.div>
            </motion.div>

            {/* Subtext on Envelope */}
            {phase === 'envelope' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-8 z-30 pointer-events-none opacity-60 font-serif italic text-[#6b5846] text-lg whitespace-nowrap">
                For {config?.name || 'You'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'envelope' && (
          <motion.div 
            className="absolute bottom-16 md:bottom-24 text-white/90 font-medium tracking-widest text-sm md:text-base flex flex-col items-center gap-3 pointer-events-none z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="animate-pulse drop-shadow-md">Tap to open your letter 💌</span>
            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Letter */}
      <motion.div 
        className="relative w-full max-w-lg bg-[#FFFDF8] rounded-[20px] md:rounded-[24px] border border-yellow-600/30 p-6 md:p-10 flex flex-col h-[82vh] md:h-[75vh] max-h-[700px] shadow-[0_0_40px_rgba(251,191,36,0.15)] z-30 transition-all duration-700"
        initial={{ opacity: 0, scale: 0.7, y: 150 }}
        animate={
          phase === 'envelope' ? { opacity: 0, scale: 0.7, y: 150, pointerEvents: 'none' } :
          { opacity: 1, scale: 1, y: 0, pointerEvents: 'auto', transition: { delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
        }
      >
        <div className="absolute inset-2 border border-yellow-800/10 rounded-[12px] md:rounded-[16px] pointer-events-none" />
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col pb-4 px-2 md:px-4">
          
          <div className="flex flex-col text-[#5a4634] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            
            {/* Greeting */}
            <motion.div
              className="font-script text-3xl md:text-4xl mb-6 text-[#4a3b32] font-semibold"
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={phase === 'reading' ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: timing.greetingDelay, duration: 1.0, ease: "easeOut" }}
            >
              {greeting}
            </motion.div>

            {/* Message Body */}
            <div className="font-sans text-[18px] md:text-[20px] leading-[1.6] md:leading-[1.7] space-y-1">
              {lines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={phase === 'reading' ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: timing.lineDelays[index], duration: 0.8, ease: "easeOut" }}
                  className="min-h-[1.5em]"
                >
                  {renderTextWithEffects(line, timing.lineDelays[index])}
                </motion.div>
              ))}
            </div>

            {/* Signature */}
            <motion.div
              className="font-script text-2xl md:text-3xl mt-10 text-[#4a3b32] font-semibold flex flex-col items-end text-right"
              initial={{ opacity: 0, y: 15 }}
              animate={phase === 'reading' ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: timing.signatureDelay, duration: 1.2, ease: "easeOut" }}
            >
              <span>{signatureLine1}</span>
              <span className="mt-2 text-3xl md:text-4xl">{signatureLine2}</span>
            </motion.div>

          </div>
          
          {/* Continue Button Container */}
          <div className="mt-12 mb-4 flex justify-center w-full shrink-0 relative z-50 pointer-events-auto h-[60px]">
            <AnimatePresence>
              {isFinished && (
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                  onClick={handleContinue}
                  disabled={isNavigating}
                  className="px-8 py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(236,72,153,0.3)] text-lg font-sans font-semibold hover:scale-105 active:scale-95 transition-transform border border-pink-300/50"
                  style={{ animation: 'pulseBtn 2s infinite 1s' }}
                >
                  {isNavigating ? 'Continuing...' : 'Continue →'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
      
      <div className="absolute bottom-4 md:bottom-6 text-[10px] md:text-xs text-white/40 italic font-sans z-10 pointer-events-none">
        Made with ❤️
      </div>
    </div>
  );
}
