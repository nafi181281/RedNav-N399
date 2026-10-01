"use client";

import { useState } from "react";
import MarsHudLoader from "../components/MarsHudLoader";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  // Start বাটনে চাপ দিলে HUD এবং থ্রিডি এক্সপ্লোরেশন চালু হবে
  if (isStarted) {
    return <MarsHudLoader />;
  }

  // শুরুতে এই চমৎকার সাই-ফাই ল্যান্ডিং স্ক্রিনটি দেখাবে
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#060408] text-white">
      {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* সাই-ফাই গ্রিড লাইন ব্যাকগ্রাউন্ড */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* কনটেন্ট বক্স */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* টপ ব্যাজ */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-red-500/30 bg-red-950/40 text-red-400 font-mono text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Surface Reconnaissance Unit
        </div>

        {/* টাইটেল: RedNav-N399 */}
        <h1 
          className="text-6xl md:text-8xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.5)]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          RedNav-N399
        </h1>

        {/* সাবটাইটেল */}
        <p className="mt-4 text-sm md:text-base text-slate-400 font-mono tracking-wider uppercase">
          Planetary Surface Navigation & Telemetry Module
        </p>

        {/* ডেকোরেশন লাইন */}
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent my-8" />

        {/* স্টার্ট বাটন */}
        <button
          onClick={() => setIsStarted(true)}
          className="group relative px-10 py-4 font-mono text-sm tracking-widest uppercase font-bold text-white transition-all duration-300 rounded border border-red-500/60 bg-red-950/30 hover:bg-red-600 hover:text-black hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] hover:border-red-400 active:scale-95 cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-3">
            <span>START EXPEDITION</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </button>

        {/* ফুটার টেলিমিতি স্ট্যাটাস */}
        <div className="mt-12 flex gap-6 text-[10px] font-mono text-slate-500 tracking-wider">
          <span>COCKPIT VISOR: READY</span>
          <span>•</span>
          <span>TERRAIN SCAN: ONLINE</span>
          <span>•</span>
          <span>ORBITAL SYNC: 100%</span>
        </div>
      </div>
    </main>
  );
}