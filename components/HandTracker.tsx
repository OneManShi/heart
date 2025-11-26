import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandTrackingData } from '../types';

interface HandTrackerProps {
  onUpdate: (data: HandTrackingData) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate, videoRef, enabled }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        setIsLoaded(true);
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };

    initMediaPipe();
    
    return () => {
      handLandmarkerRef.current?.close();
    };
  }, []);

  // Start Camera and Detection Loop
  useEffect(() => {
    if (!isLoaded || !videoRef.current || !enabled) return;

    const video = videoRef.current;
    
    // Request Camera Access
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 640,
        height: 480,
        facingMode: 'user'
      } 
    }).then((stream) => {
      video.srcObject = stream;
      // Wait for metadata to load to ensure video plays
      video.onloadedmetadata = () => {
          video.play();
          requestRef.current = requestAnimationFrame(predict);
      };
    }).catch((err) => {
      console.error("Camera access denied:", err);
    });

    const predict = () => {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        if (handLandmarkerRef.current) {
          const results = handLandmarkerRef.current.detectForVideo(video, performance.now());
          
          let scaleFactor = 1.0;
          let spreadFactor = 0.0;
          let rotation = 0.0;
          let isTracking = false;

          if (results.landmarks && results.landmarks.length > 0) {
            isTracking = true;
            const hands = results.landmarks;

            // Logic 1: Two hands (Scale + Rotation)
            if (hands.length === 2) {
              // Sort hands by x position to ensure left/right consistency
              // Normalized x: 0 is left, 1 is right
              const sortedHands = [...hands].sort((a, b) => a[0].x - b[0].x);
              
              const leftHand = sortedHands[0];
              const rightHand = sortedHands[1];
              
              const leftWrist = leftHand[0];
              const rightWrist = rightHand[0];
              
              // Scale Logic
              const dx = leftWrist.x - rightWrist.x;
              const dy = leftWrist.y - rightWrist.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              scaleFactor = Math.max(0.5, Math.min(2.5, dist * 3));

              // Rotation Logic (Steering Wheel)
              // Calculate angle between wrists
              // MediaPipe Y is down, X is right
              // Standard atan2(y,x). If Right hand is lower (larger y) than Left hand (smaller y) -> positive dy.
              // This is a "Right Turn" or Clockwise rotation.
              // ThreeJS Rotation Z: Negative is Clockwise.
              // So we invert the atan2 result.
              rotation = -Math.atan2(rightWrist.y - leftWrist.y, rightWrist.x - leftWrist.x);
            }
            else if (hands.length === 1) {
              // Logic 2: One Hand (Rotation)
              const wrist = hands[0][0];
              const tip = hands[0][12]; // Middle finger tip
              
              // Rotation based on hand angle
              // Upright hand: tip.y < wrist.y. dy negative. dx ~0. atan2 ~ -PI/2.
              // We want upright to be 0 rotation.
              // So angle = atan2 + PI/2.
              // If we rotate hand CW (Right), tip moves right (x+), down (y+). atan2 increases.
              // We want result to be negative (CW).
              // So -(atan2 + PI/2)
              rotation = -(Math.atan2(tip.y - wrist.y, tip.x - wrist.x) + Math.PI / 2);
            }

            // Logic 3: Hand Openness controls SPREAD
            let totalOpenness = 0;
            hands.forEach(hand => {
               const wrist = hand[0];
               const tip = hand[12]; 
               const dist = Math.sqrt(
                 Math.pow(wrist.x - tip.x, 2) + 
                 Math.pow(wrist.y - tip.y, 2)
               );
               totalOpenness += dist;
            });
            
            const avgOpenness = totalOpenness / hands.length;
            spreadFactor = Math.max(0, Math.min(1, (avgOpenness - 0.15) * 4));
          }

          onUpdate({
            isTracking,
            scaleFactor,
            spreadFactor,
            rotation
          });
        }
      }
      requestRef.current = requestAnimationFrame(predict);
    };

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (video.srcObject) {
         const tracks = (video.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
    };
  }, [isLoaded, onUpdate, videoRef, enabled]);

  return null;
};

export default HandTracker;
