export default function SplashScreen({ videoSrc, poster }) {
  const handleVideoEnd = () => {
    window.dispatchEvent(new CustomEvent('introVideoEnded'));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        poster={poster}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
      />
      <div className="absolute inset-0 bg-black/45" />

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('skipIntro'));
        }}
        className="absolute bottom-8 right-8 z-50 border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/60 transition-all duration-500 hover:border-noir-gold hover:text-noir-gold"
      >
        Skip Intro
      </button>
    </div>
  );
}
