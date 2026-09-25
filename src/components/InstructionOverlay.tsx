import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';

interface InstructionOverlayProps {
  sceneName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionOverlay({ sceneName, isOpen, onClose }: InstructionOverlayProps) {
  let instructions: React.ReactNode = null;

  switch (sceneName) {
    case 'intro':
      instructions = (
        <>
          <p className="mb-2"><strong>Touch and hold</strong> the bow.</p>
          <p className="mb-2"><strong>Drag the bow</strong> to aim.</p>
          <p className="mb-2"><strong>Move the bow toward the heart</strong>.</p>
          <p className="mb-2"><strong>Release</strong> to shoot the arrow.</p>
          <p>Hit the heart to continue.</p>
        </>
      );
      break;
    case 'puzzle':
      instructions = (
        <>
          <p className="mb-2">Tap two pieces to <strong>swap them</strong>.</p>
          <p className="mb-2">Or, <strong>drag a piece</strong> to its correct spot.</p>
          <p>Put the photo back together to continue.</p>
        </>
      );
      break;
    case 'rules':
      instructions = (
        <>
          <p className="mb-2">Read our <strong>Friendship Rules</strong>.</p>
          <p className="mb-2"><strong>Check off</strong> each rule by tapping it.</p>
          <p>Once all rules are checked, <strong>sign your name</strong> at the bottom.</p>
        </>
      );
      break;
    case 'message':
    case 'letter':
      instructions = (
        <>
          <p className="mb-2">Read the message written for you.</p>
          <p>Tap the <strong>Continue</strong> button at the bottom when you're ready.</p>
        </>
      );
      break;
    case 'cake':
      instructions = (
        <>
          <p className="mb-2">You can <strong>swipe around</strong> to view the cake from different angles.</p>
          <p className="mb-2">Use the controls to customize your perfect birthday cake.</p>
          <p>When you're ready, tap <strong>Cut the Cake</strong> to make a wish!</p>
        </>
      );
      break;
    case 'photos':
      instructions = (
        <>
          <p className="mb-2">Photos automatically move from right to left.</p>
          <p className="mb-2">You can <strong>touch and drag</strong> photos left or right.</p>
          <p>Auto movement pauses while you're touching, and resumes when you let go.</p>
        </>
      );
      break;
    case 'balloons':
      instructions = (
        <>
          <p className="mb-2">Tap each balloon to <strong>pop it</strong>!</p>
          <p>Pop all the balloons to see the hidden messages inside.</p>
        </>
      );
      break;
    case 'final':
      instructions = (
        <>
          <p className="mb-2">You've reached the end!</p>
          <p>Enjoy the celebrations and tap the <strong>Share</strong> button if you want to share this moment.</p>
        </>
      );
      break;
    default:
      instructions = (
        <p>Follow the on-screen instructions to continue.</p>
      );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white/95 backdrop-blur-md border border-pink-100 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <Info className="text-pink-500 w-6 h-6" />
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 text-center mt-4 mb-6 font-serif">How to Play</h2>
            
            <div className="text-gray-600 text-[15px] leading-relaxed text-center mb-8">
              {instructions}
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl font-medium shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
