import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

export default function GiftIntro({ onOpen, onInteractionStart, recipientName }: { onOpen: () => void, onInteractionStart: () => void, recipientName: string }) {
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate some random floating particles for the background
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      type: Math.random() > 0.5 ? 'heart' : 'sparkle'
    }));
    setParticles(newParticles);
  }, []);

  const handleUnwrap = () => {
    if (isUnwrapping) return;
    setIsUnwrapping(true);
    onInteractionStart();

    // After animation finishes, trigger onOpen
    setTimeout(() => {
      onOpen();
    }, 3500); // 3.5 seconds
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2e0829 0%, #4a154b 50%, #1a0b2e 100%)'
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Background glowing orb */}
      <motion.div
        className="absolute w-[150vw] h-[150vw] sm:w-[80vw] sm:h-[80vw] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)',
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isUnwrapping ? [1, 1.2, 3] : [1, 1.1, 1],
          opacity: isUnwrapping ? [0.8, 1, 0] : [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: isUnwrapping ? 2.5 : 4,
          ease: "easeInOut",
          repeat: isUnwrapping ? 0 : Infinity
        }}
      />

      {/* Floating background particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute text-pink-300/30"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {p.type === 'heart' ? <Heart size={p.size * 3} fill="currentColor" /> : <Sparkles size={p.size * 3} />}
        </motion.div>
      ))}

      {/* Burst particles (when opening) */}
      <AnimatePresence>
        {isUnwrapping && (
          <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i / 40) * Math.PI * 2;
              const velocity = 150 + Math.random() * 200;
              return (
                <motion.div
                  key={`burst-${i}`}
                  className="absolute"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * velocity,
                    y: Math.sin(angle) * velocity - 100,
                    opacity: 0,
                    scale: Math.random() * 2 + 1,
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    ease: "easeOut",
                    delay: 0.8
                  }}
                >
                  {i % 3 === 0 ? <Heart className="text-pink-400" size={16} fill="currentColor" /> : 
                   i % 3 === 1 ? <Sparkles className="text-yellow-300" size={12} /> : 
                   <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center">
        {/* Text Above */}
        <AnimatePresence>
          {!isUnwrapping && (
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-serif text-pink-100 mb-3 tracking-wide">
                A little surprise for you, {recipientName}
              </h1>
              <p className="text-pink-300/80 font-medium tracking-widest text-sm uppercase">
                Something special is waiting inside...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gift Box Container */}
        <motion.div
          className="relative cursor-pointer"
          onClick={handleUnwrap}
          animate={isUnwrapping ? {
            y: [0, -10, 5, -5, 2, 0],
            rotate: [0, -5, 5, -3, 2, 0],
            scale: [1, 1.05, 1]
          } : {
            y: [0, -8, 0]
          }}
          transition={{
            y: isUnwrapping ? { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: isUnwrapping ? { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : {},
            scale: isUnwrapping ? { duration: 0.6 } : {}
          }}
        >
          {/* Light coming from inside the box */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-pink-400/50 blur-3xl pointer-events-none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isUnwrapping ? [0, 1, 0] : 0,
              scale: isUnwrapping ? [0, 2, 4] : 0
            }}
            transition={{ duration: 2, delay: 0.5 }}
          />

          {/* SVG Gift Box */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            {/* Box Body */}
            <motion.div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-32 bg-gradient-to-br from-pink-600 to-rose-800 rounded-lg shadow-inner overflow-hidden border border-pink-500/50"
              initial={{ opacity: 1 }}
              animate={{ opacity: isUnwrapping ? [1, 1, 0] : 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              {/* Vertical Ribbon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-gradient-to-b from-yellow-200 to-yellow-500 shadow-lg" />
              {/* Horizontal Ribbon */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 bg-gradient-to-r from-yellow-200 to-yellow-500 shadow-lg" />
            </motion.div>

            {/* Box Lid */}
            <motion.div 
              className="absolute top-8 left-1/2 -translate-x-1/2 w-44 h-12 bg-gradient-to-br from-pink-500 to-rose-700 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.3)] z-10 border border-pink-400/60"
              animate={{
                y: isUnwrapping ? [0, -100, -200] : 0,
                rotate: isUnwrapping ? [0, -15, -30] : 0,
                opacity: isUnwrapping ? [1, 1, 0] : 1
              }}
              transition={{
                duration: 1.5,
                ease: "easeIn",
                delay: 0.8
              }}
            >
              {/* Lid Ribbon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-gradient-to-b from-yellow-100 to-yellow-400" />
            </motion.div>

            {/* Bow */}
            <motion.div 
              className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-12 z-20"
              animate={{
                y: isUnwrapping ? [0, -100, -200] : 0,
                rotate: isUnwrapping ? [0, -15, -30] : 0,
                opacity: isUnwrapping ? [1, 1, 0] : 1
              }}
              transition={{
                duration: 1.5,
                ease: "easeIn",
                delay: 0.8
              }}
            >
              <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                <path d="M50 25C50 25 30 0 15 15C0 30 40 25 50 25Z" fill="url(#goldGradient)" />
                <path d="M50 25C50 25 70 0 85 15C100 30 60 25 50 25Z" fill="url(#goldGradient)" />
                <circle cx="50" cy="25" r="8" fill="url(#goldGradient)" />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fef08a" />
                    <stop offset="1" stopColor="#eab308" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Text / Button Below */}
        <AnimatePresence>
          {!isUnwrapping && (
            <motion.div 
              className="mt-12 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button
                onClick={handleUnwrap}
                disabled={isUnwrapping}
                className="relative overflow-hidden group bg-gradient-to-r from-pink-400 to-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg tracking-wide shadow-[0_0_30px_rgba(244,114,182,0.4)] hover:shadow-[0_0_40px_rgba(244,114,182,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={20} />
                  Unwrap it
                </span>
              </button>
              
              <p className="mt-4 text-pink-200/60 text-sm font-medium tracking-wide flex items-center gap-2">
                <span className="w-4 h-[1px] bg-pink-200/60" />
                Tap to open your surprise
                <span className="w-4 h-[1px] bg-pink-200/60" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Final Flash */}
      <AnimatePresence>
        {isUnwrapping && (
          <motion.div
            className="absolute inset-0 bg-white z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 3.5, times: [0, 0.8, 1], ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
