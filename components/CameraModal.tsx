import React, { useState } from 'react';
import { X, Camera, Grid, Zap, Image as ImageIcon, Download } from 'lucide-react';
import { hudSound } from '../utils/soundEffects';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  headingDeg: number;
}

interface CapturedPhoto {
  id: string;
  timestamp: string;
  zoom: string;
  heading: number;
  url: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  headingDeg,
}) => {
  const [zoomLevel, setZoomLevel] = useState<'1x' | '3x' | '10x'>('1x');
  const [showGrid, setShowGrid] = useState(true);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([
    {
      id: 'photo-1',
      timestamp: 'SOL 142 14:18',
      zoom: '1x',
      heading: 240,
      url: '/src/assets/images/mars_surface_eva_1789933632776.jpg',
    },
    {
      id: 'photo-2',
      timestamp: 'SOL 142 14:26',
      zoom: '3x',
      heading: 268,
      url: '/src/assets/images/mars_jezero_crater_1789933658468.jpg',
    },
  ]);

  if (!isOpen) return null;

  const handleCapture = () => {
    hudSound.playClick();
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      timestamp: `SOL 142 14:32`,
      zoom: zoomLevel,
      heading: Math.round(headingDeg),
      url: '/src/assets/images/mars_surface_eva_1789933632776.jpg',
    };
    setPhotos([newPhoto, ...photos]);
  };

  return (
    <div
      id="modal-camera-view"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-5xl h-[85vh] rounded-3xl bg-slate-950/95 border border-cyan-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Flash overlay */}
        {flash && <div className="absolute inset-0 bg-white z-50 animate-fadeOut pointer-events-none" />}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  HELMET HIGH-RES OPTICAL CAMERA
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                  48 MP ZEISS SCIENTIFIC LENS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Multispectral Optical Viewfinder · RAW GeoTIFF Auto-Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-xl border transition-colors ${
                showGrid
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  : 'bg-white/10 border-transparent text-slate-400'
              }`}
              title="Toggle Composition Grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Main Frame */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
          {/* Live View Preview */}
          <div
            className="relative w-full h-full overflow-hidden flex items-center justify-center transition-transform duration-300"
            style={{
              transform:
                zoomLevel === '10x'
                  ? 'scale(2.2)'
                  : zoomLevel === '3x'
                  ? 'scale(1.4)'
                  : 'scale(1)',
            }}
          >
            <img
              src="/src/assets/images/mars_surface_eva_1789933632776.jpg"
              alt="Martian Viewfinder Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Grid lines */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>
          )}

          {/* Telemetry Stamp Watermark */}
          <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/10 font-mono text-[10px] text-cyan-200/90 space-y-0.5 pointer-events-none">
            <div className="font-bold text-white">NASA MARS EXPEDITION · EVA-01</div>
            <div>SOL 142 · UTC+M 14:32:08</div>
            <div>LAT 18°23'42.1"N · LNG 77°28'15.4"E · ELEV -2,548m</div>
            <div>HEADING {Math.round(headingDeg)}° WSW · ZOOM {zoomLevel}</div>
          </div>

          {/* Zoom Selector Bar */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2 p-1.5 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/10">
            {(['1x', '3x', '10x'] as const).map((z) => (
              <button
                key={z}
                onClick={() => {
                  hudSound.playClick();
                  setZoomLevel(z);
                }}
                className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all ${
                  zoomLevel === z
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Shutter Button */}
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center">
            <button
              onClick={handleCapture}
              className="p-1 rounded-full border-2 border-white bg-white/20 hover:bg-white/40 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.6)]"
              title="Take Helmet Photo"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-900" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Captured Photos Gallery Strip */}
        <div className="h-24 bg-slate-900/90 border-t border-white/10 px-6 flex items-center space-x-4 overflow-x-auto">
          <div className="flex items-center space-x-1 text-xs font-mono text-white/50 shrink-0">
            <ImageIcon className="w-4 h-4" />
            <span>SOL GALLERY ({photos.length})</span>
          </div>

          {photos.map((p) => (
            <div
              key={p.id}
              className="relative w-28 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0 group cursor-pointer"
            >
              <img
                src={p.url}
                alt="Captured Mars frame"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1">
                <span className="text-[9px] font-mono text-cyan-300 font-bold">
                  {p.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
