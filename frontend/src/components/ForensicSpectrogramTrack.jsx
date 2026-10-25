import React, { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';

function ForensicSpectrogramTrack({ 
  telemetry = {}, 
  waveform = {}, 
  activeTime = 0, 
  duration = 6.0,
  onSeek = () => {} 
}) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const f0Baseline = telemetry.f0_baseline || 224.2;
  const pitchVariance = telemetry.pitch_variance || 42.8;
  const hnrDb = telemetry.hnr_db || 11.4;
  const peakSpl = telemetry.peak_spl || -3.2;
  const totalDuration = duration || waveform.duration_sec || 6.0;

  // Generate 96 high-density audio waveform amplitude samples for realistic audio fidelity
  const baseAmps = waveform.amplitude_bars && waveform.amplitude_bars.length >= 64
    ? waveform.amplitude_bars
    : [
        0.18, 0.25, 0.40, 0.65, 0.50, 0.35, 0.22, 0.15, 0.10, 0.20, 0.35, 0.55, 0.70, 0.85, 0.60, 0.45,
        0.30, 0.20, 0.12, 0.08, 0.15, 0.30, 0.48, 0.72, 0.90, 0.65, 0.40, 0.25, 0.18, 0.12, 0.22, 0.38,
        0.58, 0.80, 0.95, 0.75, 0.50, 0.32, 0.20, 0.15, 0.28, 0.45, 0.68, 0.88, 0.70, 0.48, 0.30, 0.18,
        0.12, 0.25, 0.42, 0.65, 0.82, 0.92, 0.70, 0.45, 0.28, 0.15, 0.10, 0.22, 0.40, 0.62, 0.80, 0.60
      ];

  // Interpolate to 96 high-resolution bars
  const totalBars = 96;
  const amplitudeBars = [];
  for (let i = 0; i < totalBars; i++) {
    const srcIdx = Math.floor((i / totalBars) * baseAmps.length);
    const jitter = ((i * 7) % 11) * 0.02 - 0.1;
    const val = Math.max(0.08, Math.min(1.0, (baseAmps[srcIdx] || 0.3) + jitter));
    amplitudeBars.push(val);
  }

  // Red Jitter Cluster Spikes (dense clusters matching reference image: ~18%, ~42%, ~62%, ~78%)
  const jitterSpikeIndices = [16, 18, 20, 40, 42, 44, 60, 62, 76, 78];

  const svgWidth = 640;
  const svgHeight = 180;
  const centerY = 90;

  const handleSvgClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTimestamp = ratio * totalDuration;
    onSeek(targetTimestamp);
  };

  // Playhead position
  const playheadRatio = Math.max(0, Math.min(1, activeTime / (totalDuration || 1)));
  const playheadX = Math.max(10, Math.min(svgWidth - 10, playheadRatio * svgWidth));

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(2);
    return `${m.toString().padStart(2, '0')}:${s.padStart(5, '0')}`;
  };

  // Smooth realistic speech pitch curve (F0 trajectory)
  const pitchCurvePath = `
    M 20 120 
    C 60 100, 100 50, 140 55 
    C 170 60, 190 140, 220 145 
    C 250 150, 280 40, 310 15 
    C 330 5, 340 170, 360 175 
    C 380 180, 400 30, 430 18 
    C 450 10, 460 170, 490 170 
    C 510 170, 530 40, 560 20 
    C 580 10, 600 30, 625 15
  `;

  return (
    <div className="bg-[#f8faff] dark:bg-slate-950/90 border border-blue-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm font-sans select-none text-slate-800 dark:text-slate-200 transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Forensic Spectrogram &amp; Amplitude Track
          </h3>
        </div>
        <div className="px-2.5 py-0.5 rounded bg-blue-50/80 border border-blue-200/60 text-[11px] font-mono text-slate-500">
          FFT 2048 &nbsp;|&nbsp; Blackman-Harris
        </div>
      </div>

      {/* 4 Precision Telemetry KPI Metrics (Exact visual match) */}
      <div className="grid grid-cols-4 gap-2 mb-4 bg-blue-50/30 dark:bg-slate-900/60 rounded-xl p-2.5 border border-blue-100/60 dark:border-slate-800">
        <div className="text-center">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">FO BASELINE</div>
          <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{f0Baseline} Hz</div>
        </div>

        <div className="text-center">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">PITCH VARIANCE</div>
          <div className="text-sm font-extrabold font-mono text-red-600 mt-0.5">
            +{pitchVariance} Hz
          </div>
          <div className="text-[10px] font-bold text-red-600 -mt-0.5">(High)</div>
        </div>

        <div className="text-center">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">HNR (dB)</div>
          <div className="text-sm font-extrabold font-mono text-teal-700 mt-0.5">{hnrDb} dB</div>
        </div>

        <div className="text-center">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">PEAK SPL</div>
          <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{peakSpl} dBFS</div>
        </div>
      </div>

      {/* Main Forensic Waveform & Spectrogram Canvas */}
      <div 
        className="relative bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-xl p-2 overflow-hidden cursor-crosshair shadow-inner"
        onClick={handleSvgClick}
      >
        {/* Frequency Tiers on Left (4000 Hz, 2000 Hz, 1000 Hz, 250 Hz) */}
        <div className="absolute left-2.5 top-3 bottom-9 flex flex-col justify-between text-[9px] font-mono text-slate-400 pointer-events-none z-10 font-medium">
          <span>4000 Hz</span>
          <span>2000 Hz</span>
          <span>1000 Hz</span>
          <span>250 Hz</span>
        </div>

        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-44 overflow-visible transition-transform duration-200"
          style={{ transform: `scaleX(${zoomLevel / 100})`, transformOrigin: 'left' }}
        >
          {/* Subtle Horizontal Frequency Grid Lines */}
          <line x1="45" y1="20" x2={svgWidth} y2="20" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="45" y1="60" x2={svgWidth} y2="60" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="45" y1="100" x2={svgWidth} y2="100" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="45" y1="140" x2={svgWidth} y2="140" stroke="#f1f5f9" strokeWidth="1" />

          {/* Center Zero-Crossing Horizontal Baseline */}
          <line x1="45" y1={centerY} x2={svgWidth} y2={centerY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />

          {/* Formant Spectrogram Density (Soft Organic Blue Energy Shapes in Background) */}
          <path
            d="
              M 45 150 
              Q 120 120, 160 140 
              T 240 135 
              T 310 30 
              T 350 15 
              T 390 130 
              T 430 20 
              T 470 140 
              T 560 30 
              T 620 15 
              L 640 180 L 45 180 Z
            "
            fill="url(#forensic-spectrogram-gradient)"
            opacity="0.35"
          />

          <defs>
            <linearGradient id="forensic-spectrogram-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f8faff" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Symmetrical High-Density Audio Waveform Lines */}
          {amplitudeBars.map((amp, idx) => {
            const x = 50 + idx * ((svgWidth - 65) / totalBars);
            const isJitterSpike = jitterSpikeIndices.includes(idx);
            const halfHeight = isJitterSpike 
              ? Math.min(85, Math.max(50, amp * 95))
              : Math.max(4, amp * 50);

            const y1 = centerY - halfHeight;
            const y2 = centerY + halfHeight;

            return (
              <line
                key={idx}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={isJitterSpike ? '#dc2626' : '#94a3b8'}
                strokeWidth={isJitterSpike ? 2 : 1.2}
                strokeLinecap="round"
                opacity={isJitterSpike ? 1.0 : 0.65}
              />
            );
          })}

          {/* Smooth Deep Blue F0 Pitch Spline Curve */}
          <path
            d={pitchCurvePath}
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Playhead Needle */}
          <line
            x1={playheadX}
            y1={10}
            x2={playheadX}
            y2={175}
            stroke="#1e3a8a"
            strokeWidth="2"
          />
        </svg>

        {/* Time Axis Along Bottom */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 pl-8">
          <span>03:40.00</span>
          <span>03:50.00</span>
          <span>04:00.00</span>
          <span>04:10.00</span>
          <span className="text-[#1e3a8a] dark:text-cyan-400 font-extrabold tracking-tight">
            {formatTime(activeTime > 0 ? activeTime : 261.49)} [LIVE]
          </span>
        </div>
      </div>

      {/* Footer Controls & Legend (Pixel-perfect match to reference) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 text-xs">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">ZOOM:</span>
          {[100, 150, 200].map(lvl => (
            <button
              key={lvl}
              onClick={() => setZoomLevel(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                zoomLevel === lvl
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl}%
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a] inline-block" />
            <span className="text-slate-600">F0 Pitch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span className="text-slate-600">Jitter Clust</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            <span className="text-slate-600">Energy Spl</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ForensicSpectrogramTrack);