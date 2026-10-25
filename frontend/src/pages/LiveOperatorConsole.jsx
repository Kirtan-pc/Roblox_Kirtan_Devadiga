import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, Mic, Square, Upload, PhoneIncoming, AlertTriangle, 
  Scale, Radio, Clock, Play, Pause, Activity, Languages, Sparkles
} from 'lucide-react';
import { useTriageState } from '../store/triageStore';
import ForensicSpectrogramTrack from '../components/ForensicSpectrogramTrack';

const API_BASE = "http://localhost:8000";

export default function LiveOperatorConsole() {
  const { activeCall, queue, updateTriage } = useTriageState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [activeScrubTime, setActiveScrubTime] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  const runPresetSimulation = async (scenarioId) => {
    setLoading(true);
    setErrorMessage("");
    setActiveScrubTime(0);
    setLiveTranscript("");
    transcriptRef.current = "";
    try {
      const formData = new FormData();
      formData.append("scenario_id", scenarioId);
      const res = await axios.post(`${API_BASE}/simulate-preset`, formData);
      updateTriage(res.data);
    } catch (err) {
      setErrorMessage("Backend error! Ensure uvicorn is running on port 8000.");
    }
    setLoading(false);
  };

  // Canonical Real-time Hinglish Web Speech Hook (Stream B)
  const startRealtimeTranscription = (onTranscriptUpdate) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; // Handles Hinglish / Indian accent mixing seamlessly
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (final || interim).trim();
        if (text) {
          onTranscriptUpdate(text);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Browser Web Speech error (will fallback to faster-whisper):", e.error);
      };

      recognition.start();
      return recognition;
    } catch (err) {
      console.warn("SpeechRecognition init exception:", err);
      return null;
    }
  };

  const startLiveCall = async () => {
    audioChunksRef.current = [];
    setErrorMessage("");
    setRecordDuration(0);
    setActiveScrubTime(0);
    setLiveTranscript("");
    transcriptRef.current = "";

    // 1. Initialize Live Real-time Hinglish Transcription
    const rec = startRealtimeTranscription((text) => {
      setLiveTranscript(text);
      transcriptRef.current = text;
    });
    recognitionRef.current = rec;

    // 2. Audio Capture for Wav2Vec2 SER & Fallback faster-whisper
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Visual VU Meter
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        stream.getTracks().forEach(t => t.stop());
        try { await audioCtx.close(); } catch (e) {}

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);

        if (blob.size === 0) {
          setErrorMessage("No audio samples captured from microphone.");
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "live_mic.webm");
        formData.append("transcript", transcriptRef.current || liveTranscript || "");
        formData.append("caller_id", "+91-LIVE-OPERATOR-MIC");

        setLoading(true);
        try {
          const res = await axios.post(`${API_BASE}/analyze-call`, formData);
          updateTriage(res.data);
        } catch (err) {
          setErrorMessage("Failed to analyze live call audio. Verify backend is running.");
        }
        setLoading(false);
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setErrorMessage("Microphone access denied: " + err.message);
    }
  };

  const stopLiveCallAndAnalyze = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setErrorMessage("");
    setActiveScrubTime(0);
    setLiveTranscript("");

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
      setErrorMessage("Error analyzing uploaded WAV file via faster-whisper.");
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

  const toggleAudioPlayback = () => {
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
    <div className="flex flex-col w-full text-slate-100">
      {/* Top Ingress Banner with ECHO Universal Name */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold uppercase">
                  ECHO // 1930 COMMAND CONSOLE
                </span>
                <span className="text-xs text-slate-400 font-mono">I4C / CFCFRMS TACTICAL DESK</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Dual-Stream Paralinguistic SER (Wav2Vec2) &amp; Dual-Tier Lexical Engine (Web Speech + Whisper)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400">
              BUFFER: 3s Window / 1s Stride
            </span>
            <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
              LATENCY: {activeCall.latency_ms || 0} ms
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg font-mono">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Golden Hour & Emergency Banner */}
      {activeCall.golden_hour_alert && (
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 p-4 bg-red-950/90 border-2 border-red-500 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <div className="text-sm font-black tracking-wider text-red-300 uppercase">
                  🚨 {activeCall.priority_tier}
                </div>
                <div className="text-xs text-red-100 mt-0.5">{activeCall.triage_directive}</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded shrink-0">RANK #1 FAST-TRACK</span>
          </div>

          {activeCall.emergency_escalation && (
            <div className="lg:col-span-4 p-4 bg-amber-950/90 border-2 border-amber-500 rounded-xl flex items-center gap-3">
              <Radio className="w-7 h-7 text-amber-400 shrink-0 animate-bounce" />
              <div className="text-xs">
                <div className="font-black text-amber-300 uppercase tracking-wider">
                  EMERGENCY ESCALATION PROTOCOL
                </div>
                <div className="text-amber-100 mt-0.5">
                  Score &ge; 85: Auto-flagged for immediate CFCFRMS bank freeze API &amp; Dial-112 emergency dispatch linkage.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Control Strip: 5 Presets + Live Mic & LIVE TRANSCRIPT BOX DIRECTLY BELOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center justify-between">
            <span>Stage-1 Automated IVR Queue Screener Simulation (5 Edge-Case Profiles)</span>
            {loading && <span className="text-cyan-400 animate-pulse">Running Neural Inference &amp; STT Triage...</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button onClick={() => runPresetSimulation("calm")} disabled={loading}
              className="p-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition active:scale-95">
              1. Calm Inquiry
            </button>
            <button onClick={() => runPresetSimulation("panic")} disabled={loading}
              className="p-2 text-xs font-semibold bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-200 rounded-lg transition active:scale-95">
              2. UPI Fraud Panic
            </button>
            <button onClick={() => runPresetSimulation("coercion")} disabled={loading}
              className="p-2 text-xs font-semibold bg-rose-950/90 hover:bg-rose-900 border border-rose-500 text-rose-200 rounded-lg transition active:scale-95">
              3. "Fake Calm" Arrest
            </button>
            <button onClick={() => runPresetSimulation("sextortion")} disabled={loading}
              className="p-2 text-xs font-semibold bg-purple-950/90 hover:bg-purple-900 border border-purple-500 text-purple-200 rounded-lg transition active:scale-95">
              4. Sextortion / Threat
            </button>
            <button onClick={() => runPresetSimulation("angry")} disabled={loading}
              className="p-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg transition active:scale-95">
              5. Angry False-Alarm
            </button>
          </div>
        </div>

        {/* Live Mic & File Upload + REAL-TIME TRANSCRIPT DIRECTLY BELOW */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex justify-between items-center text-xs font-mono uppercase text-slate-400 mb-2">
              <span>Live Mic &amp; Forensic Ingest</span>
              {isRecording && (
                <span className="text-red-400 font-bold animate-pulse flex items-center gap-1">
                  REC: {recordDuration}s | VU: {micVolume}%
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!isRecording ? (
                <button onClick={startLiveCall} disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-900/30">
                  <Mic className="w-4 h-4" /> Start Live Mic Call
                </button>
              ) : (
                <button onClick={stopLiveCallAndAnalyze} disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 animate-pulse">
                  <Square className="w-4 h-4" /> Stop &amp; Run Triage
                </button>
              )}
              <label className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                <Upload className="w-4 h-4 text-cyan-400" /> Upload WAV
                <input type="file" accept=".wav,.webm,.mp3" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* REQUIRED ITEM 3: LIVE TRANSCRIPT BOX DIRECTLY BELOW START LIVE MIC CALL & UPLOAD WAV */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-cyan-400'}`}></span>
                <span className="text-slate-300 font-bold uppercase">
                  {isRecording ? "STREAMING LIVE TRANSCRIPT (en-IN)" : "ACTIVE SPEECH BUFFER"}
                </span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {isRecording ? "LIVE" : "READY"}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-200 min-h-[44px] max-h-24 overflow-y-auto leading-relaxed italic bg-slate-900/50 p-2 rounded border border-slate-800/60">
              {isRecording ? (
                liveTranscript ? (
                  <span className="text-cyan-200 not-italic font-sans">"{liveTranscript}"</span>
                ) : (
                  <span className="text-slate-500">Listening to your voice in Hinglish / English (speak now)...</span>
                )
              ) : (
                <span className="text-slate-400">
                  {liveTranscript ? `"${liveTranscript}"` : activeCall.transcript ? `"${activeCall.transcript.slice(0, 90)}..."` : "Press 'Start Live Mic Call' to begin live speech recognition."}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tactical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Telemetry + Waveform + Interactive Scrub Transcript */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-mono text-slate-400">
                  ACTIVE STREAM (PEAK WINDOW: {activeCall.peak_window_timestamp || '0.0s - 3.0s'})
                </span>
                <h2 className="text-2xl font-bold text-white mt-0.5">{activeCall.caller_id}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold ${
                  activeCall.urgency_score >= 75 ? 'bg-red-600 text-white' :
                  activeCall.urgency_score >= 45 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {activeCall.priority_tier}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-6xl font-black font-mono ${
                  activeCall.urgency_score >= 75 ? 'text-red-500' :
                  activeCall.urgency_score >= 45 ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {activeCall.urgency_score}
                </div>
                <div className="text-[11px] font-mono text-slate-400">URGENCY INDEX (0-100)</div>
              </div>
            </div>

            {/* 4 Required Emotion Bars */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-mono uppercase text-slate-400">
                Acoustic Paralinguistic Emotions (Wav2Vec2 Neural Network Predictions)
              </div>
              {Object.entries(activeCall.emotions || {}).map(([emotion, score]) => (
                <div key={emotion}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{emotion}</span>
                    <span className="font-mono text-cyan-400">{Math.round(score * 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        score >= 0.6 ? 'bg-red-500' : score >= 0.35 ? 'bg-amber-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round(score * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Forensic Spectrogram & Amplitude Track (Exact Match to Blueprint Specification) */}
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

            {/* Cumulative Lexical Stream Transcript & Timestamped Segments */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 mb-2.5 pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-cyan-400" />
                  <span>LEXICAL BUFFER: {activeCall.stt_source || "Browser Web Speech API (en-IN) [Primary]"}</span>
                </div>
                {audioUrl && (
                  <button 
                    onClick={toggleAudioPlayback}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    {isPlayingAudio ? <Pause size={13} /> : <Play size={13} />}
                    {isPlayingAudio ? "Pause Audio" : "Play Recording"}
                  </button>
                )}
              </div>

              {/* Timestamped Segment List */}
              <div className="space-y-2 mb-3">
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

              {/* Matched Threat Entities */}
              <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap gap-2">
                {activeCall.matched_keywords && activeCall.matched_keywords.length > 0 ? (
                  activeCall.matched_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-red-950 border border-red-600 text-red-300 text-xs font-mono rounded">
                      THREAT ENTITY: {kw.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-slate-500">No high-risk lexical threat entities triggered.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Priority Queue + Ethical AI Box */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PhoneIncoming className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">1930 Dynamic Priority Queue</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Auto-Sorted by Urgency</span>
            </div>

            <div className="space-y-3">
              {queue.map((item, idx) => (
                <div key={item.id}
                  className={`p-3.5 rounded-lg border flex items-center justify-between transition ${
                    item.urgency_score >= 75
                      ? 'bg-red-950/40 border-red-500/80'
                      : 'bg-slate-950 border-slate-800'
                  }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-sm text-white">{item.caller_id}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{item.summary}</div>
                    <div className="text-[11px] font-mono text-amber-300 mt-1">{item.priority_tier}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black font-mono ${
                      item.urgency_score >= 75 ? 'text-red-400' : 'text-slate-300'
                    }`}>
                      {item.urgency_score}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">SCORE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Guardrail Box */}
          <div className="mt-6 p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
            <Scale className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">RESPONSIBLE AI &amp; LEGAL GUARDRAIL:</strong> Acoustic emotion and urgency scores are strictly indicative triage signals to assist cybercrime officers in prioritizing assistance. Predictions do not constitute forensic evidence of caller honesty, intent, or legal guilt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
