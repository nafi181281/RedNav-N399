import React from 'react';
import { NavigationRoute } from '../types';

interface ArGroundPathProps {
  route: NavigationRoute;
  distanceRemaining: number;
  panOffset: number; // horizontal pan offset in degrees (-180 to 180)
  pitchOffset: number; // vertical pitch offset in degrees
  isWalking: boolean;
  walkDistance?: number;
  onSelectWaypoint?: (index: number) => void;
}

export const ArGroundPath: React.FC<ArGroundPathProps> = ({
  route,
  distanceRemaining,
  panOffset,
  pitchOffset,
  isWalking,
  walkDistance = 0,
}) => {
  // Destination bearing relative to current heading (Destination at 248°, base heading 240°)
  // Horizontal screen projection based on pan offset
  const destHeadingRel = 8 - panOffset; // degrees off-center
  const screenXPercent = 50 + destHeadingRel * 1.5; // map degrees to screen percentage
  const screenYPercent = 52 + pitchOffset * 0.8; // horizon line around 52%

  const secondsLeft = Math.max(30, Math.round(distanceRemaining / 1.25));
  const etaMinutes = Math.floor(secondsLeft / 60);
  const etaSeconds = secondsLeft % 60;

  // Dynamic animated chevrons that slide towards the astronaut as they walk forward
  const chevronOffset = (walkDistance * 0.08) % 0.16;
  const baseProgresses = [0.10, 0.26, 0.42, 0.58, 0.74, 0.90];

  const chevrons = baseProgresses.map((baseP) => {
    // As you walk forward, chevrons move toward bottom (progress decreases toward 0)
    let p = baseP - chevronOffset;
    if (p < 0.04) p += 0.96; // smoothly loop
    const width = 360 * (1 - p * 0.82);
    const opacity = Math.sin(p * Math.PI) * 0.85 + 0.15;
    return {
      progress: p,
      width,
      strokeWidth: Math.max(1.5, 4.5 * (1 - p * 0.7)),
      opacity: Math.max(0.25, Math.min(0.95, opacity)),
    };
  });

  return (
    <div
      id="hud-ar-ground-path"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
    >
      {/* 3D Perspective Ground SVG Overlay */}
      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Glowing path linear gradient */}
          <linearGradient id="arPathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
          </linearGradient>

          {/* Glowing blur filter for AR path */}
          <filter id="arGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Intense neon beacon glow */}
          <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Projected Route Surface Ribbon */}
        {/* Dynamic perspective endpoints based on pan and pitch */}
        {(() => {
          const horizonY = 540 + pitchOffset * 7;
          const targetX = 500 + destHeadingRel * 16;
          const targetY = horizonY - 10;
          const bottomStartX = 500;
          const bottomStartY = 1050;

          // Gentle S-curve path representing Martian terrain navigation
          const ctrl1X = bottomStartX + 30;
          const ctrl1Y = 820;
          const ctrl2X = targetX - 50;
          const ctrl2Y = 660;

          return (
            <g filter="url(#arGlow)">
              {/* Outer soft corridor boundaries */}
              <path
                d={`M ${bottomStartX - 180} ${bottomStartY} 
                    C ${ctrl1X - 100} ${ctrl1Y}, ${ctrl2X - 40} ${ctrl2Y}, ${targetX - 12} ${targetY}
                    L ${targetX + 12} ${targetY}
                    C ${ctrl2X + 40} ${ctrl2Y}, ${ctrl1X + 100} ${ctrl1Y}, ${bottomStartX + 180} ${bottomStartY} Z`}
                fill="url(#arPathGradient)"
                opacity="0.08"
              />

              {/* Center Guidance Line - Minimal & Clean */}
              <path
                d={`M ${bottomStartX} ${bottomStartY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${targetX} ${targetY}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                style={{
                  strokeDashoffset: isWalking ? -(walkDistance * 30) % 28 : 0,
                }}
                opacity="0.45"
              />

              {/* Waypoint subtle ground contact pips */}
              <ellipse
                cx={ctrl1X}
                cy={ctrl1Y}
                rx="28"
                ry="8"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                opacity="0.3"
              />
              <ellipse
                cx={ctrl2X}
                cy={ctrl2Y}
                rx="18"
                ry="5"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                opacity="0.25"
              />
            </g>
          );
        })()}
      </svg>

      {/* Direction indicators along the path - subtle and clean */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none pb-8">
        {chevrons.map((chev, index) => {
          // Calculate screen position along perspective curve
          const y = 88 - chev.progress * 36 - pitchOffset * 0.4;
          const x = 50 + (destHeadingRel * (chev.progress * 0.9));

          return (
            <div
              key={index}
              className="absolute transition-transform duration-100 flex items-center justify-center opacity-30"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: 'translate(-50%, -50%)',
                opacity: chev.opacity,
              }}
            >
              {/* Glowing Arrow Chevron */}
              <div
                className="flex items-center justify-center"
                style={{ width: `${chev.width * 0.6}px` }}
              >
                <div className="w-full flex items-center justify-center relative">
                  <div
                    className="h-1 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                    style={{
                      width: `${chev.width * 0.45}px`,
                      opacity: chev.opacity,
                    }}
                  />
                  {/* Small direction arrow head */}
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-cyan-300 -mt-2 shadow-[0_0_10px_rgba(103,232,249,1)]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Destination Marker over Habitat Alpha */}
      <div
        id="hud-destination-marker"
        className="absolute transition-all duration-100 flex flex-col items-center pointer-events-auto group cursor-pointer"
        style={{
          left: `${screenXPercent}%`,
          top: `${screenYPercent}%`,
          transform: 'translate(-50%, -100%)',
          display: screenXPercent > -20 && screenXPercent < 120 ? 'flex' : 'none',
        }}
      >
        {/* Destination Floating Glass Card */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:border-cyan-300 transition-all">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                {route.destinationName}
              </span>
              <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                {Math.round(distanceRemaining)} m
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-1 px-2.5 py-0.5 rounded-md bg-slate-900/60 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-cyan-200/90">
            <span>ETA {etaMinutes}m {etaSeconds.toString().padStart(2, '0')}s</span>
            <span>·</span>
            <span>BEARING 248°</span>
            <span>·</span>
            <span className="text-emerald-400">AIRLOCK 02 OPEN</span>
          </div>

          {/* Vertical Light Beacon Pillar Dropping to Surface */}
          <div className="flex flex-col items-center mt-1">
            <div className="w-0.5 h-16 bg-gradient-to-b from-cyan-400 via-cyan-400/40 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            {/* Ground contact pulsing radar target */}
            <div className="relative -mt-1">
              <div className="w-6 h-2 rounded-full border border-cyan-400/80 bg-cyan-400/20 animate-ping" />
              <div className="w-3 h-1 rounded-full bg-cyan-300 absolute inset-0 m-auto shadow-[0_0_6px_rgba(103,232,249,1)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
