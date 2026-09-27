import React from 'react';
import { Compass, Navigation } from 'lucide-react';

interface CompassTapeProps {
  headingDeg: number; // Current heading (0-360)
  targetBearingDeg: number; // Bearing to destination
  destinationName: string;
  coordinates: {
    lat: string;
    lng: string;
    elevation: string;
  };
}

export const CompassTape: React.FC<CompassTapeProps> = ({
  headingDeg,
  targetBearingDeg,
  coordinates,
}) => {
  // Normalize angles to 0-360
  const normalizedHeading = ((headingDeg % 360) + 360) % 360;

  // Render tick marks for the compass tape (range from heading - 60 to heading + 60)
  const visibleTicks = [];
  const startTick = Math.floor((normalizedHeading - 45) / 5) * 5;
  const endTick = Math.ceil((normalizedHeading + 45) / 5) * 5;

  for (let deg = startTick; deg <= endTick; deg += 5) {
    const rawDeg = ((deg % 360) + 360) % 360;
    const offsetFromCenter = deg - normalizedHeading; // degrees from center

    let label = '';
    if (rawDeg === 0) label = 'N';
    else if (rawDeg === 45) label = 'NE';
    else if (rawDeg === 90) label = 'E';
    else if (rawDeg === 135) label = 'SE';
    else if (rawDeg === 180) label = 'S';
    else if (rawDeg === 225) label = 'SW';
    else if (rawDeg === 270) label = 'W';
    else if (rawDeg === 315) label = 'NW';
    else if (rawDeg % 15 === 0) label = `${rawDeg}°`;

    visibleTicks.push({
      deg: rawDeg,
      offset: offsetFromCenter,
      isMajor: rawDeg % 15 === 0,
      isCardinal: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].includes(label),
      label,
    });
  }

  // Calculate target destination bearing relative to center
  let bearingDiff = targetBearingDeg - normalizedHeading;
  while (bearingDiff > 180) bearingDiff -= 360;
  while (bearingDiff < -180) bearingDiff += 360;
  const showBearingPip = Math.abs(bearingDiff) <= 45;

  return (
    <div id="hud-top-compass" className="w-full flex flex-col items-center pointer-events-none select-none">
      {/* Top telemetry status bar */}
      <div className="flex items-center justify-between w-full max-w-4xl px-8 pt-2 text-[11px] font-mono tracking-wider text-cyan-200/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 font-medium">EVA-1 ACTIVE</span>
          </span>
          <span className="text-white/40">|</span>
          <span>SOL 142</span>
          <span className="text-white/40">|</span>
          <span>UTC+M 14:32:08</span>
        </div>

        <div className="flex items-center space-x-3">
          <span>LAT {coordinates.lat}</span>
          <span>LNG {coordinates.lng}</span>
          <span className="text-emerald-400/90 font-medium">ELEV {coordinates.elevation}</span>
        </div>
      </div>

      {/* Futuristic Compass Tape Header */}
      <div className="relative w-full max-w-xl h-14 mt-1 flex items-center justify-center overflow-hidden">
        {/* Subtle glass gradient backing with mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/30 to-transparent backdrop-blur-[2px] rounded-b-2xl border-b border-cyan-400/20" />

        {/* Center alignment reticle & current heading readout */}
        <div className="absolute top-0 z-20 flex flex-col items-center">
          <div className="flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-slate-900/80 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-100">
              {Math.round(normalizedHeading)}°
            </span>
            <span className="text-[10px] font-mono font-semibold text-cyan-400/80">
              {normalizedHeading >= 337.5 || normalizedHeading < 22.5
                ? 'N'
                : normalizedHeading < 67.5
                ? 'NE'
                : normalizedHeading < 112.5
                ? 'E'
                : normalizedHeading < 157.5
                ? 'SE'
                : normalizedHeading < 202.5
                ? 'S'
                : normalizedHeading < 247.5
                ? 'SW'
                : normalizedHeading < 292.5
                ? 'W'
                : 'NW'}
            </span>
          </div>
          {/* Arrow pointing down to tape */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-cyan-400 mt-0.5" />
        </div>

        {/* Moving Compass Ticks Container */}
        <div className="relative w-full h-8 flex items-center justify-center">
          {visibleTicks.map((tick, idx) => {
            // Screen position relative to center: 1 degree ≈ 6.2 pixels
            const xOffsetPx = tick.offset * 6.2;
            return (
              <div
                key={`${tick.deg}-${idx}`}
                className="absolute flex flex-col items-center transition-transform duration-75"
                style={{
                  transform: `translateX(${xOffsetPx}px)`,
                  opacity: Math.max(0, 1 - Math.abs(tick.offset) / 46),
                }}
              >
                <div
                  className={`w-px ${
                    tick.isCardinal
                      ? 'h-4 bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.8)]'
                      : tick.isMajor
                      ? 'h-2.5 bg-cyan-100/70'
                      : 'h-1.5 bg-cyan-400/40'
                  }`}
                />
                {tick.label && (
                  <span
                    className={`mt-1 font-mono text-[9px] tracking-tight leading-none ${
                      tick.isCardinal
                        ? 'text-cyan-200 font-bold'
                        : 'text-cyan-300/60 font-medium'
                    }`}
                  >
                    {tick.label}
                  </span>
                )}
              </div>
            );
          })}

          {/* Destination Bearing Indicator Pip on Compass Tape */}
          {showBearingPip && (
            <div
              className="absolute z-20 flex flex-col items-center pointer-events-none transition-transform duration-100"
              style={{
                transform: `translateX(${bearingDiff * 6.2}px)`,
              }}
            >
              <div className="p-0.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse">
                <Navigation className="w-2.5 h-2.5 text-slate-950 fill-slate-950 rotate-45" />
              </div>
              <span className="text-[8px] font-mono font-bold text-cyan-300 tracking-tighter mt-0.5 bg-slate-950/70 px-1 rounded">
                DEST
              </span>
            </div>
          )}
        </div>

        {/* Gradient fade on left and right edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950/90 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950/90 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
