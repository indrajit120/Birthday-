/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useConfig } from './contexts/ConfigContext';
import Stage1Intro from './components/Stage1Intro';
import Stage2Impact from './components/Stage2Impact';
import Stage3Message from './components/Stage3Message';
import StageBalloons from './components/StageBalloons';
import StageCake from './components/StageCake';
import Stage4Photos from './components/Stage4Photos';
import StagePuzzle from './components/StagePuzzle';
import StageLetter from './components/StageLetter';
import Stage6Rules from "./components/Stage6Rules";
import Stage5Final from './components/Stage5Final';
import GiftIntro from './components/GiftIntro';
import TopUI from './components/TopUI';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { config, loading, interpolate } = useConfig();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showImpact, setShowImpact] = useState(false);
  const [impactCoords, setImpactCoords] = useState({ x: 0, y: 0 });
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (config) {
      document.title = interpolate(config.shareSettings?.title) || `Birthday Surprise`;
    }
  }, [config?.name, config?.shareSettings?.title, interpolate]);

  const [hasAttemptedAutoplay, setHasAttemptedAutoplay] = useState(false);

  useEffect(() => {
    if (config?.song && audioRef.current && !hasAttemptedAutoplay) {
      setHasAttemptedAutoplay(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => console.warn("Autoplay blocked, waiting for user interaction.", e));
      }
    }
  }, [config?.song, hasAttemptedAutoplay]);

  if (loading || !config) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const activeScenes = config.sceneOrder.filter(s => s !== 'cake' || config.cakeScene.enabled);
  const currentSceneName = activeScenes[sceneIndex] || 'intro';



  const handleInteractionStart = () => {
    if (!isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(e => console.warn("Audio play blocked on interaction", e));
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleGiftOpen = () => {
    setIsGiftOpened(true);
  };

  const handleFirstInteraction = () => {
    if (!isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => console.warn("Audio play blocked on interaction", e));
      } else {
        setIsPlaying(true);
      }
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleImpact = (x: number, y: number) => {
    setImpactCoords({ x, y });
    setShowImpact(true);
  };

  const handleNextScene = () => {
    setSceneIndex(prev => {
      const activeScenes = config.sceneOrder.filter(s => s !== 'cake' || config.cakeScene.enabled);
      if (prev < activeScenes.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const onImpactComplete = () => {
    setShowImpact(false);
    handleNextScene();
  };

  const handleBack = () => {
    if (sceneIndex > 0) {
      setSceneIndex(sceneIndex - 1);
    }
  };

  return (
    <div 
      className="relative w-full h-[100dvh] overflow-hidden text-[#4A4A4A] touch-none select-none font-sans"
      style={{
        background: `radial-gradient(circle at center, ${config.colors.bgStart} 0%, ${config.colors.bgEnd} 100%)`
      }}
      onClick={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
    >
      
      <AnimatePresence>
        {!isGiftOpened && (
          <GiftIntro 
            key="gift-intro" 
            onOpen={handleGiftOpen} 
            onInteractionStart={handleInteractionStart}
            recipientName={config.name || 'You'} 
          />
        )}
      </AnimatePresence>
      <audio ref={audioRef} src={config.song} loop />

      
      <TopUI isPlaying={isPlaying} toggleMusic={toggleMusic} stage={sceneIndex + 1} setStage={handleBack} currentSceneName={currentSceneName} />

      <AnimatePresence mode="wait">
        {showImpact && (
          <div key="impact-scene" className="absolute inset-0 z-50">
            <Stage2Impact impactCoords={impactCoords} onComplete={onImpactComplete} />
          </div>
        )}
        
        {!showImpact && currentSceneName === 'intro' && (
          <div key="scene-intro" className="absolute inset-0">
            <Stage1Intro onImpact={handleImpact} />
          </div>
        )}
        {!showImpact && currentSceneName === 'message' && (
          <div key="scene-message" className="absolute inset-0">
            <Stage3Message onComplete={handleNextScene} />
          </div>
        )}
        {!showImpact && currentSceneName === 'balloons' && (
          <div key="scene-balloons" className="absolute inset-0">
            <StageBalloons onComplete={handleNextScene} />
          </div>
        )}
        {!showImpact && currentSceneName === 'cake' && (
          <div key="scene-cake" className="absolute inset-0">
            <ErrorBoundary fallback={<div className="flex items-center justify-center h-full w-full bg-black/50 text-white">Oops, the 3D cake couldn't load.</div>} onError={handleNextScene}>
              <StageCake onComplete={handleNextScene} />
            </ErrorBoundary>
          </div>
        )}
        {!showImpact && currentSceneName === 'photos' && (
          <div key="scene-photos" className="absolute inset-0">
            <Stage4Photos onComplete={handleNextScene} />
          </div>
        )}
        {!showImpact && currentSceneName === 'puzzle' && (
          <div key="scene-puzzle" className="absolute inset-0">
            <StagePuzzle onComplete={handleNextScene} />
          </div>
        )}
        {!showImpact && currentSceneName === 'letter' && (
          <div key="scene-letter" className="absolute inset-0">
            <StageLetter onComplete={handleNextScene} />
          </div>
        )}
        {!showImpact && currentSceneName === "rules" && (
          <div key="scene-rules" className="absolute inset-0">
            <Stage6Rules onComplete={handleNextScene} />
          </div>
        )}
        {!showImpact && currentSceneName === 'final' && (
          <div key="scene-final" className="absolute inset-0">
            <Stage5Final onComplete={handleNextScene} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

