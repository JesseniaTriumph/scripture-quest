import { useEffect, useRef } from 'react';

/**
 * Hook for managing game sound effects
 * Provides chime (word found), victory (game complete), refill (oil restored), and burn (oil lost) sounds
 */
export const useSounds = () => {
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const victoryRef = useRef<HTMLAudioElement | null>(null);
  const refillRef = useRef<HTMLAudioElement | null>(null);
  const burnRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    chimeRef.current = new Audio('/sounds/chime.mp3');
    victoryRef.current = new Audio('/sounds/victory.mp3');
    refillRef.current = new Audio('/sounds/chime.mp3'); // Using chime for refill (positive sound)
    burnRef.current = new Audio('/sounds/chime.mp3'); // Using chime pitched differently for burn

    // Set volume
    if (chimeRef.current) chimeRef.current.volume = 0.5;
    if (victoryRef.current) victoryRef.current.volume = 0.6;
    if (refillRef.current) {
      refillRef.current.volume = 0.4;
      refillRef.current.playbackRate = 1.2; // Higher pitch for positive refill
    }
    if (burnRef.current) {
      burnRef.current.volume = 0.3;
      burnRef.current.playbackRate = 0.7; // Lower pitch for negative burn
    }

    return () => {
      // Cleanup
      if (chimeRef.current) chimeRef.current.pause();
      if (victoryRef.current) victoryRef.current.pause();
      if (refillRef.current) refillRef.current.pause();
      if (burnRef.current) burnRef.current.pause();
    };
  }, []);

  const playChime = () => {
    if (chimeRef.current) {
      chimeRef.current.currentTime = 0;
      chimeRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playVictory = () => {
    if (victoryRef.current) {
      victoryRef.current.currentTime = 0;
      victoryRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playRefill = () => {
    if (refillRef.current) {
      refillRef.current.currentTime = 0;
      refillRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playBurn = () => {
    if (burnRef.current) {
      burnRef.current.currentTime = 0;
      burnRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  return { playChime, playVictory, playRefill, playBurn };
};
