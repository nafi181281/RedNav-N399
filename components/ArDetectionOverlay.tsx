import React from 'react';
import {
  AlertTriangle,
  FlaskConical,
  Bot,
  Droplets,
  Users,
  ChevronRight,
  Info,
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
  onOpenInformation?: (obj: DetectedObject) => void;
}

export const ArDetectionOverlay: React.FC<ArDetectionOverlayProps> = ({
  objects,
  headingDeg,
  pitchDeg,
  selectedObjectId,
  onSelectObject,
  onSetNavigationTarget,
  onOpenInformation,
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

        // Is centered in reticle (within 7 degrees)?
        const isTargetLocked = Math.abs(azimuthDiff) < 6 && Math.abs(elevDiff) < 5;
        const isSelected = selectedObjectId === obj.id || isTargetLocked;

        const isHazard = obj.category === 'HAZARD';
        const isRover = obj.category === 'ROVER';
        const isWater = obj.category === 'RESOURCE';
        const isCrew = obj.category === 'CREW';

        // Subtle theme colors
        const accentColor = isHazard
          ? 'text-amber-400 border-amber-400/40'
          : isCrew
          ? 'text-emerald-400 border-emerald-400/40'
          : isWater
          ? 'text-cyan-300 border-cyan-400/40'
          : isRover
          ? 'text-sky-400 border-sky-400/40'
          : 'text-cyan-400 border-cyan-400/40';

        const dotBg = isHazard
          ? 'bg-amber-400'
          : isCrew
          ? 'bg-emerald-400'
          : isWater
          ? 'bg-cyan-300'
          : isRover
          ? 'bg-sky-400'
          : 'bg-cyan-400';

        const iconNode = isHazard ? (
          <AlertTriangle className="w-3 h-3 text-amber-400" />
        ) : isCrew ? (
          <Users className="w-3 h-3 text-emerald-400" />
        ) : isRover ? (
          <Bot className="w-3 h-3 text-sky-400" />
        ) : isWater ? (
          <Droplets className="w-3 h-3 text-cyan-300" />
        ) : (
          <FlaskConical className="w-3 h-3 text-cyan-400" />
        );

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
              if (onOpenInformation) {
                onOpenInformation(obj);
              }
            }}
          >
            {/* Minimalist, Low-Visibility Reticle Marker on Terrain */}
            <div className="relative flex flex-col items-center">
              {/* Corner Brackets Reticle: subtle, translucent (low visibility as requested) */}
              <div
                className={`relative w-6 h-6 flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'scale-110 opacity-90'
                    : 'scale-90 opacity-30 group-hover:opacity-85'
                }`}
              >
                {/* 4 delicate corner ticks */}
                <div
                  className={`absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l ${
                    isHazard ? 'border-amber-400' : isCrew ? 'border-emerald-400' : 'border-cyan-400'
                  }`}
                />
                <div
                  className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r ${
                    isHazard ? 'border-amber-400' : isCrew ? 'border-emerald-400' : 'border-cyan-400'
                  }`}
                />
                <div
                  className={`absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l ${
                    isHazard ? 'border-amber-400' : isCrew ? 'border-emerald-400' : 'border-cyan-400'
                  }`}
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r ${
                    isHazard ? 'border-amber-400' : isCrew ? 'border-emerald-400' : 'border-cyan-400'
                  }`}
                />

                {/* Center subtle dot */}
                <div
                  className={`w-1 h-1 rounded-full ${dotBg} ${
                    isSelected ? 'w-1.5 h-1.5 animate-ping' : 'opacity-60'
                  }`}
                />
              </div>

              {/* Sleek, Low-Visibility Translucent Pill Tag */}
              {/* Clean & compact: Doesn't obstruct Mars landscape! Rich specs are in side panel */}
              <div
                className={`mt-1 flex items-center space-x-1.5 px-2 py-0.5 rounded-full border transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-950/65 backdrop-blur-md border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] opacity-95 scale-105'
                    : 'bg-slate-950/30 backdrop-blur-xs border-white/10 text-white/70 opacity-35 group-hover:opacity-90 group-hover:bg-slate-950/50 scale-95'
                }`}
              >
                {/* Minimal Icon */}
                <span className="shrink-0">{iconNode}</span>

                {/* Concise Object Title */}
                <span className="text-[10px] font-mono font-bold tracking-tight text-white whitespace-nowrap">
                  {obj.title}
                </span>

                {/* Distance in meters */}
                <span className="text-[9px] font-mono font-semibold text-cyan-300/90 whitespace-nowrap">
                  {Math.round(obj.distanceMeters)}m
                </span>

                {/* Subtle side info hint indicator */}
                <span className="text-[8px] font-mono text-cyan-400/80 bg-cyan-950/50 px-1 py-0.2 rounded border border-cyan-500/20 group-hover:inline-block hidden">
                  INFO ↗
                </span>
              </div>

              {/* Red small downward triangle arrow for astronaut crew pointing to helmet */}
              {isCrew && (
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[7px] border-t-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.95)]" />
                </div>
              )}

              {/* Delicate thin anchor stem */}
              <div
                className={`w-px h-2 transition-opacity ${
                  isCrew
                    ? 'bg-red-500/70 opacity-90'
                    : isSelected
                    ? 'bg-cyan-400/50 opacity-80'
                    : 'bg-white/15 opacity-25'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
