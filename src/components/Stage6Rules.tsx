import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';
import { Sparkles, Check, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Point {
  x: number;
  y: number;
}

export default function Stage6Rules({ onComplete }: { onComplete: () => void }) {
  const { config, interpolate } = useConfig();
  const rulesConfig = config?.friendshipRules;
  const [checkedRules, setCheckedRules] = useState<Set<string>>(new Set());
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const activeRules = (rulesConfig?.rules || [])
    .filter(r => r.enabled)
    .sort((a, b) => a.order - b.order);

  const allRequiredChecked = activeRules
    .filter(r => r.required)
    .every(r => checkedRules.has(r.id));

  const canSubmit = allRequiredChecked && signatureSaved;

  const experienceId = config?.experienceId || (config ? btoa(encodeURIComponent(`${config.name}-${config.senderName}`)) : 'default');
  const storageKey = `friendshipProgress_${experienceId}`;
  
  const [hydrated, setHydrated] = useState(false);

  const saveProgress = (updates: any) => {
    try {
      const existingStr = localStorage.getItem(storageKey);
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const newProgress = { ...existing, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(newProgress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  useEffect(() => {
    const loadState = () => {
      const saved = localStorage.getItem(storageKey);
      let ctx = canvasRef.current?.getContext('2d');
      
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.completed) {
            setIsCompleted(true);
            setCheckedRules(new Set(activeRules.map(r => r.id)));
          } else if (data.checkedRules) {
            setCheckedRules(new Set(data.checkedRules));
          }
          if (data.signature && canvasRef.current) {
            const img = new Image();
            img.onload = () => {
              if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, 0, 0);
                setSignatureSaved(true);
                setHydrated(true);
              }
            };
            img.src = data.signature;
            return;
          }
        } catch (e) {
          console.error('Failed to parse progress', e);
        }
      } else {
        // New experience: explicitly clear state
        setCheckedRules(new Set());
        setSignatureSaved(false);
        setIsCompleted(false);
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      setHydrated(true);
    };

    loadState();

    const handleStorage = (e: StorageEvent) => {
      // If our specific key was deleted, or if localStorage was cleared
      if ((e.key === storageKey && e.newValue === null) || e.key === null) {
        loadState();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    const handleCustomReset = (e: any) => {
      if (e.type === 'entire-website-progress-reset' && e.detail?.experienceId !== experienceId) return;
      loadState();
    };
    window.addEventListener('entire-website-progress-reset', handleCustomReset);
    window.addEventListener('pageshow', loadState); // Handle bfcache

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('entire-website-progress-reset', handleCustomReset);
      window.removeEventListener('pageshow', loadState);
    };
  }, [storageKey]); // activeRules excluded on purpose // activeRules excluded on purpose to avoid re-running mid-session unless experienceId changes

  const handleToggleRule = (id: string) => {
    if (isCompleted || !hydrated) return;
    const next = new Set(checkedRules);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedRules(next);
    saveProgress({ checkedRules: Array.from(next) });
  };

  const getCanvasPoint = (e: React.TouchEvent | React.MouseEvent | MouseEvent | TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Scale for high DPI displays if we implement scaling, 
    // but assuming 1:1 CSS to internal resolution for simplicity
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    if (isCompleted) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = getCanvasPoint(e);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current || isCompleted || !canvasRef.current) return;
    e.preventDefault();
    
    const ctx = canvasRef.current.getContext('2d');
    const currentPoint = getCanvasPoint(e);
    
    if (ctx && lastPoint.current && currentPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.strokeStyle = '#db2777'; // pink-600
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      lastPoint.current = currentPoint;
    }
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPoint.current = null;
      if (canvasRef.current) {
        // Save to local storage
        const dataUrl = canvasRef.current.toDataURL();
        saveProgress({ signature: dataUrl });
        setSignatureSaved(true);
      }
    }
  };

  const clearSignature = () => {
    if (isCompleted || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveProgress({ signature: null });
      setSignatureSaved(false);
    }
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbcfe8', '#db2777', '#fdf2f8']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbcfe8', '#db2777', '#fdf2f8']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleRenew = () => {
    if (!canSubmit || isCompleted) return;
    setIsCompleted(true);
    saveProgress({ completed: true });
    fireConfetti();
  };

  // Helper for touch-action none
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const preventScroll = (e: TouchEvent) => {
        if (e.target === canvas) {
          e.preventDefault();
        }
      };
      canvas.addEventListener('touchmove', preventScroll, { passive: false });
      return () => canvas.removeEventListener('touchmove', preventScroll);
    }
  }, []);

  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-[#FFF0F5] to-[#FFE4E1] flex flex-col items-center overflow-y-auto overflow-x-hidden pt-20 pb-32 transition-opacity duration-300 ${hydrated ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-10 w-48 h-48 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        
        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles size={16 + Math.random() * 12} />
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-lg px-4 flex flex-col items-center z-10">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block px-3 py-1 bg-pink-100/80 backdrop-blur rounded-full text-pink-600 text-xs font-bold tracking-[0.2em] mb-4">
            {interpolate(rulesConfig?.roomLabel || 'ROOM 7 · THE PROMISES')}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 drop-shadow-sm font-display">
            {interpolate(rulesConfig?.title || 'Tick each promise, then sign.')}
          </h2>
        </motion.div>

        {/* Main Agreement Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-[#FFFAF0] rounded-3xl shadow-xl shadow-pink-200/50 p-6 md:p-8 border border-pink-100/60 relative overflow-hidden"
        >
          {/* RENEWED STAMP */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div 
                initial={{ opacity: 0, scale: 2, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: -15 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <div className="border-4 border-rose-500 text-rose-500 rounded-lg px-6 py-2 bg-white/80 backdrop-blur-sm shadow-xl flex flex-col items-center whitespace-nowrap">
                  <span className="text-4xl md:text-5xl font-black tracking-widest leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                    {interpolate(rulesConfig?.stampTitle || 'RENEWED')}
                  </span>
                  <span className="text-lg md:text-xl font-bold tracking-[0.2em] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                    {interpolate(rulesConfig?.stampSubtitle || 'FOR LIFE')}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mb-8 border-b-2 border-pink-100 pb-6 border-dashed">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">
              {interpolate(rulesConfig?.cardTitle || 'Our Friendship Rules')}
            </h3>
            <p className="text-xs font-bold tracking-widest text-pink-500 uppercase">
              {interpolate(rulesConfig?.subtitle || 'BETWEEN {senderName} AND {recipientName}')}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {activeRules.map((rule, idx) => (
              <div 
                key={rule.id}
                onClick={() => handleToggleRule(rule.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer ${
                  checkedRules.has(rule.id) ? 'bg-pink-50 border border-pink-200' : 'bg-white border border-gray-100 hover:border-pink-200 shadow-sm'
                } ${isCompleted ? 'pointer-events-none' : ''}`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  checkedRules.has(rule.id) ? 'bg-pink-500' : 'bg-gray-100 border border-gray-300'
                }`}>
                  <AnimatePresence>
                    {checkedRules.has(rule.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1">
                  <p className={`font-sans text-[15px] md:text-base leading-snug transition-colors ${
                    checkedRules.has(rule.id) ? 'text-gray-800 font-medium' : 'text-gray-600'
                  }`}>
                    {interpolate(rule.text)}
                  </p>
                </div>
                
                {rule.icon && (
                  <div className="shrink-0 text-xl opacity-80">
                    {rule.icon}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs font-bold tracking-[0.15em] text-pink-400 mb-4 uppercase">
              {interpolate(rulesConfig?.signatureLabel || 'SIGN HERE WITH YOUR FINGER')}
            </p>
            
            <div className="relative w-full max-w-sm aspect-[2.5/1] bg-white rounded-xl border-2 border-dashed border-pink-200 shadow-inner overflow-hidden touch-none select-none">
              <canvas
                ref={canvasRef}
                width={600}
                height={240}
                className="w-full h-full touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
              
              <div className="absolute bottom-[25%] left-[10%] right-[10%] h-px bg-pink-100 pointer-events-none" />
              <div className="absolute bottom-[5%] left-0 right-0 text-center text-pink-200 font-script text-xl opacity-50 pointer-events-none">
                {interpolate(config?.name || 'You')}
              </div>

              {!isCompleted && (
                <button 
                  onClick={clearSignature}
                  className="absolute top-2 right-2 p-2 bg-gray-50 text-gray-400 hover:text-pink-500 rounded-full shadow-sm"
                  title="Clear signature"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 w-full max-w-sm"
        >
          <button
            onClick={isCompleted ? onComplete : handleRenew}
            disabled={!canSubmit && !isCompleted}
            className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isCompleted 
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-pink-500/40 hover:scale-[1.02]' 
                : canSubmit 
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-pink-500/40 hover:scale-[1.02] active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isCompleted 
              ? interpolate(rulesConfig?.completedButtonText || 'Renewed 🎉') 
              : interpolate(rulesConfig?.buttonText || 'Renew our friendship ✍️')
            }
            {canSubmit && !isCompleted && <Sparkles size={18} />}
          </button>
          
          {!canSubmit && !isCompleted && (
            <p className="text-center text-xs font-medium text-pink-500/70 mt-3 flex items-center justify-center gap-1">
              Check all required rules & sign above
            </p>
          )}
        </motion.div>

      </div>
    </div>
  );
}
