import React from 'react';
import {
  X,
  Wrench,
  Sun,
  Shield,
  Volume2,
  VolumeX,
  Wind,
  Radio,
  Flame,
  CheckCircle2,
  Download,
  FileArchive,
  Terminal,
  Layers,
} from 'lucide-react';
import { VisorTint } from '../types';
import { hudSound } from '../utils/soundEffects';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visorTint: VisorTint;
  onChangeVisorTint: (tint: VisorTint) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  visorTint,
  onChangeVisorTint,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-tools-view"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-3xl h-[85vh] rounded-3xl bg-slate-950/95 border border-cyan-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  EVA TOOLS & HELMET CONFIGURATION
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                  PLSS MARK VII
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Portable Life Support System · Optical Visor Coatings · Codebase Archive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Content Grid */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* 1. Project Download / Export Package */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-slate-950/90 border border-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
                    <span>COMPLETE PROJECT ARCHIVE (.ZIP)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                      v1.0.0 READY
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Full React 19 + TypeScript + Vite project with all assets & simulations
                  </p>
                </div>
              </div>

              <a
                href="/mars-astronaut-helmet-hud.zip"
                download="mars-astronaut-helmet-hud.zip"
                onClick={() => hudSound.playTargetLock()}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD ZIP (3.7 MB)</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-cyan-300 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>PACKAGED CONTENTS</span>
                </div>
                <div className="text-slate-300 font-medium">All Components & Textures</div>
                <div className="text-[11px] text-slate-400">HUD overlays, terrain, kinematics</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-emerald-300 flex items-center space-x-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>LOCAL EXECUTION</span>
                </div>
                <div className="font-mono text-slate-200 text-[11px]">npm install && npm run dev</div>
                <div className="text-[11px] text-slate-400">Vite 8 · Port 3000</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>STANDALONE READY</span>
                </div>
                <div className="text-slate-300 font-medium">Self-Contained Audio & Shaders</div>
                <div className="text-[11px] text-slate-400">Zero external runtime dependencies</div>
              </div>
            </div>
          </div>

          {/* 2. Visor Tint & Electrochromic Coating */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 uppercase">
              <Sun className="w-4 h-4" />
              <span>Visor Electrochromic Optical Filter</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  id: 'clear' as VisorTint,
                  label: 'Clear Neutral',
                  desc: 'High clarity anti-glare',
                  badge: 'Standard',
                },
                {
                  id: 'gold-polar' as VisorTint,
                  label: 'Gold Polarized',
                  desc: 'High UV & solar block',
                  badge: 'Dust / High Sun',
                },
                {
                  id: 'thermal-lidar' as VisorTint,
                  label: 'Thermal Lidar',
                  desc: 'Geological heat contrast',
                  badge: 'Spectrometry',
                },
                {
                  id: 'night-nv' as VisorTint,
                  label: 'Night / Infrared',
                  desc: 'Low light shadow boost',
                  badge: 'Craters / Dusk',
                },
              ].map((tint) => (
                <button
                  key={tint.id}
                  onClick={() => {
                    hudSound.playClick();
                    onChangeVisorTint(tint.id);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    visorTint === tint.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950/40 border-white/5 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                      {tint.badge}
                    </span>
                    <div className="font-bold text-xs mt-2">{tint.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {tint.desc}
                    </div>
                  </div>
                  {visorTint === tint.id && (
                    <div className="flex items-center space-x-1 text-cyan-400 text-[10px] font-mono mt-3 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Audio & Feedback Systems */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Audio Synthesizer & Helmet Comms Feedback</div>
                <div className="text-xs text-slate-400 font-mono">
                  Synthesizes subtle EVA boot step crunches, target lock chimes, and hazard warnings
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleSound();
                hudSound.playClick();
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                soundEnabled
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* 4. Life Support Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
                <Wind className="w-4 h-4" />
                <span>Visor Defogger & Vent Heater</span>
              </div>
              <p className="text-xs text-slate-300">
                Pulse heated dry nitrogen across inner visor glass to clear condensation.
              </p>
              <button
                onClick={() => {
                  hudSound.playClick();
                }}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono text-white transition-colors"
              >
                PULSE DEFOGGER (10s)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400">
                <Radio className="w-4 h-4" />
                <span>Emergency UHF Distress Beacon</span>
              </div>
              <p className="text-xs text-slate-300">
                Broadcast high-priority emergency telemetry to Habitat Alpha & MRO.
              </p>
              <button
                onClick={() => {
                  hudSound.playHazardAlert();
                }}
                className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-mono text-amber-300 transition-colors"
              >
                TEST DISTRESS BEACON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
