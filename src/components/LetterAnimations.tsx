import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';
import { Heart, Sparkles, Star } from 'lucide-react';

const ButterflySVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.6" width="100%" height="100%">
    <path d="M12,12 C10,8 6,4 2,8 C-2,12 2,16 6,18 C8,19 10,16 12,14 C14,16 16,19 18,18 C22,16 26,12 22,8 C18,4 14,8 12,12 Z" />
  </svg>
);

const BirdSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.4" width="100%" height="100%">
    <path d="M2,12 C6,8 10,8 12,12 C14,8 18,8 22,12 C20,14 16,16 12,14 C8,16 4,14 2,12 Z" />
  </svg>
);

const BunnySVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.3" width="100%" height="100%">
    <path d="M12 20a4 4 0 0 1-4-4c0-2 2-4 2-4s-1-4 1-6c1-1 2-1 3 0s1 4 1 6c0 0 2 2 2 4a4 4 0 0 1-4 4zM9 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);

const PetalSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.5" width="100%" height="100%">
    <path d="M12,2 C16,4 20,8 20,12 C20,16 16,20 12,22 C8,20 4,16 4,12 C4,8 8,4 12,2 Z" />
  </svg>
);

export function AtmosphereAnimations() {
  const { config } = useConfig();
  const settings = config?.letterScene || {
    enableAnimals: true,
    enableHearts: true,
    enableSparkles: true,
    enablePetals: true,
    animationIntensity: 'Medium'
  };

  const mult = settings.animationIntensity === 'Low' ? 0.5 : settings.animationIntensity === 'High' ? 1.5 : 1;

  const hearts = useMemo(() => Array.from({ length: Math.floor(15 * mult) }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 10 + 8, duration: Math.random() * 20 + 15, delay: Math.random() * 10
  })), [mult]);

  const petals = useMemo(() => Array.from({ length: Math.floor(20 * mult) }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: -20 - Math.random() * 50, size: Math.random() * 8 + 6, duration: Math.random() * 15 + 10, delay: Math.random() * 15
  })), [mult]);

  const sparkles = useMemo(() => Array.from({ length: Math.floor(25 * mult) }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 4 + 2, delay: Math.random() * 5
  })), [mult]);

  const butterflies = useMemo(() => Array.from({ length: Math.floor(3 * mult) }).map((_, i) => ({
    id: i, startY: Math.random() * 60 + 20, duration: Math.random() * 15 + 20, delay: Math.random() * 10
  })), [mult]);
  
  const birds = useMemo(() => Array.from({ length: Math.floor(4 * mult) }).map((_, i) => ({
    id: i, startY: Math.random() * 30 + 5, duration: Math.random() * 30 + 30, delay: Math.random() * 15
  })), [mult]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Hearts */}
      {settings.enableHearts && hearts.map(p => (
        <motion.div key={`heart-${p.id}`} className="absolute text-pink-300/40" style={{ left: `${p.x}%`, width: p.size, height: p.size }}
          initial={{ y: `${p.y}vh`, opacity: 0 }}
          animate={{ y: `${p.y - 30}vh`, opacity: [0, 1, 0], x: [0, Math.random() * 20 - 10, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart fill="currentColor" stroke="none" />
        </motion.div>
      ))}

      {/* Petals */}
      {settings.enablePetals && petals.map(p => (
        <motion.div key={`petal-${p.id}`} className="absolute text-pink-200/50" style={{ left: `${p.x}%`, width: p.size, height: p.size }}
          initial={{ y: `${p.y}vh`, opacity: 0, rotate: 0 }}
          animate={{ y: '120vh', opacity: [0, 1, 1, 0], rotate: 360, x: [0, Math.random() * 50 - 25, Math.random() * 50 - 25] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <PetalSVG />
        </motion.div>
      ))}

      {/* Sparkles & Stars */}
      {settings.enableSparkles && sparkles.map(p => (
        <motion.div key={`sparkle-${p.id}`} className="absolute text-yellow-100/60" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {p.id % 2 === 0 ? <Sparkles /> : <Star fill="currentColor" stroke="none" />}
        </motion.div>
      ))}

      {/* Butterflies */}
      {settings.enableAnimals && butterflies.map(p => (
        <motion.div key={`bf-${p.id}`} className="absolute text-pink-200/40" style={{ top: `${p.startY}%`, width: 16, height: 16 }}
          initial={{ left: '-10%', opacity: 0 }}
          animate={{ left: '110%', opacity: [0, 1, 1, 0], y: [0, -30, 20, -10, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <motion.div animate={{ scaleX: [1, 0.2, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>
            <ButterflySVG />
          </motion.div>
        </motion.div>
      ))}

      {/* Birds */}
      {settings.enableAnimals && birds.map(p => (
        <motion.div key={`bird-${p.id}`} className="absolute text-white/20" style={{ top: `${p.startY}%`, width: 12, height: 12 }}
          initial={{ right: '-10%', opacity: 0 }}
          animate={{ right: '110%', opacity: [0, 1, 1, 0], y: [0, 10, -5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
           <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
             <BirdSVG />
           </motion.div>
        </motion.div>
      ))}

      {/* Bunny Silhouette (Occasional) */}
      {settings.enableAnimals && (
        <motion.div className="absolute bottom-5 right-[15%] w-10 h-10 text-white/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: [0, 1, 1, 0], x: [20, 0, 0, -20] }}
          transition={{ duration: 15, delay: 10, repeat: Infinity, repeatDelay: 20 }}
        >
          <BunnySVG />
        </motion.div>
      )}
    </div>
  );
}
