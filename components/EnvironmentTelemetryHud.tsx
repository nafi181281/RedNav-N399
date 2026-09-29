import React from 'react';
import {
  Wind,
  BatteryCharging,
  ThermometerSnowflake,
  ShieldCheck,
  Radio,
  Activity,
  Users,
} from 'lucide-react';
import { EnvironmentTelemetry } from '../types';

interface EnvironmentTelemetryHudProps {
  telemetry: EnvironmentTelemetry;
  expanded?: boolean;
}

export const EnvironmentTelemetryHud: React.FC<EnvironmentTelemetryHudProps> = ({
  telemetry,
}) => {
  const squad = [
    { callsign: 'Dr. ATHER ISRAK', dist: 'Left 9.8m', o2: '96%', status: 'lead', color: 'text-sky-300' },
    { callsign: 'Dr. POLLOB KUMAR', dist: 'Right 11.2m', o2: '98%', status: 'nominal', color: 'text-emerald-300' },
    { callsign: 'Dr. JAMIUL ISLAM', dist: 'Flank 19.5m', o2: '94%', status: 'scout', color: 'text-amber-300' },
  ];

  return (
    <div
      id="hud-environment-telemetry"
      className="absolute top-20 right-8 z-30 flex flex-col space-y-2 pointer-events-auto select-none"
    >
      {/* Telemetry Capsule Header */}
      <div className="flex items-center justify-between px-3 py-1 rounded-t-xl bg-slate-950/50 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-white/60">
        <span className="flex items-center space-x-1.5">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-white/80">SUIT VITALS & ENV</span>
        </span>
        <span className="text-cyan-400/80 font-mono">NOMINAL</span>
      </div>

      {/* Subtle Floating HUD Elements Container */}
      <div className="flex flex-col space-y-1.5 p-2 rounded-b-xl bg-slate-950/40 backdrop-blur-lg border-x border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-60">
        {/* 1. Oxygen: 78% */}
        <div
          id="hud-vital-oxygen"
          className="group relative flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 border border-white/5 hover:border-cyan-400/30 transition-all duration-200"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
              <Wind className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/50 tracking-wider">OXYGEN</div>
              <div className="text-xs text-white/70 font-mono">{telemetry.suitPressurePsi} psi · O₂ flow</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono font-bold text-white tracking-tight">
              {telemetry.oxygenPercent}%
            </span>
            {/* Clean Apple-like progress bar */}
            <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                style={{ width: `${telemetry.oxygenPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Suit Energy: 65% */}
        <div
          id="hud-vital-energy"
          className="group relative flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 border border-white/5 hover:border-amber-400/30 transition-all duration-200"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-400/20">
              <BatteryCharging className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/50 tracking-wider">SUIT ENERGY</div>
              <div className="text-xs text-white/70 font-mono">{telemetry.powerDrawWatts} W · 4h 18m</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono font-bold text-white tracking-tight">
              {telemetry.suitEnergyPercent}%
            </span>
            <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                style={{ width: `${telemetry.suitEnergyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Temperature: -63°C */}
        <div
          id="hud-vital-temp"
          className="group relative flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 border border-white/5 hover:border-sky-400/30 transition-all duration-200"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-400/20">
              <ThermometerSnowflake className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/50 tracking-wider">TEMPERATURE</div>
              <div className="text-xs text-emerald-400/90 font-mono">Suit: +{telemetry.tempSuitC}°C</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono font-bold text-cyan-200 tracking-tight">
              {telemetry.tempExternalC}°C
            </span>
            <span className="text-[9px] font-mono text-white/40 tracking-wider">EXT SURFACE</span>
          </div>
        </div>

        {/* 4. Atmosphere: Normal */}
        <div
          id="hud-vital-atmosphere"
          className="group relative flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 border border-white/5 hover:border-emerald-400/30 transition-all duration-200"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/50 tracking-wider">ATMOSPHERE</div>
              <div className="text-xs text-white/70 font-mono">0.6 kPa CO₂ Ext</div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
              {telemetry.atmosphereStatus}
            </span>
          </div>
        </div>

        {/* 5. Communication: Good */}
        <div
          id="hud-vital-comms"
          className="group relative flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 border border-white/5 hover:border-cyan-400/30 transition-all duration-200"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
              <Radio className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/50 tracking-wider">COMMUNICATION</div>
              <div className="text-xs text-white/70 font-mono">MRO Relay · {telemetry.commPingMs}m</div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            {/* 4 signal bars */}
            <div className="flex items-end space-x-0.5 h-3">
              <span className="w-1 h-1.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-400 rounded-xs" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
              {telemetry.commsStatus}
            </span>
          </div>
        </div>

        {/* 6. Expedition Squad in Front (Ares-VI Crew Vitals) */}
        <div className="pt-1.5 mt-1 border-t border-white/10">
          <div className="flex items-center justify-between px-1 mb-1.5 text-[9px] font-mono tracking-wider text-white/50 uppercase">
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>ARES-VI SQUAD AHEAD</span>
            </span>
            <span className="text-emerald-400 font-bold">3 SYNCED</span>
          </div>

          <div className="flex flex-col space-y-1">
            {squad.map((member) => (
              <div
                key={member.callsign}
                className="flex items-center justify-between px-2 py-1 rounded-md bg-slate-900/50 border border-white/5 text-[10px] font-mono"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className={`font-semibold ${member.color}`}>{member.callsign}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60">
                  <span>+{member.dist}</span>
                  <span className="text-emerald-400/90 font-bold">{member.o2}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
