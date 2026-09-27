import React from 'react';
import {
  AlertTriangle,
  FlaskConical,
  Bot,
  Droplets,
  Navigation,
  ChevronRight,
  Crosshair,
  Info,
  Users,
} from 'lucide-react';
import { DetectedObject } from '../types';
import { hudSound } from '../utils/soundEffects';

interface ArDetectionOverlayProps {
  objects: DetectedObject[];
  headingDeg: number;
  pitchDeg: number;
  selectedObjectId: string | null;
  onSelectObject: (obj: DetectedObject) => void;
  onSetNavigationTarget: (obj: DetectedObject) => void;
}

export const ArDetectionOverlay: React.FC<ArDetectionOverlayProps> = ({
  objects,
  headingDeg,
  pitchDeg,
  selectedObjectId,
  onSelectObject,
  onSetNavigationTarget,
}) => {
  // Normalize heading 0-360
  const normHeading = ((headingDeg % 360) + 360) % 360;

  return (
    <div id="hud-ar-detections" className="absolute inset-0 pointer-events-none select-none">
      {objects.map((obj) => {
        // Calculate relative azimuth angle to user's view
        let azimuthDiff = obj.azimuthDeg - normHeading;
        while (azimuthDiff > 180) azimuthDiff -= 360;
        while (azimuthDiff < -180) azimuthDiff += 360;

        // Field of view: ~70 degrees horizontally
        const isInFov = Math.abs(azimuthDiff) <= 38;
        if (!isInFov) return null;

        // Screen coordinates in percentage
        const screenX = 50 + (azimuthDiff / 38) * 44; // keep inside ~6% to 94%
        const elevDiff = obj.elevationDeg - pitchDeg;
        const screenY = 50 - (elevDiff / 25) * 35; // mapping elevation

        // Is centered in reticle (within 8 degrees)?
        const isTargetLocked = Math.abs(azimuthDiff) < 7 && Math.abs(elevDiff) < 6;
        const isSelected = selectedObjectId === obj.id || isTargetLocked;

        const isHazard = obj.category === 'HAZARD';
        const isRover = obj.category === 'ROVER';
        const isWater = obj.category === 'RESOURCE';
        const isScience = obj.category === 'SCIENCE';
        const isCrew = (obj.category as string) === 'CREW';

        // Styling based on category
        const borderGlow = isHazard
          ? 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
          : isCrew
          ? 'border-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
          : isWater
          ? 'border-cyan-300/80 shadow-[0_0_20px_rgba(103,232,249,0.5)]'
          : isRover
          ? 'border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
          : 'border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.4)]';

        const badgeBg = isHazard
          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
          : isCrew
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
          : isWater
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
          : isRover
          ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';

        return (
          <div
            key={obj.id}
            id={`ar-target-${obj.id}`}
            className="absolute transition-all duration-150 pointer-events-auto cursor-pointer group"
            style={{
              left: `${screenX}%`,
              top: `${screenY}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 40 : 25,
            }}
            onClick={() => {
              hudSound.playTargetLock();
              onSelectObject(obj);
            }}
          >
            {/* Reticle Target Marker on Terrain */}
            <div className="relative flex flex-col items-center">
              {/* Pulsing Brackets / Crosshair */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                {/* 4 corner brackets */}
                <div
                  className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${
                    isHazard ? 'border-amber-400' : 'border-cyan-400'
                  }`}
                />
                <div
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${
                    isHazard ? 'border-amber-400' : 'border-cyan-400'
                  }`}
                />
                <div
                  className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${
                    isHazard ? 'border-amber-400' : 'border-cyan-400'
                  }`}
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${
                    isHazard ? 'border-amber-400' : 'border-cyan-400'
                  }`}
                />

                {/* Center dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHazard ? 'bg-amber-400' : isCrew ? 'bg-emerald-400' : 'bg-cyan-400'
                  } ${isSelected ? 'animate-ping' : ''}`}
                />

                {isSelected && (
                  <Crosshair className="w-5 h-5 text-cyan-300 animate-spin-slow opacity-80" />
                )}
              </div>

              {/* Target Identification Pill Card */}
              <div
                className={`mt-2 flex flex-col items-center transition-all duration-200 ${
                  isSelected ? 'scale-105' : 'scale-95 opacity-90 group-hover:opacity-100'
                }`}
              >
                {/* Floating Glass Identification Pod */}
                <div
                  className={`flex flex-col p-2.5 rounded-xl bg-slate-950/75 backdrop-blur-md border ${borderGlow} min-w-[190px]`}
                >
                  {/* Category Header with user requested formatting */}
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10">
                    <div className="flex items-center space-x-1.5">
                      {isHazard ? (
                        <div className="flex items-center space-x-1 text-amber-400 font-mono text-[10px] font-bold tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                          <span>TERRAIN HAZARD</span>
                        </div>
                      ) : isCrew ? (
                        <div className="flex items-center space-x-1 text-emerald-300 font-mono text-[10px] font-bold tracking-wider">
                          <Users className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>EXPEDITION CREW</span>
                        </div>
                      ) : isRover ? (
                        <div className="flex items-center space-x-1 text-sky-300 font-mono text-[10px] font-bold tracking-wider">
                          <Bot className="w-3.5 h-3.5" />
                          <span>NEARBY ROVER</span>
                        </div>
                      ) : isWater ? (
                        <div className="flex items-center space-x-1 text-cyan-300 font-mono text-[10px] font-bold tracking-wider">
                          <Droplets className="w-3.5 h-3.5" />
                          <span>WATER / ICE</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-cyan-300 font-mono text-[10px] font-bold tracking-wider">
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>SCIENCE TARGET</span>
                        </div>
                      )}
                    </div>

                    <span className="font-mono text-xs font-bold text-white tracking-tight">
                      {Math.round(obj.distanceMeters)} m
                    </span>
                  </div>

                  {/* Object Title & Subtitle */}
                  <div className="text-left">
                    <div className="text-xs font-bold text-white tracking-tight">
                      {obj.title}
                    </div>
                    <div className="text-[10px] font-medium text-slate-300/80 leading-tight">
                      {obj.subtitle}
                    </div>
                  </div>

                  {/* Expanded Telemetry when clicked/locked */}
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5 text-[10px] font-mono animate-fadeIn">
                      {/* NASA Mission Photo Preview */}
                      {obj.image && (
                        <div className="relative rounded-lg overflow-hidden border border-cyan-400/40 shadow-inner my-1.5">
                          <img
                            src={obj.image}
                            alt={obj.title}
                            className="w-full h-24 object-cover filter contrast-105"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-1.5">
                            <span className="text-[9px] text-cyan-300 font-bold block truncate">
                              {obj.nasaMission || 'NASA MASTCAM OPTICAL ARCHIVE'}
                            </span>
                          </div>
                        </div>
                      )}

                      {obj.nasaMission && !obj.image && (
                        <div className="text-[9px] text-cyan-300/90 font-bold px-1 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20">
                          {obj.nasaMission}
                        </div>
                      )}

                      {obj.details.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300">
                          <span className="text-white/50">{d.label}:</span>
                          <span className="font-semibold text-cyan-100 truncate ml-1">
                            {d.value}
                          </span>
                        </div>
                      ))}

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hudSound.playClick();
                          onSetNavigationTarget(obj);
                        }}
                        className="w-full mt-2 py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[10px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-cyan-300" />
                        <span>Navigate to Target</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Stem Line anchoring tag to target position */}
                <div
                  className={`w-0.5 h-3 ${
                    isHazard ? 'bg-amber-400/60' : 'bg-cyan-400/60'
                  }`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
