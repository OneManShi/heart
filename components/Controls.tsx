import React from 'react';
import { ShapeType } from '../types';
import { Heart, Globe, Flower2, Zap, Dna, Maximize2 } from 'lucide-react';

interface ControlsProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  color: string;
  setColor: (c: string) => void;
  isTracking: boolean;
  toggleFullscreen: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  currentShape, 
  setShape, 
  color, 
  setColor, 
  isTracking,
  toggleFullscreen 
}) => {
  
  const shapes = [
    { type: ShapeType.HEART, icon: <Heart size={20} /> },
    { type: ShapeType.FLOWER, icon: <Flower2 size={20} /> },
    { type: ShapeType.SPHERE, icon: <Globe size={20} /> },
    { type: ShapeType.FIREWORKS, icon: <Zap size={20} /> },
    { type: ShapeType.DNA, icon: <Dna size={20} /> },
  ];

  const colors = [
    '#ff0055', // Hot Pink
    '#00ffff', // Cyan
    '#ffaa00', // Gold
    '#aa00ff', // Violet
    '#00ff66', // Green
    '#ffffff'  // White
  ];

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 pb-8 sm:pb-6 pointer-events-none">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto mt-safe-top">
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white max-w-[70%] shadow-lg">
          <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Gesture Particles
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isTracking ? 'Tracking Active' : 'Camera Ready'}
          </div>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="bg-black/60 text-white p-3 rounded-full backdrop-blur-md border border-white/10 active:scale-95 transition-transform shadow-lg"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 size={24} />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 items-center pointer-events-auto w-full max-w-lg mx-auto mb-safe-bottom">
        
        {/* Color Selector */}
        <div className="flex gap-4 bg-black/60 backdrop-blur-md px-6 py-4 rounded-full border border-white/10 overflow-x-auto max-w-full shadow-lg no-scrollbar">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform ${
                color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c, boxShadow: `0 0 12px ${c}66` }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>

        {/* Shape Selector */}
        <div className="flex gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 overflow-x-auto max-w-full w-full justify-center sm:w-auto shadow-lg no-scrollbar">
          {shapes.map((item) => (
            <button
              key={item.type}
              onClick={() => setShape(item.type)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4 py-3 rounded-xl transition-all flex-1 sm:flex-none ${
                currentShape === item.type 
                  ? 'bg-white/20 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-[10px] sm:text-sm font-medium">{item.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;