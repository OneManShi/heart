export enum ShapeType {
  HEART = 'Heart',
  SPHERE = 'Planet',
  FLOWER = 'Flower',
  FIREWORKS = 'Fireworks',
  DNA = 'DNA'
}

export interface ParticleState {
  shape: ShapeType;
  color: string;
  count: number;
}

export interface HandTrackingData {
  isTracking: boolean;
  scaleFactor: number; // Controlled by distance between hands (0.5 to 2.0)
  spreadFactor: number; // Controlled by hand openness (0.0 to 1.0)
  rotation: number; // Controlled by hand angle (radians)
}
