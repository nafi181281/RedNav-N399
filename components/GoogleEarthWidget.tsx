import React from 'react';
import {
  Compass,
  Layers,
  Sun,
  Eye,
  Camera,
  Play,
  Pause,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Wind,
} from 'lucide-react';
import { GoogleEarthViewMode, TimeOfSol } from '../types';

interface GoogleEarthWidgetProps {
  viewMode: GoogleEarthViewMode;
  onViewModeChange: (mode: GoogleEarthViewMode) => void;
  timeOfSol: TimeOfSol;
  onTimeOfSolChange: (time: TimeOfSol) => void;
  showTopoGrid: boolean;
  onToggleTopoGrid: () => void;
  isTourPlaying: boolean;
  onToggleTour: () => void;
  headingDeg: number;
  onResetNorth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  altitudeMeters: number;
  dustDevilsActive: boolean;
  onToggleDustDevils: () => void;
}

export const GoogleEarthWidget: React.FC<GoogleEarthWidgetProps> = ({
  viewMode,
  onViewModeChange,
  timeOfSol,
  onTimeOfSolChange,
  showTopoGrid,
  onToggleTopoGrid,
  isTourPlaying,
  onToggleTour,
  headingDeg,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  altitudeMeters,
  dustDevilsActive,
  onToggleDustDevils,
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  // Sol time labels & icons
  const solTimes: { id: TimeOfSol; label: string; icon: string; solHour: string }[] = [
    { id: 'morning', label: 'Morning', icon: '🌅', solHour: '08:15' },
    { id: 'noon', label: 'Midday', icon: '☀️', solHour: '12:30' },
    { id: 'golden', label: 'Golden Sol', icon: '🌇', solHour: '16:45' },
    { id: 'blue-sunset', label: 'Mars Blue Sunset', icon: '🌌', solHour: '18:50' },
    { id: 'night', label: 'Night & Moons', icon: '✨', solHour: '22:10' },
  ];

  const viewModes: { id: GoogleEarthViewMode; label: string; short: string; desc: string }[] = [
    { id: 'eva', label: 'Helmet HUD (1st Person)', short: 'EVA 1.75m', desc: '1st Person Inside Visor' },
    { id: 'astronaut', label: 'Astronaut Walk (3rd Person)', short: 'Astronaut', desc: 'Watch Astronaut Walk on Mars Soil' },
    { id: 'drone', label: '3D Drone Tilt', short: '3D Tilt 28m', desc: 'Google Earth 3D Oblique' },
    { id: 'satellite', label: 'HiRISE Satellite', short: 'Satellite 180m', desc: 'Orbital Topography' },
    { id: 'flyover', label: 'Cinematic Tour', short: '3D Flyover', desc: 'Automatic Jezero Flyby' },
  ];

  return (
    <aside
      aria-label="Google Mars 3D controls"
      id="google-earth-mars-widget"
      className="absolute top-20 right-6 z-40 flex flex-col items-end space-y-3 pointer-events-auto select-none"
    >
      {/* 1. Google Earth Iconic 3D Floating Control Column */}
      <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] text-white">
        {/* 1.1 Compass Navigation Disc */}
        <button
          onClick={onResetNorth}
          title="Reset to True North (0°)"
          className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900/80 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-400/50 transition-all group"
        >
          {/* Rotating Compass Needle inside disc */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${-headingDeg}deg)` }}
          >
            {/* North red pointer */}
            <div className="absolute top-0.5 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[9px] border-b-red-500" />
            {/* South white pointer */}
            <div className="absolute bottom-0.5 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[9px] border-t-white/80" />
            <span className="text-[8px] font-mono font-bold text-red-400 group-hover:scale-110">N</span>
          </div>
        </button>

        <div className="w-7 h-px bg-white/10 my-1" />

        {/* 1.2 "3D" / "2D" Google Earth Tilt Toggle */}
        <button
          onClick={() => {
            if (viewMode === 'eva') onViewModeChange('drone');
            else if (viewMode === 'drone') onViewModeChange('satellite');
            else onViewModeChange('eva');
          }}
          title="Toggle 3D / 2D Tilt (Google Earth style)"
          className={`w-11 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
            viewMode !== 'eva'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10'
          }`}
        >
          3D
        </button>

        <div className="w-7 h-px bg-white/10 my-1" />

        {/* 1.3 Zoom In / Zoom Out */}
        <button
          onClick={onZoomIn}
          title="Zoom In (Decrease Eye Altitude)"
          className="w-11 h-9 rounded-xl flex items-center justify-center hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out (Increase Eye Altitude)"
          className="w-11 h-9 rounded-xl flex items-center justify-center hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-7 h-px bg-white/10 my-1" />

        {/* 1.4 Expand Google Earth Mars Studio Drawer */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title="Google Earth Mars 3D Controls"
          className={`w-11 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isExpanded
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Eye Altitude Badge (Like Google Earth's bottom right "Eye alt 1.75 m") */}
      <div className="px-3 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md border border-white/10 shadow-lg text-[10px] font-mono text-slate-300 flex items-center space-x-2">
        <span className="text-cyan-400 font-semibold">EYE ALT:</span>
        <span className="font-bold text-white">
          {altitudeMeters < 10 ? `${altitudeMeters.toFixed(1)} m` : `${Math.round(altitudeMeters)} m`}
        </span>
        <span className="text-white/40">·</span>
        <span className="text-amber-400 uppercase">{viewMode}</span>
      </div>

      {/* 3. Flyover Tour Button */}
      <button
        onClick={onToggleTour}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all text-xs font-mono ${
          isTourPlaying
            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
            : 'bg-slate-950/80 hover:bg-slate-900 border-white/15 text-slate-300 hover:text-white'
        }`}
      >
        {isTourPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-semibold">PAUSE 3D TOUR</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D FLYOVER TOUR</span>
          </>
        )}
      </button>

      {/* 4. Expanded Google Earth Mars Settings Panel */}
      {isExpanded && (
        <div className="w-80 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-fadeIn text-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <h2 className="text-xs font-mono font-bold tracking-wider text-cyan-300">
                GOOGLE MARS 3D VIEWER
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">HiRISE ORBITAL</span>
          </div>

          {/* 4.1 Perspective Modes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              3D Perspective Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {viewModes.map((vm) => (
                <button
                  key={vm.id}
                  onClick={() => onViewModeChange(vm.id)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    viewMode === vm.id
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/60 hover:bg-slate-800/70 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{vm.short}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{vm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4.2 Mars Dynamic Time of Sol (Lighting & Shadows) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Martian Sun & Shadows</span>
              </label>
              <span className="text-[10px] font-mono text-amber-300">
                SOL {solTimes.find((s) => s.id === timeOfSol)?.solHour}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {solTimes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => onTimeOfSolChange(st.id)}
                  className={`px-2 py-1.5 rounded-lg text-center border text-[10px] font-mono transition-all flex flex-col items-center justify-center ${
                    timeOfSol === st.id
                      ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 font-bold'
                      : 'bg-slate-900/60 hover:bg-slate-800 border-white/10 text-slate-400'
                  }`}
                >
                  <span>{st.icon}</span>
                  <span className="mt-0.5 leading-none truncate max-w-[70px]">{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4.3 Interactive Atmosphere & Surface Life Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Lively Martian Features
            </label>

            {/* Dust Devils */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/10">
              <div className="flex items-center space-x-2 text-xs">
                <Wind className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <div>
                  <div className="font-semibold text-slate-200">Swirling Dust Devils</div>
                  <div className="text-[9px] text-slate-400">Rotating vortexes on plains</div>
                </div>
              </div>
              <button
                onClick={onToggleDustDevils}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                  dustDevilsActive
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {dustDevilsActive ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Topographic Contour Grid */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/10">
              <div className="flex items-center space-x-2 text-xs">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="font-semibold text-slate-200">Google 3D Topo Grid</div>
                  <div className="text-[9px] text-slate-400">DEM contour isolines & elevation</div>
                </div>
              </div>
              <button
                onClick={onToggleTopoGrid}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                  showTopoGrid
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {showTopoGrid ? 'VISIBLE' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
