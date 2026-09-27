import React, { useState } from 'react';
import {
  X,
  Compass,
  Layers,
  MapPin,
  TrendingUp,
  Navigation,
  Check,
} from 'lucide-react';
import { DetectedObject, NavigationRoute } from '../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: NavigationRoute;
  objects: DetectedObject[];
  walkDistance?: number;
  distanceRemaining?: number;
  isWalking?: boolean;
  coordinates?: {
    lat: string;
    lng: string;
    elevation: string;
  };
  onSelectDestination: (obj: DetectedObject) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  route,
  objects,
  walkDistance = 0,
  distanceRemaining = 640,
  isWalking = false,
  coordinates = {
    lat: '18°23\'42.1"N',
    lng: '77°28\'15.4"E',
    elevation: '-2,548 m',
  },
  onSelectDestination,
}) => {
  const [mapLayer, setMapLayer] = useState<'topo' | 'slope' | 'mineral'>('topo');

  // Traversal progress: 0 to 1
  const t = Math.min(1, Math.max(0, walkDistance / (route.totalDistanceMeters || 640)));

  // Calculate live astronaut position on the orbital map SVG (800x600 viewBox)
  // Curve: M 200 420 Q 320 380 420 310 T 620 180
  let currentX = 200;
  let currentY = 420;
  if (t <= 0.5) {
    const u = t * 2;
    currentX = (1 - u) ** 2 * 200 + 2 * (1 - u) * u * 320 + u ** 2 * 420;
    currentY = (1 - u) ** 2 * 420 + 2 * (1 - u) * u * 380 + u ** 2 * 310;
  } else {
    const u = (t - 0.5) * 2;
    currentX = (1 - u) ** 2 * 420 + 2 * (1 - u) * u * 520 + u ** 2 * 620;
    currentY = (1 - u) ** 2 * 310 + 2 * (1 - u) * u * 240 + u ** 2 * 180;
  }

  // Traveled breadcrumbs along the curve
  const breadcrumbPoints: { x: number; y: number }[] = [];
  const totalSteps = 16;
  const activeSteps = Math.floor(t * totalSteps);
  for (let i = 1; i <= activeSteps; i++) {
    const pT = i / totalSteps;
    let px = 200;
    let py = 420;
    if (pT <= 0.5) {
      const u = pT * 2;
      px = (1 - u) ** 2 * 200 + 2 * (1 - u) * u * 320 + u ** 2 * 420;
      py = (1 - u) ** 2 * 420 + 2 * (1 - u) * u * 380 + u ** 2 * 310;
    } else {
      const u = (pT - 0.5) * 2;
      px = (1 - u) ** 2 * 420 + 2 * (1 - u) * u * 520 + u ** 2 * 620;
      py = (1 - u) ** 2 * 310 + 2 * (1 - u) * u * 240 + u ** 2 * 180;
    }
    breadcrumbPoints.push({ x: px, y: py });
  }

  if (!isOpen) return null;

  return (
    <div
      id="modal-map-view"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-5xl h-[85vh] rounded-3xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  JEZERO CRATER ORBITAL MAP
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                  MRO HiRISE 25cm/px
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                18°23'42.1"N, 77°28'15.4"E · Elevation -2,548 m · Sol 142
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Layer switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/60 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setMapLayer('topo')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  mapLayer === 'topo'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Topography
              </button>
              <button
                onClick={() => setMapLayer('slope')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  mapLayer === 'slope'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Slope Hazards
              </button>
              <button
                onClick={() => setMapLayer('mineral')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  mapLayer === 'mineral'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hydrated Minerals
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Body: Split into Interactive Map & Route Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Visual Map Area */}
          <div className="flex-1 relative bg-slate-950 p-4 flex items-center justify-center overflow-hidden">
            {/* Simulated Satellite Terrain Base with High-Fidelity SVG Contours */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-[#1a0f0d]">
              {/* Martian Texture Background */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'radial-gradient(#d97706 1px, transparent 1px), radial-gradient(#9a3412 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />

              {/* Topographic Contour lines */}
              <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 800 600">
                {/* Elevation Rings */}
                <ellipse cx="400" cy="300" rx="360" ry="240" fill="none" stroke="#ea580c" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
                <ellipse cx="380" cy="310" rx="280" ry="180" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.4" />
                <ellipse cx="350" cy="320" rx="190" ry="120" fill="none" stroke="#ea580c" strokeWidth="1.2" opacity="0.5" />
                <ellipse cx="320" cy="330" rx="110" ry="70" fill="none" stroke="#ea580c" strokeWidth="1.4" opacity="0.6" />

                {/* River delta braided channels */}
                <path d="M 50 150 Q 200 240 380 320 T 750 480" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.7" />
                <path d="M 70 200 Q 220 280 410 330 T 720 520" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.5" />

                {/* Layer specific highlights */}
                {mapLayer === 'slope' && (
                  <path
                    d="M 280 360 L 350 350 L 380 400 L 310 420 Z"
                    fill="rgba(245, 158, 11, 0.35)"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                )}

                {mapLayer === 'mineral' && (
                  <ellipse
                    cx="540"
                    cy="260"
                    rx="60"
                    ry="45"
                    fill="rgba(6, 182, 212, 0.3)"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                  />
                )}

                {/* Active Planned Route & Moving Astronaut Traversal */}
                <g>
                  {/* Traveled Trail Line (Solid Emerald Green) */}
                  {breadcrumbPoints.length > 1 && (
                    <polyline
                      points={`200,420 ${breadcrumbPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} ${currentX.toFixed(1)},${currentY.toFixed(1)}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.9))"
                    />
                  )}

                  {/* Traveled Breadcrumbs Dots */}
                  {breadcrumbPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="2.5"
                      fill="#34d399"
                      stroke="#064e3b"
                      strokeWidth="0.8"
                    />
                  ))}

                  {/* Remaining Ahead Planned Route (Dashed Glowing Cyan) */}
                  <path
                    d={`M ${currentX.toFixed(1)} ${currentY.toFixed(1)} Q 320 380 420 310 T 620 180`}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    className="animate-dash-forward"
                    filter="drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))"
                  />

                  {/* Waypoint 1 */}
                  <circle cx="330" cy="370" r="5" fill={t > 0.35 ? '#10b981' : '#38bdf8'} stroke="#fff" strokeWidth="1.5" />
                  {/* Waypoint 2 */}
                  <circle cx="480" cy="270" r="5" fill={t > 0.7 ? '#10b981' : '#38bdf8'} stroke="#fff" strokeWidth="1.5" />

                  {/* Starting Base Point */}
                  <circle cx="200" cy="420" r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />

                  {/* Dynamic Astronaut Position Marker (Moving Forward Across Map!) */}
                  <circle cx={currentX} cy={currentY} r="10" fill="#06b6d4" className={isWalking ? 'animate-ping' : ''} opacity="0.4" />
                  <circle cx={currentX} cy={currentY} r="6.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2.5" filter="drop-shadow(0 0 8px rgba(34,211,238,1))" />

                  {/* Astronaut Moving Tag */}
                  <g transform={`translate(${currentX}, ${currentY + 22})`}>
                    <rect x="-48" y="-12" width="96" height="18" rx="9" fill="rgba(15, 23, 42, 0.9)" stroke="#22d3ee" strokeWidth="1" />
                    <text x="0" y="1" fill="#ffffff" fontSize="9.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {isWalking ? `EVA-1 (+${Math.round(walkDistance)}m)` : 'YOU (EVA-1)'}
                    </text>
                  </g>
                </g>
              </svg>

              {/* Live Forward Traversal Floating Telemetry Card in Top-Left of Map */}
              <div className="absolute top-4 left-4 z-20 p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-400/30 text-xs font-mono space-y-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                <div className="flex items-center space-x-2 text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${isWalking ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
                  <span>{isWalking ? 'LIVE TRAVERSAL ACTIVE' : 'EVA-1 STATIONARY'}</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-white font-bold text-sm">
                    {Math.round(walkDistance)} m
                  </span>
                  <span className="text-slate-400 text-[11px]">walked</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {Math.round(distanceRemaining)} m
                  </span>
                  <span className="text-slate-400 text-[11px]">to base</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-200"
                    style={{ width: `${Math.round(t * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>GPS: {coordinates.lat.slice(0, 10)}</span>
                  <span className="text-cyan-300 font-bold">{Math.round(t * 100)}%</span>
                </div>
              </div>

              {/* Clickable POI Markers on the Map */}
              {objects.map((obj) => {
                // Map object positions to SVG coordinates
                let posX = 200;
                let posY = 420;

                if (obj.category === 'BASE') {
                  posX = 620;
                  posY = 180;
                } else if (obj.category === 'HAZARD') {
                  posX = 320;
                  posY = 390;
                } else if (obj.category === 'SCIENCE') {
                  posX = 380;
                  posY = 430;
                } else if (obj.category === 'ROVER') {
                  posX = 490;
                  posY = 210;
                } else if (obj.category === 'RESOURCE') {
                  posX = 540;
                  posY = 260;
                }

                const isCurrentDest = route.destinationName.includes(obj.title);

                return (
                  <button
                    key={obj.id}
                    onClick={() => onSelectDestination(obj)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${(posX / 800) * 100}%`, top: `${(posY / 600) * 100}%` }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`p-1.5 rounded-full border shadow-lg transition-transform group-hover:scale-125 ${
                          isCurrentDest
                            ? 'bg-emerald-500 text-slate-950 border-white ring-4 ring-emerald-500/30'
                            : obj.category === 'HAZARD'
                            ? 'bg-amber-500 text-slate-950 border-white'
                            : 'bg-slate-900/90 text-cyan-300 border-cyan-400'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white whitespace-nowrap">
                        {obj.title} ({Math.round(obj.distanceMeters)}m)
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-mono space-y-1.5">
                <div className="font-bold text-white/70">MAP OVERLAY</div>
                <div className="flex items-center space-x-2 text-cyan-300">
                  <span className="w-2 h-0.5 bg-cyan-400" />
                  <span>Optimal Traversability Route</span>
                </div>
                <div className="flex items-center space-x-2 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Steep Basalt Hazard Zone (&gt;25°)</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Safe Pressurized Enclosure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Active Route & Waypoints List */}
          <div className="w-80 border-l border-white/10 bg-slate-900/40 p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-3">
                <Navigation className="w-4 h-4" />
                <span>Active Route Plan</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 mb-4">
                <div className="text-xs text-white/50 font-mono">TARGET DESTINATION</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {route.destinationName}
                </div>
                <div className="flex items-center space-x-3 mt-2 text-xs font-mono text-cyan-200">
                  <span>{Math.round(route.currentDistanceRemaining)} m left</span>
                  <span>·</span>
                  <span>~8 min walk</span>
                </div>
              </div>

              {/* Waypoints Sequence */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-white/60 font-semibold mb-2">
                  ROUTE WAYPOINTS
                </div>
                {route.waypoints.map((wp, idx) => (
                  <div
                    key={wp.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs font-mono ${
                      idx === route.currentStepIndex
                        ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                        : 'bg-slate-900/30 border-white/5 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">WP-{idx + 1}: {wp.name}</span>
                      <span className="text-[10px] text-white/50">{wp.distanceMeters}m</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 font-sans">
                      {wp.instruction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-colors shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                RETURN TO VISOR HUD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
