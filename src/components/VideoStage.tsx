import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ArrowRight, Heart, Sparkles, Star, Volume2, AlertCircle } from 'lucide-react';
import { VideoStageConfig } from '../contexts/ConfigContext';

interface VideoStageProps {
  config: VideoStageConfig;
  onComplete: () => void;
  onVideoStartPlaying: () => void;
  onVideoLeave: () => void;
}

export default function VideoStage({
  config,
  onComplete,
  onVideoStartPlaying,
  onVideoLeave
}: VideoStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const hasCompletedRef = useRef(false);

  // Calculate effective aspect ratio based on config & natural video metadata
  const effectiveAspectRatio = useMemo(() => {
    const setting = config.aspectRatio || 'Auto';
    if (setting === '16:9') return 16 / 9;
    if (setting === '9:16') return 9 / 16;
    if (setting === '4:3') return 4 / 3;
    if (setting === '1:1') return 1;
    // Auto: use detected natural ratio or fallback to 16/9 while loading
    return naturalRatio || (16 / 9);
  }, [config.aspectRatio, naturalRatio]);

  // Ambient particles (Hearts, Sparkles, Petals, Stars, Bokeh)
  const floatingParticles = useMemo(() => 
    Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1.2,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 4,
      type: ['heart', 'glowing-heart', 'sparkle', 'star', 'petal', 'bokeh'][i % 6]
    })),
  []);

  // Resolve best compatible video source according to resolution setting
  const getVideoSource = (): string => {
    if (!config) return '';
    const res = config.resolution || 'Auto';
    if (res !== 'Auto' && config.resolutions && config.resolutions[res as keyof typeof config.resolutions]) {
      return config.resolutions[res as keyof typeof config.resolutions]!;
    }
    return config.videoUrl || '';
  };

  const videoSrc = getVideoSource();

  // Completion handler — guarantees exactly ONCE execution
  const handleCompletion = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  // Attempt autoplay on mount with smooth sequence
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    const attemptPlay = async () => {
      try {
        await video.play();
        if (isMounted) {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          setHasStartedPlaying(true);
          onVideoStartPlaying();
        }
      } catch (err) {
        console.warn('Video autoplay with audio blocked by browser policy:', err);
        if (isMounted) {
          setAutoplayBlocked(true);
          setIsPlaying(false);
        }
      }
    };

    const timer = setTimeout(() => {
      attemptPlay();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      onVideoLeave();
    };
  }, []);

  const handleManualPlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
      setHasStartedPlaying(true);
      onVideoStartPlaying();
    } catch (e) {
      console.warn('Manual play failed:', e);
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && video.currentTime >= video.duration - 0.25) {
      handleCompletion();
    }
  };

  const handleVideoEnded = () => {
    handleCompletion();
  };

  const handleVideoError = () => {
    setLoadError(true);
    setAutoplayBlocked(false);
  };

  const handleRetry = () => {
    setLoadError(false);
    const video = videoRef.current;
    if (video) {
      video.load();
      handleManualPlay();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-3 sm:px-6 select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #2a0b2e 0%, #17041c 55%, #0b020e 100%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative ambient subtle background glows & bokeh */}
      <div 
        className="absolute w-[95vw] h-[95vw] sm:w-[60vw] sm:h-[60vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,114,182,0.18) 0%, rgba(192,132,252,0.12) 40%, rgba(0,0,0,0) 70%)',
          filter: 'blur(55px)',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)'
        }}
      />

      {/* Subtle romantic light rays from top-center */}
      <div 
        className="absolute top-0 inset-x-0 h-[45vh] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(244,114,182,0.3) 0%, rgba(236,72,153,0.08) 50%, transparent 80%)',
          filter: 'blur(30px)'
        }}
      />

      {/* Floating hearts, petals, and sparkles AROUND & BESIDE the video */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingParticles.map(p => (
          <motion.div
            key={p.id}
            className="absolute text-pink-300"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate3d(0, 0, 0)'
            }}
            animate={{
              y: [0, -60, -120],
              x: [0, (p.id % 2 === 0 ? 12 : -12), 0],
              opacity: [0, 0.65, 0],
              scale: [0.8, 1.15, 0.9],
              rotate: [0, p.id % 2 === 0 ? 25 : -25, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut'
            }}
          >
            {p.type === 'heart' && (
              <Heart 
                size={p.size * 7} 
                className="text-pink-400/50 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" 
                fill="currentColor" 
              />
            )}
            {p.type === 'glowing-heart' && (
              <Heart 
                size={p.size * 8} 
                className="text-rose-400/60 drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]" 
                fill="currentColor" 
              />
            )}
            {p.type === 'sparkle' && (
              <Sparkles 
                size={p.size * 6} 
                className="text-yellow-200/55 drop-shadow-[0_0_6px_rgba(253,224,71,0.7)]" 
              />
            )}
            {p.type === 'star' && (
              <Star 
                size={p.size * 5} 
                className="text-pink-200/50 drop-shadow-[0_0_6px_rgba(244,114,182,0.5)]" 
                fill="currentColor" 
              />
            )}
            {p.type === 'petal' && (
              <div 
                className="w-3 h-4 rounded-full bg-gradient-to-br from-pink-300/40 to-rose-400/30 transform rotate-45 blur-[0.5px] shadow-sm" 
              />
            )}
            {p.type === 'bokeh' && (
              <div 
                className="w-4 h-4 rounded-full bg-pink-400/15 blur-[2px]" 
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Top Header Tag */}
      <motion.div
        className="mb-2 sm:mb-4 text-center pointer-events-none z-10 shrink-0"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-pink-300/30 text-pink-200 text-xs sm:text-sm font-medium tracking-wide shadow-md">
          <Sparkles size={13} className="text-pink-300 animate-pulse" />
          <span>A Special Moment For You</span>
          <Heart size={12} className="text-pink-300 fill-pink-300" />
        </div>
      </motion.div>

      {/* Main Video Container with Breathing Pink Glow & Animated Frame */}
      <motion.div
        className="relative flex flex-col items-center justify-center z-10 w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer breathing glow aura around the frame */}
        <div 
          className="absolute inset-0 pointer-events-none -m-3 sm:-m-4 rounded-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(244, 114, 182, 0.28) 0%, rgba(192, 132, 252, 0.15) 50%, transparent 75%)',
            filter: 'blur(20px)',
            animation: 'gentleBreath 4s ease-in-out infinite'
          }}
        />

        {/* Animated Shimmering Gradient Border Frame */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl p-[2px] shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: effectiveAspectRatio,
            maxHeight: 'min(70vh, 580px)',
            maxWidth: 'min(92vw, 860px)',
            width: effectiveAspectRatio < 1 ? `calc(min(70vh, 580px) * ${effectiveAspectRatio})` : '100%',
            height: 'auto'
          }}
        >
          {/* Animated Gradient Sweep Border */}
          <div 
            className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #a855f7, #f43f5e, #ec4899)',
              backgroundSize: '300% 300%',
              animation: 'cinematicSweep 5s ease infinite',
              opacity: 0.9
            }}
          />

          {/* Glass-like Inner Video Shell */}
          <div className="relative w-full h-full rounded-2xl sm:rounded-3xl bg-black/90 overflow-hidden backdrop-blur-xl flex items-center justify-center shadow-inner">
            {/* The Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              controls={!autoplayBlocked && !loadError}
              className="w-full h-full object-contain rounded-2xl sm:rounded-3xl bg-black"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) {
                  setNaturalRatio(v.videoWidth / v.videoHeight);
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
                setAutoplayBlocked(false);
                onVideoStartPlaying();
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />

            {/* Tap to Play Overlay if Autoplay was blocked */}
            <AnimatePresence>
              {autoplayBlocked && !loadError && (
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 cursor-pointer z-20"
                  onClick={handleManualPlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.button
                    className="relative group flex items-center gap-3 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Play size={22} className="text-white fill-white ml-0.5" />
                    </div>
                    <span>Play Video</span>
                    <Volume2 size={18} className="text-pink-200" />
                  </motion.button>
                  <p className="mt-3 text-xs sm:text-sm text-pink-200/90 font-light">
                    Tap to start with sound ✨
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Overlay */}
            <AnimatePresence>
              {loadError && (
                <motion.div
                  className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle size={44} className="text-pink-400 mb-2" />
                  <h3 className="text-white font-medium text-base sm:text-lg mb-1">Video couldn't be loaded</h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-4 max-w-xs">
                    The video source could not be played on this browser.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-medium transition-all"
                    >
                      <RotateCcw size={14} />
                      <span>Retry</span>
                    </button>
                    <button
                      onClick={handleCompletion}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs sm:text-sm font-medium shadow transition-all hover:scale-105"
                    >
                      <span>Continue</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom subtle Skip / Continue link & Aspect Info */}
        <div 
          className="mt-2.5 flex items-center justify-between w-full px-2 text-xs text-pink-200/70"
          style={{
            maxWidth: 'min(92vw, 860px)',
            width: effectiveAspectRatio < 1 ? `calc(min(70vh, 580px) * ${effectiveAspectRatio})` : '100%'
          }}
        >
          <div className="font-light tracking-wide text-pink-300/80">
            {config.aspectRatio && config.aspectRatio !== 'Auto' ? `${config.aspectRatio}` : 'Auto Aspect'}
          </div>
          <button
            onClick={handleCompletion}
            className="inline-flex items-center gap-1 text-pink-200 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/10 font-medium"
            title="Skip to next stage"
          >
            <span>Skip to surprise</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>

      {/* GPU-Friendly Keyframe animations */}
      <style>{`
        @keyframes cinematicSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gentleBreath {
          0%, 100% { transform: scale(0.98); opacity: 0.55; }
          50% { transform: scale(1.02); opacity: 0.85; }
        }
      `}</style>
    </motion.div>
  );
}
