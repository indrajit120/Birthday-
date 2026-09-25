import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';
import confetti from 'canvas-confetti';
import { Sparkles, Move, Clock, Eye, RotateCcw } from 'lucide-react';

export default function StagePuzzle({ onComplete }: { onComplete: () => void }) {
  const { config, interpolate } = useConfig();
  const puzzleConfig = config?.puzzleScene;
  
  const gridSize = puzzleConfig?.gridSize || 3;
  const numPieces = gridSize * gridSize;
  
  const experienceId = config?.experienceId || (config ? btoa(encodeURIComponent(`${config.name}-${config.senderName}`)) : 'default');
  const imageHash = btoa(encodeURIComponent(puzzleConfig?.image || '')).substring(0, 10);
  const storageKey = `puzzleProgress_${imageHash}_${experienceId}`;

  const [hydrated, setHydrated] = useState(false);

  const [pieces, setPieces] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveProgress = (updates: Partial<{pieces: number[], moves: number, elapsed: number, isSolved: boolean}>) => {
    try {
      const existingStr = localStorage.getItem(storageKey);
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const newProgress = { ...existing, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(newProgress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  const shuffleArray = (array: number[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  useEffect(() => {
    const loadState = () => {
      const saved = localStorage.getItem(storageKey);
      let initialPieces: number[] = [];
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.pieces && data.pieces.length === numPieces) {
            initialPieces = data.pieces;
            setMoves(data.moves || 0);
            setElapsed(data.elapsed || 0);
            setIsSolved(data.isSolved || false);
          }
        } catch (e) {}
      }
      
      if (initialPieces.length === 0) {
        let arr = Array.from({ length: numPieces }, (_, i) => i);
        let shuffled = shuffleArray(arr);
        while (shuffled.every((val, index) => val === index) && numPieces > 1) {
          shuffled = shuffleArray(arr);
        }
        initialPieces = shuffled;
        setMoves(0);
        setElapsed(0);
        setIsSolved(false);
      }
      
      setPieces(initialPieces);
      setHydrated(true);
    };

    loadState();

    const handleStorage = (e: StorageEvent) => {
      // If our specific key was deleted, or if localStorage was cleared
      if ((e.key === storageKey && e.newValue === null) || e.key === null) {
        loadState();
      } else if (e.key === null) { // Fallback for clear()
        loadState();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    const handleCustomReset = (e: any) => {
      if (e.type === 'entire-website-progress-reset' && e.detail?.experienceId !== experienceId) return;
      loadState();
    };
    window.addEventListener('entire-website-progress-reset', handleCustomReset);
    window.addEventListener('pageshow', loadState); // Handle bfcache

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('entire-website-progress-reset', handleCustomReset);
      window.removeEventListener('pageshow', loadState);
    };
  }, [storageKey, numPieces]);

  useEffect(() => {
    if (hydrated && !isSolved && puzzleConfig?.enableTimer) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          saveProgress({ elapsed: next });
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hydrated, isSolved, puzzleConfig?.enableTimer, storageKey]);

  const handleReset = () => {
    let arr = Array.from({ length: numPieces }, (_, i) => i);
    let shuffled = shuffleArray(arr);
    while (shuffled.every((val, index) => val === index) && numPieces > 1) {
      shuffled = shuffleArray(arr);
    }
    setPieces(shuffled);
    setMoves(0);
    setElapsed(0);
    setIsSolved(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ pieces: shuffled, moves: 0, elapsed: 0, isSolved: false }));
    } catch (e) {}
  };

  const handleSwap = (index1: number, index2: number) => {
    if (isSolved || index1 === index2) return;
    
    setPieces(prev => {
      const next = [...prev];
      [next[index1], next[index2]] = [next[index2], next[index1]];
      
      const newMoves = moves + 1;
      setMoves(newMoves);
      
      const solved = next.every((val, i) => val === i);
      
      saveProgress({ pieces: next, moves: newMoves, isSolved: solved });
      
      if (solved) {
        setIsSolved(true);
        if (timerRef.current) clearInterval(timerRef.current);
        fireConfetti();
      }
      
      return next;
    });
  };

const handlePieceClick = (index: number) => {
    if (isSolved) return;
    // We handle selection in pointer events. Click is mostly fallback or can be ignored.
    // Actually, to make tap-to-swap work:
    // If we have a selected piece from a PREVIOUS tap, and we tap a NEW piece, swap them.
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbcfe8', '#db2777', '#fdf2f8']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbcfe8', '#db2777', '#fdf2f8']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

const draggedPiece = useRef<number | null>(null);

const handlePointerDown = (e: React.PointerEvent, index: number) => {
    if (isSolved) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggedPiece.current = index;
    // If tapping a second piece, swap them
    if (selectedPiece !== null && selectedPiece !== index) {
      handleSwap(selectedPiece, index);
      setSelectedPiece(null);
      draggedPiece.current = null;
    } else {
      setSelectedPiece(index);
    }
  };

  const handlePointerUp = (e: React.PointerEvent, index: number) => {
    if (isSolved) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Find what element is under the pointer right now
    const clientX = e.clientX;
    const clientY = e.clientY;
    const targetElement = document.elementFromPoint(clientX, clientY);
    
    const dropIndexStr = targetElement?.getAttribute('data-index');
    
    if (draggedPiece.current !== null && dropIndexStr !== null && dropIndexStr !== undefined) {
      const dropIndex = parseInt(dropIndexStr, 10);
      if (!isNaN(dropIndex) && draggedPiece.current !== dropIndex) {
        handleSwap(draggedPiece.current, dropIndex);
        setSelectedPiece(null);
        draggedPiece.current = null;
        return;
      }
    }
    
    // If dropped on itself or outside, it counts as a tap selection.
    // If it was already selected previously, tap-to-swap will be handled by onClick.
    draggedPiece.current = null;
  };





  if (!puzzleConfig || pieces.length === 0) return null;

  return (
    <div 
      className={`absolute inset-0 z-10 flex flex-col pt-16 md:pt-20 pb-8 px-4 items-center justify-center overflow-hidden touch-none transition-opacity duration-300 ${hydrated ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: puzzleConfig.backgroundColor, color: puzzleConfig.textColor }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg flex flex-col h-full"
      >
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-white/40 backdrop-blur rounded-full text-xs font-bold tracking-[0.2em] mb-4 opacity-80 uppercase">
            {interpolate(puzzleConfig.roomLabel)}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold drop-shadow-sm font-display mb-2">
            {interpolate(puzzleConfig.title)}
          </h2>
          <p className="text-sm opacity-80 px-4">
            {interpolate(puzzleConfig.instructions)}
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-4 text-sm font-medium opacity-80">
          {puzzleConfig.enableMoveCounter && (
            <div className="flex items-center gap-1">
              <Move size={16} />
              Moves: {moves}
            </div>
          )}
          {puzzleConfig.enableTimer && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              {formatTime(elapsed)}
            </div>
          )}
          <button onClick={handleReset} className="flex items-center gap-1 hover:opacity-75 transition-opacity cursor-pointer" title="Reset Puzzle">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center w-full min-h-0 relative">
          <div 
            ref={containerRef}
            className="w-full aspect-square max-w-[400px] relative bg-black/5 rounded-xl p-2 shadow-inner"
          >
            <div 
              className="relative w-full h-full"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gap: '2px'
              }}
            >
              {pieces.map((originalIndex, currentIndex) => {
                const x = (originalIndex % gridSize) * (100 / (gridSize - 1));
                const y = Math.floor(originalIndex / gridSize) * (100 / (gridSize - 1));
                
                return (
                  <motion.div
                    key={originalIndex}
                    layout
                    initial={false}
                    className={`relative rounded-md overflow-hidden bg-gray-200 cursor-pointer ${selectedPiece === currentIndex ? 'ring-4 ring-pink-400 z-10 scale-105' : 'hover:opacity-90'}`}
                    style={{
                      backgroundImage: (isPeeking || isSolved) ? 'none' : `url(${puzzleConfig.image})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${x}% ${y}%`,
                      touchAction: 'none'
                    }}
                    onClick={() => handlePieceClick(currentIndex)}
                    data-index={currentIndex}
                    onPointerDown={(e) => handlePointerDown(e, currentIndex)}
                    onPointerUp={(e) => handlePointerUp(e, currentIndex)}
                    onPointerCancel={(e) => {
                      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                      draggedPiece.current = null;
                    }}
                  >
                     {/* For peek/solved state overlay */}
                  </motion.div>
                );
              })}
              
              <AnimatePresence>
                {(isPeeking || isSolved) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 rounded-md overflow-hidden shadow-xl border-4 border-white/50"
                    style={{
                      backgroundImage: `url(${puzzleConfig.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {isSolved && (
                       <motion.div 
                         initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                         animate={{ scale: 1, opacity: 1, rotate: -5 }}
                         transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
                         className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                       >
                         <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-2xl border-2 border-pink-200 text-center transform -rotate-6">
                            <span className="block text-3xl font-black text-pink-500 tracking-wider">
                                {interpolate(puzzleConfig.completionTitle)}
                            </span>
                            <span className="block text-sm font-bold text-gray-700 mt-1">
                                {interpolate(puzzleConfig.completionMessage)}
                            </span>
                         </div>
                       </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 min-h-[80px]">
          {isSolved ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onComplete}
              className="w-full max-w-xs py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg shadow-pink-500/40 hover:scale-[1.02] active:scale-95"
            >
              {interpolate(puzzleConfig.completionButtonText)}
              <Sparkles size={18} />
            </motion.button>
          ) : (
            puzzleConfig.enablePeek && (
              <button
                onPointerDown={() => setIsPeeking(true)}
                onPointerUp={() => setIsPeeking(false)}
                onPointerLeave={() => setIsPeeking(false)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-black/5 hover:bg-black/10 active:bg-black/15 transition-colors font-medium text-sm"
              >
                <Eye size={18} />
                Hold to peek
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
