const fs = require('fs');

const code = `import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export default function Stage1Intro({ onImpact }: { onImpact: (x: number, y: number) => void }) {
  const { config, interpolate } = useConfig();
  
  const targetRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const stringRef = useRef<SVGPathElement>(null);
  
  const [isDraggingState, setIsDraggingState] = useState(false);
  
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ vx: 0, vy: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isLaunched = useRef(false);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 10 + 5,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 2,
  }));

  const updateDOM = (x: number, y: number, rot: number = 0) => {
     if (projRef.current) {
        projRef.current.style.transform = \`translate3d(\${x}px, \${y}px, 0) rotate(\${rot}deg)\`;
     }
     if (stringRef.current) {
        // String ends are at (60, 210) and (340, 210). Center is at (200, 200).
        stringRef.current.setAttribute('d', \`M 60 210 L \${200 + x} \${200 + y} L 340 210\`);
     }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
     if (isLaunched.current) return;
     isDragging.current = true;
     setIsDraggingState(true);
     startPos.current = { x: e.clientX, y: e.clientY };
     dragOffset.current = { x: pos.current.x, y: pos.current.y };
     e.currentTarget.setPointerCapture(e.pointerId);
     e.currentTarget.style.cursor = 'grabbing';
     cancelAnimationFrame(animFrame.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
     if (!isDragging.current) return;
     
     const dx = e.clientX - startPos.current.x;
     const dy = e.clientY - startPos.current.y;
     
     let newX = dragOffset.current.x + dx;
     let newY = dragOffset.current.y + dy;
     
     // Max pull radius
     const dist = Math.hypot(newX, newY);
     const MAX_PULL = config?.slingshotSettings?.maxPull || 140;
     
     if (dist > MAX_PULL) {
        newX = (newX / dist) * MAX_PULL;
        newY = (newY / dist) * MAX_PULL;
     }
     
     // Prevent pulling arrow too far forward above the bow grip
     if (newY < -30) newY = -30;
     
     pos.current = { x: newX, y: newY };
     
     // Calculate rotation based on pull angle
     let rot = 0;
     if (Math.abs(newX) > 0.1 || Math.abs(newY) > 0.1) {
         rot = (Math.atan2(-newY, -newX) * 180 / Math.PI) + 90;
     }
     
     updateDOM(newX, newY, rot);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
     if (!isDragging.current) return;
     isDragging.current = false;
     setIsDraggingState(false);
     
     if (projRef.current) {
        projRef.current.releasePointerCapture(e.pointerId);
        projRef.current.style.cursor = 'grab';
     }
     
     // Only launch if pulled down significantly
     if (pos.current.y > 30) {
        launch();
     } else {
        snapBack();
     }
  };

  const snapBack = () => {
     const animate = () => {
        if (isDragging.current || isLaunched.current) return;
        
        pos.current.x *= 0.55;
        pos.current.y *= 0.55;
        
        if (Math.abs(pos.current.x) < 1 && Math.abs(pos.current.y) < 1) {
           pos.current = { x: 0, y: 0 };
           updateDOM(0, 0, 0);
           return; 
        }
        
        let rot = 0;
        if (Math.abs(pos.current.x) > 0.1 || Math.abs(pos.current.y) > 0.1) {
            rot = (Math.atan2(-pos.current.y, -pos.current.x) * 180 / Math.PI) + 90;
        }
        
        updateDOM(pos.current.x, pos.current.y, rot);
        animFrame.current = requestAnimationFrame(animate);
     };
     animFrame.current = requestAnimationFrame(animate);
  };

  const launch = () => {
     isLaunched.current = true;
     // Fire the arrow based on pull distance
     vel.current.vx = -pos.current.x * 0.28;
     vel.current.vy = -pos.current.y * 0.28;
     
     // Snap the string back instantly
     if (stringRef.current) {
        stringRef.current.setAttribute('d', \`M 60 210 L 200 200 L 340 210\`);
     }
     
     const animate = () => {
        if (!isLaunched.current) return;
        
        pos.current.x += vel.current.vx;
        pos.current.y += vel.current.vy;
        
        vel.current.vy += config?.slingshotSettings?.gravity || 0.8; // gravity
        
        // Update arrow rotation to follow trajectory
        const rot = (Math.atan2(vel.current.vy, vel.current.vx) * 180 / Math.PI) + 90;
        
        if (projRef.current) {
           projRef.current.style.transform = \`translate3d(\${pos.current.x}px, \${pos.current.y}px, 0) rotate(\${rot}deg)\`;
        }
        
        if (checkCollision()) {
           return; 
        }
        
        if (pos.current.y > window.innerHeight || pos.current.x < -window.innerWidth || pos.current.x > window.innerWidth) {
           resetBow();
           return;
        }
        
        animFrame.current = requestAnimationFrame(animate);
     };
     animFrame.current = requestAnimationFrame(animate);
  };

  const checkCollision = () => {
     if (!targetRef.current || !projRef.current) return false;
     const targetRect = targetRef.current.getBoundingClientRect();
     const projRect = projRef.current.getBoundingClientRect();
     
     const tx = targetRect.left + targetRect.width / 2;
     const ty = targetRect.top + targetRect.height / 2;
     const px = projRect.left + projRect.width / 2;
     const py = projRect.top + projRect.height / 2;
     
     const dist = Math.hypot(tx - px, ty - py);
     
     // 90 is generous hit radius for mobile
     if (dist < 90) {
         isLaunched.current = false;
         onImpact(tx, ty);
         return true;
     }
     return false;
  };

  const resetBow = () => {
     isLaunched.current = false;
     pos.current = { x: 0, y: 0 };
     vel.current = { vx: 0, vy: 0 };
     updateDOM(0, 0, 0);
  };

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-between py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ 
               left: \`\${p.x}%\`, 
               top: \`\${p.y}%\`,
               color: config?.colors.heartPink,
               opacity: 0.3
            }}
            animate={{
              y: [-20, 20],
              x: [-10, 10],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 180]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: p.delay,
              ease: "easeInOut"
            }}
          >
            <Heart size={p.size} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center z-10 w-full relative">
        <motion.p 
          className="font-display text-lg italic opacity-70 mb-12"         
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.8 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {interpolate(config?.introText)}
        </motion.p>

        <motion.div
          ref={targetRef}
          className="relative w-40 h-40 flex items-center justify-center drop-shadow-2xl"
          animate={{ y: [-10, 10] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-pink-500 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg z-10 overflow-visible pointer-events-none">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff75a0" />
                <stop offset="100%" stopColor="#ff1493" />
              </linearGradient>
              <radialGradient id="highlight" cx="30%" cy="30%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path 
              d="M50,85 C50,85 10,55 10,30 C10,15 25,10 35,15 C45,20 50,30 50,30 C50,30 55,20 65,15 C75,10 90,15 90,30 C90,55 50,85 50,85 Z" 
              fill="url(#heartGrad)" 
            />
            <path 
              d="M50,85 C50,85 10,55 10,30 C10,15 25,10 35,15 C45,20 50,30 50,30 C50,30 55,20 65,15 C75,10 90,15 90,30 C90,55 50,85 50,85 Z" 
              fill="url(#highlight)" 
            />
          </svg>
        </motion.div>
      </div>

      {/* Interactive Cupid Bow Area */}
      <div className="relative z-10 mt-auto mb-20 w-full h-64 flex justify-center items-end pointer-events-none">
         <div className="relative w-0 h-0">
            
            <svg className="absolute w-[400px] h-[400px] -left-[200px] -top-[200px] pointer-events-none overflow-visible z-10">
              <defs>
                <linearGradient id="bowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b45309" /> 
                  <stop offset="15%" stopColor="#f59e0b" /> 
                  <stop offset="50%" stopColor="#fbbf24" /> 
                  <stop offset="85%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="4" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Bow Limbs */}
              <path 
                 d="M 60 210 Q 200 110 340 210" 
                 fill="none" 
                 stroke="url(#bowGrad)" 
                 strokeWidth="16" 
                 strokeLinecap="round" 
                 style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.3))' }}
              />
              {/* Grip wrap */}
              <path 
                 d="M 185 159 L 215 159 L 212 175 L 188 175 Z" 
                 fill="#78350f" 
              />
              <path 
                 d="M 187 167 L 213 167" 
                 stroke="#d97706" 
                 strokeWidth="2" 
              />
              {/* Heart on Grip */}
              <path 
                 d="M 200 167 C 200 167 192 156 192 163 C 192 168 200 174 200 174 C 200 174 208 168 208 163 C 208 156 200 167 200 167 Z" 
                 fill="#ec4899" 
                 filter="url(#glow)"
              />

              {/* String */}
              <path 
                 ref={stringRef} 
                 d="M 60 210 L 200 200 L 340 210" 
                 fill="none" 
                 stroke="#fbcfe8" 
                 strokeWidth="2.5" 
                 strokeLinecap="round"
                 style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}
              />
            </svg>

            {/* Cupid Arrow */}
            <div
                ref={projRef}
                className="absolute -left-3 -top-[112px] w-6 h-[112px] flex flex-col items-center justify-end cursor-grab touch-none z-20 pointer-events-auto"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ touchAction: 'none', transformOrigin: 'bottom center' }}
            >
               {/* Arrow Head */}
               <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-pink-500 drop-shadow-md relative z-10" />
               {/* Shaft */}
               <div className="w-1.5 h-[80px] bg-gradient-to-b from-pink-400 to-pink-200 shadow-sm -mt-1" />
               {/* Fletching */}
               <div className="flex w-full justify-between -mt-6 relative z-0">
                  <div className="w-3 h-8 bg-white/90 rounded-full rotate-[30deg] transform origin-bottom-right shadow-sm border border-pink-100" />
                  <div className="w-3 h-8 bg-white/90 rounded-full -rotate-[30deg] transform origin-bottom-left shadow-sm border border-pink-100" />
               </div>
               {/* Nock */}
               <div className="w-2 h-2 bg-pink-300 rounded-sm mt-1" />
               
               {/* Invisible interactive grab area (large for mobile) */}
               <div className="absolute bottom-[-30px] w-24 h-24 bg-transparent rounded-full" />
            </div>

            <motion.div
                className="absolute bottom-[-70px] left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.2em] uppercase text-pink-500 opacity-90 whitespace-nowrap"
               animate={{ opacity: isDraggingState ? 0 : 0.9, y: isDraggingState ? 10 : 0 }}
            >
               {interpolate(config?.instructionText || 'Pull to release love')}
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}
`;

fs.writeFileSync('src/components/Stage1Intro.tsx', code);
