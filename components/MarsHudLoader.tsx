'use client';

import dynamic from 'next/dynamic';

// The HUD uses the camera, WebAudio and three.js/WebGL, all of which only
// exist in the browser, so it's loaded on the client only (ssr: false).
// `next/dynamic` with `ssr: false` must be called from a Client Component,
// which is why this small wrapper exists between app/page.tsx and MarsHudApp.
const MarsHudApp = dynamic(() => import('./MarsHudApp'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-slate-300 font-mono text-sm tracking-widest">
      INITIALIZING HELMET SYSTEMS…
    </div>
  ),
});

export default function MarsHudLoader() {
  return <MarsHudApp />;
}
