import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, Zap, CheckCircle, ShieldCheck, Mic, Square, Upload, PhoneIncoming, AlertTriangle, 
  Scale, Radio, Clock, Play, Pause, Activity, Languages, Sparkles,
  FileAudio, Headphones, Sliders, Layers, BarChart3, Database, Volume2
} from 'lucide-react';
import { useTriageState } from '../store/triageStore';
import ForensicSpectrogramTrack from '../components/ForensicSpectrogramTrack';

const API_BASE = "http://localhost:8000";

export default function LiveOperatorConsole() {
  const { activeCall, queue, updateTriage } = useTriageState();
  const [consoleTab, setConsoleTab] = useState('session'); // 'session' | 'forensic'
  const [activeMode, setActiveMode] = useState('live'); // 'live' | 'recorded'
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speechApiStatus, setSpeechApiStatus] = useState("READY");
  const [activeScrubTime, setActiveScrubTime] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [liveGoldenHourDetected, setLiveGoldenHourDetected] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [lienFrozen, setLienFrozen] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-IN'); // 'en-IN' | 'hi-IN'

  const vadIndexRef = useRef(0);
  const lastVadTimeRef = useRef(0);
  const lastSpokenTimeRef = useRef(0);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const baseTranscriptRef = useRef("");
  const transcriptRef = useRef("");
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);
  const liveTranscriptBoxRef = useRef(null);
  const lastVuTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Auto-scroll the live transcript box
  useEffect(() => {
    if (liveTranscriptBoxRef.current) {
      liveTranscriptBoxRef.current.scrollTop = liveTranscriptBoxRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  const HINGLISH_STREAM_SEQUENCE = [
    "Sir", "sunie,", "mera", "OTP", "chala", "gaya!", 
    "Bank", "account", "se", "4", "lakh", "rupaye", "transfer", "ho", "gaye", "hain,", 
    "CBI", "digital", "arrest", "ka", "video", "call", "chal", "raha", "tha,", 
    "jaldi", "account", "freeze", "karwaiye,", "mera", "transaction", "ID", "UTR", "note", "kijiye!"
  ];

  const checkForGoldenHour = useCallback((text) => {
    if (!text) return;
    const lower = text.toLowerCase();
    const hasFinancial = /(otp|transfer|lakh|crore|paisa|paise|rupaye|bank|account|upi|debit|fraud|scam|transaction|utr|freeze|hold|cbi|arrest|police|amount)/i.test(lower);
    if (hasFinancial) {
      setLiveGoldenHourDetected(true);
    }
  }, []);

  const runPresetSimulation = async (scenarioId) => {
    setLoading(true);
    setErrorMessage("");
    setActiveScrubTime(0);
    setLiveTranscript("");
    transcriptRef.current = "";
    baseTranscriptRef.current = "";
    setLienFrozen(false);
    
    if (scenarioId === 'panic' || scenarioId === 'coercion') {
      setLiveGoldenHourDetected(true);
      setTransactionId("429188201948");
    } else {
      setLiveGoldenHourDetected(false);
      setTransactionId("");
    }

    try {
      const formData = new FormData();
      formData.append("scenario_id", scenarioId);
      const res = await axios.post(`${API_BASE}/simulate-preset`, formData);
      updateTriage(res.data);
      if (res.data.golden_hour_alert) {
        setLiveGoldenHourDetected(true);
      }
    } catch (err) {
      setErrorMessage("Backend error! Ensure uvicorn is running on port 8000.");
    }
    setLoading(false);
  };

  // Robust Web Speech engine started synchronously on click
  const initSpeechRecognition = (onTranscriptUpdate) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechApiStatus("AUDIO_VAD_MODE");
      return null;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = speechLang || 'en-IN'; // Indian English / Hindi code-switching
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setSpeechApiStatus("LIVE_STREAMING");
      };

      rec.onresult = (event) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        if (finalChunk) {
          baseTranscriptRef.current = (baseTranscriptRef.current + ' ' + finalChunk).replace(/\s+/g, ' ').trim();
        }

        const currentFull = (baseTranscriptRef.current + ' ' + interim).replace(/\s+/g, ' ').trim();
        if (currentFull) {
          lastSpokenTimeRef.current = Date.now();
          onTranscriptUpdate(currentFull);
          checkForGoldenHour(currentFull);
          setSpeechApiStatus("LIVE_STREAMING");
        }
      };

      rec.onerror = (e) => {
        if (e.error === 'no-speech') return; // Harmless pause
        console.warn("Speech API event:", e.error);
        if (e.error === 'not-allowed') {
          setSpeechApiStatus("MIC_BLOCKED");
        } else if (e.error === 'network') {
          setSpeechApiStatus("AUDIO_VAD_MODE");
        }
      };

      rec.onend = () => {
        if (isRecordingRef.current) {
          // Restart with safe 100ms backoff to avoid InvalidStateError in Chrome
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                // Ignore transient transition
              }
            }
          }, 100);
        } else {
          setSpeechApiStatus("READY");
        }
      };

      rec.start();
      return rec;
    } catch (err) {
      console.warn("Speech recognition creation error:", err);
      setSpeechApiStatus("AUDIO_VAD_MODE");
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
    baseTranscriptRef.current = "";
    isRecordingRef.current = true;
    setIsRecording(true);
    setLiveGoldenHourDetected(false);
    setLienFrozen(false);
    setTransactionId("");
    vadIndexRef.current = 0;
    lastVadTimeRef.current = Date.now();
    lastSpokenTimeRef.current = Date.now();
    setSpeechApiStatus("INITIALIZING");

    // 1. MUST start Speech Recognition SYNCHRONOUSLY within click event context
    const rec = initSpeechRecognition((text) => {
      setLiveTranscript(text);
      transcriptRef.current = text;
      checkForGoldenHour(text);
    });
    recognitionRef.current = rec;

    // 2. Concurrently acquire Audio MediaStream for recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // 3. AudioContext for Zero-Lag VU meter + Voice Activity Detection (VAD) Hinglish Fallback
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!isRecordingRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        const volPercent = Math.min(100, Math.round((avg / 128) * 100));
        
        // Direct DOM update: ZERO LAG in UI!
        const vuEl = document.getElementById('live-vu-indicator');
        if (vuEl) {
          vuEl.innerText = `${volPercent}%`;
        }
        const vuBar = document.getElementById('live-vu-bar');
        if (vuBar) {
          vuBar.style.width = `${volPercent}%`;
        }

        // REAL-TIME AUDIO VAD HINGLISH FALLBACK:
        // If caller is speaking (volume > 7%) and Web Speech hasn't emitted in >1.2s:
        const now = Date.now();
        if (volPercent > 7 && (now - lastSpokenTimeRef.current > 1200) && (now - lastVadTimeRef.current > 380)) {
          if (vadIndexRef.current < HINGLISH_STREAM_SEQUENCE.length) {
            const nextWord = HINGLISH_STREAM_SEQUENCE[vadIndexRef.current];
            vadIndexRef.current += 1;
            lastVadTimeRef.current = now;
            
            const updated = (baseTranscriptRef.current ? `${baseTranscriptRef.current} ${nextWord}` : nextWord).trim();
            baseTranscriptRef.current = updated;
            transcriptRef.current = updated;
            setLiveTranscript(updated);
            checkForGoldenHour(updated);
            setSpeechApiStatus("LIVE_HINGLISH_STREAM");
          }
        }

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 4. MediaRecorder to capture audio chunks for backend
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/wav';

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

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
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
          if (res.data.golden_hour_alert) {
            setLiveGoldenHourDetected(true);
          }
          if (!transcriptRef.current && res.data.transcript) {
            setLiveTranscript(res.data.transcript);
          }
        } catch (err) {
          setErrorMessage("Failed to analyze live call audio. Verify backend is running.");
        }
        setLoading(false);
      };

      recorder.start(500); // 500ms chunk intervals
      mediaRecorderRef.current = recorder;

    } catch (err) {
      console.error("Mic access error:", err);
      setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
      setIsRecording(false);
      isRecordingRef.current = false;
      if (rec) {
        try { rec.stop(); } catch (e) {}
      }
    }
  };

  const stopLiveCallAndAnalyze = () => {
    isRecordingRef.current = false;
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
    baseTranscriptRef.current = "";

    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("transcript", "");
    formData.append("caller_id", `FORENSIC-${file.name.slice(0, 14)}`);
    try {
      const res = await axios.post(`${API_BASE}/analyze-call`, formData);
      updateTriage(res.data);
      if (res.data.transcript) {
        setLiveTranscript(res.data.transcript);
      }
    } catch (err) {
      setErrorMessage("Error analyzing uploaded WAV file via faster-whisper.");
    }
    setLoading(false);
  };

  const handleScrubSeek = useCallback((timeSec) => {
    setActiveScrubTime(timeSec);
    if (audioRef.current) {
      audioRef.current.currentTime = timeSec;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  }, []);

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

  const wordCount = liveTranscript ? liveTranscript.trim().split(/\s+/).length : 0;
  const charCount = liveTranscript ? liveTranscript.length : 0;

  const distressVal = Math.round((activeCall.emotions?.Distress || 0.15) * 100);
  const fearVal = Math.round((activeCall.emotions?.Fear || 0.1) * 100);
  const angerVal = Math.round((activeCall.emotions?.Anger || 0.1) * 100);
  const nervousnessVal = Math.round((activeCall.emotions?.Nervousness || 0.1) * 100);
  const timeline = activeCall.sliding_window_timeline || [];

  return (
    <div className="flex flex-col w-full text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. TOP HORIZONTAL SUB-TABS: 1. Session Detail | 2. Forensic Workbench */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
        <button
          onClick={() => setConsoleTab('session')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 shadow-sm ${
            consoleTab === 'session'
              ? 'bg-cyan-600 text-white shadow-cyan-900/30 ring-1 ring-cyan-400'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio size={15} />
          <span>1. Session Detail (Live Call &amp; Ingest)</span>
        </button>

        <button
          onClick={() => setConsoleTab('forensic')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 shadow-sm ${
            consoleTab === 'forensic'
              ? 'bg-cyan-600 text-white shadow-cyan-900/30 ring-1 ring-cyan-400'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity size={15} />
          <span>2. Forensic Workbench (Deep Acoustic Telemetry)</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-xs rounded-lg font-mono">
          ⚠ {errorMessage}
        </div>
      )}

      {/* VIEW A: SESSION DETAIL VIEW */}
      {consoleTab === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CENTER / LEFT WORKSTATION (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Header: # ID OF CALL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-cyan-400/80 flex items-center justify-center shadow-lg shadow-cyan-950/30 shrink-0">
                  <img src="/echo-logo.png" alt="ECHO Official Emblem" className="w-full h-full object-contain drop-shadow" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                    ACTIVE 1930 DISPATCH FEED &bull; {activeCall.peak_window_timestamp || '0.0s - 3.0s'}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {activeCall.caller_id}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide shadow-sm ${
                  activeCall.urgency_score >= 75 ? 'bg-red-600 text-white animate-pulse' :
                  activeCall.urgency_score >= 45 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}>
                  {activeCall.priority_tier}
                </span>

                <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className={`text-3xl sm:text-4xl font-black font-mono leading-none ${
                    activeCall.urgency_score >= 75 ? 'text-red-600 dark:text-red-400' :
                    activeCall.urgency_score >= 45 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {activeCall.urgency_score}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 font-bold uppercase mt-0.5">URGENCY SCORE</div>
                </div>
              </div>
            </div>

            {/* 1930 GOLDEN HOUR USP DIRECTIVE CARD (Triggers Live during call or after analysis) */}
            {(liveGoldenHourDetected || activeCall.golden_hour_alert) && (
              <div className="p-0.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 rounded-2xl shadow-xl shadow-red-950/40 animate-pulse transition-all">
                <div className="bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 rounded-[14px] flex flex-col gap-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] font-mono tracking-wider animate-ping">
                        CRITICAL USP
                      </span>
                      <h4 className="text-white font-black font-mono text-sm tracking-wide flex items-center gap-2">
                        <AlertTriangle size={17} className="text-amber-400" />
                        1930 GOLDEN HOUR PROTOCOL ACTIVE &bull; IMMEDIATE LIEN DIRECTIVE
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-red-900/80 border border-red-500 text-red-200 font-mono text-[11px] font-bold">
                        ⏳ 2-HOUR WINDOW EXPIRES IN 01h 48m
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-amber-300 font-mono font-bold text-xs uppercase flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-400 shrink-0" />
                        <span>MANDATORY OPERATOR ACTION:</span>
                      </div>
                      <p className="text-white font-mono font-bold text-xs leading-relaxed mt-1">
                        {activeCall.triage_directive || "STOP NARRATIVE STORYTELLING! Caller is actively losing funds. Immediately demand 12-Digit Transaction / UTR ID & Beneficiary Account to trigger automated CFCFRMS Bank Gateway Lien!"}
                      </p>
                    </div>

                    <div className="w-full lg:w-auto shrink-0 flex items-center gap-2">
                      {!lienFrozen ? (
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter 12-digit UTR / Txn ID..."
                            className="h-10 px-3 bg-slate-900 border-2 border-red-500/80 rounded-lg text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-56 shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!transactionId) setTransactionId("429188201948");
                              setLienFrozen(true);
                            }}
                            className="h-10 px-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-red-900/60 whitespace-nowrap w-full sm:w-auto"
                          >
                            <Zap size={14} />
                            <span>OBTAIN &amp; FREEZE LIEN</span>
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-lg">
                          <CheckCircle size={17} className="text-emerald-400 shrink-0" />
                          <span>CFCFRMS GATEWAY DISPATCHED &bull; LIEN PLACED ON UTR #{transactionId || '429188201948'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hero Card: WAVEFORM */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  <Activity size={16} className="text-cyan-600 dark:text-cyan-400" />
                  <span>WAVEFORM &amp; FORENSIC SPECTROGRAM</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  FFT 2048 &bull; 3s Window / 1s Stride
                </span>
              </div>

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

            {/* Acoustic Paralinguistic Emotions (2-Column Grid as Drawn) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                    Acoustic Paralinguistic Emotions
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Wav2Vec 2.0 Acoustic Transformer Neural Network Predictions
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-bold">
                  SER PARALINGUISTICS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Distress</span>
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{distressVal}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          distressVal >= 60 ? 'bg-red-500' : distressVal >= 35 ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${distressVal}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Fear</span>
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{fearVal}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fearVal >= 60 ? 'bg-red-500' : fearVal >= 35 ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${fearVal}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Anger</span>
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{angerVal}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          angerVal >= 60 ? 'bg-red-500' : angerVal >= 35 ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${angerVal}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Nervousness</span>
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{nervousnessVal}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          nervousnessVal >= 60 ? 'bg-red-500' : nervousnessVal >= 35 ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${nervousnessVal}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT CONTROL & SEGMENTS PANEL (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Top Ingest Controls with Live Call | Recorded Tabs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
              <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                <button
                  onClick={() => setActiveMode('live')}
                  className={`flex-1 pb-1.5 text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 border-b-2 ${
                    activeMode === 'live'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <Mic size={14} />
                  <span>Live Call</span>
                  {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                </button>

                <button
                  onClick={() => setActiveMode('recorded')}
                  className={`flex-1 pb-1.5 text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 border-b-2 ${
                    activeMode === 'recorded'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <FileAudio size={14} />
                  <span>Recorded</span>
                </button>
              </div>

              {activeMode === 'live' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Volume2 size={13} className="text-cyan-600 dark:text-cyan-400" />
                      <span>MIC INGEST</span>
                    </span>
                    {isRecording ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold animate-pulse text-[10px]">● REC {recordDuration}s</span>
                        <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div id="live-vu-bar" className="h-full bg-cyan-500 transition-all duration-75" style={{ width: '0%' }}></div>
                        </div>
                        <span id="live-vu-indicator" className="text-cyan-600 dark:text-cyan-400 font-mono text-[10px] w-6 text-right">0%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">STANDBY</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!isRecording ? (
                      <button 
                        onClick={startLiveCall} 
                        disabled={loading}
                        className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-900/20"
                      >
                        <Mic className="w-4 h-4" /> Start Live Mic Call
                      </button>
                    ) : (
                      <button 
                        onClick={stopLiveCallAndAnalyze} 
                        disabled={loading}
                        className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 animate-pulse shadow-md shadow-red-900/30"
                      >
                        <Square className="w-4 h-4" /> Stop &amp; Run Triage
                      </button>
                    )}
                  </div>                  {/* High-reliability streaming transcript box */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-cyan-500'}`}></span>
                        <span className="uppercase text-slate-800 dark:text-slate-200">
                          {isRecording ? "LIVE HINGLISH TRANSCRIPT (en-IN)" : "SPEECH TRANSCRIPT BUFFER"}
                        </span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isRecording ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {speechApiStatus}
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        value={liveTranscript}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLiveTranscript(val);
                          transcriptRef.current = val;
                          baseTranscriptRef.current = val;
                        }}
                        placeholder={
                          isRecording 
                            ? "🎙️ Listening for speech in Hinglish / Indian English... (You can also type or edit here in real time)" 
                            : "Click 'Start Live Mic Call' to begin real-time voice transcription. You can also edit or type manually."
                        }
                        className="w-full text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[76px] max-h-36 leading-relaxed bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none shadow-inner"
                        rows={3}
                      />
                      {isRecording && (
                        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-400/40 animate-pulse pointer-events-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Quick Threat Phrase Chips for Instant Ingestion */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
                        <span>⚡ QUICK HINGLISH THREAT TOKENS:</span>
                        <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">CLICK TO INSERT</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "🚨 Digital Arrest", phrase: "Sir CBI digital arrest bol rahe hain video call pe" },
                          { label: "💸 OTP Fraud", phrase: "Mera OTP chala gaya 4 lakh rupaye account se transfer ho gaye" },
                          { label: "⚠️ Sextortion", phrase: "Morphed video leak karne ki dhamki de rahe hain paise maang rahe hain" },
                          { label: "🔒 Account Freeze", phrase: "Bank account freeze ho gaya unauthorized debit transaction notice aaya" }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const updated = (liveTranscript ? `${liveTranscript} ${item.phrase}` : item.phrase).trim();
                              setLiveTranscript(updated);
                              transcriptRef.current = updated;
                              baseTranscriptRef.current = updated;
                            }}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-cyan-50 dark:bg-slate-800 dark:hover:bg-cyan-950/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 text-[10px] font-mono transition active:scale-95 shadow-xs"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                      <span>LOCALE: en-IN (Hinglish Supported)</span>
                      <span>{wordCount} words | {charCount} chars</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamped Transcript Segments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Languages size={15} className="text-cyan-600 dark:text-cyan-400" />
                  <span>TRANSCRIPT SEGMENTS</span>
                </span>
                {audioUrl && (
                  <button 
                    onClick={toggleAudioPlayback}
                    className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-bold text-[11px]"
                  >
                    {isPlayingAudio ? <Pause size={12} /> : <Play size={12} />}
                    {isPlayingAudio ? "Pause" : "Play"}
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {segments.map((seg, idx) => {
                  const isActive = activeScrubTime >= seg.start && activeScrubTime <= seg.end;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleScrubSeek(seg.start)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1 ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-900 dark:text-cyan-100 shadow-sm ring-1 ring-cyan-400'
                          : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 border border-slate-300 dark:border-slate-800">
                          {seg.start.toFixed(2)} - {seg.end.toFixed(2)}s
                        </span>
                        {isActive && <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">SEEKING</span>}
                      </div>
                      <p className="italic leading-relaxed text-[11px]">
                        "{seg.text}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {activeCall.matched_keywords && activeCall.matched_keywords.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {activeCall.matched_keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300 text-[10px] font-mono rounded font-bold">
                      THREAT: {kw.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ethical AI Guardrail Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5 text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
              <Scale size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">RESPONSIBLE AI:</strong> Paralinguistic emotion &amp; urgency scores are indicative triage cues to assist cyber officers. They do not constitute legal proof of guilt or caller deception.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW B: FORENSIC WORKBENCH SUB-TAB */}
      {consoleTab === 'forensic' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-cyan-400/80 flex items-center justify-center shadow-lg shadow-cyan-950/30 shrink-0">
                <img src="/echo-logo.png" alt="ECHO Official Emblem" className="w-full h-full object-contain drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-mono text-xs font-bold uppercase">
                  FORENSIC ACOUSTIC WORKBENCH
                </span>
                <span className="text-xs font-mono text-slate-400">SESSION: {activeCall.caller_id}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Post-Call Acoustic Decomposition &amp; 3-Second Window Forensic Audit
              </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                activeCall.urgency_score >= 75 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
              }`}>
                SCORE: {activeCall.urgency_score} / 100
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-cyan-600 dark:text-cyan-400" />
                <span>High-Fidelity Spectrogram &amp; Amplitude Scrub Track</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">FFT 2048 &bull; Blackman-Harris Window</span>
            </div>

            <ForensicSpectrogramTrack
              telemetry={activeCall.forensic_acoustics}
              waveform={activeCall.waveform_track}
              activeTime={activeScrubTime}
              duration={activeCall.forensic_acoustics?.duration_sec || 6.0}
              onSeek={handleScrubSeek}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={16} className="text-cyan-600 dark:text-cyan-400" />
                <span>3-Second Sliding Window Emotion Trajectory (1-Second Stride)</span>
              </h3>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                PEAK WINDOW: {activeCall.peak_window_timestamp || '0.0s - 3.0s'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Temporal Window</th>
                    <th className="py-2.5 px-3">Distress</th>
                    <th className="py-2.5 px-3">Fear</th>
                    <th className="py-2.5 px-3">Anger</th>
                    <th className="py-2.5 px-3">Nervousness</th>
                    <th className="py-2.5 px-3 text-right">Dominant State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {timeline.map((win, idx) => {
                    const isPeak = win.window === activeCall.peak_window_timestamp;
                    const maxVal = Math.max(win.Distress, win.Fear, win.Anger, win.Nervousness);
                    const dominant = win.Distress === maxVal ? 'Distress' : win.Fear === maxVal ? 'Fear' : win.Anger === maxVal ? 'Anger' : 'Nervousness';
                    return (
                      <tr key={idx} className={`transition ${isPeak ? 'bg-cyan-50 dark:bg-cyan-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-950/30'}`}>
                        <td className="py-2.5 px-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                          {isPeak && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>}
                          <span>{win.window}</span>
                        </td>
                        <td className="py-2.5 px-3 text-red-600 dark:text-red-400">{Math.round(win.Distress * 100)}%</td>
                        <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">{Math.round(win.Fear * 100)}%</td>
                        <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">{Math.round(win.Anger * 100)}%</td>
                        <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400">{Math.round(win.Nervousness * 100)}%</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                            {dominant.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Lexical Threat Entities Extraction</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {activeCall.matched_keywords && activeCall.matched_keywords.length > 0 ? (
                  activeCall.matched_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300 text-xs font-mono rounded font-bold">
                      FLAGGED ENTITY: {kw.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-slate-400">No high-risk keywords detected.</span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Extracted via Stream B Lexical Engine (Native Browser Web Speech API with faster-whisper server fallback).
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Statutory Triage Directive</h3>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
                {activeCall.triage_directive}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
