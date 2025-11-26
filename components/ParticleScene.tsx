import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ShapeType, HandTrackingData } from '../types';
import { generateParticles } from '../utils/geometry';

interface ParticlesProps {
  shape: ShapeType;
  color: string;
  trackingData: HandTrackingData;
  isMobile: boolean;
}

const Particles: React.FC<ParticlesProps> = ({ shape, color, trackingData, isMobile }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Reduce particle count on mobile for performance
  const count = isMobile ? 3000 : 6000;
  
  const currentPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const targetPositions = useMemo(() => generateParticles(shape, count), [shape, count]);
  
  // Initialize positions
  useMemo(() => {
    targetPositions.forEach((v, i) => currentPositions[i] = v);
  }, [targetPositions, currentPositions]);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const { scaleFactor, spreadFactor, rotation } = trackingData;

    const lerpSpeed = 4.0 * delta;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      let tx = targetPositions[i3];
      let ty = targetPositions[i3 + 1];
      let tz = targetPositions[i3 + 2];

      // 1. Scale
      tx *= scaleFactor;
      ty *= scaleFactor;
      tz *= scaleFactor;

      // 2. Spread
      const dist = Math.sqrt(tx*tx + ty*ty + tz*tz) + 0.001;
      const nx = tx / dist;
      const ny = ty / dist;
      const nz = tz / dist;

      const spread = spreadFactor * 5.0;
      tx += nx * spread;
      ty += ny * spread;
      tz += nz * spread;
      
      // 3. Idle Animation
      tx += Math.sin(time + i) * 0.02;
      ty += Math.cos(time + i * 0.5) * 0.02;

      // Lerp
      positions[i3] += (tx - positions[i3]) * lerpSpeed;
      positions[i3 + 1] += (ty - positions[i3 + 1]) * lerpSpeed;
      positions[i3 + 2] += (tz - positions[i3 + 2]) * lerpSpeed;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    (pointsRef.current.material as THREE.PointsMaterial).color.lerp(new THREE.Color(color), 0.1);
    
    // Apply Hand Rotation (Z-axis)
    // Lerp rotation for smoothness
    const currentRot = pointsRef.current.rotation.z;
    pointsRef.current.rotation.z += (rotation - currentRot) * 0.1;
    
    // Subtle auto-rotation on Y
    pointsRef.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        map={particleTexture}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={color}
      />
    </points>
  );
};

interface SceneProps {
  currentShape: ShapeType;
  currentColor: string;
  trackingData: HandTrackingData;
  isMobile: boolean;
}

const ParticleScene: React.FC<SceneProps> = ({ currentShape, currentColor, trackingData, isMobile }) => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
      <color attach="background" args={['#000']} />
      <Stars radius={100} depth={50} count={isMobile ? 1500 : 3000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Particles 
        shape={currentShape} 
        color={currentColor} 
        trackingData={trackingData}
        isMobile={isMobile}
      />
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
};

export default ParticleScene;