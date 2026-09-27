import React from 'react';
import {
  Map,
  Scan,
  Navigation,
  Camera,
  Wrench,
  Footprints,
  RotateCcw,
  Download,
  Globe,
} from 'lucide-react';
import { HudMode, GoogleEarthViewMode } from '../types';
import { hudSound } from '../utils/soundEffects';

interface BottomNavControlsProps {
  activeMode: HudMode;
  onModeChange: (mode: HudMode) => void;
  isWalking: boolean;
  onToggleWalking: () => void;
  onResetView: () => void;
  walkPace?: 'normal' | 'fast';
  onTogglePace?: () => void;
  viewMode?: GoogleEarthViewMode;
  onToggle3dView?: () => void;
}

export const BottomNavControls: React.FC<BottomNavControlsProps> = ({
  activeMode,
  onModeChange,
  isWalking,
  onToggleWalking,
  onResetView,
  walkPace = 'normal',
  onTogglePace,
  viewMode = 'eva',
  onToggle3dView,
}) => {
  const navItems: { mode: HudMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'MAP', label: 'MAP', icon: <Map className="w-4 h-4" /> },
    { mode: 'SCAN', label: 'SCAN', icon: <Scan className="w-4 h-4" /> },
    {
      mode: 'NAVIGATION',
      label: 'NAVIGATION',
      icon: <Navigation className="w-4 h-4" />,
    },
    { mode: 'CAMERA', label: 'CAMERA', icon: <Camera className="w-4 h-4" /> },
    { mode: 'TOOLS', label: 'TOOLS', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <div
      id="hud-bottom-navigation-dock"
      className="absolute bottom-5 inset-x-0 z-40 flex items-center justify-center pointer-events-auto select-none px-4"
    >
      <div className="flex items-center space-x-3">
        {/* Reset View Button */}
        <button
          onClick={() => {
            hudSound.playClick();
            onResetView();
          }}
          className="p-2.5 rounded-full bg-slate-950/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white transition-all shadow-lg active:scale-95"
          title="Center Helmet View (Reset Pan)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Google Mars 3D Toggle Quick Button */}
        {onToggle3dView && (
          <button
            onClick={() => {
              hudSound.playClick();
              onToggle3dView();
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-full backdrop-blur-xl border transition-all shadow-lg text-xs font-mono font-bold ${
              viewMode !== 'eva'
                ? 'bg-cyan-500/30 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'bg-slate-950/60 hover:bg-slate-900 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle Google Mars 3D Perspective (EVA / Drone / Satellite)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase text-[11px]">{viewMode === 'eva' ? '3D MARS' : viewMode}</span>
          </button>
        )}

        {/* Apple-like Glass Floating Dock */}
        <nav
          className="flex items-center p-1.5 rounded-full bg-slate-950/70 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          aria-label="Helmet HUD Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeMode === item.mode;
            return (
              <button
                key={item.mode}
                id={`nav-btn-${item.mode.toLowerCase()}`}
                onClick={() => {
                  hudSound.playClick();
                  onModeChange(item.mode);
                }}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-full font-mono text-xs font-semibold tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/25 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-300' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {/* Active cyan status pip */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,1)] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Walk / EVA Sim Toggle & Pace Selector */}
        <div className="flex items-center space-x-1 p-0.5 rounded-full bg-slate-950/60 backdrop-blur-xl border border-white/10">
          <button
            onClick={() => {
              hudSound.playClick();
              onToggleWalking();
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-full transition-all duration-200 shadow-lg active:scale-95 ${
              isWalking
                ? 'bg-emerald-500/30 border border-emerald-400/70 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle Forward EVA Walk Simulation (Spacebar)"
          >
            <Footprints className={`w-4 h-4 ${isWalking ? 'text-emerald-300 animate-bounce' : ''}`} />
            <span className="font-mono text-xs font-bold tracking-wider">
              {isWalking ? 'WALKING' : 'WALK'}
            </span>
          </button>

          {isWalking && onTogglePace && (
            <button
              onClick={() => {
                hudSound.playClick();
                onTogglePace();
              }}
              className="px-2.5 py-1.5 rounded-full font-mono text-[10px] font-bold text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/20 border border-cyan-400/30 transition-all mr-1"
              title="Toggle Walk Pace (1.2 m/s Stroll vs 2.2 m/s Stride)"
            >
              {walkPace === 'normal' ? '1.2 M/S' : '2.2 M/S'}
            </button>
          )}
        </div>

        {/* Quick Project Download Button */}
        <a
          href="/mars-astronaut-helmet-hud.zip"
          download="mars-astronaut-helmet-hud.zip"
          onClick={() => hudSound.playTargetLock()}
          className="p-2.5 rounded-full bg-slate-950/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shadow-lg active:scale-95 flex items-center justify-center group"
          title="Download Project ZIP File (3.7 MB)"
        >
          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </div>
  );
};
