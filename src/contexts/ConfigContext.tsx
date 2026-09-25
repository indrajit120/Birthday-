import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from './defaultConfig';

export type VideoStageConfig = {
  enabled: boolean;
  videoUrl: string;
  fileName?: string;
  resolution: 'Auto' | '360p' | '480p' | '720p' | '1080p';
  aspectRatio?: 'Auto' | '16:9' | '9:16' | '4:3' | '1:1';
  resolutions?: {
    '360p'?: string;
    '480p'?: string;
    '720p'?: string;
    '1080p'?: string;
  };
};

export type BirthdayConfig = {
  experienceId?: string;
  name: string;
  senderName: string;
  age: number;
  birthdayDate: string;
  introText: string;
  instructionText: string;
  mainMessage: string;
  subtitle: string;
  finalMessage: string;
  song: string;
  photos: string[];
  colors: {
    bgStart: string;
    bgEnd: string;
    heartPink: string;
  };
  slingshotSettings: {
    maxPull: number;
    gravity: number;
    bowScale?: number;
    bowDistance?: number;
  };
  heartAnimation: {
    particleCount: number;
    speed: number;
    glow: number;
  };
  photoScene?: {
    heading: string;
    subtitle: string;
  };
  shareSettings: {
    title: string;
    description: string;
  };
  letterScene?: {
    enableAnimals: boolean;
    enableHearts: boolean;
    enableSparkles: boolean;
    enablePetals: boolean;
    animationIntensity: 'Low' | 'Medium' | 'High';
  };
  cakeScene: {
    enabled: boolean;
    title: string;
    buttonText: string;
    surpriseMessage1: string;
    surpriseMessage2: string;
    continueButton: string;
    cakeBaseColor: string;
    frostingColor: string;
    creamColor: string;
    decorationColor: string;
    candleCount: number;
    candleColor: string;
    soundEffect: string;
    sparkleIntensity: number;
    flavour?: string;
    spongeColor?: string;
    dripColor?: string;
    flowerColor?: string;
    heartColor?: string;
    pearlColor?: string;
    platformColor?: string;
    backgroundColor?: string;
  };
  balloonScene?: {
    enabled: boolean;
    heading: string;
    subtitle: string;
    popSoundEnabled: boolean;
    confettiEnabled: boolean;
    sparkleEnabled: boolean;
    completionText: string;
    balloons: Array<{
      id: string | number;
      title: string;
      message: string;
      balloonColor: string;
      accentColor: string;
    }>;
  };
  friendshipRules?: {
    enabled: boolean;
    roomLabel: string;
    title: string;
    cardTitle: string;
    subtitle: string;
    signatureLabel: string;
    buttonText: string;
    completedButtonText: string;
    stampTitle: string;
    stampSubtitle: string;
    rules: Array<{
      id: string;
      text: string;
      enabled: boolean;
      required: boolean;
      order: number;
      icon?: string;
    }>;
  };
  puzzleScene?: {
    enabled: boolean;
    roomLabel: string;
    title: string;
    instructions: string;
    image: string;
    gridSize: number; // 2, 3, 4
    completionTitle: string;
    completionMessage: string;
    completionButtonText: string;
    enablePeek: boolean;
    enableTimer: boolean;
    enableMoveCounter: boolean;
    backgroundColor: string;
    textColor: string;
  };
  videoStage?: VideoStageConfig;
  endScene?: {
    enabled: boolean;
    heading: string;
    senderMessage: string;
    buttonText: string;
    helperText: string;
    colors: {
      bgStart: string;
      bgEnd: string;
      heading: string;
      recipientName: string;
      senderMessage: string;
      buttonStart: string;
      buttonEnd: string;
      buttonText: string;
      helperText: string;
    };
    animations: {
      confetti: boolean;
      sparkles: boolean;
      hearts: boolean;
      floatingParticles: boolean;
      characterAnimation: boolean;
      intensity: 'Low' | 'Medium' | 'High';
      speed: number;
      confettiAmount: number;
      glowEffects: boolean;
    };
    character: {
      enabled: boolean;
      type: 'emoji' | 'photo';
      image: string;
      size: number;
      position: 'center' | 'bottom';
      floating: boolean;
      imageFit: 'contain' | 'cover';
      imageBorderRadius: number;
      glow: boolean;
      glowIntensity: number;
    };
    button: {
      icon: string;
      size: 'small' | 'medium' | 'large';
      cornerRadius: number;
      glow: boolean;
      pulse: boolean;
      hoverAnimation: boolean;
    };
  };
  sceneOrder: string[];
};

