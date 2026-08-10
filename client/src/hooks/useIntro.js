import { useEffect, useState } from 'react';

/**
 * Shows intro video and waits for it to complete before hiding.
 */
export default function useIntro() {
  const [splashMounted, setSplashMounted] = useState(true);

  useEffect(() => {
    // Listen for video to end
    const handleVideoEnd = () => {
      // Video finished - hide splash
      setSplashMounted(false);
    };

    window.addEventListener('introVideoEnded', handleVideoEnd);

    // Allow skipping the intro
    const handleSkip = () => {
      setSplashMounted(false);
    };

    window.addEventListener('skipIntro', handleSkip);

    return () => {
      window.removeEventListener('introVideoEnded', handleVideoEnd);
      window.removeEventListener('skipIntro', handleSkip);
    };
  }, []);

  return {
    splashMounted,
  };
}
