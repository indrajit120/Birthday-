const fs = require('fs');

const code = `import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronRight, Sparkles } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export default function Stage4Photos({ onComplete }: { onComplete: () => void }) {
  const { config, interpolate } = useConfig();
  const photos = config?.photos || [];
  
  const heading = interpolate(config?.photoScene?.heading || 'A walk down memory lane');
  const subtitle = interpolate(config?.photoScene?.subtitle || 'Every moment with you is my favorite memory. ❤️');

  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const isMobile = winWidth < 768;
  const itemW = isMobile ? 240 : 320;
  const itemGap = isMobile ? 32 : 64;
  const itemWidth = itemW + itemGap;
  const setWidth = photos.length * itemWidth;

  const numCopies = Math.max(5, Math.ceil((winWidth * 3) / (setWidth || 1)));
  const baseOffset = -Math.floor(numCopies / 2) * setWidth;
  const centerOffset = (winWidth / 2) - (itemW / 2);

  const allPhotos = [];
  for (let i = 0; i < numCopies; i++) {
    allPhotos.push(...photos);
  }

  // Physics State
  const x = useRef(0);
  const velocity = useRef(0);
  const isDown = useRef(false);
  const lastMouseX = useRef(0);
  const lastTime = useRef(performance.now());
  const lastPointerTime = useRef(performance.now());
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number>(0);
  const autoSlide = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (photos.length === 0) {
      onComplete();
    }
  }, [photos.length, onComplete]);

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    autoSlide.current = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    lastTime.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = now - lastTime.current;
      lastTime.current = now;

      if (!isDown.current) {
        if (!autoSlide.current) {
          // Settling / Friction
          x.current += velocity.current;
          velocity.current *= 0.92;
        } else {
          // Auto sliding right to left (negative velocity)
          // Normal speed: roughly -0.8 px per frame at 60fps
          const targetVelocity = -0.048 * dt; 
          velocity.current += (targetVelocity - velocity.current) * 0.1;
          x.current += velocity.current;
        }
      }

      // Wrap x
      if (setWidth > 0) {
        x.current = ((x.current % setWidth) + setWidth) % setWidth;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = \`translate3d(\${baseOffset + x.current + centerOffset}px, 0, 0)\`;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    };
  }, [photos.length, setWidth, baseOffset, centerOffset]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (photos.length === 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDown.current = true;
    setIsDragging(true);
    lastMouseX.current = e.clientX;
    lastPointerTime.current = performance.now();
    velocity.current = 0;
    autoSlide.current = false;
    if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDown.current) return;
    const delta = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;
    x.current += delta;
    
    const now = performance.now();
    const dt = now - lastPointerTime.current;
    if (dt > 0) {
        velocity.current = (delta / dt) * 16.6;
    }
    lastPointerTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDown.current) return;
    isDown.current = false;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      pauseTimeout.current = setTimeout(() => {
        autoSlide.current = true;
      }, 2500);
    }
  };

  if (photos.length === 0) return null;

  // Background particles
  const hearts = Array.from({ length: 15 }).map((_, i) => ({
    id: \`heart-\${i}\`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 15 + 10,
    duration: Math.random() * 6 + 5,
    delay: Math.random() * 4,
  }));

  const sparkles = Array.from({ length: 25 }).map((_, i) => ({
    id: \`sparkle-\${i}\`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
  }));

  // Bulbs along the rope (spanning a wide area)
  const bulbs = Array.from({ length: 80 }).map((_, i) => ({
    id: \`bulb-\${i}\`,
    left: (i - 40) * 120, // Spread out widely
    duration: 1.5 + Math.random() * 2,
    delay: Math.random() * 2,
    isWarm: Math.random() > 0.5
  }));

  return (
    <motion.div 
      className="absolute inset-0 z-40 flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#ffe5ec] via-[#ffb3c6] to-[#ff8fab] overscroll-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <style>{\`
        .photo-mask {
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      \`}</style>

      {/* Bokeh / Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-400/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Floating Hearts */}
      {hearts.map(f => (
        <motion.div
          key={f.id}
          className="absolute text-pink-100/50 pointer-events-none"
          style={{ left: \`\${f.x}%\`, top: \`\${f.y}%\` }}
          animate={{
            y: [-40, 40],
            rotate: [0, 90, 180],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: f.duration, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut", delay: f.delay }}
        >
          <Heart size={f.size} fill="currentColor" />
        </motion.div>
      ))}

      {/* Sparkles */}
      {sparkles.map(f => (
        <motion.div
          key={f.id}
          className="absolute text-yellow-100/60 pointer-events-none"
          style={{ left: \`\${f.x}%\`, top: \`\${f.y}%\` }}
          animate={{
            scale: [0.5, 1.2, 0.5],
            opacity: [0.1, 0.8, 0.1],
            rotate: [0, 180]
          }}
          transition={{ duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
        >
          <Sparkles size={f.size} />
        </motion.div>
      ))}

      {/* Header Area */}
      <div className="absolute top-12 left-0 w-full text-center z-50 pointer-events-none px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-serif font-bold text-pink-900 drop-shadow-sm mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {heading}
        </motion.h2>
        <motion.p 
          className="text-sm md:text-base text-pink-800/90 font-medium max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Carousel */}
      <div 
        className="w-full relative h-[60dvh] mt-12 photo-mask touch-pan-y"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Continuous fixed rope (doesn't scroll, extends far) */}
        <div className="absolute top-[20px] h-[3px] bg-[#b07d5d] shadow-[0_1px_3px_rgba(0,0,0,0.4)] pointer-events-none" style={{ left: -1000, right: -1000, zIndex: 10 }}>
           {bulbs.map(b => (
             <div 
               key={b.id} 
               className={\`absolute -top-1.5 w-3 h-3 rounded-full \${b.isWarm ? 'bg-yellow-100 shadow-[0_0_15px_5px_rgba(253,224,71,0.8)]' : 'bg-amber-100 shadow-[0_0_12px_4px_rgba(251,191,36,0.7)]'} animate-pulse\`}
               style={{ 
                 left: \`\${b.left + (winWidth/2)}px\`, 
                 animationDuration: \`\${b.duration}s\`, 
                 animationDelay: \`\${b.delay}s\` 
               }} 
             />
           ))}
        </div>

        <div 
          ref={trackRef}
          className="absolute top-0 left-0 h-full flex items-start pointer-events-none" 
          style={{ willChange: 'transform' }}
        >
          {/* Photo Items */}
          {allPhotos.map((src, idx) => {
            const originalIdx = idx % photos.length;
            const rotation = -4 + (originalIdx % 9);
            const swayDuration = 4 + (originalIdx % 3);
            const swayDelay = (originalIdx % 5) * 0.5;

            return (
              <div 
                key={\`\${idx}-\${src}\`}
                className="relative shrink-0 flex flex-col items-center pointer-events-none"
                style={{ width: \`\${itemW}px\`, marginRight: \`\${itemGap}px\` }}
              >
                <motion.div 
                  className="relative z-20 flex flex-col items-center pt-[20px]"
                  style={{ transformOrigin: 'top center' }}
                  animate={{ rotate: [rotation - 2, rotation + 2, rotation - 2] }}
                  transition={{ duration: swayDuration, delay: swayDelay, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Clip */}
                  <div className="absolute top-[10px] w-3 h-7 bg-[#4a4e69] rounded-sm shadow-md z-30 border border-[#22223b]" />
                  
                  {/* Polaroid Frame */}
                  <div className="w-full aspect-[4/5] bg-[#f8f9fa] p-3 pb-12 md:p-4 md:pb-16 shadow-[0_12px_30px_rgba(0,0,0,0.25)] rounded-sm border border-gray-100 relative mt-4 pointer-events-auto">
                     <img src={src} alt="Memory" className="w-full h-full object-cover pointer-events-none rounded-sm bg-gray-200" draggable="false" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls & Navigation */}
      <div className="absolute bottom-6 left-0 w-full flex flex-col items-center gap-6 z-50 pointer-events-none">
        {/* Continue Button */}
        <button 
          onClick={onComplete}
          className="flex items-center gap-2 px-8 py-3.5 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full text-pink-900 font-bold shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all pointer-events-auto hover:scale-105 active:scale-95"
        >
          Continue <ChevronRight size={18} className="text-pink-700" />
        </button>
      </div>
    </motion.div>
  );
}
`;

fs.writeFileSync('src/components/Stage4Photos.tsx', code);
