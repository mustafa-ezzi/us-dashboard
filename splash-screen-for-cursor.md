# Splash Screen — "us." Couples App

> Copy-paste this into Cursor to recreate the splash screen exactly.

---

## Dependencies

```bash
npm install framer-motion lucide-react wouter
# or
pnpm add framer-motion lucide-react wouter
```

---

## Color Palette (Splash Only)

| Role | Hex | Usage |
|---|---|---|
| Background base | `#050A2E` | Page background |
| Deep navy | `#1A0A5E` | Gradient layer 1 |
| Electric blue | `#0D47A1` | Gradient layer 2 |
| Hot pink | `#FF006E` | SVG stroke, CTA button, glow |
| Soft pink | `#FF4DB3` | Gradient layer 3 |
| Text | `#FFFFFF` | Logo wordmark |
| Tagline | `rgba(blue-200, 0.8)` | `text-blue-200/80` |

---

## File: `src/pages/splash.tsx`

```tsx
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Skip splash on revisit
    const hasSeenSplash = localStorage.getItem('seen_splash');
    if (hasSeenSplash) {
      setLocation('/dashboard');
      return;
    }

    // Auto-navigate after 4.5 seconds
    const timer = setTimeout(() => {
      localStorage.setItem('seen_splash', 'true');
      setLocation('/dashboard');
    }, 4500);

    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleStart = () => {
    localStorage.setItem('seen_splash', 'true');
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#050A2E]">

      {/* === ANIMATED GRADIENT BACKGROUND === */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(26, 10, 94, 0.8) 0%, rgba(5, 10, 46, 1) 50%)',
              'radial-gradient(circle at 80% 70%, rgba(255, 0, 110, 0.4) 0%, rgba(13, 71, 161, 0.6) 40%, rgba(5, 10, 46, 1) 70%)',
              'radial-gradient(circle at 50% 50%, rgba(255, 77, 179, 0.3) 0%, rgba(26, 10, 94, 0.7) 50%, rgba(5, 10, 46, 1) 80%)',
              'radial-gradient(circle at 20% 30%, rgba(26, 10, 94, 0.8) 0%, rgba(5, 10, 46, 1) 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      {/* === BOKEH / FLOATING PARTICLES === */}
      <div className="absolute inset-0 z-0 opacity-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white mix-blend-screen"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* === MAIN CONTENT === */}
      <div className="z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">

        {/* Animated Infinity Heart SVG (drawn with framer-motion pathLength) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative mb-8"
        >
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_15px_rgba(255,0,110,0.5)]"
          >
            <motion.path
              d="M30 15C15 15 5 25 5 40C5 55 15 55 25 55C40 55 50 35 60 35C70 35 80 55 95 55C105 55 115 55 115 40C115 25 105 15 90 15C75 15 65 35 60 35C55 35 45 15 30 15Z"
              stroke="#FF006E"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            />
          </svg>
        </motion.div>

        {/* Logo Wordmark */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-6xl font-extrabold tracking-tighter text-white mb-4 drop-shadow-md"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
        >
          us.
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-lg text-blue-200/80 mb-12 font-medium tracking-wide"
        >
          Your world. Just the two of you.
        </motion.p>

        {/* CTA Button with shimmer */}
        <motion.button
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="relative overflow-hidden group px-8 py-4 rounded-full bg-[#FF006E] text-white font-bold text-lg shadow-[0_0_20px_rgba(255,0,110,0.4)] transition-shadow hover:shadow-[0_0_30px_rgba(255,0,110,0.6)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started <Heart size={20} className="fill-white" />
          </span>
          {/* Shimmer sweep on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        </motion.button>

      </div>
    </div>
  );
}
```

---

## Shimmer Keyframe (add to your CSS / tailwind config)

If using Tailwind, add this to your `tailwind.config.ts` under `theme.extend`:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
};
```

Or as a plain CSS `@keyframes` block:

```css
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
```

---

## Routing (wouter)

Register the splash as the root route and redirect to your main page:

```tsx
// App.tsx
import { Route, Switch } from 'wouter';
import Splash from '@/pages/splash';
import Dashboard from '@/pages/dashboard';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/dashboard" component={Dashboard} />
      {/* ...other routes */}
    </Switch>
  );
}
```

The component automatically:
- **Skips itself** on repeat visits (`localStorage.getItem('seen_splash')`)
- **Auto-navigates** to `/dashboard` after 4.5 s
- **Immediately navigates** on "Get Started" click

To **reset the splash** during development: `localStorage.removeItem('seen_splash')` in the browser console.

---

## Animation Timeline

| Delay | Element | Animation |
|---|---|---|
| 0 s | Background gradient | Loops forever (10 s cycle) |
| 0 s | Bokeh particles | Float upward, loop forever |
| 0.2 s | Infinity heart container | Scale + fade in |
| 0.5 s | Infinity heart SVG path | `pathLength` draw (2 s) |
| 1.0 s | "us." wordmark | Slide up + fade in |
| 1.4 s | Tagline | Slide up + fade in |
| 2.2 s | "Get Started" button | Slide up + fade in |
| 4.5 s | Auto-navigate | `setLocation('/dashboard')` |

---

## Visual Effects Reference

| Effect | Implementation |
|---|---|
| Animated gradient | `framer-motion` `animate.background` array cycling through 4 radial gradients |
| Bokeh particles | 15× `motion.div` white circles, `mix-blend-screen`, `blur(1px)`, random positions/sizes/timings |
| Hot-pink glow on SVG | Tailwind `drop-shadow-[0_0_15px_rgba(255,0,110,0.5)]` |
| CTA glow | `box-shadow: 0 0 20px rgba(255,0,110,0.4)` → `0 0 30px …` on hover |
| Shimmer sweep | Pseudo-div with `bg-gradient-to-r from-transparent via-white/40 to-transparent`, `group-hover:animate-shimmer` |
| Wordmark glow | Inline `textShadow: '0 0 20px rgba(255,255,255,0.3)'` |
| SVG draw | `motion.path` with `initial={{ pathLength: 0 }}` → `animate={{ pathLength: 1 }}` |
