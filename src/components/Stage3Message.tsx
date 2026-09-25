import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';

export default function Stage3Message({ onComplete }: { onComplete: () => void }) {
  const { config, interpolate } = useConfig();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2500);
    const t3 = setTimeout(() => setStep(3), 4500);
    
    // Auto advance after the text appears
    const t4 = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="absolute inset-0 z-30 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
      
      <div className="relative z-10 min-h-full grid place-items-center p-6 text-center">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl py-12">
        <AnimatePresence>
          {step >= 1 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg italic opacity-70"
             
            >
              {interpolate(config?.introText)}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step >= 2 && (
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-display text-5xl md:text-7xl font-bold tracking-tight text-pink-600"
              style={{ textShadow: '0 2px 10px rgba(219, 39, 119, 0.1)' }}
            >
              {interpolate(config?.mainMessage)}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl opacity-80 font-medium mt-4"
            >
              {interpolate(config?.subtitle)}
            </motion.p>
          )}
        </AnimatePresence>


        </div>
      </div>
    </motion.div>
  );
}
