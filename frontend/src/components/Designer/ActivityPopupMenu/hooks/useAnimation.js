/**
 * Hook for managing animation states: 'hidden', 'entering', 'visible', 'exiting'
 */
import { useState, useEffect, useRef } from 'react';

/**
 * Animation hook for popup menu
 * @param {boolean} showPopup - Whether the popup should be shown
 * @returns {object} - { animationState, animationClass }
 */
export const useAnimation = (showPopup) => {
  const [animationState, setAnimationState] = useState('hidden');
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    // console.log('ActivityPopupMenu useEffect triggered:', { showPopup, animationState });
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // Handle showPopup becoming true (open popup)
    if (showPopup) {
      // console.log('showPopup is true, current animationState:', animationState);
      if (animationState === 'hidden') {
        // console.log('Transition: hidden -> entering');
        // Normal open: hidden -> entering
        setAnimationState('entering');
        animationTimeoutRef.current = setTimeout(() => {
          // console.log('Transition: entering -> visible');
          setAnimationState('visible');
        }, 300);
      } else if (animationState === 'exiting') {
        // console.log('Transition: exiting -> entering (cancel exit)');
        // Quick re-open while closing: exiting -> entering (cancel exit)
        setAnimationState('entering');
        animationTimeoutRef.current = setTimeout(() => {
          // console.log('Transition: entering -> visible');
          setAnimationState('visible');
        }, 300);
      }
      // If already 'entering' or 'visible', do nothing (already opening/opened)
    } 
    // Handle showPopup becoming false (close popup)
    else if (!showPopup) {
      // console.log('showPopup is false, current animationState:', animationState);
      if (animationState === 'visible' || animationState === 'entering') {
        // console.log('Transition: visible/entering -> exiting');
        // Close while visible or entering: -> exiting
        setAnimationState('exiting');
        animationTimeoutRef.current = setTimeout(() => {
          // console.log('Transition: exiting -> hidden');
          setAnimationState('hidden');
        }, 300);
      }
      // If already 'exiting' or 'hidden', do nothing (already closing/closed)
    }

    // Cleanup timeout on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [showPopup, animationState]);

  // Calculate animation class
  const animationClass = 
    animationState === 'entering' ? 'fade-in' :
    animationState === 'exiting' ? 'fade-out' : '';

  return {
    animationState,
    animationClass,
    isVisible: animationState === 'visible' || animationState === 'entering'
  };
};

/**
 * Hook for handling Escape key
 * @param {boolean} isVisible - Whether the menu is visible
 * @param {function} onClose - Function to close the menu
 */
export const useEscapeKey = (isVisible, onClose) => {
  useEffect(() => {
    if (!isVisible) return;

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isVisible, onClose]);
};
