# Mars EVA Helmet HUD — Next.js (App Router)

মূল প্রজেক্টটা ছিল Vite + React (Google AI Studio থেকে বানানো, কোনো router ছাড়া, শুধু state দিয়ে "mode" পাল্টানো)। এটাকে **Next.js 15 + App Router** স্ট্রাকচারে কনভার্ট করা হয়েছে।

## Project Structure

```
mars-eva-helmet-hud/
├── app/
│   ├── layout.tsx        # Root layout: fonts, metadata, <html>/<body>
│   ├── page.tsx          # "/" route — এখান থেকেই HUD লোড হয়
│   └── globals.css       # Tailwind v4 + সব কাস্টম animation/keyframes
│
├── components/
│   ├── MarsHudLoader.tsx # Client wrapper — next/dynamic দিয়ে ssr:false সেট করে
│   ├── MarsHudApp.tsx    # আসল App (আগে src/App.tsx ছিল) — 'use client'
│   ├── CompassTape.tsx
│   ├── EnvironmentTelemetryHud.tsx
│   ├── TurnByTurnBanner.tsx
│   ├── ArGroundPath.tsx
│   ├── ArDetectionOverlay.tsx
│   ├── MiniMapRadar.tsx
│   ├── BottomNavControls.tsx
│   ├── HelmetVisorOverlay.tsx
│   ├── Mars3dSurface.tsx # three.js দিয়ে 3D ground
│   ├── GoogleEarthWidget.tsx
│   ├── MapModal.tsx
│   ├── ScanModal.tsx
│   ├── CameraModal.tsx
│   └── ToolsModal.tsx
│
├── data/
│   └── marsData.ts       # initial telemetry/route/detected-objects ডেটা
│
├── utils/
│   └── soundEffects.ts   # WebAudio দিয়ে HUD sound effects
│
├── types.ts               # সব shared TypeScript types
│
├── /
│   └── images/            # সব mars/astronaut জেপিজি (আগে /images-এ ছিল)
│
├── next.config.mjs
├── postcss.config.mjs     # @tailwindcss/postcss plugin
├── tsconfig.json
└── package.json
```

### কী কী বদলেছে (Vite → Next.js)

1. **Routing:** `App.tsx` → `components/MarsHudApp.tsx` নাম হয়ে `app/page.tsx`-এর ভেতর দিয়ে render হচ্ছে — এটাই App Router-এর `/` রুট।
2. **Client-only rendering:** এই HUD ক্যামেরা, WebAudio আর three.js/WebGL ব্যবহার করে — এগুলো শুধু ব্রাউজারে চলে, সার্ভারে না। তাই `MarsHudLoader.tsx` `next/dynamic`-এর `ssr: false` দিয়ে `MarsHudApp` লোড করে, আর `MarsHudApp.tsx`-এর একদম উপরে `'use client'` directive আছে।
3. **Images:** আগে `/images/xxx.jpg` পাথ দিয়ে রেফার হতো (Vite dev server `/src` সার্ভ করত)। এখন সব ইমেজ `/images/`-এ, আর কোডে পাথ `/images/xxx.jpg` করা হয়েছে (Next.js `/` ফোল্ডার এমনিতেই root থেকে সার্ভ করে)।
4. **Unused deps বাদ:** `express`, `dotenv`, `@google/genai`, `motion` — কোডে এগুলোর কোনো ব্যবহার পাওয়া যায়নি (স্ক্যাফোল্ডের leftover ছিল), তাই `package.json` থেকে সরানো হয়েছে। HUD পুরোটাই client-side, কোনো external API কল নেই।
5. **Tailwind v4:** আগে `@tailwindcss/vite` প্লাগিন ছিল, এখন `@tailwindcss/postcss` + `postcss.config.mjs` দিয়ে সেটআপ করা হয়েছে (Next.js-এর PostCSS pipeline দিয়ে চলে)।

## Setup Instructions

**Prerequisites:** Node.js 18.18+ (Next.js 15-এর জন্য 20+ recommended)

```bash
# 1. Dependencies install করো
npm install

# 2. Dev server চালাও (http://localhost:3000)
npm run dev

# 3. Production build
npm run build
npm run start
```

কোনো `.env` ফাইলের দরকার নেই — এই প্রজেক্টে কোনো API key ব্যবহার হয় না, পুরোটাই ফ্রন্টএন্ড/ব্রাউজার-সাইড অ্যাপ (camera, geolocation-style mock data, three.js 3D ground, WebAudio sound effects)।

## Notes

- `components/Mars3dSurface.tsx` তে three.js দিয়ে procedural ground টেক্সচার বানানো হয় — খুব ভারী, তাই lazy/client-only করা জরুরি ছিল (উপরে বলা হয়েছে)।
- `CameraModal.tsx` ব্রাউজারের ক্যামেরা পারমিশন চায় — HTTPS বা `localhost`-এ ছাড়া কাজ করবে না (browser security restriction, Next.js-এর কোনো ব্যাপার না)।
- চাইলে পরে `app/` এর ভেতর আরও রুট (যেমন `/settings`, `/about`) যোগ করা যাবে — এখন যেহেতু App Router বসানো হয়েছে, নতুন ফোল্ডার + `page.tsx` বানালেই নতুন রুট তৈরি হয়ে যাবে।
