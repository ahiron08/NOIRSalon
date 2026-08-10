import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/**
 * Reusable full-bleed background video with:
 *  - lazy loading (preload card-frame only until needed)
 *  - poster fallback + on-can-play loading skeleton
 *  - a slow, cinematic GSAP zoom once playing
 *  - an optional darkening overlay
 */
export default function HeroVideo({ src, poster, play, overlay = 'rgba(0,0,0,0.55)', className = '' }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  // start playback only when the splash hands off to the homepage
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (play) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [play]);

  // slow cinematic zoom (GPU transform — stays on the compositor)
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !play) return undefined;

    const tween = gsap.fromTo(
      el,
      { scale: 1, transformOrigin: 'center center' },
      { scale: 1.12, duration: 24, ease: 'none', repeat: -1, yoyo: true }
    );
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [play]);

  return (
    <div className={'absolute inset-0 overflow-hidden bg-black ' + className}>
      {/* loading skeleton — avoids layout shift */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black"
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: ready ? 'none' : 'auto' }}
      >
        <div className="h-[34vw] max-h-72 w-[52vw] max-w-lg overflow-hidden">
          <motion.div
            className="h-full w-full"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              backgroundImage:
                'linear-gradient(110deg, #050505 8%, #0d0d0d 18%, #050505 33%)',
              backgroundSize: '200% 200%',
            }}
          />
        </div>
      </motion.div>

      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay={play}
        muted
        loop
        playsInline
        preload={play ? 'auto' : 'metadata'}
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)}
        onError={() => setReady(true)}
      />

      {/* darkening overlay */}
      <div className="absolute inset-0" style={{ background: overlay }} />
    </div>
  );
}
