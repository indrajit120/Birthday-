const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ChevronRight } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export default function Stage4Photos({ onComplete }: { onComplete: () => void }) {
  const { config } = useConfig();
  const photos = config?.photos || [];

  useEffect(() => {
    if (photos.length === 0) {
      onComplete();
      return;
    }
    
    // Auto advance after giving enough time to view the rope loop
    const timer = setTimeout(() => {
      onComplete();
    }, Math.max(photos.length * 4000 + 4000, 15000));

    return () => clearTimeout(timer);
  }, [photos.length, onComplete]);

  if (photos.length === 0) return null;

  // Floating background hearts for romantic effect
  const floaters = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    duration: Math.random() * 5 + 4,
    delay: Math.random() * 2,
  }));

  // Ensure we have enough photos to scroll seamlessly (at least 8 items)
  let basePhotos = [...photos];
  while (basePhotos.length > 0 && basePhotos.length < 8) {
    basePhotos = [...basePhotos, ...photos];
  }

  const duration = basePhotos.length * 4; // 4 seconds per photo

  return (
    <motion.div 
      className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <style>{\`
        @keyframes rope-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-rope-scroll {
          animation: rope-scroll var(--scroll-duration, 30s) linear infinite;
          display: flex;
          width: max-content;
        }
        .rope-mask {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          width: 100%;
          display: flex;
          align-items: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-rope-scroll {
            animation: none !important;
            flex-wrap: wrap;
            width: 100%;
            justify-content: center;
            transform: none !important;
          }
          .rope-mask {
            mask-image: none;
            -webkit-mask-image: none;
            overflow-y: auto;
          }
        }
      \`}</style>

      {/* Floating Hearts Background */}
      {floaters.map(f => (
        <motion.div
          key={f.id}
          className="absolute text-pink-400/30 pointer-events-none"
          style={{ left: \`\${f.x}%\`, top: \`\${f.y}%\` }}
          animate={{
            y: [-30, 30],
            rotate: [0, 90, 180],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            duration: f.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut",
            delay: f.delay
          }}
        >
          <Heart size={f.size} fill="currentColor" />
        </motion.div>
      ))}

      <div className="rope-mask w-full">
        <div 
          className="animate-rope-scroll items-start pt-10 pb-20"
          style={{ '--scroll-duration': \`\${duration}s\` } as any}
        >
          {[0, 1].map((blockIdx) => (
            <div key={blockIdx} className="flex">
              {basePhotos.map((src, idx) => {
                const globalIdx = blockIdx * basePhotos.length + idx;
                const swayDuration = 3 + (globalIdx % 3); 
                const swayDelay = (globalIdx % 5) * 0.5;
                const rotation = -3 + (globalIdx % 7);
                
                return (
                  <div key={\`\${blockIdx}-\${idx}\`} className="relative flex flex-col items-center px-4 md:px-8 shrink-0">
                    {/* Rope Segment */}
                    <div className="absolute top-[16px] left-0 w-full h-[2px] bg-[#d4a373] shadow-[0_1px_3px_rgba(0,0,0,0.8)] z-0">
                       {/* Bulbs */}
                       <div className="absolute -top-1.5 left-[25%] w-3 h-3 rounded-full bg-yellow-100 shadow-[0_0_15px_5px_rgba(253,224,71,0.9)] animate-pulse" style={{ animationDuration: '2.2s', animationDelay: \`\${globalIdx * 0.2}s\` }} />
                       <div className="absolute -top-1.5 left-[75%] w-3 h-3 rounded-full bg-amber-100 shadow-[0_0_12px_4px_rgba(251,191,36,0.8)] animate-pulse" style={{ animationDuration: '2.8s', animationDelay: \`\${globalIdx * 0.4}s\` }} />
                    </div>

                    {/* Swaying Photo */}
                    <motion.div 
                      className="relative z-10 flex flex-col items-center pt-[4px]"
                      style={{ transformOrigin: 'top center' }}
                      animate={{ rotate: [rotation - 2, rotation + 2, rotation - 2] }}
                      transition={{ duration: swayDuration, delay: swayDelay, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Clip */}
                      <div className="w-2.5 h-6 bg-[#4a4e69] rounded-sm shadow-md -mb-2 z-20 relative border border-[#22223b]" />
                      
                      {/* Photo Card */}
                      <div className="w-44 h-52 md:w-64 md:h-80 bg-[#f8f9fa] p-2 pb-10 md:p-3 md:pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-sm border border-gray-200">
                         <img src={src} alt="Memory" className="w-full h-full object-cover pointer-events-none rounded-sm" />
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onComplete}
        className="absolute bottom-8 z-50 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium transition-colors border border-white/20 shadow-lg"
      >
        Continue <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}
`;

fs.writeFileSync('src/components/Stage4Photos.tsx', code);
