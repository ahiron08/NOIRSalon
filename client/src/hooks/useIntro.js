import { useEffect, useState, useRef } from 'react';

/**
 * Shows intro video and waits for it to complete before hiding.
 *
 * We listen for the native `ended` event AND enforce a hard timeout so the
 * splash always dismisses even if the browser fails to fire `onEnded` (this
 * happens on some mobile browsers / cached video combinations).
 */
export default function useIntro() {
  const [splashMounted, setSplashMounted] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Dismiss splash (video ended OR safety timeout fired).
    const dismiss = () => setSplashMounted(false);

    window.addEventListener('introVideoEnded', dismiss);

    // Fallback: force-dismiss after 10 seconds so a stuck video can't
    // trap the user on the landing page forever.
    timeoutRef.current = setTimeout(dismiss, 10_000);

    // Allow skipping the intro
    const handleSkip = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      dismiss();
    };
    window.addEventListener('skipIntro', handleSkip);

    return () => {
      window.removeEventListener('introVideoEnded', dismiss);
      window.removeEventListener('skipIntro', handleSkip);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    splashMounted,
  };
}
