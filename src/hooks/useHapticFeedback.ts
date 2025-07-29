import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'tap' | 'click' | 'doubleClick' | 'longPress' | 'notification';

interface HapticPatterns {
  [key: string]: number | number[];
}

const useHapticFeedback = () => {
  const patterns: HapticPatterns = {
    light: 50,
    medium: 100,
    heavy: 200,
    success: [100, 50, 100],
    error: [200, 100, 200, 100, 200],
    warning: [150, 75, 150],
    tap: 25,
    click: 75,
    doubleClick: [50, 50, 50],
    longPress: 300,
    notification: [100, 50, 100, 50, 300]
  };

  const isHapticSupported = useCallback((): boolean => {
    return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
  }, []);

  const triggerHaptic = useCallback((pattern: HapticPattern | number | number[]) => {
    if (!isHapticSupported()) {
      return false;
    }

    try {
      let vibrationPattern: number | number[];

      if (typeof pattern === 'string') {
        vibrationPattern = patterns[pattern] || patterns.light;
      } else {
        vibrationPattern = pattern;
      }

      navigator.vibrate(vibrationPattern);
      return true;
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }
  }, [patterns]);

  // Specific feedback functions for common interactions
  const feedback = {
    tap: () => triggerHaptic('tap'),
    click: () => triggerHaptic('click'),
    success: () => triggerHaptic('success'),
    error: () => triggerHaptic('error'),
    warning: () => triggerHaptic('warning'),
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    notification: () => triggerHaptic('notification'),
    doubleClick: () => triggerHaptic('doubleClick'),
    longPress: () => triggerHaptic('longPress'),
    
    // Form-specific feedback
    fieldComplete: () => triggerHaptic([75, 25, 75]),
    fieldError: () => triggerHaptic([150, 50, 150]),
    formSubmit: () => triggerHaptic([100, 50, 100, 50, 200]),
    
    // UI interaction feedback
    buttonPress: () => triggerHaptic(50),
    toggle: () => triggerHaptic([25, 25, 25]),
    swipe: () => triggerHaptic(30),
    
    // Rating feedback
    ratingSelect: (rating: number) => {
      const intensity = Math.min(rating * 20, 200);
      triggerHaptic(intensity);
    },
    
    // Custom pattern
    custom: (pattern: number | number[]) => triggerHaptic(pattern)
  };

  return {
    isSupported: isHapticSupported(),
    trigger: triggerHaptic,
    feedback
  };
};

export default useHapticFeedback;