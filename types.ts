export type HudMode = 'MAP' | 'SCAN' | 'NAVIGATION' | 'CAMERA' | 'TOOLS';

export type VisorTint = 'clear' | 'gold-polar' | 'thermal-lidar' | 'night-nv';

export type GoogleEarthViewMode = 'eva' | 'astronaut' | 'drone' | 'satellite' | 'flyover';

export type TimeOfSol = 'morning' | 'noon' | 'golden' | 'blue-sunset' | 'night';

export type ObjectCategory = 'SCIENCE' | 'HAZARD' | 'ROVER' | 'RESOURCE' | 'BASE';

export interface DetectedObject {
  id: string;
  category: ObjectCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  distanceMeters: number;
  initialDistance: number;
  azimuthDeg: number; // heading in degrees (0 - 360)
  elevationDeg: number; // vertical angle (-20 to +20)
  image?: string;
  nasaMission?: string;
  details: {
    label: string;
    value: string;
  }[];
  hazardLevel?: 'low' | 'medium' | 'high';
  isLocked?: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  distanceMeters: number;
  instruction: string;
  turnType: 'straight' | 'slight-right' | 'slight-left' | 'sharp-right' | 'destination';
  bearing: number;
  completed: boolean;
}

export interface EnvironmentTelemetry {
  oxygenPercent: number;
  suitEnergyPercent: number;
  tempExternalC: number;
  tempSuitC: number;
  atmosphereStatus: 'Normal' | 'Trace O2' | 'Pressure Alert';
  commsStatus: 'Good' | 'Optimal' | 'MRO Relay Lag';
  suitPressurePsi: number;
  powerDrawWatts: number;
  commPingMs: number;
  co2Ppm: number;
  radiationUsv: number;
  missionElapsedSeconds: number;
}

export interface NavigationRoute {
  destinationName: string;
  destinationType: string;
  totalDistanceMeters: number;
  estimatedTimeSeconds: number;
  currentStepIndex: number;
  currentDistanceRemaining: number;
  waypoints: Waypoint[];
  targetCoordinates: {
    lat: string;
    lng: string;
    elevation: string;
  };
}
