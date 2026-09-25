const fs = require('fs');

const code = `import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export default function Stage4Photos({ onComplete }: { onComplete: () => void }) {
  const { config, interpolate } = useConfig();
  const photos = config?.photos || [];
  
  const heading = interpolate(config?.photoScene?.heading || 'A walk down memory lane');
  const subtitle = interpolate(config?.photoScene?.subtitle || 'Every moment with you is my favorite memory. ❤️');

  const [index, setIndex] = useState(0);
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPos = scrollRef.current.scrollLeft;
    const itemWidth = isMobile ? 240 + 32 : 320 + 64; // itemW + itemGap
    const paddingLeft = (winWidth / 2) - (isMobile ? 240 / 2 : 320 / 2);
    
    // Calculate which item is currently centered
    const centeredIndex = Math.round((scrollPos) / itemWidth);
    if (centeredIndex !== index && centeredIndex >= 0 && centeredIndex < photos.length) {
      setIndex(centeredIndex);
    }
  };

  const scrollToPhoto = (i: number) => {
    if (!scrollRef.current) return;
    const itemWidth = isMobile ? 240 + 32 : 320 + 64;
    scrollRef.current.scrollTo({
      left: i * itemWidth,
      behavior: 'smooth'
    });
    setIndex(i);
  };

  const next = () => {
    if (index < photos.length - 1) scrollToPhoto(index + 1);
  };
  
  const prev = () => {
    if (index > 0) scrollToPhoto(index - 1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Snap to nearest photo after drag
    if (!scrollRef.current) return;
    const scrollPos = scrollRef.current.scrollLeft;
    const itemWidth = isMobile ? 240 + 32 : 320 + 64;
    const nearestIndex = Math.round(scrollPos / itemWidth);
    scrollToPhoto(Math.max(0, Math.min(nearestIndex, photos.length - 1)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (photos.length === 0) return null;

  const isMobile = winWidth < 768;
  const itemW = isMobile ? 240 : 320;
  const itemGap = isMobile ? 32 : 64;
  
  // To center the first and last items, we need padding on both sides of the scroll container
  const sidePadding = (winWidth / 2) - (itemW / 2);

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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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

      {/* Native Scrollable Carousel */}
      <div className="w-full relative h-[60dvh] mt-12 photo-mask">
        
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
          ref={scrollRef}
          className={\`w-full h-full overflow-x-auto overflow-y-hidden flex items-start hide-scrollbar \${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'}\`}
          style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {/* Photo Items */}
          {photos.map((src, idx) => {
            const rotation = -4 + (idx % 9);
            const swayDuration = 4 + (idx % 3);
            const swayDelay = (idx % 5) * 0.5;

            return (
              <div 
                key={idx} 
                className="relative shrink-0 flex flex-col items-center snap-center"
                style={{ width: \`\${itemW}px\`, marginRight: idx === photos.length - 1 ? 0 : itemGap }}
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
                  <div className="w-full aspect-[4/5] bg-[#f8f9fa] p-3 pb-12 md:p-4 md:pb-16 shadow-[0_12px_30px_rgba(0,0,0,0.25)] rounded-sm border border-gray-100 relative mt-4">
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
        
        {/* Navigation Arrows & Dots */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <button 
            onClick={prev}
            disabled={index === 0}
            className={\`p-2 rounded-full transition-all \${index === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-white/30 hover:bg-white/50 shadow-md text-pink-900'}\`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            {photos.map((_, i) => (
              <button 
                key={i} 
                onClick={() => scrollToPhoto(i)}
                className={\`w-2.5 h-2.5 rounded-full transition-all \${index === i ? 'bg-pink-600 scale-125' : 'bg-pink-300 hover:bg-pink-400'}\`}
                aria-label={\`Go to photo \${i + 1}\`}
              />
            ))}
          </div>

          <button 
            onClick={next}
            disabled={index === photos.length - 1}
            className={\`p-2 rounded-full transition-all \${index === photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white/30 hover:bg-white/50 shadow-md text-pink-900'}\`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

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
`

fs.writeFileSync('src/components/Stage4Photos.tsx', code);
