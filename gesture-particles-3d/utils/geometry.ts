import * as THREE from 'three';
import { ShapeType } from '../types';

export const generateParticles = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ShapeType.HEART: {
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        const r = Math.random(); // Fill inside
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        const scale = 0.15;
        x = scale * 16 * Math.pow(Math.sin(t), 3);
        y = scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        z = (Math.random() - 0.5) * 2; // Thickness
        
        // Randomize slightly to fill volume
        x *= Math.cbrt(r);
        y *= Math.cbrt(r);
        break;
      }

      case ShapeType.SPHERE: {
        // Sphere surface + volume
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.5 * Math.cbrt(Math.random()); // Random radius for volume
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }

      case ShapeType.FLOWER: {
        // Rose/Flower parametric
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const petalCount = 5;
        // Radius modulated by sine wave
        const r = 1.5 + Math.sin(petalCount * theta) * Math.sin(phi) * 1.0;
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi); // Flattened slightly
        z = r * Math.sin(phi) * Math.sin(theta);
        break;
      }

      case ShapeType.FIREWORKS: {
        // Explosion bursts
        const branch = Math.floor(Math.random() * 10);
        const t = Math.random();
        const theta = (Math.PI * 2 * branch) / 10;
        const phi = Math.random() * Math.PI * 0.5; // Top half
        
        const r = t * 4;
        x = r * Math.cos(theta) * Math.sin(phi) + (Math.random() - 0.5) * 0.5;
        y = r * Math.cos(phi) + (Math.random() - 0.5) * 0.5;
        z = r * Math.sin(theta) * Math.sin(phi) + (Math.random() - 0.5) * 0.5;
        break;
      }

      case ShapeType.DNA: {
        // Double Helix
        const t = i / count * 10 * Math.PI;
        const radius = 1.5;
        const offset = (i % 2 === 0) ? 0 : Math.PI;
        
        x = Math.cos(t + offset) * radius;
        y = (i / count - 0.5) * 8;
        z = Math.sin(t + offset) * radius;
        
        // Add some noise
        x += (Math.random() - 0.5) * 0.2;
        z += (Math.random() - 0.5) * 0.2;
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};