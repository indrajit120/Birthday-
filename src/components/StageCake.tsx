import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../contexts/ConfigContext';
import { Sparkles as HtmlSparkles, Heart } from 'lucide-react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, PerspectiveCamera } from '@react-three/drei';

// ==========================================
// 3D DECORATIVE COMPONENTS
// ==========================================

function Flame({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!flameRef.current || !lightRef.current) return;
    const t = state.clock.getElapsedTime() + position[0] * 10;
    const scale = 1 + Math.sin(t * 20) * 0.1 + Math.sin(t * 13) * 0.05;
    flameRef.current.scale.setScalar(scale);
    lightRef.current.intensity = 1.0 + Math.sin(t * 15) * 0.2;
    flameRef.current.position.x = Math.sin(t * 25) * 0.01;
    flameRef.current.position.z = Math.cos(t * 22) * 0.01;
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#ffb52e" distance={4} intensity={1.0} decay={2} castShadow />
      <group ref={flameRef}>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffb52e" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function Candle({ position, color, ignited }: { position: [number, number, number], color: string, ignited: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {ignited && <Flame position={[0, 0.85, 0]} />}
    </group>
  );
}

function Rose({ position, scale = 1, primaryColor, secondaryColor }: { position: [number, number, number], scale?: number, primaryColor: string, secondaryColor: string }) {
  const petals = useMemo(() => {
    const arr = [];
    const sizes = [0.18, 0.15, 0.12, 0.10, 0.08];
    sizes.forEach((size, layer) => {
      const count = layer === 0 ? 5 : 7;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = layer * 0.08;
        arr.push({
          size,
          color: layer % 2 === 0 ? primaryColor : secondaryColor,
          pos: [Math.cos(angle) * radius, layer * 0.035, Math.sin(angle) * radius],
          rotY: angle
        });
      }
    });
    return arr;
  }, [primaryColor, secondaryColor]);

  return (
    <group position={position} scale={scale}>
      {petals.map((p, i) => (
        <mesh key={i} position={p.pos as [number, number, number]} rotation={[0, p.rotY, 0]} castShadow>
          <sphereGeometry args={[p.size, 16, 16]} />
          <meshPhysicalMaterial color={p.color} roughness={0.4} clearcoat={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingHeartParticle({ position, delay }: { position: [number, number, number], delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const t = state.clock.getElapsedTime() - delay;
    if (t > 0) {
      ref.current.position.y += 0.02;
      ref.current.rotation.y += 0.01;
      ref.current.scale.setScalar(1 + t * 0.2);
      matRef.current.opacity = Math.max(0, 0.8 - (t / 4));
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial ref={matRef} color="#ff7198" transparent opacity={0} />
    </mesh>
  );
}

// ==========================================
// REALISTIC 3D CAKE & KNIFE LOGIC
// ==========================================

export function CakeScene3D({ config, step, onSliceComplete }: { config: any, step: number, onSliceComplete: () => void }) {
  const { viewport } = useThree();
  const sliceGroup = useRef<THREE.Group>(null);
  const knifeRef = useRef<THREE.Group>(null);
  
  const sliceProgress = useRef(0);
  const knifeProgress = useRef(0);

  // Responsive Scaling: Target ~55-60% of viewport width on mobile. 
  // Cake radius is 2.2, total width ~4.4. 
  const targetScale = Math.min(1.2, (viewport.width * 0.55) / 4.4);

  // Core dimensions
  const radius = 2.2;
  const height = 1.3; // Proportionally realistic: wider than tall
  const cutAngle = Math.PI / 4; 

  const { frostingColor, cakeBaseColor, creamColor, decorationColor, candleCount, candleColor } = config;
  const spongeColor = config.spongeColor || cakeBaseColor || "#eab995";
  const finalFrostingColor = config.frostingColor || frostingColor || "#FFF0F5";
  const dripColor = config.dripColor || "#ff91b1";
  const flowerColor = config.flowerColor || "#ff91b1";
  const finalCreamColor = config.creamColor || creamColor || "#FFFFFF";
  const heartColor = config.heartColor || "#ff7198";
  const pearlColor = config.pearlColor || decorationColor || "#ffc84d";
  const finalCandleColor = config.candleColor || candleColor || "#FFFFFF";
  const platformColor = config.platformColor || "#ffe6ea";

  // Materials
  const frostingMat = <meshPhysicalMaterial color={finalFrostingColor} roughness={0.35} clearcoat={0.25} />;
  const pinkFrostingMat = <meshPhysicalMaterial color={dripColor} roughness={0.38} clearcoat={0.35} />;
  const spongeMat = <meshPhysicalMaterial color={spongeColor} roughness={0.85} bumpScale={0.05} />;
  const creamMat = <meshPhysicalMaterial color={finalCreamColor} roughness={0.55} clearcoat={0.12} />;
  const strawberryMat = <meshPhysicalMaterial color={heartColor} roughness={0.4} clearcoat={0.3} />;
  const pearlMat = <meshPhysicalMaterial color={pearlColor} metalness={0.65} roughness={0.22} clearcoat={0.3} />;

  // Geometry Generation for the Cut Slice
  const sliceExtrudeSettings = { depth: height, bevelEnabled: false, steps: 1 };
  
  const sliceShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    const startA = Math.PI * 2 - cutAngle;
    shape.lineTo(Math.cos(startA) * radius, Math.sin(startA) * radius);
    shape.absarc(0, 0, radius, startA, Math.PI * 2, false);
    shape.lineTo(0, 0);
    return shape;
  }, [radius, cutAngle]);

  const mainCakeShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(radius, 0);
    shape.absarc(0, 0, radius, 0, Math.PI * 2 - cutAngle, false);
    shape.lineTo(0, 0);
    return shape;
  }, [radius, cutAngle]);

  // Animation Loop
  useFrame((state, delta) => {
    if (step === 2) {
      if (knifeProgress.current < 1) {
        knifeProgress.current = Math.min(1, knifeProgress.current + delta * 0.8); // Elegant slicing speed
      } else {
        onSliceComplete();
      }
    }
    
    if (step >= 3) {
      if (sliceProgress.current < 1) {
        sliceProgress.current = Math.min(1, sliceProgress.current + delta * 1.5);
      }
      if (sliceGroup.current) {
        // Slide out along the angle bisector
        const angle = Math.PI * 2 - (cutAngle / 2);
        const dist = sliceProgress.current * 0.8;
        sliceGroup.current.position.x = THREE.MathUtils.lerp(sliceGroup.current.position.x, Math.cos(angle) * dist, 0.15);
        sliceGroup.current.position.z = THREE.MathUtils.lerp(sliceGroup.current.position.z, Math.sin(angle) * dist, 0.15);
      }
    }
    
    // Smooth Knife Kinematics
    if (knifeRef.current) {
      if (step === 1) {
        // Hover naturally outside/above cake right side
        knifeRef.current.position.lerp(new THREE.Vector3(radius + 1.2, height + 1.5, radius * 0.5), 0.1);
        knifeRef.current.rotation.set(-0.2, 0.5, -0.4);
      } else if (step === 2) {
        // Slicing motion
        if (knifeProgress.current < 0.2) {
           // Move into position above cut center
           const p = knifeProgress.current / 0.2;
           knifeRef.current.position.lerp(new THREE.Vector3(radius * 0.8, height + 1.0, -radius * 0.2), p);
           knifeRef.current.rotation.set(0, Math.PI/4, 0);
        } else if (knifeProgress.current < 0.7) {
           // Slice downwards diagonally through cake
           const p = (knifeProgress.current - 0.2) / 0.5;
           knifeRef.current.position.lerp(new THREE.Vector3(0.2, -0.2, -radius * 0.2), p);
        } else {
           // Retract
           const p = (knifeProgress.current - 0.7) / 0.3;
           knifeRef.current.position.lerp(new THREE.Vector3(radius + 1.5, height, radius * 0.8), p);
           knifeRef.current.rotation.set(-0.2, 0.5, -0.4);
        }
      } else if (step >= 3) {
        // Move fully off-screen
        knifeRef.current.position.lerp(new THREE.Vector3(radius + 3.0, height - 1.0, radius + 2.0), 0.05);
      }
    }
  });

  return (
    <group scale={targetScale} position={[0, -height/2, 0]}>
      
      {/* 1. Presentation Platform */}
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <cylinderGeometry args={[3.0, 3.0, 0.3, 64]} />
          <meshPhysicalMaterial color={platformColor} roughness={0.28} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[2.7, 2.75, 64]} />
          <meshBasicMaterial color="#ffd66e" />
        </mesh>
      </group>

      {/* 2. Realistic Knife */}
      <group ref={knifeRef} position={[radius + 1.5, height + 2, radius]} rotation={[-0.2, 0.5, -0.4]}>
          <mesh position={[-0.7, 0, 0]} castShadow>
            <boxGeometry args={[1.4, 0.12, 0.02]} />
            <meshPhysicalMaterial color="#e8edf2" metalness={0.95} roughness={0.12} clearcoat={0.4} />
          </mesh>
          <mesh position={[0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 32]} />
            <meshPhysicalMaterial color="#5b3039" roughness={0.35} />
          </mesh>
      </group>

      {/* 3. Intact Uncut Cake (Visible until sliced) */}
      {step < 3 && (
        <group>
          {/* Main outer cylinder */}
          <mesh castShadow receiveShadow position={[0, height/2, 0]}>
            <cylinderGeometry args={[radius, radius, height, 64]} />
            {frostingMat}
          </mesh>
        </group>
      )}

      {/* 4. Sliced Cake (Replaces intact cake at step 3) */}
      {step >= 3 && (
        <>
          {/* Main cake missing wedge */}
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh castShadow receiveShadow>
              <extrudeGeometry args={[mainCakeShape, sliceExtrudeSettings]} />
              {frostingMat}
            </mesh>
            {/* Inner cut layers for main cake */}
            <mesh position={[0, 0, 0.01]} receiveShadow>
              <extrudeGeometry args={[mainCakeShape, { ...sliceExtrudeSettings, depth: 0.35 }]} />
              {spongeMat}
            </mesh>
            <mesh position={[0, 0, 0.36]} receiveShadow>
              <extrudeGeometry args={[mainCakeShape, { ...sliceExtrudeSettings, depth: 0.15 }]} />
              {creamMat}
            </mesh>
            <mesh position={[0, 0, 0.51]} receiveShadow>
              <extrudeGeometry args={[mainCakeShape, { ...sliceExtrudeSettings, depth: 0.1 }]} />
              {strawberryMat}
            </mesh>
            <mesh position={[0, 0, 0.61]} receiveShadow>
              <extrudeGeometry args={[mainCakeShape, { ...sliceExtrudeSettings, depth: 0.35 }]} />
              {spongeMat}
            </mesh>
          </group>

          {/* The separated slice */}
          <group ref={sliceGroup} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh castShadow receiveShadow>
              <extrudeGeometry args={[sliceShape, sliceExtrudeSettings]} />
              {frostingMat}
            </mesh>
            {/* Inner cut layers for slice */}
            <mesh position={[0, 0, 0.01]} receiveShadow>
              <extrudeGeometry args={[sliceShape, { ...sliceExtrudeSettings, depth: 0.35 }]} />
              {spongeMat}
            </mesh>
            <mesh position={[0, 0, 0.36]} receiveShadow>
              <extrudeGeometry args={[sliceShape, { ...sliceExtrudeSettings, depth: 0.15 }]} />
              {creamMat}
            </mesh>
            <mesh position={[0, 0, 0.51]} receiveShadow>
              <extrudeGeometry args={[sliceShape, { ...sliceExtrudeSettings, depth: 0.1 }]} />
              {strawberryMat}
            </mesh>
            <mesh position={[0, 0, 0.61]} receiveShadow>
              <extrudeGeometry args={[sliceShape, { ...sliceExtrudeSettings, depth: 0.35 }]} />
              {spongeMat}
            </mesh>
          </group>
        </>
      )}

      {/* 5. Bakery Decorations (Shared on full and split cake) */}
      <group>
        {/* Edible Pearls around base */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (Math.PI * 2 / 36) * i;
          if (step >= 3 && angle >= (Math.PI * 2 - cutAngle) && angle <= Math.PI * 2) return null;
          return (
            <mesh key={`base-${i}`} position={[Math.cos(angle) * (radius + 0.03), 0.05, Math.sin(angle) * (radius + 0.03)]} castShadow>
              <sphereGeometry args={[0.07, 24, 24]} />
              {pearlMat}
            </mesh>
          );
        })}

        {/* Pink Drip Icing on top edge */}
        {Array.from({ length: 28 }).map((_, i) => {
          const angle = (Math.PI * 2 / 28) * i;
          if (step >= 3 && angle >= (Math.PI * 2 - cutAngle) && angle <= Math.PI * 2) return null;
          const dripLength = 0.2 + Math.random() * 0.3;
          return (
            <mesh key={`drip-${i}`} position={[Math.cos(angle) * (radius + 0.04), height - dripLength/2, Math.sin(angle) * (radius + 0.04)]} castShadow>
              <capsuleGeometry args={[0.06, dripLength, 8, 16]} />
              {pinkFrostingMat}
            </mesh>
          );
        })}

        {/* Floral Roses on top */}
        <Rose position={[-1.2, height + 0.1, 0.8]} scale={1.2} primaryColor={flowerColor} secondaryColor={finalCreamColor} />
        <Rose position={[-0.4, height + 0.1, 1.3]} scale={1.0} primaryColor={finalCreamColor} secondaryColor={flowerColor} />
        <Rose position={[0.6, height + 0.1, 1.0]} scale={1.1} primaryColor={flowerColor} secondaryColor={finalCreamColor} />
        <Rose position={[1.3, height + 0.1, 0.4]} scale={0.9} primaryColor={finalCreamColor} secondaryColor={flowerColor} />

        {/* Candles */}
        {step >= 1 && (candleCount ? Array.from({ length: candleCount }) : Array.from({ length: 6 })).map((_, i, arr) => {
          const angle = (Math.PI * 2 / arr.length) * i;
          return (
            <Candle key={`c-${i}`} position={[Math.cos(angle) * (radius * 0.55), height, Math.sin(angle) * (radius * 0.55)]} color={finalCandleColor} ignited={step >= 1} />
          );
        })}

        {/* Celebratory particles from inside cut */}
        {step >= 3 && Array.from({ length: 8 }).map((_, i) => (
          <FloatingHeartParticle key={`fh-${i}`} position={[0.5, height * 0.5, -0.5]} delay={i * 0.15} />
        ))}
      </group>
    </group>
  );
}

