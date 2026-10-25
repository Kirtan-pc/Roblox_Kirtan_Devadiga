import { useState, useEffect } from 'react';

// Default initial state
export const initialActiveCall = {
  caller_id: 'STANDBY-1930',
  urgency_score: 12,
  priority_tier: 'SYSTEM READY',
  golden_hour_alert: false,
  emergency_escalation: false,
  matched_keywords: [],
  triage_directive: 'Select a live stream, upload a forensic recording, or trigger a Stage-1 Queue Simulation.',
  transcript: 'Waiting for incoming telephony audio stream...',
  transcript_segments: [
    { start: 0.0, end: 6.0, text: 'Waiting for incoming telephony audio stream...' }
  ],
  latency_ms: 0,
  peak_window_timestamp: '0.0s - 3.0s',
  emotions: { Distress: 0.05, Fear: 0.04, Anger: 0.02, Nervousness: 0.08 },
  sliding_window_timeline: [
    { window: '0.0s - 3.0s', Distress: 0.05, Fear: 0.04, Anger: 0.02, Nervousness: 0.08 }
  ],
  forensic_acoustics: {
    f0_baseline: 224.2,
    pitch_variance: 42.8,
    hnr_db: 11.4,
    peak_spl: -3.2,
    duration_sec: 6.0
  },
  waveform_track: {
    amplitude_bars: [0.15, 0.22, 0.35, 0.48, 0.62, 0.75, 0.85, 0.72, 0.58, 0.42, 0.35, 0.28, 0.24, 0.38, 0.72, 0.88, 0.92, 0.65, 0.45, 0.38, 0.42, 0.55, 0.68, 0.75, 0.62, 0.48, 0.35, 0.42, 0.78, 0.85, 0.68, 0.52, 0.42, 0.35, 0.28, 0.22, 0.28, 0.42, 0.58, 0.72, 0.82, 0.75, 0.58, 0.45, 0.38, 0.32, 0.25, 0.22, 0.28, 0.35, 0.42, 0.55, 0.68, 0.58, 0.42, 0.35, 0.28, 0.22, 0.18, 0.15, 0.18, 0.22, 0.18, 0.12],
    pitch_contour: [25, 28, 35, 45, 58, 70, 78, 72, 55, 42, 35, 28, 25, 38, 65, 82, 85, 60, 42, 35, 38, 48, 62, 70, 58, 45, 35, 40, 72, 80, 65, 48, 38, 32, 28, 25, 30, 42, 55, 68, 75, 68, 52, 40, 35, 30, 25, 22, 28, 35, 42, 52, 62, 55, 40, 32, 28, 22, 20, 18, 20, 22, 18, 15],
    stress_spikes: [14, 15, 16, 28, 29, 39, 40, 51, 52],
    duration_sec: 6.0
  }
};

export const initialQueue = [
  { id: 1, caller_id: '+91-98102-44120', urgency_score: 18, priority_tier: 'STANDARD QUEUE', summary: 'Portal status inquiry', time: '14:28:42', status: 'PENDING' },
  { id: 2, caller_id: '+91-91234-77410', urgency_score: 28, priority_tier: 'LOW: AGITATED NON-CRITICAL', summary: 'Broadband router complaint (Filtered)', time: '14:22:05', status: 'PENDING' }
];

let globalActiveCall = { ...initialActiveCall };
let globalQueue = [ ...initialQueue ];
const listeners = new Set();

function broadcast() {
  listeners.forEach(fn => fn({ activeCall: globalActiveCall, queue: globalQueue }));
}

export function setGlobalActiveCall(data) {
  globalActiveCall = {
    ...initialActiveCall,
    ...data,
    forensic_acoustics: {
      ...initialActiveCall.forensic_acoustics,
      ...(data.forensic_acoustics || {})
    },
    waveform_track: {
      ...initialActiveCall.waveform_track,
      ...(data.waveform_track || {})
    },
    transcript_segments: data.transcript_segments && data.transcript_segments.length > 0
      ? data.transcript_segments
      : [{ start: 0.0, end: data.forensic_acoustics?.duration_sec || 6.0, text: data.transcript || '' }]
  };

  const filtered = globalQueue.filter(item => item.caller_id !== data.caller_id);
  globalQueue = [
    ...filtered,
    {
      id: Date.now(),
      caller_id: data.caller_id,
      urgency_score: data.urgency_score,
      priority_tier: data.priority_tier,
      summary: data.transcript ? data.transcript.slice(0, 58) + '...' : 'Acoustic Triage Signal',
      time: new Date().toLocaleTimeString(),
      status: data.urgency_score >= 85 ? 'CRITICAL' : data.urgency_score >= 45 ? 'ELEVATED' : 'STANDARD'
    }
  ].sort((a, b) => b.urgency_score - a.urgency_score);
  broadcast();
}

export function useTriageState() {
  const [state, setState] = useState({ activeCall: globalActiveCall, queue: globalQueue });

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  return {
    activeCall: state.activeCall,
    queue: state.queue,
    updateTriage: setGlobalActiveCall
  };
}
