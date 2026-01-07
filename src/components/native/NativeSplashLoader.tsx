import { useState, useEffect, useCallback } from 'react';
import { isDespiaIOS, isDespiaAndroid } from '@/lib/despia';
import { getTipsForPlatform } from '@/lib/quick-tips';

const SPLASH_IMAGE_URL = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/website-images/iap_image.webp';
const LOGO_URL = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/website-images/logo-with-text-white.webp';
const TIP_INTERVAL = 3000; // 3 seconds

interface NativeSplashLoaderProps {
  isReady: boolean;
  onFadeComplete?: () => void;
}

export const NativeSplashLoader = ({ isReady, onFadeComplete }: NativeSplashLoaderProps) => {
  const [currentTip, setCurrentTip] = useState('');
  const [tipVisible, setTipVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const isIOS = isDespiaIOS();
  const isAndroid = isDespiaAndroid();
  const tips = getTipsForPlatform(isIOS, isAndroid);
  
  // Get next tip
  const getNextTip = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex].text;
  }, [tips]);
  
  // Initialize first tip
  useEffect(() => {
    setCurrentTip(getNextTip());
  }, [getNextTip]);
  
  // Rotate tips every 3 seconds
  useEffect(() => {
    if (isReady) return; // Stop rotating when ready
    
    const interval = setInterval(() => {
      // Fade out current tip
      setTipVisible(false);
      
      // After fade out, change tip and fade in
      setTimeout(() => {
        setCurrentTip(getNextTip());
        setTipVisible(true);
      }, 300);
    }, TIP_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isReady, getNextTip]);
  
  // Handle fade out when ready
  useEffect(() => {
    if (isReady && !isFadingOut) {
      setIsFadingOut(true);
      
      // Wait for fade animation to complete
      const timeout = setTimeout(() => {
        onFadeComplete?.();
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [isReady, isFadingOut, onFadeComplete]);
  
  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col
        transition-opacity duration-500 ease-out
        ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
      style={{
        backgroundColor: '#0D0D14', // Fallback while image loads
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${SPLASH_IMAGE_URL})`,
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full safe-top safe-bottom">
        {/* Logo - Top area */}
        <div className="flex-1 flex items-center justify-center pt-12">
          <img
            src={LOGO_URL}
            alt="FitConnect"
            className="h-12 w-auto object-contain drop-shadow-lg"
          />
        </div>
        
        {/* Quick Tips - Bottom area */}
        <div className="pb-16 px-6">
          <div className="flex flex-col items-center gap-3">
            {/* Loading indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
            </div>
            
            {/* Tip text */}
            <p
              className={`
                text-center text-sm text-white/80 font-medium
                max-w-[280px] leading-relaxed
                transition-all duration-300 ease-out
                ${tipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
            >
              {currentTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