// ==========================================
// MAIN UI LAYOUT WRAPPER
// ==========================================

export default function StageCake({ onComplete }: { onComplete: () => void }) {
  const { config, interpolate } = useConfig();
  const [step, setStep] = useState(0); 
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setStep(1), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleCut = () => {
    setStep(2);
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
  };

  const cakeSettings = config?.cakeScene;
  if (!cakeSettings) return null;

  const backgroundColor = cakeSettings.backgroundColor || "#f8dfe4";

  return (
    <div className="absolute inset-0 flex flex-col justify-between overflow-hidden z-20 pointer-events-auto" style={{ backgroundColor }}>
      {cakeSettings.soundEffect && <audio ref={audioRef} src={cakeSettings.soundEffect} />}
      
      {/* Subtle floating background hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bg-heart-${i}`}
            className="absolute text-pink-400"
            style={{ left: `${Math.random() * 100}%`, top: `${100 + Math.random() * 20}%` }}
            animate={{ y: -1000, opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: Math.random() * 180 }}
            transition={{ duration: 12 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }}
          >
            <Heart fill="currentColor" size={16 + Math.random() * 24} />
          </motion.div>
        ))}
      </div>

      {/* TOP HEADER AREA */}
      <div className="w-full text-center pt-[14vh] z-30 shrink-0 h-[22vh]">
        <AnimatePresence>
          {step >= 1 && step < 3 && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-pink-700 drop-shadow-sm px-4">
                {interpolate(cakeSettings.title)}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MIDDLE 3D CAKE AREA */}
      <div className="flex-1 w-full relative z-20">
         <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 3.5, 11]} fov={38} />
            <OrbitControls 
              enablePan={false} 
              enableZoom={false} // Prevent user from breaking layout scale
              minPolarAngle={Math.PI / 3.5} 
              maxPolarAngle={Math.PI / 2.1} 
              autoRotate={step >= 3} 
              autoRotateSpeed={0.5} 
            />
            
            <hemisphereLight args={[0xfff5f7, 0xd49aa6, 2.5]} />
            <directionalLight position={[4, 9, 7]} intensity={4.0} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
            <pointLight position={[-4, 4, 4]} intensity={2.2} color="#ff8fb0" distance={12} />

            <Environment preset="apartment" />
            <CakeScene3D config={cakeSettings} step={step} onSliceComplete={() => setStep(3)} />
            
            {step >= 3 && <Sparkles count={150} scale={5} size={3} speed={0.4} opacity={0.8} color="#FFD700" />}
         </Canvas>

         {/* Surprise Message Modal (Overlays Canvas after cut) */}
         <AnimatePresence>
          {step === 3 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-white/85 backdrop-blur-lg px-8 py-6 rounded-[2rem] border border-white/60 shadow-pink-200/60 shadow-2xl text-center mx-4 max-w-sm"
              >
                <div className="text-4xl mb-3 animate-bounce drop-shadow-sm">❤️</div>
                <p className="text-lg font-medium text-pink-600 italic mb-2">
                  {interpolate(cakeSettings.surpriseMessage1)}
                </p>
                <p className="font-script text-3xl font-bold text-pink-800 leading-tight">
                  {interpolate(cakeSettings.surpriseMessage2)}
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM BUTTON AREA */}
      <div className="w-full flex justify-center pb-[10vh] pt-4 z-30 shrink-0 h-[22vh]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.button
              key="cut-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleCut}
              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-pink-500/30 transition-all active:scale-95 flex items-center gap-3 text-lg border border-pink-300/50"
            >
              <span className="text-xl">🎂</span> {cakeSettings.buttonText}
            </motion.button>
          )}
          
          {step === 3 && (
            <motion.button
              key="continue-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
              onClick={onComplete}
              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-pink-500/30 transition-all active:scale-95 flex items-center gap-3 text-lg border border-pink-300/50 pointer-events-auto"
            >
              <HtmlSparkles size={20} /> {cakeSettings.continueButton}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
