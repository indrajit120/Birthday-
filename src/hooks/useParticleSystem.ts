import { useEffect, useRef, RefObject } from 'react';
import { useConfig } from '../contexts/ConfigContext';

export type Particle = {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  baseSize: number;
  colorIdx: number;
  rotation: number;
  targetRotation: number;
  rotationSpeed: number;
  opacity: number;
  state: 'explode' | 'form' | 'settled';
  delay: number;
  timeAlive: number;
  isFloater: boolean;
};

const heartColors = [
  '#FF69B4', '#FF1493', '#FFC0CB', '#FFB6C1', '#DB7093', '#F08080', '#FFA07A', '#FF4500', '#FFD700'
];

let cachedSprites: HTMLCanvasElement[] | null = null;

// Pre-render hearts to offscreen canvases for massive performance gains on mobile
const getHeartSprites = () => {
  if (cachedSprites) return cachedSprites;
  cachedSprites = heartColors.map(color => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.translate(size / 2, size / 2);
    ctx.scale(size / 30, size / 30);

    ctx.shadowColor = 'rgba(200, 50, 100, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-10, -5, -20, 5, 0, 20);
    ctx.bezierCurveTo(20, 5, 10, -5, 0, 5);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.bezierCurveTo(-6, -2, -10, 4, -2, 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    return canvas;
  });
  return cachedSprites;
};

export function useParticleSystem(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isActive: boolean,
  originX: number,
  originY: number,
  onFormationComplete: () => void
) {
  const { config } = useConfig();
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const formationCompleteTriggered = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive || !config) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const sprites = getHeartSprites();

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const baseCount = config.heartAnimation?.particleCount || (window.innerWidth > 600 ? 500 : 350);
    const particleCount = prefersReducedMotion ? Math.floor(baseCount / 3) : baseCount;
    const newParticles: Particle[] = [];

    // Scale calculation for the target bouquet
    const scale = Math.min(width, height) / 45; 
    const centerX = width / 2;
    const centerY = height / 2 - 50;

    for (let i = 0; i < particleCount; i++) {
      const isFloater = Math.random() > 0.85; // 15% are floating ambient hearts
      
      // Explosion physics
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 20 + 8;
      
      // Bouquet Mathematical Shape Distribution
      const t = Math.random() * Math.PI * 2;
      // Rejection-style sampling mix (filling the area vs edging)
      let r = Math.sqrt(Math.random()); 
      if (Math.random() > 0.7) r = 0.9 + Math.random() * 0.1; // Edge clustering for solid outline
      
      const hx = 16 * Math.pow(Math.sin(t), 3) * r;
      const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
      
      const targetZ = (Math.random() - 0.5) * 2; // -1 (back) to 1 (front)

      newParticles.push({
        id: i,
        x: originX,
        y: originY,
        z: (Math.random() - 0.5) * 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * 5,
        targetX: centerX + hx * scale,
        targetY: centerY - hy * scale,
        targetZ: targetZ,
        baseSize: isFloater ? (Math.random() * 8 + 4) : (Math.random() * 14 + 10),
        colorIdx: Math.floor(Math.random() * heartColors.length),
        rotation: Math.random() * Math.PI * 2,
        targetRotation: (Math.random() - 0.5) * 0.3, // Slight organic tilt in final state
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        opacity: 1,
        state: 'explode',
        delay: Math.random() * 40,
        timeAlive: 0,
        isFloater
      });
    }

    // Sort immediately by targetZ so drawing order natively creates correct depth layer overlapping
    newParticles.sort((a, b) => a.targetZ - b.targetZ);
    particlesRef.current = newParticles;
    formationCompleteTriggered.current = false;

    const drawStem = (ctx: CanvasRenderingContext2D) => {
       ctx.save();
       ctx.beginPath();
       ctx.moveTo(centerX, centerY + scale * 15);
       ctx.quadraticCurveTo(centerX + 20, centerY + scale * 30, centerX - 10, height + 50);
       
       const gradient = ctx.createLinearGradient(centerX, centerY, centerX, height);
       gradient.addColorStop(0, 'rgba(219, 39, 119, 0.4)'); // Pink-600 with opacity
       gradient.addColorStop(1, 'transparent');
       
       ctx.strokeStyle = gradient;
       ctx.lineWidth = 4;
       ctx.stroke();
       ctx.restore();
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let allFormed = true;
      let someFormed = false;
      const time = Date.now() * 0.001;

      particlesRef.current.forEach(p => {
        p.timeAlive++;

        if (p.state === 'explode') {
          allFormed = false;
          // Apply velocity and friction
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.vx *= 0.90;
          p.vy *= 0.90;
          p.vz *= 0.90;
          
          p.rotation += p.rotationSpeed;

          // Transition to forming state
          if (p.timeAlive > 30 + p.delay) {
            p.state = p.isFloater ? 'settled' : 'form';
          }
        } else if (p.state === 'form') {
          someFormed = true;
          // Spring physics toward target
          const stiffness = 0.04;
          const damping = 0.82;
          
          const ax = (p.targetX - p.x) * stiffness;
          const ay = (p.targetY - p.y) * stiffness;
          const az = (p.targetZ - p.z) * stiffness;
          
          p.vx = (p.vx + ax) * damping;
          p.vy = (p.vy + ay) * damping;
          p.vz = (p.vz + az) * damping;
          
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          
          // Smoothly interpolate rotation
          p.rotation += (p.targetRotation - p.rotation) * 0.05;

          // Check if settled
          if (Math.abs(p.vx) > 0.2 || Math.abs(p.vy) > 0.2 || Math.abs(p.targetX - p.x) > 2) {
             allFormed = false;
          } else {
             p.state = 'settled';
          }
        } else if (p.state === 'settled') {
           someFormed = true;
           if (!p.isFloater) {
             // Organic breathing/swaying movement based on position and time
             const offset = Math.sin(time * 2 + p.id * 0.1) * 0.3;
             p.x += Math.cos(time + p.id) * 0.1;
             p.y += offset;
           } else {
             // Float away gracefully
             p.y -= 0.5 + Math.random() * 0.5;
             p.x += Math.sin(time + p.id) * 0.5;
             p.rotation += p.rotationSpeed * 0.1;
             p.opacity = Math.max(0, p.opacity - 0.002);
             
             // Wrap around if offscreen
             if (p.y < -50) {
                p.y = height + 50;
                p.x = Math.random() * width;
                p.opacity = 1;
             }
           }
        }

        if (p.opacity <= 0) return;

        // Draw particle using cached sprite
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Scale based on Z depth (perspective simulation)
        // targetZ is -1 (back) to 1 (front)
        const depthScale = (p.z + 2) / 2; // Maps to roughly 0.5 to 1.5
        const finalScale = (p.baseSize / 64) * depthScale; // 64 is sprite size
        
        ctx.scale(finalScale, finalScale);
        ctx.globalAlpha = p.opacity;
        
        ctx.drawImage(sprites[p.colorIdx], -32, -32); // Draw centered
        ctx.restore();
      });

      if (someFormed) {
         // Draw stem behind particles
         ctx.globalCompositeOperation = 'destination-over';
         drawStem(ctx);
         ctx.globalCompositeOperation = 'source-over';
      }

      // Safe fallback timer: trigger completion 5 seconds after start regardless
      const timeSinceStart = particlesRef.current[0]?.timeAlive || 0;
      
      if ((allFormed || timeSinceStart > 300) && !formationCompleteTriggered.current) {
         formationCompleteTriggered.current = true;
         onFormationComplete();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, originX, originY, onFormationComplete, canvasRef]);
}
