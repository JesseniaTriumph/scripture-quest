import { useEffect, useRef } from 'react';

/**
 * Hook for managing game sound effects
 * Provides chime (word found) and victory (game complete) sounds
 */
export const useSounds = () => {
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const victoryRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    chimeRef.current = new Audio('/sounds/chime.mp3');
    victoryRef.current = new Audio('/sounds/victory.mp3');

    // Set volume
    if (chimeRef.current) chimeRef.current.volume = 0.5;
    if (victoryRef.current) victoryRef.current.volume = 0.6;

    return () => {
      // Cleanup
      if (chimeRef.current) chimeRef.current.pause();
      if (victoryRef.current) victoryRef.current.pause();
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

  return { playChime, playVictory };
};
