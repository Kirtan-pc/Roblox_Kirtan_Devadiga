import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Clock, Play, Pause, FileText } from 'lucide-react';
import { useTriageState } from '../store/triageStore';
import ForensicSpectrogramTrack from '../components/ForensicSpectrogramTrack';

const API_BASE = "http://localhost:8000";

export default function ForensicWorkbench() {
  const { activeCall, updateTriage } = useTriageState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeScrubTime, setActiveScrubTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    setActiveScrubTime(0);

    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("transcript", "");
    formData.append("caller_id", `FORENSIC-${file.name.slice(0, 14)}`);
    try {
      const res = await axios.post(`${API_BASE}/analyze-call`, formData);
      updateTriage(res.data);
    } catch (err) {
      setError("Failed to analyze forensic audio file. Ensure server is online.");
    }
    setLoading(false);
  };

  const handleScrubSeek = (timeSec) => {
    setActiveScrubTime(timeSec);
    if (audioRef.current) {
      audioRef.current.currentTime = timeSec;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const segments = activeCall.transcript_segments && activeCall.transcript_segments.length > 0
    ? activeCall.transcript_segments
    : [{ start: 0.0, end: activeCall.forensic_acoustics?.duration_sec || 6.0, text: activeCall.transcript }];

  return (
    <div className="flex flex-col w-full gap-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Forensic Acoustic Workbench</h1>
          <p className="text-xs text-slate-400 mt-1">Post-call forensic scrub, 3-second sliding window telemetry, and paralinguistic spectrograms</p>
        </div>
        <label className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 font-mono text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 transition">
          <Upload size={14} /> Upload Audio for Scrubbing
          <input type="file" accept=".wav,.webm,.mp3" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg font-mono">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-700 text-cyan-200 text-xs rounded-lg font-mono animate-pulse">
          ⚡ Running Wav2Vec 2.0 Acoustic SER &amp; Whisper ASR Engines...
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-slate-400">ACTIVE FORENSIC TARGET:</span>
            <h2 className="text-xl font-bold text-white font-mono mt-0.5">{activeCall.caller_id}</h2>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${
              activeCall.urgency_score >= 75 ? 'bg-red-600 text-white' :
              activeCall.urgency_score >= 45 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {activeCall.priority_tier}
            </span>
          </div>
        </div>

        {/* Forensic Spectrogram & Amplitude Track */}
        <div className="mb-6">
          <ForensicSpectrogramTrack
            telemetry={activeCall.forensic_acoustics}
            waveform={activeCall.waveform_track}
            activeTime={activeScrubTime}
            duration={activeCall.forensic_acoustics?.duration_sec || 6.0}
            onSeek={handleScrubSeek}
          />

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={(e) => setActiveScrubTime(e.target.currentTime)}
              onEnded={() => setIsPlayingAudio(false)}
              className="hidden"
            />
          )}
        </div>

        {/* Interactive Scrub Transcript Segments */}
        <div className="mb-6 bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>INTERACTIVE TIMESTAMPED TRANSCRIPT (Click to scrub waveform &amp; audio)</span>
            {audioUrl && (
              <button 
                onClick={toggleAudio}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
              >
                {isPlayingAudio ? <Pause size={13} /> : <Play size={13} />}
                {isPlayingAudio ? "Pause Audio" : "Play Recording"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {segments.map((seg, idx) => {
              const isActive = activeScrubTime >= seg.start && activeScrubTime <= seg.end;
              return (
                <div
                  key={idx}
                  onClick={() => handleScrubSeek(seg.start)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start gap-3 ${
                    isActive
                      ? 'bg-cyan-950/70 border-cyan-500 text-cyan-100 shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 shrink-0">
                    {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                  </span>
                  <p className="italic leading-relaxed flex-1">
                    "{seg.text}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Second Sliding Window Slices */}
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>3-SECOND SLIDING WINDOW TIMELINE SLICES (1s Stride Forensic Scrubbing)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(activeCall.sliding_window_timeline || []).map((w, idx) => {
              const isPeak = w.window === activeCall.peak_window_timestamp;
              return (
                <div key={idx} className={`p-3 rounded-lg border text-xs font-mono transition ${
                  isPeak 
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white">{w.window}</span>
                    {isPeak && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black uppercase">
                        PEAK
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Distress:</span>
                      <span className="text-slate-200">{Math.round((w.Distress || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fear:</span>
                      <span className="text-slate-200">{Math.round((w.Fear || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anger:</span>
                      <span className="text-slate-200">{Math.round((w.Anger || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nervousness:</span>
                      <span className="text-slate-200">{Math.round((w.Nervousness || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Triage Directives */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
          <div className="text-xs font-mono text-slate-400 mb-1">AUTOMATED TRIAGE DIRECTIVE</div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">{activeCall.triage_directive}</p>
        </div>
      </div>
    </div>
  );
}
