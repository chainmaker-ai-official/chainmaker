import React, { useState, useEffect } from 'react';

export const useAnimation = (showPopup: boolean) => {
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden');

  useEffect(() => {
    if (showPopup) {
      if (animationState === 'hidden' || animationState === 'exiting') {
        setAnimationState('entering');
        const timer = setTimeout(() => setAnimationState('visible'), 300);
        return () => clearTimeout(timer);
      }
    } else {
      if (animationState === 'visible' || animationState === 'entering') {
        setAnimationState('exiting');
        const timer = setTimeout(() => setAnimationState('hidden'), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [showPopup]);

  const animationClass = animationState === 'entering' ? 'fade-in' : animationState === 'exiting' ? 'fade-out' : '';

  return { animationState, animationClass, isVisible: animationState === 'visible' || animationState === 'entering' };
};

export const useEscapeKey = (isVisible: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isVisible) return;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isVisible, onClose]);
};
