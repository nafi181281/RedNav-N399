import React from 'react';
import { VisorTint, GoogleEarthViewMode } from '../types';

interface HelmetVisorOverlayProps {
  tint: VisorTint;
  panOffset: number;
  pitchOffset: number;
  isWalking: boolean;
  viewMode?: GoogleEarthViewMode;
}

export const HelmetVisorOverlay: React.FC<HelmetVisorOverlayProps> = ({
  tint,
  panOffset,
  pitchOffset,
  isWalking,
  viewMode = 'eva',
}) => {
  const isOrbital = viewMode !== 'eva';

  // Tint class mappings
  const getTintOverlay = () => {
    switch (tint) {
      case 'gold-polar':
        return 'bg-amber-600/15 mix-blend-color backdrop-brightness-95 backdrop-contrast-110';
      case 'thermal-lidar':
        return 'bg-violet-900/20 mix-blend-hard-light backdrop-contrast-125';
      case 'night-nv':
        return 'bg-emerald-900/20 mix-blend-screen backdrop-brightness-110';
      default:
        return 'bg-cyan-950/5';
    }
  };

  return (
    <div
      id="hud-helmet-visor-structure"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10"
    >
      {/* 1. Visor Glass Tint & Anti-Reflective Optical Coating */}
      <div className={`absolute inset-0 transition-colors duration-500 ${getTintOverlay()}`} />

      {/* 2. Visor Curvature Vignette (Physical helmet interior shadow - softens in Google Earth 3D view) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${isOrbital ? 'opacity-25' : 'opacity-100'}`}
        style={{
          boxShadow: 'inset 0 0 120px 40px rgba(2, 6, 23, 0.85), inset 0 0 40px 10px rgba(0, 0, 0, 0.95)',
        }}
      />

      {/* 2.1 Orbital Recon HUD framing when in Google Earth 3D views */}
      {isOrbital && (
        <div className="absolute inset-4 rounded-3xl border border-cyan-500/20 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400/70 tracking-widest uppercase">
            <span>[ GOOGLE MARS 3D · {viewMode.toUpperCase()} VIEW ]</span>
            <span>MRO HiRISE PHOTOGRAMMETRY 0.25m/px</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400/60 tracking-widest uppercase">
            <span>DEM ELEVATION MODEL: ACTIVE</span>
            <span>LAT 18°23'N · LON 77°28'E</span>
          </div>
        </div>
      )}

      {/* 3. Subtle Hexagonal Micro-Matrix AR Projection Plane */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#22d3ee 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 4. Realistic Visor Curved Glass Optical Reflections & Glares */}
      <div
        className="absolute inset-0 transition-transform duration-300 pointer-events-none opacity-40"
        style={{
          transform: `translate(${panOffset * 0.4}px, ${pitchOffset * 0.4}px)`,
        }}
      >
        {/* Upper Left Visor Arch Glare */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[350px] rounded-[100%] opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(200,240,255,0.1) 40%, transparent 70%)',
            transform: 'rotate(-25deg)',
          }}
        />

        {/* Lower Right Secondary Visor Arc Reflection */}
        <div
          className="absolute -bottom-40 -right-40 w-[700px] h-[400px] rounded-[100%] opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,220,180,0.3) 0%, rgba(255,160,100,0.05) 50%, transparent 70%)',
            transform: 'rotate(15deg)',
          }}
        />
      </div>

      {/* 5. Center Helmet Crosshairs / HUD Rangefinder Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Central Target Pip */}
          <div className="w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(103,232,249,1)]" />

          {/* Precision Crosshair Lines with central gap */}
          <div className="absolute top-0 w-px h-3 bg-cyan-400/40" />
          <div className="absolute bottom-0 w-px h-3 bg-cyan-400/40" />
          <div className="absolute left-0 h-px w-3 bg-cyan-400/40" />
          <div className="absolute right-0 h-px w-3 bg-cyan-400/40" />

          {/* Range Arc Lines */}
          <div className="absolute w-8 h-8 rounded-full border border-cyan-400/20 border-dashed" />
        </div>
      </div>

      {/* 6. Physical Helmet Visor Frame Edges (Top & Bottom Seal Rims) */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent pointer-events-none flex items-center justify-center">
        {/* Visor top curvature seam line */}
        <div className="w-2/3 h-px bg-white/10 rounded-full" />
      </div>

      <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none flex items-center justify-center">
        {/* Visor bottom chin seal rim */}
        <div className="w-3/4 h-px bg-white/10 rounded-full" />
      </div>

      {/* 7. Subtle Astronaut Respiration Condensation (Gentle breathing cycle at lower rim) */}
      <div
        className="absolute bottom-2 inset-x-1/4 h-16 rounded-t-full bg-gradient-to-t from-white/5 via-cyan-100/5 to-transparent blur-md pointer-events-none"
        style={{
          animation: 'breathing 6s ease-in-out infinite',
        }}
      />
    </div>
  );
};
