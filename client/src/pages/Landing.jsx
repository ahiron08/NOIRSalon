import useIntro from '../hooks/useIntro.js';
import SplashScreen from '../components/SplashScreen.jsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * The Landing Experience — just shows the intro video.
 * After video completes, redirects to homepage.
 */
export default function Landing() {
  const { splashMounted } = useIntro();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page after splash is done
    // This is handled by the introVideoEnded event in useIntro
    // We just need to navigate after splashMounted becomes false
    if (!splashMounted) {
      navigate('/home', { replace: true });
    }
  }, [splashMounted, navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Just show the splash video */}
      {splashMounted && (
        <SplashScreen
          key="splash"
          videoSrc="/videos/intro.mp4"
        />
      )}
    </main>
  );
}
