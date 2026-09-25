import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';
import { Sparkles, Heart } from 'lucide-react';

interface StageBalloonsProps {
  onComplete: () => void;
}

const Balloon = ({ color, index, onPop, isPopped, delay }: any) => {
  const [isWobbling, setIsWobbling] = useState(false);
  const [internalPopped, setInternalPopped] = useState(isPopped);

  useEffect(() => {
    if (isPopped && !internalPopped) {
      setIsWobbling(true);
      const timer = setTimeout(() => {
        setIsWobbling(false);
        setInternalPopped(true);
      }, 150);
      return () => clearTimeout(timer);
    } else if (!isPopped) {
      setInternalPopped(false);
      setIsWobbling(false);
    }
  }, [isPopped, internalPopped]);

  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0 }}
      animate={
        internalPopped ? { scale: 0, opacity: 0, transition: { duration: 0.1 } } : 
        isWobbling ? { scale: 1.15, rotate: [0, -8, 8, -8, 8, 0], transition: { duration: 0.15 } } : 
        { y: 0, opacity: 1, scale: 1 }
      }
      transition={{ type: 'spring', damping: 15, stiffness: 40, delay: delay }}
      className={`relative cursor-pointer flex flex-col items-center justify-center ${isPopped ? 'pointer-events-none' : ''}`}
      onClick={onPop}
      style={{
        zIndex: isPopped ? 0 : 10 - index
      }}
    >
      <motion.div
        animate={internalPopped || isWobbling ? {} : {
          y: [0, -15, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          repeat: Infinity,
          duration: 3 + index,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div
          className="w-14 h-[4.5rem] sm:w-20 sm:h-24 md:w-24 md:h-28 rounded-[50%] shadow-md relative"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${color} 0%, ${color}dd 45%, #00000022 100%)`,
            boxShadow: `inset -5px -5px 15px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.05)`
          }}
        >
          {/* Highlight */}
          <div className="absolute top-[12%] left-[18%] w-[25%] h-[35%] rounded-[50%] bg-white opacity-40 rotate-[-40deg]" />
          
          {/* Cute Accent (Heart) */}
          {index % 2 === 0 && (
             <Heart className="absolute top-[30%] right-[20%] w-3 h-3 text-white opacity-60" fill="currentColor" />
          )}
          {index % 2 !== 0 && (
             <Sparkles className="absolute top-[30%] right-[20%] w-3 h-3 text-white opacity-60" fill="currentColor" />
          )}

          {/* Balloon tie */}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-[50%] bg-opacity-90" style={{ backgroundColor: color }}>
            <div className="absolute -bottom-1 -left-1 w-5 h-2 bg-inherit rounded-[50%]" />
          </div>
        </div>
        {/* String */}
        <div className="absolute top-[calc(100%+4px)] left-1/2 w-[1px] h-32 md:h-48 bg-gray-300 opacity-80 origin-top" />
      </motion.div>
    </motion.div>
  );
};

const ConfettiParticle = ({ color, x, y, type }: any) => {
  const randomX = (Math.random() - 0.5) * 300;
  const randomY = (Math.random() - 0.5) * 300 - 50;
  const randomRotate = Math.random() * 360;
  
  let shapeClass = "w-2 h-2 rounded-sm";
  if (type === 'circle') shapeClass = "w-3 h-3 rounded-full";
  if (type === 'fragment') shapeClass = "w-4 h-4 rounded-[40%] opacity-80";

  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x: x + randomX,
        y: y + randomY + 150, // Gravity effect
        opacity: 0,
        scale: Math.random() * 0.8 + 0.2,
        rotate: randomRotate + 180,
      }}
      transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
      className={`absolute z-20 pointer-events-none ${shapeClass}`}
      style={{ backgroundColor: color }}
    />
  );
};

