import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useParticleSystem } from '../hooks/useParticleSystem';

interface Stage2ImpactProps {
  impactCoords: { x: number; y: number };
  onComplete: () => void;
}

export default function Stage2Impact({ impactCoords, onComplete }: Stage2ImpactProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFlash, setShowFlash] = useState(true);

  useParticleSystem(canvasRef, true, impactCoords.x, impactCoords.y, () => {
    // Wait a bit after formation is complete to show the bouquet, then transition
    setTimeout(onComplete, 2000);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFlash(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      {/* Canvas for Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* Impact Flash */}
      {showFlash && (
        <motion.div 
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}

      {/* Ripple Effect */}
      {showFlash && (
        <motion.div
          className="absolute rounded-full border-4 border-pink-400"
          style={{
            left: impactCoords.x - 50,
            top: impactCoords.y - 50,
            width: 100,
            height: 100,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}
