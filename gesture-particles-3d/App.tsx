import React, { useState, useRef, useCallback, useEffect } from 'react';
import ParticleScene from './components/ParticleScene';
import Controls from './components/Controls';
import HandTracker from './components/HandTracker';
import { ShapeType, HandTrackingData } from './types';
import { Play, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentShape, setShape] = useState<ShapeType>(ShapeType.HEART);
  const [currentColor, setColor] = useState<string>('#ff0055');
  const [trackingData, setTrackingData] = useState<HandTrackingData>({
    isTracking: false,
    scaleFactor: 1.0,
    spreadFactor: 0.0,
    rotation: 0.0
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simple mobile detection
    const mobileCheck = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  const handleTrackingUpdate = useCallback((data: HandTrackingData) => {
    setTrackingData(prev => ({
      ...data,
      // Smooth out jitter
      scaleFactor: prev.scaleFactor * 0.8 + data.scaleFactor * 0.2,
      spreadFactor: prev.spreadFactor * 0.8 + data.spreadFactor * 0.2,
      rotation: prev.rotation * 0.8 + data.rotation * 0.2
    }));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const startExperience = () => {
    setHasStarted(true);
    // Try to trigger fullscreen on mobile interaction
    if (isMobile) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden select-none">
      {/* Hidden Video Element for MediaPipe */}
      <video 
        ref={videoRef} 
        className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none" 
        playsInline 
        muted 
      />

      {/* Logic Layer */}
      <HandTracker 
        onUpdate={handleTrackingUpdate} 
        videoRef={videoRef}
        enabled={hasStarted}
      />

      {/* Visual Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleScene 
          currentShape={currentShape} 
          currentColor={currentColor}
          trackingData={trackingData}
          isMobile={isMobile}
        />
      </div>

      {/* UI Layer */}
      {hasStarted ? (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Controls 
            currentShape={currentShape}
            setShape={setShape}
            color={currentColor}
            setColor={setColor}
            isTracking={trackingData.isTracking}
            toggleFullscreen={toggleFullscreen}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Gesture Particles
          </h1>
          <p className="text-gray-300 mb-8 max-w-md text-sm sm:text-base">
            Create 3D art with your hands.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-8 text-left w-full max-w-xs">
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 text-xl">👋</div>
                <div>
                  <div className="font-bold text-sm">One Hand</div>
                  <div className="text-xs text-gray-400">Tilt to Rotate • Open to Spread</div>
                </div>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 text-xl">👐</div>
                <div>
                  <div className="font-bold text-sm">Two Hands</div>
                  <div className="text-xs text-gray-400">Distance to Scale • Steer to Rotate</div>
                </div>
             </div>
          </div>

          <button 
            onClick={startExperience}
            className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95"
          >
            <Play fill="black" size={20} />
            Start
          </button>
          
          {isMobile && (
            <div className="mt-8 flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full">
              <Smartphone size={14} />
              <span>For best results, prop up your phone</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;