export default function StageBalloons({ onComplete }: StageBalloonsProps) {
  const { config, interpolate } = useConfig();
  const sceneConfig = config?.balloonScene;
  const balloons = sceneConfig?.balloons || [];
  
  const [poppedBalloons, setPoppedBalloons] = useState<Record<string, boolean>>({});
  const [particles, setParticles] = useState<any[]>([]);
  const [revealedMessages, setRevealedMessages] = useState<any[]>([]);

  const handlePop = (balloon: any, e: React.MouseEvent) => {
    if (poppedBalloons[balloon.id]) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setPoppedBalloons(prev => ({ ...prev, [balloon.id]: true }));
    
    // Add revealed message
    setRevealedMessages(prev => [...prev, balloon]);

    if (sceneConfig?.popSoundEnabled) {
      const audio = new Audio('https://actions.google.com/sounds/v1/foley/balloon_pop.ogg');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    if (sceneConfig?.confettiEnabled) {
      const newParticles = Array.from({ length: 45 }).map((_, i) => ({
        id: `${balloon.id}-${i}`,
        x: centerX,
        y: centerY,
        color: i % 3 === 0 ? balloon.balloonColor : balloon.accentColor,
        type: i < 15 ? 'fragment' : (i < 30 ? 'circle' : 'square')
      }));
      setParticles(prev => [...prev, ...newParticles]);
    }
  };

  const handleReplay = () => {
    setPoppedBalloons({});
    setRevealedMessages([]);
    setParticles([]);
  };

  const allPopped = revealedMessages.length === balloons.length && balloons.length > 0;

  if (!sceneConfig?.enabled) {
    useEffect(() => {
      onComplete();
    }, []);
    return null;
  }

  return (
    <div 
      className="w-full h-full flex flex-col items-center text-gray-800 overflow-y-auto overflow-x-hidden relative"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Particles layer */}
      {particles.map(p => (
        <ConfettiParticle key={p.id} color={p.color} x={p.x} y={p.y} type={p.type} />
      ))}

      <div className="z-10 w-full max-w-lg px-6 pt-16 pb-32 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-pink-600 drop-shadow-sm">
            {interpolate(sceneConfig.heading)}
          </h2>
          <p className="text-gray-600 text-sm md:text-base italic">
            {interpolate(sceneConfig.subtitle)}
          </p>
        </motion.div>

        {/* Balloons Container */}
        <div className="relative h-48 md:h-56 mb-8 flex justify-center items-end gap-2 md:gap-6">
          {balloons.map((b: any, index: number) => (
            <div key={`b-container-${b.id}`} className="flex-1 flex justify-center h-full">
              <Balloon
                color={b.balloonColor}
                index={index}
                delay={index * 0.15}
                isPopped={poppedBalloons[b.id]}
                onPop={(e: any) => handlePop(b, e)}
              />
            </div>
          ))}
        </div>

        {/* Revealed Messages */}
        <div className="flex-1 w-full space-y-4">
          <AnimatePresence>
            {revealedMessages.map((msg, index) => (
              <motion.div
                key={`msg-${msg.id}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full p-5 rounded-2xl backdrop-blur-md border shadow-sm"
                style={{
                  backgroundColor: `${msg.accentColor}15`,
                  borderColor: `${msg.accentColor}30`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sans text-xs font-bold tracking-widest uppercase opacity-90" style={{ color: msg.accentColor }}>
                    {interpolate(msg.title)}
                  </h3>
                  {sceneConfig.sparkleEnabled && (
                    <Sparkles className="w-4 h-4" style={{ color: msg.accentColor }} />
                  )}
                </div>
                <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-800">
                  {interpolate(msg.message)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Completion State */}
          <AnimatePresence>
            {allPopped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="pt-8 pb-4 text-center space-y-6"
              >
                <p className="text-pink-600 font-medium italic text-lg">
                  {interpolate(sceneConfig.completionText)}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleReplay}
                    className="w-12 h-12 rounded-full bg-white/50 border border-pink-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
