'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface TorusProps {
  progress: number; // 0 to 100
  size?: number;
}

function AnimatedTorus({ progress, size = 1.2 }: TorusProps) {
  const torusRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create gradient material for the torus
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#C9A227',
      metalness: 0.8,
      roughness: 0.2,
      emissive: '#C9A227',
      emissiveIntensity: 0.3,
    });
  }, []);

  // Background ring material
  const bgMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2D2D30',
      metalness: 0.3,
      roughness: 0.7,
      transparent: true,
      opacity: 0.5,
    });
  }, []);

  // Create partial torus geometry based on progress
  const torusGeometry = useMemo(() => {
    const progressRad = (progress / 100) * Math.PI * 2;
    return new THREE.TorusGeometry(size, 0.08, 16, 100, progressRad);
  }, [progress, size]);

  // Full background torus
  const bgTorusGeometry = useMemo(() => {
    return new THREE.TorusGeometry(size, 0.06, 16, 100);
  }, [size]);

  // Floating particles around the torus
  const particlePositions = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = size + (Math.random() - 0.5) * 0.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }

    return positions;
  }, [size]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (torusRef.current) {
      // Slow rotation
      torusRef.current.rotation.z = -Math.PI / 2 + time * 0.1;
      // Subtle wobble
      torusRef.current.rotation.x = Math.sin(time * 0.5) * 0.05;
      torusRef.current.rotation.y = Math.cos(time * 0.3) * 0.05;
    }

    if (glowRef.current) {
      // Pulsating glow
      const scale = 1 + Math.sin(time * 2) * 0.02;
      glowRef.current.scale.set(scale, scale, 1);
    }

    if (particlesRef.current) {
      // Rotate particles opposite direction
      particlesRef.current.rotation.z = -time * 0.15;

      // Update particle positions for floating effect
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 50; i++) {
        const i3 = i * 3;
        positions[i3 + 2] = Math.sin(time * 2 + i * 0.5) * 0.15;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Background ring */}
      <mesh geometry={bgTorusGeometry} material={bgMaterial} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Progress ring */}
      <mesh
        ref={torusRef}
        geometry={torusGeometry}
        material={material}
      />

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, -0.1]}>
        <ringGeometry args={[size - 0.15, size + 0.15, 64]} />
        <meshBasicMaterial
          color="#C9A227"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating particles */}
      <Points ref={particlesRef} positions={particlePositions} stride={3} frustumCulled={false}>
        <PointMaterial
          color="#C9A227"
          size={0.03}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Center percentage text would go here in 2D overlay */}
    </group>
  );
}

// Lighting setup
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#F5F0E8" />
      <pointLight position={[-5, -5, 3]} intensity={0.4} color="#C9A227" />
    </>
  );
}

interface ProgressTorusProps {
  progress: number;
  size?: number;
  className?: string;
}

export default function ProgressTorus({ progress, size = 1.2, className }: ProgressTorusProps) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  if (!mounted) {
    return (
      <div className={className} style={{ width: 200, height: 200 }}>
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
      </div>
    );
  }

  // Fallback to 2D for reduced motion
  if (reducedMotion) {
    return (
      <div className={className} style={{ position: 'relative', width: 200, height: 200 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--color-surface-variant)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--wagyu-gold)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 251.2} 251.2`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--wagyu-gold)',
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative', width: 200, height: 200 }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Lights />
        <AnimatedTorus progress={progress} size={size} />
      </Canvas>
      {/* 2D percentage overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--wagyu-gold)',
          textShadow: '0 0 20px rgba(201, 162, 39, 0.5)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
}
