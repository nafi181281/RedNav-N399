import React from 'react';
import {
  ArrowUpRight,
  ArrowUp,
  ArrowUpLeft,
  MapPin,
  Clock,
  Navigation2,
  ChevronRight,
} from 'lucide-react';
import { NavigationRoute } from '../types';

interface TurnByTurnBannerProps {
  route: NavigationRoute;
  distanceRemaining: number;
  onOpenMap?: () => void;
}

export const TurnByTurnBanner: React.FC<TurnByTurnBannerProps> = ({
  route,
  distanceRemaining,
  onOpenMap,
}) => {
  const currentWp = route.waypoints[route.currentStepIndex] || route.waypoints[0];
  const nextWp = route.waypoints[route.currentStepIndex + 1];

  // Calculate dynamic ETA based on ~1.25 m/s EVA walking speed
  const secondsLeft = Math.max(30, Math.round(distanceRemaining / 1.25));
  const etaMinutes = Math.floor(secondsLeft / 60);
  const etaSeconds = secondsLeft % 60;

  const renderTurnIcon = (type: string) => {
    switch (type) {
      case 'slight-right':
        return <ArrowUpRight className="w-7 h-7 text-cyan-300 stroke-[2.5]" />;
      case 'slight-left':
        return <ArrowUpLeft className="w-7 h-7 text-cyan-300 stroke-[2.5]" />;
      case 'destination':
        return <MapPin className="w-7 h-7 text-emerald-400 stroke-[2.5]" />;
      default:
        return <ArrowUp className="w-7 h-7 text-cyan-300 stroke-[2.5]" />;
    }
  };

  const progressPercent = Math.min(
    100,
    Math.max(5, ((route.totalDistanceMeters - distanceRemaining) / route.totalDistanceMeters) * 100)
  );

  return (
    <div
      id="hud-turn-by-turn-banner"
      className="absolute top-20 left-8 z-30 flex flex-col pointer-events-auto select-none max-w-sm w-full"
    >
      {/* Apple-like Glass Route Guidance Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Subtle accent glow top border */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-300 to-transparent" />

        <div className="p-4">
          {/* Main active direction maneuver */}
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {renderTurnIcon(currentWp.turnType)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">
                  {Math.round(currentWp.distanceMeters)} m
                </span>
                <span className="text-xs font-mono font-medium text-cyan-300/80 tracking-wide uppercase">
                  {currentWp.turnType.replace('-', ' ')}
                </span>
              </div>

              <div className="text-sm font-medium text-slate-100 mt-0.5 leading-snug">
                {currentWp.instruction}
              </div>

              {/* Next step preview (Apple Maps style) */}
              {nextWp && (
                <div className="flex items-center space-x-1.5 mt-2.5 pt-2.5 border-t border-white/10 text-xs text-slate-400">
                  <span className="font-mono text-[10px] uppercase text-white/50">Then</span>
                  <span className="text-slate-300 truncate">{nextWp.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto text-slate-500 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Route progress line */}
          <div className="mt-3.5">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Footer ETA and distance summary */}
          <div className="flex items-center justify-between mt-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {etaMinutes}m {etaSeconds.toString().padStart(2, '0')}s
              </span>
            </div>

            <div className="flex items-center space-x-1 text-slate-200">
              <Navigation2 className="w-3 h-3 text-cyan-400" />
              <span className="font-bold">{Math.round(distanceRemaining)} m</span>
              <span className="text-slate-400">remaining</span>
            </div>

            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-sans text-cyan-200 transition-colors"
              >
                Route
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
