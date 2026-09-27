'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  HudMode,
  VisorTint,
  DetectedObject,
  NavigationRoute,
  EnvironmentTelemetry,
  GoogleEarthViewMode,
  TimeOfSol,
} from '../types';
import {
  INITIAL_DETECTED_OBJECTS,
  INITIAL_TELEMETRY,
  INITIAL_ROUTE,
} from '../data/marsData';
import { CompassTape } from './CompassTape';
import { EnvironmentTelemetryHud } from './EnvironmentTelemetryHud';
import { TurnByTurnBanner } from './TurnByTurnBanner';
import { ArGroundPath } from './ArGroundPath';
import { ArDetectionOverlay } from './ArDetectionOverlay';
import { MiniMapRadar } from './MiniMapRadar';
import { BottomNavControls } from './BottomNavControls';
import { HelmetVisorOverlay } from './HelmetVisorOverlay';
import { Mars3dSurface } from './Mars3dSurface';
import { GoogleEarthWidget } from './GoogleEarthWidget';
import { MapModal } from './MapModal';
import { ScanModal } from './ScanModal';
import { CameraModal } from './CameraModal';
import { ToolsModal } from './ToolsModal';
import { hudSound } from '../utils/soundEffects';

export default function App() {
  // Navigation & HUD Modes (NAVIGATION is active mode by default)
  const [activeMode, setActiveMode] = useState<HudMode>('NAVIGATION');
  const [visorTint, setVisorTint] = useState<VisorTint>('clear');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Google Earth Mars 3D & Surface Life States
  const [viewMode, setViewMode] = useState<GoogleEarthViewMode>('eva');
  const [timeOfSol, setTimeOfSol] = useState<TimeOfSol>('noon');
  const [showTopoGrid, setShowTopoGrid] = useState<boolean>(false);
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [dustDevilsActive, setDustDevilsActive] = useState<boolean>(true);
  const [altitudeMeters, setAltitudeMeters] = useState<number>(1.75);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Astronaut Heading & Helmet Orientation
  // Default base heading looking towards the path is ~240° (WSW)
  const [baseHeading] = useState<number>(240);
  const [panOffset, setPanOffset] = useState<number>(0); // -50° to +50°
  const [pitchOffset, setPitchOffset] = useState<number>(0); // -16° to +16°
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startPan: number; startPitch: number }>({
    x: 0,
    y: 0,
    startPan: 0,
    startPitch: 0,
  });

  // Current effective heading
  const currentHeading = baseHeading + panOffset;

  // Active Route & Distance
  const [route, setRoute] = useState<NavigationRoute>(INITIAL_ROUTE);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(INITIAL_ROUTE.totalDistanceMeters);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [walkPace, setWalkPace] = useState<'normal' | 'fast'>('normal');
  const [stepPhase, setStepPhase] = useState<number>(0);
  const [walkDistance, setWalkDistance] = useState<number>(0);
  const [walkBob, setWalkBob] = useState<number>(0);

  // Objects & Target Detection
  // The shared object model also includes CREW, while the HUD's DetectedObject
  // category excludes it. Keep the richer source data and narrow it at the
  // state boundary to the categories this HUD supports.
  const [objects, setObjects] = useState<DetectedObject[]>(() =>
    INITIAL_DETECTED_OBJECTS.filter(
      (obj): obj is DetectedObject => obj.category !== 'CREW',
    ),
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Telemetry
  const [telemetry, setTelemetry] = useState<EnvironmentTelemetry>(INITIAL_TELEMETRY);

  // High-Precision Walking Gait Animation Loop (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let currentPhase = stepPhase;
    let lastFootstrike = 0; // 1 = left heel strike, 2 = right heel strike

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp delta
      lastTime = now;

      if (isWalking) {
        // Mars EVA Exploration Speed:
        // normal stroll: ~1.25 m/s, fast stride: ~2.2 m/s
        const speed = walkPace === 'normal' ? 1.25 : 2.2;
        // Mars 0.38g gravity stride period: ~1.25s normal, ~0.95s fast
        const cycleDuration = walkPace === 'normal' ? 1.25 : 0.95;
        const phaseAdvance = ((2 * Math.PI) / cycleDuration) * dt;

        currentPhase = (currentPhase + phaseAdvance) % (2 * Math.PI);
        setStepPhase(currentPhase);

        // Advance traversed ground distance
        setWalkDistance((d) => d + speed * dt);
        setDistanceRemaining((prev) => Math.max(0, prev - speed * dt));

        // Walking head-bob & slight lateral sway (Martian 0.38g lofted cadence)
        const bob = Math.sin(currentPhase * 2) * 3.2;
        setWalkBob(bob);

        // Sound effect triggers on exact heel strikes
        // Left heel strike around phase 1.2
        if (currentPhase >= 1.0 && currentPhase < 1.8 && lastFootstrike !== 1) {
          lastFootstrike = 1;
          if (soundEnabled) {
            hudSound.playFootstep('left');
            hudSound.playSuitMovement();
          }
        }
        // Right heel strike around phase 4.2
        else if (currentPhase >= 4.0 && currentPhase < 4.8 && lastFootstrike !== 2) {
          lastFootstrike = 2;
          if (soundEnabled) {
            hudSound.playFootstep('right');
            hudSound.playSuitMovement();
          }
        } else if (
          (currentPhase < 0.8 || (currentPhase > 2.2 && currentPhase < 3.8)) &&
          lastFootstrike !== 0
        ) {
          lastFootstrike = 0; // Reset footstrike trigger zone
        }
      } else {
        setWalkBob(0);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isWalking, walkPace, soundEnabled]);

  // Periodic Telemetry Update during EVA
  useEffect(() => {
    if (!isWalking) return;
    const telemetryInterval = setInterval(() => {
      setTelemetry((t) => ({
        ...t,
        oxygenPercent: Math.max(50, +(t.oxygenPercent - 0.01).toFixed(1)),
        suitEnergyPercent: Math.max(40, +(t.suitEnergyPercent - 0.02).toFixed(1)),
        missionElapsedSeconds: t.missionElapsedSeconds + 1,
      }));
    }, 1500);

    return () => clearInterval(telemetryInterval);
  }, [isWalking]);

  // Mouse / Touch Drag to Pan Helmet Visor
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking background or non-interactive overlay
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPan: panOffset,
      startPitch: pitchOffset,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Scale mouse movement to degrees
    const newPan = Math.max(-50, Math.min(50, dragStartRef.current.startPan + deltaX * 0.12));
    const newPitch = Math.max(-16, Math.min(16, dragStartRef.current.startPitch - deltaY * 0.1));

    setPanOffset(newPan);
    setPitchOffset(newPitch);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPanOffset((p) => Math.max(-50, p - 3));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPanOffset((p) => Math.min(50, p + 3));
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setPitchOffset((p) => Math.min(16, p + 2));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setPitchOffset((p) => Math.max(-16, p - 2));
      } else if (e.key === ' ') {
        // Spacebar toggles walking
        setIsWalking((w) => !w);
      } else if (e.key === 'Escape') {
        setActiveMode('NAVIGATION');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set Navigation Target to any detected object
  const handleSetNavigationTarget = (obj: DetectedObject) => {
    setSelectedObjectId(obj.id);
    setRoute((prev) => ({
      ...prev,
      destinationName: obj.title,
      destinationType: obj.categoryLabel,
      totalDistanceMeters: obj.distanceMeters,
      currentDistanceRemaining: obj.distanceMeters,
      waypoints: [
        {
          id: 'wp-new-1',
          name: `${obj.title} Approach`,
          distanceMeters: Math.round(obj.distanceMeters * 0.5),
          instruction: `Head bearing ${obj.azimuthDeg}° directly toward ${obj.title}`,
          turnType: 'straight',
          bearing: obj.azimuthDeg,
          completed: false,
        },
        {
          id: 'wp-new-2',
          name: obj.title,
          distanceMeters: Math.round(obj.distanceMeters),
          instruction: `Arrive at target zone: ${obj.title}`,
          turnType: 'destination',
          bearing: obj.azimuthDeg,
          completed: false,
        },
      ],
    }));
    setDistanceRemaining(obj.distanceMeters);
    setActiveMode('NAVIGATION');
    hudSound.playTargetLock();
  };

  // Google Earth zoom & navigation handlers
  const handleZoomIn = () => {
    setZoomLevel((z) => Math.max(0.4, +(z * 0.85).toFixed(2)));
    hudSound.playClick();
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.min(2.8, +(z * 1.15).toFixed(2)));
    hudSound.playClick();
  };

  const handleResetNorth = () => {
    setPanOffset(-baseHeading); // Snaps currentHeading to 0° (North)
    setPitchOffset(0);
    hudSound.playClick();
  };

  const handleToggleTour = () => {
    const next = !isTourPlaying;
    setIsTourPlaying(next);
    if (next) {
      setViewMode('flyover');
    } else {
      setViewMode('eva');
    }
    hudSound.playClick();
  };

  // Ambient Martian wind management
  useEffect(() => {
    if (soundEnabled) {
      hudSound.startMartianWind();
    } else {
      hudSound.stopMartianWind();
    }
    return () => {
      hudSound.stopMartianWind();
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (isWalking && soundEnabled) {
      hudSound.triggerWindGust();
    }
  }, [isWalking, soundEnabled]);

  // Reset View to center
  const handleResetView = () => {
    setPanOffset(0);
    setPitchOffset(0);
    setViewMode('eva');
    setIsTourPlaying(false);
  };

  // Dynamic Martian GPS Coordinates advancing continuously as astronaut walks forward across Mars
  const latSec = (42.1 + walkDistance * 0.038).toFixed(1);
  const lngSec = (15.4 + walkDistance * 0.046).toFixed(1);
  const currentElevationVal = Math.round(-2548 + walkDistance * 0.08);

  const currentCoordinates = {
    lat: `18°23'${latSec}"N`,
    lng: `77°28'${lngSec}"E`,
    elevation: `${currentElevationVal.toLocaleString()} m`,
  };

  // Dynamic route with live waypoint distances and active step advancement
  const activeStepIndex = walkDistance < 180 ? 0 : walkDistance < 420 ? 1 : 2;
  const dynamicRoute: NavigationRoute = {
    ...route,
    currentStepIndex: activeStepIndex,
    waypoints: route.waypoints.map((wp, idx) => {
      let wpDist = wp.distanceMeters;
      if (idx === 0) wpDist = Math.max(0, 180 - walkDistance);
      else if (idx === 1) wpDist = Math.max(0, 420 - walkDistance);
      else if (idx === 2) wpDist = Math.max(0, 640 - walkDistance);
      return {
        ...wp,
        distanceMeters: wpDist,
      };
    }),
  };

  // Dynamic detected objects with decreasing distance as you approach them
  const dynamicObjects: DetectedObject[] = objects.map((obj) => {
    const initialDist =
      INITIAL_DETECTED_OBJECTS.find((o) => o.id === obj.id)?.distanceMeters ?? obj.distanceMeters;
    const curDist = Math.max(10, Math.round(initialDist - walkDistance * 0.55));
    return {
      ...obj,
      distanceMeters: curDist,
    };
  });

  return (
    <div
      id="mars-eva-hud-container"
      className="relative w-screen h-screen overflow-hidden bg-black select-none cursor-grab active:cursor-grabbing font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 1. Real 3D WebGL Martian Surface & Atmospheric World (Three.js) */}
      <Mars3dSurface
        isWalking={isWalking}
        walkDistance={walkDistance}
        stepPhase={stepPhase}
        pitchOffset={pitchOffset}
        panOffset={panOffset}
        headingDeg={currentHeading}
        visorTint={visorTint}
        viewMode={viewMode}
        timeOfSol={timeOfSol}
        showTopoGrid={showTopoGrid}
        isTourPlaying={isTourPlaying}
        dustDevilsActive={dustDevilsActive}
        onAltitudeChange={(alt) => setAltitudeMeters(alt)}
        zoomLevel={zoomLevel}
      />

      {/* 1.1 Google Mars 3D Navigation Controls Widget (Google Earth style) */}
      <GoogleEarthWidget
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          if (mode === 'flyover') setIsTourPlaying(true);
          else setIsTourPlaying(false);
          hudSound.playClick();
        }}
        timeOfSol={timeOfSol}
        onTimeOfSolChange={(time) => {
          setTimeOfSol(time);
          hudSound.playClick();
        }}
        showTopoGrid={showTopoGrid}
        onToggleTopoGrid={() => {
          setShowTopoGrid(!showTopoGrid);
          hudSound.playClick();
        }}
        isTourPlaying={isTourPlaying}
        onToggleTour={handleToggleTour}
        headingDeg={currentHeading}
        onResetNorth={handleResetNorth}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        altitudeMeters={altitudeMeters}
        dustDevilsActive={dustDevilsActive}
        onToggleDustDevils={() => {
          setDustDevilsActive(!dustDevilsActive);
          hudSound.playClick();
        }}
      />

      {/* 2. AR Ground Projected Route & Direction Chevrons */}
      {/* Shown naturally on the Martian surface when in NAVIGATION mode */}
      {activeMode === 'NAVIGATION' && (
        <ArGroundPath
          route={dynamicRoute}
          distanceRemaining={distanceRemaining}
          panOffset={panOffset}
          pitchOffset={pitchOffset}
          isWalking={isWalking}
          walkDistance={walkDistance}
        />
      )}

      {/* 4. Smart AR Object Detections (Identifies science targets, hazards, rovers, water ice) */}
      <ArDetectionOverlay
        objects={dynamicObjects}
        headingDeg={currentHeading}
        pitchDeg={pitchOffset}
        selectedObjectId={selectedObjectId}
        onSelectObject={(obj) => setSelectedObjectId(obj.id)}
        onSetNavigationTarget={handleSetNavigationTarget}
      />

      {/* 5. Precision Top Visor Tape Compass (Fixed to Helmet Visor) with Live GPS Coordinates */}
      <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
        <CompassTape
          headingDeg={currentHeading}
          targetBearingDeg={248}
          destinationName={route.destinationName}
          coordinates={currentCoordinates}
        />
      </div>

      {/* 6. Apple Maps Inspired Turn-by-Turn Navigation Banner (Fixed to Helmet Visor) */}
      {activeMode === 'NAVIGATION' && (
        <TurnByTurnBanner
          route={dynamicRoute}
          distanceRemaining={distanceRemaining}
          onOpenMap={() => setActiveMode('MAP')}
        />
      )}

      {/* 7. Environment Telemetry Floating HUD (Fixed to Helmet Visor) */}
      <EnvironmentTelemetryHud telemetry={telemetry} />

      {/* 8. Small Transparent Mini-Map Radar with Live Walking Traversal */}
      <MiniMapRadar
        headingDeg={currentHeading}
        route={dynamicRoute}
        objects={dynamicObjects}
        distanceRemaining={distanceRemaining}
        walkDistance={walkDistance}
        isWalking={isWalking}
        onExpandMap={() => setActiveMode('MAP')}
        onSelectObject={(obj) => setSelectedObjectId(obj.id)}
      />

      {/* 9. Interactive Look-Around & Traversal Hint Banner */}
      <div className="absolute bottom-20 left-8 z-30 pointer-events-none">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-cyan-500/20 text-[11px] font-mono text-white/80 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${isWalking ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <span>
            {isWalking
              ? `TRAVERSING JEZERO CRATER · +${Math.round(walkDistance)}m · ${viewMode.toUpperCase()} VIEW`
              : viewMode === 'eva'
              ? 'DRAG TO LOOK AROUND · SPACEBAR TO WALK · USE 3D WIDGET FOR GOOGLE MARS VIEWS'
              : `GOOGLE MARS 3D (${viewMode.toUpperCase()}) · DRAG TO ROTATE · SPACE TO WALK`}
          </span>
        </div>
      </div>

      {/* 10. Realistic Physical Helmet Visor Overlay (Curvature, reflections, reticle, breathing condensation) */}
      <HelmetVisorOverlay
        tint={visorTint}
        panOffset={panOffset}
        pitchOffset={pitchOffset}
        isWalking={isWalking}
        viewMode={viewMode}
      />

      {/* 13. Bottom Navigation Controls (MAP, SCAN, NAVIGATION, CAMERA, TOOLS, WALK PACE) */}
      <BottomNavControls
        activeMode={activeMode}
        onModeChange={(mode) => setActiveMode(mode)}
        isWalking={isWalking}
        onToggleWalking={() => setIsWalking(!isWalking)}
        onResetView={handleResetView}
        walkPace={walkPace}
        onTogglePace={() => setWalkPace((p) => (p === 'normal' ? 'fast' : 'normal'))}
        viewMode={viewMode}
        onToggle3dView={() => {
          if (viewMode === 'eva') setViewMode('astronaut');
          else if (viewMode === 'astronaut') setViewMode('drone');
          else if (viewMode === 'drone') setViewMode('satellite');
          else setViewMode('eva');
        }}
      />

      {/* 11. Modal Views for Secondary Modes */}
      {/* MAP Mode Modal with Live Mars Traversal */}
      <MapModal
        isOpen={activeMode === 'MAP'}
        onClose={() => setActiveMode('NAVIGATION')}
        route={dynamicRoute}
        objects={dynamicObjects}
        walkDistance={walkDistance}
        distanceRemaining={distanceRemaining}
        isWalking={isWalking}
        coordinates={currentCoordinates}
        onSelectDestination={(dest) => {
          handleSetNavigationTarget(dest);
          setActiveMode('NAVIGATION');
        }}
      />

      {/* SCAN Mode Modal */}
      <ScanModal
        isOpen={activeMode === 'SCAN'}
        onClose={() => setActiveMode('NAVIGATION')}
        objects={objects}
        onSelectTarget={(target) => {
          handleSetNavigationTarget(target);
          setActiveMode('NAVIGATION');
        }}
      />

      {/* CAMERA Mode Modal */}
      <CameraModal
        isOpen={activeMode === 'CAMERA'}
        onClose={() => setActiveMode('NAVIGATION')}
        headingDeg={currentHeading}
      />

      {/* TOOLS Mode Modal */}
      <ToolsModal
        isOpen={activeMode === 'TOOLS'}
        onClose={() => setActiveMode('NAVIGATION')}
        visorTint={visorTint}
        onChangeVisorTint={(tint) => setVisorTint(tint)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          hudSound.enabled = next;
        }}
      />
    </div>
  );
}
