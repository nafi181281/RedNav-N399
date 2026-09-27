import React, { useState } from 'react';
import { Maximize2, Plus, Minus, Layers } from 'lucide-react';
import { DetectedObject, NavigationRoute } from '../types';

interface MiniMapRadarProps {
  headingDeg: number;
  route: NavigationRoute;
  objects: DetectedObject[];
  distanceRemaining: number;
  walkDistance?: number;
  isWalking?: boolean;
  onExpandMap: () => void;
  onSelectObject: (obj: DetectedObject) => void;
}

export const MiniMapRadar: React.FC<MiniMapRadarProps> = ({
  headingDeg,
  route,
  objects,
  distanceRemaining,
  walkDistance = 0,
  isWalking = false,
  onExpandMap,
  onSelectObject,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(1); // 1x = 700m radius, 2x = 350m radius

  const radarRadius = 70; // px
  const maxRangeMeters = 700 / zoomScale;

  // Traversal progress: 0 to 1
  const progress = Math.min(1, Math.max(0, walkDistance / (route.totalDistanceMeters || 640)));

  // Destination on radar (bearing 248°, upper-left/west)
  const destAngleRad = ((248 - 90) * Math.PI) / 180;
  const destDistNorm = 0.78;
  const destX = 72 + Math.cos(destAngleRad) * (radarRadius * destDistNorm);
  const destY = 72 + Math.sin(destAngleRad) * (radarRadius * destDistNorm);

  // Start point on radar (lower-right/east)
  const startX = 72 - Math.cos(destAngleRad) * (radarRadius * 0.65);
  const startY = 72 - Math.sin(destAngleRad) * (radarRadius * 0.65);

  // Current active position of astronaut moving forward across the map!
  const userX = startX + (destX - startX) * progress;
  const userY = startY + (destY - startY) * progress;

  return (
    <div
      id="hud-minimap-radar"
      className="absolute bottom-24 right-8 z-30 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Radar Glass Enclosure */}
      <div className="relative p-3 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Top Header */}
        <div className="flex items-center justify-between w-full mb-2 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5 text-cyan-300">
            <Layers className="w-3 h-3" />
            <span className="font-semibold tracking-wider">RADAR · {Math.round(maxRangeMeters)}m</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.5))}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              title="Zoom In"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => setZoomScale((z) => Math.max(0.75, z - 0.5))}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onExpandMap}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              title="Expand Orbital Map"
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Circular Radar Scope */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden border border-cyan-400/30 bg-slate-900/60 flex items-center justify-center">
          {/* Martian Contour Elevation Background Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            viewBox="0 0 144 144"
          >
            {/* Elevation Contours */}
            <path
              d="M 10 70 Q 50 40 80 70 T 140 60"
              fill="none"
              stroke="#fb923c"
              strokeWidth="0.8"
            />
            <path
              d="M 20 90 Q 60 70 90 90 T 140 85"
              fill="none"
              stroke="#fb923c"
              strokeWidth="0.8"
            />
            <path
              d="M 5 45 Q 60 20 110 40 T 140 30"
              fill="none"
              stroke="#fb923c"
              strokeWidth="0.8"
            />
          </svg>

          {/* Concentric Distance Rings */}
          <div className="absolute w-28 h-28 rounded-full border border-cyan-500/20" />
          <div className="absolute w-16 h-16 rounded-full border border-cyan-500/30" />
          <div className="absolute w-6 h-6 rounded-full border border-cyan-500/40" />

          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400/20" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-400/20" />

          {/* Radar Sweep Animation */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, rgba(34, 211, 238, 0.25) 0deg, transparent 60deg, transparent 360deg)',
              animation: 'spin 4s linear infinite',
            }}
          />

          {/* Route Lines & Traveled Breadcrumb Trail */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* 1. Traveled Path (Behind the Astronaut) */}
            {progress > 0.01 && (
              <line
                x1={startX}
                y1={startY}
                x2={userX}
                y2={userY}
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}

            {/* 2. Traveled Step Breadcrumbs */}
            {progress > 0.05 && (
              <>
                <circle cx={startX + (destX - startX) * (progress * 0.25)} cy={startY + (destY - startY) * (progress * 0.25)} r="1.5" fill="#34d399" opacity="0.6" />
                <circle cx={startX + (destX - startX) * (progress * 0.50)} cy={startY + (destY - startY) * (progress * 0.50)} r="1.5" fill="#34d399" opacity="0.7" />
                <circle cx={startX + (destX - startX) * (progress * 0.75)} cy={startY + (destY - startY) * (progress * 0.75)} r="1.5" fill="#34d399" opacity="0.8" />
              </>
            )}

            {/* 3. Remaining Route to Destination (Ahead of the Astronaut) */}
            <line
              x1={userX}
              y1={userY}
              x2={destX}
              y2={destY}
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.8"
            />

            {/* Starting Point Marker */}
            <circle
              cx={startX}
              cy={startY}
              r="2.5"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="0.8"
              opacity="0.7"
            />

            {/* Destination Marker (Habitat Alpha) */}
            <circle
              cx={destX}
              cy={destY}
              r="4.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.2"
              className="animate-pulse"
            />
          </svg>

          {/* Dynamic Astronaut Blip Advancing on the Mars Map */}
          <div
            className="absolute z-20 flex items-center justify-center transition-all duration-100"
            style={{
              left: `${userX}px`,
              top: `${userY}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Walking Movement Ripple */}
            {isWalking && (
              <div className="absolute w-8 h-8 rounded-full border border-cyan-400/60 animate-ping pointer-events-none" />
            )}

            {/* Heading FOV Cone */}
            <div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${headingDeg}deg)`,
              }}
            >
              <div
                className="absolute -top-14 w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[52px] border-t-cyan-400/25 pointer-events-none"
              />
            </div>

            {/* Astronaut Core Beacon */}
            <div className="relative w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>

          {/* Detected Objects Blips on Radar */}
          {objects.map((obj) => {
            // Calculate polar coordinates on radar
            const angleRad = ((obj.azimuthDeg - 90) * Math.PI) / 180;
            const distNorm = Math.min(0.92, (obj.distanceMeters / maxRangeMeters) * 0.9);
            const x = 72 + Math.cos(angleRad) * (radarRadius * distNorm);
            const y = 72 + Math.sin(angleRad) * (radarRadius * distNorm);

            const isHazard = obj.category === 'HAZARD';
            const isRover = obj.category === 'ROVER';
            const isWater = obj.category === 'RESOURCE';

            const blipColor = isHazard
              ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,1)]'
              : isWater
              ? 'bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,1)]'
              : isRover
              ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,1)]'
              : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]';

            return (
              <button
                key={obj.id}
                onClick={() => onSelectObject(obj)}
                title={`${obj.title} (${Math.round(obj.distanceMeters)}m)`}
                className={`absolute w-2 h-2 rounded-full ${blipColor} -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-150 transition-transform`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              />
            );
          })}
        </div>

        {/* Cardinal North & Live Traversal Indicator */}
        <div className="flex justify-between items-center mt-2 px-1 text-[9px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isWalking ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
            <span className={isWalking ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
              {isWalking ? `ADV +${Math.round(walkDistance)}m` : `SOL 142 · ${Math.round(distanceRemaining)}m`}
            </span>
          </div>
          <span className="text-cyan-400 font-bold">N ↑ 000°</span>
        </div>
      </div>
    </div>
  );
};
