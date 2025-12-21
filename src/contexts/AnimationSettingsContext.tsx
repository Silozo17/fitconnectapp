import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'animation-settings';

interface AnimationSettings {
  celebrationsEnabled: boolean;
  confettiEnabled: boolean;
  overlayTransitionsEnabled: boolean;
}

interface AnimationSettingsContextValue extends AnimationSettings {
  // Computed value that combines user preference with system preference
  shouldAnimate: boolean;
  prefersReducedMotion: boolean;
  // Setters
  setCelebrationsEnabled: (enabled: boolean) => void;
  setConfettiEnabled: (enabled: boolean) => void;
  setOverlayTransitionsEnabled: (enabled: boolean) => void;
  // Convenience
  toggleCelebrations: () => void;
}

const defaultSettings: AnimationSettings = {
  celebrationsEnabled: true,
  confettiEnabled: true,
  overlayTransitionsEnabled: true,
};

const AnimationSettingsContext = createContext<AnimationSettingsContextValue | undefined>(undefined);

export function useAnimationSettings(): AnimationSettingsContextValue {
  const context = useContext(AnimationSettingsContext);
  if (!context) {
    throw new Error('useAnimationSettings must be used within AnimationSettingsProvider');
  }
  return context;
}

// Standalone function for use outside React (e.g., in confetti.ts)
export function getAnimationSettings(): AnimationSettings & { prefersReducedMotion: boolean } {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
    
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed, prefersReducedMotion };
    }
  } catch {
    // Ignore parse errors
  }
  
  return { ...defaultSettings, prefersReducedMotion };
}

// Quick check for confetti utility
export function shouldTriggerConfetti(): boolean {
  const settings = getAnimationSettings();
  return settings.celebrationsEnabled && settings.confettiEnabled && !settings.prefersReducedMotion;
}

interface AnimationSettingsProviderProps {
  children: React.ReactNode;
}

export function AnimationSettingsProvider({ children }: AnimationSettingsProviderProps) {
  const [settings, setSettings] = useState<AnimationSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return defaultSettings;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors (e.g., private browsing)
    }
  }, [settings]);

  const setCelebrationsEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, celebrationsEnabled: enabled }));
  }, []);

  const setConfettiEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, confettiEnabled: enabled }));
  }, []);

  const setOverlayTransitionsEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, overlayTransitionsEnabled: enabled }));
  }, []);

  const toggleCelebrations = useCallback(() => {
    setSettings(prev => ({ ...prev, celebrationsEnabled: !prev.celebrationsEnabled }));
  }, []);

  // Computed: should we animate at all?
  const shouldAnimate = useMemo(() => {
    return settings.celebrationsEnabled && !prefersReducedMotion;
  }, [settings.celebrationsEnabled, prefersReducedMotion]);

  const value = useMemo<AnimationSettingsContextValue>(() => ({
    ...settings,
    prefersReducedMotion,
    shouldAnimate,
    setCelebrationsEnabled,
    setConfettiEnabled,
    setOverlayTransitionsEnabled,
    toggleCelebrations,
  }), [settings, prefersReducedMotion, shouldAnimate, setCelebrationsEnabled, setConfettiEnabled, setOverlayTransitionsEnabled, toggleCelebrations]);

  return (
    <AnimationSettingsContext.Provider value={value}>
      {children}
    </AnimationSettingsContext.Provider>
  );
}