type ConfigContextType = {
  config: BirthdayConfig;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  updateConfigLocally: (newConfig: BirthdayConfig) => void;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

function getInitialConfig(): BirthdayConfig {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('birthday_surprise_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return {
            ...DEFAULT_CONFIG,
            ...parsed,
            colors: { ...DEFAULT_CONFIG.colors, ...parsed.colors },
            slingshotSettings: { ...DEFAULT_CONFIG.slingshotSettings, ...parsed.slingshotSettings },
            heartAnimation: { ...DEFAULT_CONFIG.heartAnimation, ...parsed.heartAnimation },
            shareSettings: { ...DEFAULT_CONFIG.shareSettings, ...parsed.shareSettings },
            cakeScene: { ...DEFAULT_CONFIG.cakeScene, ...parsed.cakeScene },
            balloonScene: { ...DEFAULT_CONFIG.balloonScene, ...parsed.balloonScene },
            friendshipRules: { ...DEFAULT_CONFIG.friendshipRules, ...parsed.friendshipRules },
            puzzleScene: { ...DEFAULT_CONFIG.puzzleScene, ...parsed.puzzleScene },
            videoStage: { ...DEFAULT_CONFIG.videoStage, ...(parsed.videoStage || {}) },
            endScene: { ...DEFAULT_CONFIG.endScene, ...parsed.endScene },
            letterScene: { ...DEFAULT_CONFIG.letterScene, ...parsed.letterScene },
            sceneOrder: parsed.sceneOrder || DEFAULT_CONFIG.sceneOrder,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached config from localStorage', e);
    }
  }
  return DEFAULT_CONFIG;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BirthdayConfig>(getInitialConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfigLocally = (newConfig: BirthdayConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('birthday_surprise_config', JSON.stringify(newConfig));
    } catch (err) {
      console.warn('Failed to update config locally in localStorage', err);
    }
  };

  const fetchConfig = async () => {
    try {
      let data: any = null;

      // 1. Try primary API endpoint (/api/config)
      try {
        const res = await fetch('/api/config', {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('Fetch from /api/config failed, trying fallback:', e);
      }

      // 2. If primary API failed, try static config.json fallback (e.g. Netlify static hosting)
      if (!data || typeof data !== 'object' || !data.name) {
        try {
          const res = await fetch('/config.json', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          });
          const contentType = res.headers.get('content-type');
          if (res.ok && contentType && contentType.includes('application/json')) {
            data = await res.json();
          }
        } catch (e) {
          console.warn('Fetch from /config.json failed:', e);
        }
      }

      if (data && typeof data === 'object' && data.name) {
        const merged: BirthdayConfig = {
          ...DEFAULT_CONFIG,
          ...data,
          colors: { ...DEFAULT_CONFIG.colors, ...data.colors },
          slingshotSettings: { ...DEFAULT_CONFIG.slingshotSettings, ...data.slingshotSettings },
          heartAnimation: { ...DEFAULT_CONFIG.heartAnimation, ...data.heartAnimation },
          shareSettings: { ...DEFAULT_CONFIG.shareSettings, ...data.shareSettings },
          cakeScene: { ...DEFAULT_CONFIG.cakeScene, ...data.cakeScene },
          balloonScene: { ...DEFAULT_CONFIG.balloonScene, ...data.balloonScene },
          friendshipRules: { ...DEFAULT_CONFIG.friendshipRules, ...data.friendshipRules },
          puzzleScene: { ...DEFAULT_CONFIG.puzzleScene, ...data.puzzleScene },
          videoStage: { ...DEFAULT_CONFIG.videoStage, ...(data.videoStage || {}) },
          endScene: { ...DEFAULT_CONFIG.endScene, ...data.endScene },
          letterScene: { ...DEFAULT_CONFIG.letterScene, ...data.letterScene },
          sceneOrder: data.sceneOrder || DEFAULT_CONFIG.sceneOrder,
        };
        setConfig(merged);
        try {
          localStorage.setItem('birthday_surprise_config', JSON.stringify(merged));
        } catch (err) {
          console.warn('Unable to persist config to localStorage', err);
        }
        setError(null);
      } else {
        setConfig(prev => prev || getInitialConfig());
      }
    } catch (err) {
      console.warn('Config fetch error, using fallback:', err);
      setConfig(prev => prev || getInitialConfig());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error, refreshConfig: fetchConfig, updateConfigLocally }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  const interpolate = (text: string | undefined) => {
    if (!text) return "";
    let result = text.replace(/\{(name|recipientName)\}/gi, context.config?.name || 'You');
    result = result.replace(/\{senderName\}/gi, context.config?.senderName || 'Me');
    result = result.replace(/\{age\}/gi, context.config?.age?.toString() || '');
    return result;
  };

  return { ...context, interpolate };
}
