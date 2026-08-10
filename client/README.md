# NOIR SALON — Landing Experience

> *"This isn't a salon. This is a luxury beauty brand."*

A premium, cinematic landing experience (Splash + Hero Homepage) for **NOIR SALON, Guwahati — East India's Largest Luxury Salon**.

Built to feel like Apple × Dior × Rolex × Aman Resorts: minimalist, spacious, editorial, restrained.

## Tech Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3** (custom luxury design tokens)
- **Framer Motion** (orchestrated reveals, masks, transitions)
- **GSAP** (slow cinematic hero-video zoom)
- **Lenis** (buttery smooth scrolling)
- **React Router** (routing shell, ready for future pages)
- **React Icons**

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run preview
```

## Experience Flow

1. **Splash** — pure black, `NOIR` wordmark fades in (blur→crisp), the cinematic
   `intro.mp4` slowly rises over the full screen, then the tagline *"Luxury •
   Beauty • Confidence"* and a gold rule glide in.
2. **~3.4s** — the homepage `hero.mp4` starts playing *beneath* the splash.
3. **~4.7s** — the splash dissolves (opacity / blur / scale) via `AnimatePresence`,
   revealing an already-running hero — an Apple-like handoff, never a hard cut.

## Media

Replace the placeholders:

| File | Path | Used by |
| ---- | ---- | ------- |
| `intro.mp4` | `/public/videos/intro.mp4` | Splash |
| `hero.mp4` | `/public/videos/hero.mp4` | Homepage Hero |

> The canonical media source folder is `/assets/videos/` (see its README). For the
> running build, drop files into `/public/videos/`. Optionally add poster images in
> `/public/images/`.

## Structure

```
src/
  components/
    Navbar.jsx          Transparent→solid, animated, mobile drawer, Book Now
    Hero.jsx            Full-viewport hero, masked headline, stats, scroll cue
    HeroVideo.jsx       Lazy full-bleed video + skeleton + cinematic zoom
    SplashScreen.jsx    Immersive intro sequence
    Stats.jsx           Glassmorphism stat cards (column / row)
    Buttons.jsx         Book + Explore buttons, Magnetic wrapper
    ScrollIndicator.jsx Animated mouse scroll cue
    Cursor.jsx          Bespoke golden cursor (spring + halo)
    BackgroundNoise.jsx Film grain + drifting gradients
    Reveal.jsx          Masked text reveal
  hooks/
    useIntro.js         Splash→home timeline orchestration
    useCursor.js        Custom-cursor enable/hover wiring
  pages/
    Landing.jsx         Composes splash + navbar + hero
  App.jsx               Lenis scroll, global layers, routing
```

## Design Language

- **Palette**: `#000000` / `#FFFFFF` / `#D4AF37` (gold used sparingly) / `#A1A1AA`.
- **Type**: Cormorant Garamond (serif display) + Manrope (modern sans).
- **Motion**: opacity, blur, translate, mask reveals, parallax, slow easing —
  nothing pops, everything glides. No bounce.
- **Interactions**: magnetic buttons, custom cursor that expands on targets,
  hover-lift cards, underline reveals.

## Notes

- Only the landing experience is built. Menu links (`Services`, `Gallery`, etc.)
  are anchor placeholders ready to be pointed at future routes.
- The custom cursor auto-disables on touch devices.
