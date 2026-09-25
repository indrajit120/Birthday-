const fs = require('fs');
let code = fs.readFileSync('src/components/TopUI.tsx', 'utf8');

const importsToAdd = `
import { useState, useRef, useEffect } from 'react';
import InstructionOverlay from './InstructionOverlay';
import { motion, AnimatePresence } from 'motion/react';
`;

code = code.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate } from 'react-router-dom';\n" + importsToAdd
);

// Update interface
code = code.replace(
  "interface TopUIProps {\n  isPlaying: boolean;\n  toggleMusic: () => void;\n  stage: number;\n  setStage: (stage: number) => void;\n}",
  "interface TopUIProps {\n  isPlaying: boolean;\n  toggleMusic: () => void;\n  stage: number;\n  setStage: (stage: number) => void;\n  currentSceneName?: string;\n}"
);

// Update component signature
code = code.replace(
  "export default function TopUI({ isPlaying, toggleMusic, stage, setStage }: TopUIProps) {",
  "export default function TopUI({ isPlaying, toggleMusic, stage, setStage, currentSceneName = 'intro' }: TopUIProps) {"
);

// Add state and logic for long press and instructions
const logicToAdd = `
  const [showInstructions, setShowInstructions] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  
  const HOLD_DURATION = 2000;

  const clearHoldTimers = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimerRef.current = null;
    holdIntervalRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      clearHoldTimers();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    clearHoldTimers();
    setIsHolding(true);
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      clearHoldTimers();
      navigate('/admin');
    }, HOLD_DURATION);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isHolding) return;
    
    // If moved outside the button bounds significantly, cancel
    const rect = e.currentTarget.getBoundingClientRect();
    const margin = 20;
    if (
      e.clientX < rect.left - margin ||
      e.clientX > rect.right + margin ||
      e.clientY < rect.top - margin ||
      e.clientY > rect.bottom + margin
    ) {
      clearHoldTimers();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (isHolding) {
      const elapsed = Date.now() - holdStartTimeRef.current;
      clearHoldTimers();
      
      // If it was a short tap, show instructions
      if (elapsed < HOLD_DURATION) {
        setShowInstructions(true);
      }
    }
  };
`;

code = code.replace(
  "const handleShare = async () => {",
  logicToAdd + "\n  const handleShare = async () => {"
);

// Update the ribbon button and add overlay
const newButton = `
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center justify-center">
        <AnimatePresence>
          {isHolding && (
            <motion.svg
              className="absolute pointer-events-none"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#fbcfe8"
                strokeWidth="4"
                className="opacity-30"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#ec4899"
                strokeWidth="4"
                strokeDasharray="175.93"
                strokeDashoffset={175.93 - (175.93 * holdProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-75"
                transform="rotate(-90 32 32)"
              />
            </motion.svg>
          )}
        </AnimatePresence>
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={clearHoldTimers}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
          className="w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-lg rounded-full border border-white/50 shadow-sm hover:scale-110 active:scale-95 transition-transform text-xl relative z-10 select-none"
          title="Info"
        >
          🎀
        </button>
      </div>
      <InstructionOverlay 
        sceneName={currentSceneName}
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
`;

code = code.replace(
  /<button[\s\S]*onClick=\{\(\) => navigate\('\/admin'\)\}[\s\S]*🎀\s*<\/button>/m,
  newButton
);

fs.writeFileSync('src/components/TopUI.tsx', code);
