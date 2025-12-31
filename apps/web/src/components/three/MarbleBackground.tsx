'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

// Wagyu marbling particle system
function MarbleParticles({ count = 3000, mouse }: { count?: number; mouse: React.RefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Points>(null);

  // Generate random positions for particles
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread particles across the viewport
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10 - 5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Slow, organic velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    return [positions, velocities];
  }, [count]);

  // Animation loop
  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.getElapsedTime();
    const positionArray = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Add subtle floating motion
      positionArray[i3] += velocities[i3] + Math.sin(time * 0.5 + i) * 0.0005;
      positionArray[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.3 + i) * 0.0005;
      positionArray[i3 + 2] += velocities[i3 + 2];

      // Mouse interaction - subtle attraction
      if (mouse.current) {
        const dx = mouse.current.x * 5 - positionArray[i3];
        const dy = mouse.current.y * 5 - positionArray[i3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          positionArray[i3] += dx * 0.0002;
          positionArray[i3 + 1] += dy * 0.0002;
        }
      }

      // Wrap around edges for infinite effect
      if (positionArray[i3] > 10) positionArray[i3] = -10;
      if (positionArray[i3] < -10) positionArray[i3] = 10;
      if (positionArray[i3 + 1] > 8) positionArray[i3 + 1] = -8;
      if (positionArray[i3 + 1] < -8) positionArray[i3 + 1] = 8;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;

    // Subtle rotation
    ref.current.rotation.z = time * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#F5F0E8"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.6}
      />
    </Points>
  );
}

// Gold accent particles (fewer, larger, more prominent)
function GoldParticles({ count = 50 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
    }

    return positions;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.getElapsedTime();
    const positionArray = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Gentle floating with sine waves
      positionArray[i3] += Math.sin(time * 0.2 + i * 0.5) * 0.002;
      positionArray[i3 + 1] += Math.cos(time * 0.3 + i * 0.3) * 0.002;

      // Wrap around
      if (positionArray[i3] > 9) positionArray[i3] = -9;
      if (positionArray[i3] < -9) positionArray[i3] = 9;
      if (positionArray[i3 + 1] > 6) positionArray[i3 + 1] = -6;
      if (positionArray[i3 + 1] < -6) positionArray[i3 + 1] = 6;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;

    // Pulsating opacity effect through scale
    ref.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#C9A227"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  );
}

// Connection lines between nearby gold particles (marbling effect)
function MarbleLines() {
  const groupRef = useRef<THREE.Group>(null);
  const lineCount = 20;

  // Generate line points
  const lines = useMemo(() => {
    const result: Array<[number, number, number][]> = [];

    for (let i = 0; i < lineCount; i++) {
      const startX = (Math.random() - 0.5) * 16;
      const startY = (Math.random() - 0.5) * 12;
      const startZ = (Math.random() - 0.5) * 4 - 6;

      const endX = startX + (Math.random() - 0.5) * 4;
      const endY = startY + (Math.random() - 0.5) * 3;
      const endZ = startZ + (Math.random() - 0.5) * 2;

      result.push([
        [startX, startY, startZ],
        [endX, endY, endZ],
      ]);
    }

    return result;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Slow rotation
    groupRef.current.rotation.z = time * 0.01;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#F5F0E8"
          lineWidth={0.5}
          transparent
          opacity={0.08}
        />
      ))}
    </group>
  );
}

// Ambient glow sphere
function AmbientGlow() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();

    // Pulsating scale
    ref.current.scale.setScalar(1 + Math.sin(time * 0.3) * 0.1);
  });

  return (
    <mesh ref={ref} position={[0, 0, -10]}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial
        color="#5D1A1D"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Scene component
function Scene() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <AmbientGlow />
      <MarbleLines />
      <MarbleParticles count={2500} mouse={mouse} />
      <GoldParticles count={40} />
    </>
  );
}

// Main component with reduced motion support
export default function MarbleBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!mounted) return null;

  // Don't render 3D on reduced motion preference
  if (reducedMotion) {
    return (
      <div className="three-canvas-container">
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at center, rgba(93, 26, 29, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="three-canvas-container">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
