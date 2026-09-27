import React, { useState } from 'react';
import { X, Scan, Activity, Radio, Cpu, RefreshCw } from 'lucide-react';
import { DetectedObject } from '../types';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  objects: DetectedObject[];
  onSelectTarget: (obj: DetectedObject) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  objects,
  onSelectTarget,
}) => {
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const triggerRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div
      id="modal-scan-view"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-4xl h-[80vh] rounded-3xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  LIDAR & MULTISPECTRAL AR SCANNER
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                  RIMFAX + SHERLOC SUITE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Laser Induced Breakdown Spectrometry · Subsurface Ground Radar
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={triggerRescan}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'PULSING...' : 'PULSE LIDAR'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="flex-1 p-6 grid grid-cols-3 gap-6 overflow-y-auto">
          {/* Left 2 Cols: Real-time scan matrix visualizer */}
          <div className="col-span-2 flex flex-col space-y-4">
            {/* Lidar Point Cloud Stage */}
            <div className="relative h-64 rounded-2xl bg-slate-900/50 border border-cyan-400/30 overflow-hidden flex items-center justify-center p-4">
              {/* Scanline sweep */}
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,1)] z-20"
                style={{
                  animation: 'scanline 2.5s ease-in-out infinite',
                }}
              />

              {/* Point cloud graphic */}
              <svg className="w-full h-full" viewBox="0 0 500 200">
                {/* Ground grid lines */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={40 + i * 18}
                    x2="480"
                    y2={40 + i * 18}
                    stroke="#06b6d4"
                    strokeWidth="0.5"
                    strokeDasharray="2 4"
                    opacity={0.3 + (i / 9) * 0.5}
                  />
                ))}

                {/* Detected target point clouds */}
                {/* Ancient rock formation */}
                <circle cx="160" cy="110" r="18" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" />
                <circle cx="160" cy="110" r="4" fill="#22d3ee" />
                <text x="160" y="85" fill="#22d3ee" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  ANCIENT ROCK (126m)
                </text>

                {/* Steep slope hazard */}
                <path d="M 80 150 L 130 175 L 100 190 Z" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1" />
                <text x="105" y="145" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  ⚠ STEEP SLOPE (84m)
                </text>

                {/* Water ice deposit */}
                <ellipse cx="380" cy="130" rx="35" ry="15" fill="rgba(103,232,249,0.2)" stroke="#67e8f9" strokeWidth="1" />
                <text x="380" y="105" fill="#67e8f9" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  ICE DEPOSIT (312m)
                </text>
              </svg>

              <div className="absolute bottom-2 left-3 font-mono text-[10px] text-cyan-400/80">
                POINT CLOUD DENSITY: 14,200 pts/m² · 532nm LASER
              </div>
            </div>

            {/* Subsurface Radar Cross-Section */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">SUBSURFACE GROUND PENETRATING RADAR (RIMFAX)</span>
                <span className="text-cyan-300">0.0m - 12.0m DEPTH</span>
              </div>

              <div className="h-20 w-full rounded-xl bg-slate-950/80 border border-cyan-500/20 p-2 flex items-end space-x-1">
                {/* Sounding radar return bars */}
                {[20, 35, 42, 68, 85, 92, 88, 70, 55, 40, 30, 25, 45, 60, 80, 65, 40, 30].map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                    <div
                      className={`w-full rounded-t-sm ${
                        h > 80 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-cyan-700/60'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/50">
                <span>0.0m (Regolith)</span>
                <span className="text-cyan-300 font-bold">★ High Dielectric Interface at 0.82m (Possible Ice)</span>
                <span>12.0m (Bedrock)</span>
              </div>
            </div>
          </div>

          {/* Right Col: Identified Spectral Targets List */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-white/70 tracking-wider uppercase">
              Identified Signatures ({objects.length})
            </div>

            {objects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => {
                  onSelectTarget(obj);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wide text-cyan-300">
                    {obj.categoryLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {Math.round(obj.distanceMeters)} m
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-1.5">
                  {obj.image && (
                    <img
                      src={obj.image}
                      alt={obj.title}
                      className="w-12 h-12 rounded-lg object-cover border border-cyan-400/30 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-cyan-200 truncate">
                      {obj.title}
                    </div>
                    <div className="text-xs text-slate-400 truncate">{obj.subtitle}</div>
                    {obj.nasaMission && (
                      <div className="text-[9px] text-cyan-300 font-mono font-semibold truncate mt-0.5">
                        {obj.nasaMission}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span>Lock Bearing: {obj.azimuthDeg}°</span>
                  <span className="text-cyan-400 group-hover:underline">Track &gt;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
