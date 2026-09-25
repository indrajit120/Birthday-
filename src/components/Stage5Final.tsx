import { useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Star, Link as LinkIcon } from 'lucide-react';

const particleStyles = `
  @keyframes sfParticleFloat {
    0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
    20% { opacity: 0.8; }
    80% { opacity: 0.8; }
    100% { transform: translateY(-100vh) scale(1.5) rotate(90deg); opacity: 0; }
  }
  @keyframes sfHeartFloat {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    20% { opacity: 1; transform: translateY(-15vh) translateX(-15px); }
    80% { opacity: 1; transform: translateY(-30vh) translateX(15px); }
    100% { transform: translateY(-40vh) translateX(0); opacity: 0; }
  }
  @keyframes sfSparkleTwinkle {
    0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
    100% { transform: scale(0.5) rotate(90deg); opacity: 0; }
  }
  @keyframes sfPetalSpin {
    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
    20% { opacity: 0.8; }
    80% { opacity: 0.8; }
    100% { transform: translateY(100vh) translateX(20vw) rotate(360deg); opacity: 0; }
  }
`;

function ParticleBackground({ colors, animations }: any) {
  const intensity = animations?.intensity || 'Medium';
  // Reduced particle counts for mobile performance (WebGL context safe)
  const mult = intensity === 'Low' ? 0.3 : intensity === 'High' ? 1.0 : 0.6;
  
  const particles = useMemo(() => Array.from({ length: Math.floor(25 * mult) }).map((_, i) => ({
    id: `p-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 15 + 10, delay: Math.random() * 10,
  })), [mult]);

  const hearts = useMemo(() => Array.from({ length: Math.floor(10 * mult) }).map((_, i) => ({
    id: `h-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 10 + 8, duration: Math.random() * 20 + 15, delay: Math.random() * 10
  })), [mult]);

  const sparkles = useMemo(() => Array.from({ length: Math.floor(15 * mult) }).map((_, i) => ({
    id: `s-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 4 + 2, delay: Math.random() * 5
  })), [mult]);

  const petals = useMemo(() => Array.from({ length: Math.floor(8 * mult) }).map((_, i) => ({
    id: `petal-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 6 + 4, duration: Math.random() * 15 + 10, delay: Math.random() * 10
  })), [mult]);

  const isGlow = animations?.glowEffects !== false;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{particleStyles}</style>
      {animations?.floatingParticles !== false && particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            backgroundColor: isGlow ? '#fff' : 'rgba(255,255,255,0.4)',
            boxShadow: isGlow ? '0 0 10px rgba(255,255,255,0.8)' : 'none',
            animation: `sfParticleFloat ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}

      {animations?.hearts !== false && hearts.map(p => (
        <div key={p.id} className="absolute text-pink-300/40" style={{ 
          left: `${p.x}%`, top: `${p.y}vh`, width: p.size, height: p.size,
          animation: `sfHeartFloat ${p.duration}s ease-in-out ${p.delay}s infinite`
        }}>
          <Heart fill="currentColor" stroke="none" />
        </div>
      ))}

      {animations?.sparkles !== false && sparkles.map(p => (
        <div key={p.id} className="absolute text-yellow-100/60" style={{ 
          left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          animation: `sfSparkleTwinkle ${p.duration}s ease-in-out ${p.delay}s infinite`
        }}>
          {parseInt(p.id.split('-')[1]) % 2 === 0 ? <Sparkles /> : <Star fill="currentColor" stroke="none" />}
        </div>
      ))}

      {animations?.floatingParticles !== false && petals.map(p => (
        <div key={p.id} className="absolute text-pink-200/50" style={{ 
          left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          animation: `sfPetalSpin ${p.duration}s linear ${p.delay}s infinite`
        }}>
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-full h-full">
            <path d="M12 2C8 2 4 6 4 12C4 18 8 22 12 22C16 22 20 18 20 12C20 6 16 2 12 2Z" style={{transform: "scale(1, 0.5) rotate(45deg)", transformOrigin: "center"}} />
          </svg>
        </div>
      ))}
    </div>
  );
}

export default function Stage5Final({ onComplete }: { onComplete?: () => void }) {
  const { config, interpolate } = useConfig();
  
  // Safely extract deeply nested configurations to prevent crashes
  const endScene: any = config?.endScene || {};
  const animations: any = endScene.animations || {};
  const character: any = endScene.character || {};
  const colors: any = endScene.colors || {};
  const button: any = endScene.button || {};

  const handleShare = async () => {
    if (animations.confetti !== false) {
      confetti({
        particleCount: animations.confettiAmount || 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7']
      });
    }

    const shareUrl = window.location.href;
    const shareText = `Check out this birthday surprise for ${config?.name || 'you'}! 🎂✨`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Happy Birthday!',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        // AbortError is thrown when user cancels the share sheet. Ignore it.
        console.log('Share sheet was closed or failed:', err);
      }
    } else {
      // Fallback
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const formattedSenderMessage = () => {
    const msgTemplate = endScene.senderMessage || "Made with love, just for you — {senderName} ❤️";
    const fullMessage = interpolate(msgTemplate);
    const sender = config?.senderName;
    
    if (sender && fullMessage.includes(sender)) {
      const parts = fullMessage.split(sender);
      return (
        <span style={{ color: colors.senderMessage || '#ffffff' }}>
          {parts[0]}
          <span style={{ color: colors.recipientName || '#FBBF24', fontWeight: 600 }}>{sender}</span>
          {parts[1]}
        </span>
      );
    }
    
    return <span style={{ color: colors.senderMessage || '#ffffff' }}>{fullMessage}</span>;
  };

  // Safe checks for character rendering
  const charEnabled = character.enabled !== false;
  const charType = character.type || 'emoji';
  const charImage = character.image || (charType === 'photo' ? '' : '🐰');
  const charSize = character.size || 120;
  const charRadius = character.imageBorderRadius || 0;
  const charGlow = character.glow !== false;
  const charGlowIntensity = character.glowIntensity || 20;

  return (
    <motion.div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
      style={{
        background: `radial-gradient(circle at center, ${colors.bgStart || '#2B1B36'} 0%, ${colors.bgEnd || '#1F1223'} 100%)`
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');`}
      </style>
      
      {animations.floatingParticles !== false && (
        <ParticleBackground colors={colors} animations={animations} />
      )}
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md h-full justify-center pb-8 safe-area-pb">
        
        {/* Top Text Section */}
        <div className="flex flex-col items-center gap-2 mb-6 md:mb-8 mt-auto pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center font-black tracking-widest uppercase drop-shadow-md leading-[1.15]"
            style={{ 
              color: colors.heading || '#ffffff', 

              fontSize: 'min(12vw, 3rem)' 
            }}
          >
            {interpolate(endScene.heading || "HAPPY BIRTHDAY").split(' ').map((word: string, i: number) => (
              <span key={i} className="block">{word}</span>
            ))}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
            className="font-script font-bold tracking-normal drop-shadow-lg leading-none"
            style={{ 
              color: colors.recipientName || '#FBBF24', 
               
              fontSize: 'min(16vw, 5rem)' 
            }}
          >
            {config?.name || 'You'}!
          </motion.h2>
        </div>

        {/* Character / Photo Section */}
        {charEnabled && (
          <motion.div
            animate={character.floating !== false && animations.characterAnimation !== false ? { y: [-8, 8, -8] } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8 md:mb-12 relative shrink-0 flex items-center justify-center"
            style={charType === 'photo' && charGlow ? {
              filter: `drop-shadow(0 0 ${charGlowIntensity}px rgba(255, 255, 255, 0.4))`
            } : {}}
          >
            {charType === 'emoji' ? (
              <span style={{ fontSize: `${charSize}px`, lineHeight: 1, filter: charGlow ? `drop-shadow(0 0 ${charGlowIntensity}px rgba(255,255,255,0.4))` : 'none' }}>
                {charImage}
              </span>
            ) : charType === 'photo' && charImage ? (
              <div 
                style={{ 
                  width: `${charSize}px`, 
                  height: `${charSize}px`,
                  borderRadius: `${charRadius}px`,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={charImage} 
                  alt="Character" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: character.imageFit || 'contain'
                  }}
                />
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Bottom Actions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-auto flex flex-col items-center gap-4 w-full px-4"
        >
          <p 
            className="text-sm md:text-base opacity-95 drop-shadow-sm flex items-center justify-center flex-wrap gap-1"
           
          >
            {formattedSenderMessage()}
          </p>
          
          <motion.button
            onClick={handleShare}
            whileHover={button.hoverAnimation !== false ? { scale: 1.03 } : {}}
            whileTap={button.hoverAnimation !== false ? { scale: 0.97 } : {}}
            animate={button.pulse !== false ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              background: `linear-gradient(135deg, ${colors.buttonStart || '#FF7E5F'}, ${colors.buttonEnd || '#FEB47B'})`,
              color: colors.buttonText || '#ffffff',
              borderRadius: `${button.cornerRadius ?? 9999}px`,
              boxShadow: button.glow !== false ? `0 0 25px ${colors.buttonStart || '#FF7E5F'}80, 0 8px 16px rgba(0,0,0,0.1)` : '0 4px 6px rgba(0,0,0,0.1)',
              padding: button.size === 'large' ? '18px 32px' : button.size === 'medium' ? '14px 24px' : '10px 16px'
            }}
            className="w-full flex items-center justify-center font-bold text-lg md:text-xl border-0 cursor-pointer overflow-hidden relative group max-w-sm mx-auto"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              {interpolate(endScene.buttonText || "Send It to {recipientName} 🎁")}
            </span>
          </motion.button>
          
          <div 
            className="text-xs md:text-sm font-medium mt-1 flex items-center justify-center gap-1.5 opacity-80"
            style={{ color: colors.helperText || '#ffffffb3' }}
          >
            {endScene.helperText?.includes("🔗") ? null : <LinkIcon size={14} className="opacity-70 shrink-0" />}
            <span className="text-center">{interpolate(endScene.helperText || "🔗 This creates the private link you'll send them")}</span>
          </div>
        </motion.div>
        
        {/* Hidden complete button just in case parents depend on it */}
        {onComplete && (
           <div className="hidden pointer-events-none" onClick={onComplete}></div>
        )}
      </div>
    </motion.div>
  );
}
