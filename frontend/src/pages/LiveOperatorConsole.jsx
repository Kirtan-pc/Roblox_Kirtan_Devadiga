import React, { useState } from 'react'
import { 
  Pause, 
  SlidersHorizontal, 
  ArrowRight,
  Mic,
  BarChart3,
  Brain,
  ShieldCheck,
  FileText,
  Bell,
  Headphones
} from 'lucide-react'

const LiveOperatorConsole = () => {
  const [isPaused, setIsPaused] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [memo, setMemo] = useState('')

  const toggleStream = () => {
    setIsPaused(!isPaused)
  }

  const acknowledgeReview = () => {
    setAcknowledged(true)
  }

  const insertTag = (tag) => {
    setMemo(prev => prev + tag)
  }

  const saveMemo = () => {
    alert('Triage memo saved to session audit trail.')
  }

  return (
    <div className="flex flex-col w-full">
      {/* TOP SUB-HEADER: SESSION METRICS & TELEMETRY */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md mb-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          {/* Session Identifiers */}
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-outline">SESSION REF</span>
              <span className="font-code-sm text-code-sm font-semibold text-on-surface">SV-2026-00418</span>
            </div>
            <span className="text-outline-variant font-code-sm">/</span>
            <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-error tracking-wider uppercase">LIVE STREAMING — SIMULATED DEMO</span>
            </div>
            <span className="text-outline-variant font-code-sm">/</span>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-outline">ELAPSED</span>
              <span className="font-transcript-timestamp text-transcript-timestamp text-primary font-bold">04:21.49</span>
            </div>
          </div>
          {/* Ingress Specs */}
          <div className="hidden 2xl:flex items-center gap-space-lg text-outline-variant">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-code-sm text-code-sm">
              <span className="text-outline font-label-caps text-label-caps">INGRESS:</span>
              <span>SIP-GW-INBOUND#04</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-code-sm text-code-sm">
              <span className="text-outline font-label-caps text-label-caps">CODEC:</span>
              <span>48kHz / 16-bit PCM</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-code-sm text-code-sm">
              <span className="text-outline font-label-caps text-label-caps">LATENCY:</span>
              <span className="text-secondary font-semibold">18ms</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-code-sm text-code-sm">
              <span className="text-outline font-label-caps text-label-caps">JITTER:</span>
              <span>0.04%</span>
            </div>
          </div>
          {/* Operational Primary Actions */}
          <div className="flex items-center gap-space-xs">
            <button 
              onClick={toggleStream}
              className="h-8 px-space-md rounded bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest font-headline-md text-body-sm transition-colors flex items-center gap-1.5"
            >
              <Pause size={16} />
              <span>{isPaused ? 'Resume Ingestion' : 'Pause Ingestion'}</span>
            </button>
            <button className="h-8 px-space-md rounded bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest font-headline-md text-body-sm transition-colors flex items-center gap-1.5">
              <SlidersHorizontal size={16} />
              <span>Recalibrate Baseline</span>
            </button>
            <button className="h-8 px-space-md rounded bg-primary-container text-on-primary hover:bg-primary transition-colors font-headline-md text-body-sm flex items-center gap-1.5">
              <ArrowRight size={16} />
              <span>Transfer to Nodal Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3-COLUMN OPERATIONAL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-space-md">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Caller Metadata Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <Mic className="text-primary" size={18} />
                <span className="font-label-caps text-label-caps uppercase text-outline">CALLER ATTRIBUTION</span>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-code-sm text-code-sm text-secondary font-medium">SNR 28.4 dB (Optimal)</span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
              <div className="flex flex-col bg-surface-container-low p-space-xs rounded">
                <span className="font-label-caps text-label-caps text-outline">EST. DEMO</span>
                <span className="font-headline-md text-body-sm text-on-surface">Female, ~48y</span>
              </div>
              <div className="flex flex-col bg-surface-container-low p-space-xs rounded">
                <span className="font-label-caps text-label-caps text-outline">ROUTE</span>
                <span className="font-headline-md text-body-sm text-on-surface">PSTN-Trunk-09</span>
              </div>
              <div className="flex flex-col bg-surface-container-low p-space-xs rounded">
                <span className="font-label-caps text-label-caps text-outline">LOC CLUSTER</span>
                <span className="font-headline-md text-body-sm text-on-surface">MH-Zone 4</span>
              </div>
            </div>
          </div>

          {/* Live Transcript Stream */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex-1 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-space-sm mb-space-xs">
              <div className="flex items-center gap-space-xs">
                <FileText className="text-secondary" size={18} />
                <span className="font-label-caps text-label-caps uppercase text-outline">REAL-TIME FORENSIC TRANSCRIPT</span>
              </div>
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-outline">
                <span>WER 1.4%</span>
                <span className="text-outline-variant">•</span>
                <span className="text-[#247A52] font-semibold">CONF 98.2%</span>
              </div>
            </div>
            <div className="flex flex-col gap-space-md flex-1 overflow-y-auto pr-space-xs">
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-secondary font-bold tracking-wide">CALLER [FEMALE ~48YRS]</span>
                  <span className="font-transcript-timestamp text-transcript-timestamp text-outline">04:02.12</span>
                </div>
                <p className="font-transcript-primary text-transcript-primary text-on-surface leading-relaxed">
                  They told me they were calling from the <mark className="bg-error-container text-on-error-container px-1 py-0.5 rounded font-medium">cyber crime cell</mark> and that my national identity card is linked to money laundering in Mumbai...
                </p>
              </div>
              <div className="p-space-sm rounded bg-surface-container-lowest flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-primary font-bold tracking-wide">OPERATOR [VARMA - ID 894]</span>
                  <span className="font-transcript-timestamp text-transcript-timestamp text-outline">04:08.40</span>
                </div>
                <p className="font-transcript-primary text-transcript-primary text-on-surface leading-relaxed">
                  Ma'am, please take a deep breath. You are on the verified national helpline. Do not disconnect this line or open any third-party screen sharing software under any circumstance.
                </p>
              </div>
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-secondary font-bold tracking-wide">CALLER [FEMALE ~48YRS]</span>
                  <span className="font-transcript-timestamp text-transcript-timestamp text-outline">04:14.05</span>
                </div>
                <p className="font-transcript-primary text-transcript-primary text-on-surface leading-relaxed">
                  He has been on Skype video for 3 hours! He says I am under <mark className="bg-error-container text-on-error-container px-1 py-0.5 rounded font-medium">digital arrest</mark> and they will send the local police right now to my house if I don't initiate the <mark className="bg-error-container text-on-error-container px-1 py-0.5 rounded font-medium">immediate transfer</mark> to the clearance reserve...
                </p>
              </div>
              <div className="flex items-center gap-space-sm py-1 px-space-xs text-outline font-code-sm text-code-sm animate-pulse">
                <Mic size={14} className="text-secondary" />
                <span>Acoustic stream ingest active: [04:21.49] listening...</span>
              </div>
            </div>
            {/* Coercion Detection Card */}
            <div className="mt-space-md pt-space-sm bg-surface-container-low p-space-sm rounded">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-caps text-label-caps uppercase text-outline">DETECTED COERCION SIGNALS</span>
                <span className="font-label-caps text-label-caps text-outline-variant font-normal">NLP-V4.6</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface font-medium flex items-center gap-1">
                    <Bell size={14} className="text-error" />
                    Digital Arrest Protocol
                  </span>
                  <span className="font-code-sm text-code-sm font-bold text-error">94% CONF</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface font-medium flex items-center gap-1">
                    <ShieldCheck size={14} className="text-error" />
                    Police Impersonation Vector
                  </span>
                  <span className="font-code-sm text-code-sm font-bold text-error">92% CONF</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface font-medium flex items-center gap-1">
                    <FileText size={14} className="text-tertiary-container" />
                    Forced Liquidation Demand
                  </span>
                  <span className="font-code-sm text-code-sm font-bold text-tertiary-container">88% CONF</span>
                </div>
              </div>
              <p className="font-label-caps text-label-caps text-outline-variant mt-space-xs text-right">Model estimate, not a verified finding.</p>
            </div>
          </div>
        </div>
        {/* CENTER COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Waveform & Spectrogram Analysis Rack */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <BarChart3 className="text-primary" size={18} />
                <span className="font-headline-md text-headline-md text-on-surface">Forensic Spectrogram & Amplitude Track</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low px-1.5 py-0.5 rounded text-outline font-code-sm text-code-sm">
                <span>FFT 2048</span>
                <span>|</span>
                <span>Blackman-Harris</span>
              </div>
            </div>
            {/* Telemetry Indicators Grid */}
            <div className="grid grid-cols-4 gap-space-xs py-space-sm my-space-xs bg-surface-container-low rounded px-space-sm text-center">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline">F0 BASELINE</span>
                <span className="font-code-sm text-code-sm text-on-surface font-bold">224.2 Hz</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline">PITCH VARIANCE</span>
                <span className="font-code-sm text-code-sm text-error font-bold">+42.8 Hz (High)</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline">HNR (dB)</span>
                <span className="font-code-sm text-code-sm text-secondary font-bold">11.4 dB</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline">PEAK SPL</span>
                <span className="font-code-sm text-code-sm text-on-surface font-bold">-3.2 dBFS</span>
              </div>
            </div>
            {/* SVG Visualizer */}
            <div className="relative w-full h-44 bg-surface-container-low rounded overflow-hidden flex flex-col justify-between p-space-xs">
              <div className="absolute left-2 top-2 z-10 flex flex-col gap-3 font-code-sm text-[9px] text-outline opacity-70 pointer-events-none">
                <span>4000 Hz</span>
                <span>2000 Hz</span>
                <span>1000 Hz</span>
                <span>250 Hz</span>
              </div>
              <svg className="w-full h-full text-secondary" fill="none" preserveAspectRatio="none" viewBox="0 0 540 140">
                <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.08" x1="0" x2="540" y1="35" y2="35"></line>
                <line stroke="currentColor" strokeOpacity="0.15" x1="0" x2="540" y1="70" y2="70"></line>
                <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.08" x1="0" x2="540" y1="105" y2="105"></line>
                <line stroke="currentColor" strokeOpacity="0.08" x1="135" x2="135" y1="0" y2="140"></line>
                <line stroke="currentColor" strokeOpacity="0.08" x1="270" x2="270" y1="0" y2="140"></line>
                <line stroke="currentColor" strokeOpacity="0.08" x1="405" x2="405" y1="0" y2="140"></line>
                <path d="M0,70 Q 20,45 35,70 T 70,70 T 100,20 T 130,70 T 160,95 T 190,70 T 220,15 T 250,70 T 280,30 T 310,70 T 340,110 T 370,70 T 400,22 T 430,70 T 470,10 T 500,70 L 500,70 L 0,70 Z" fill="currentColor" fillOpacity="0.12"></path>
                <g fill="currentColor" fillOpacity="0.45">
                  <rect height="24" rx="1.5" width="3" x="10" y="58"></rect>
                  <rect height="40" rx="1.5" width="3" x="18" y="50"></rect>
                  <rect height="16" rx="1.5" width="3" x="26" y="62"></rect>
                  <rect height="52" rx="1.5" width="3" x="34" y="44"></rect>
                  <rect height="32" rx="1.5" width="3" x="42" y="54"></rect>
                  <rect height="76" rx="1.5" width="3" x="50" y="32"></rect>
                  <rect height="60" rx="1.5" width="3" x="58" y="40"></rect>
                  <rect height="20" rx="1.5" width="3" x="66" y="60"></rect>
                  <rect height="10" rx="1.5" width="3" x="74" y="65"></rect>
                  <rect fill="#C43D43" fillOpacity="0.8" height="92" rx="1.5" width="3" x="85" y="24"></rect>
                  <rect fill="#C43D43" fillOpacity="0.8" height="108" rx="1.5" width="3" x="93" y="16"></rect>
                  <rect fill="#C43D43" fillOpacity="0.8" height="84" rx="1.5" width="3" x="101" y="28"></rect>
                  <rect height="64" rx="1.5" width="3" x="109" y="38"></rect>
                  <rect height="36" rx="1.5" width="3" x="120" y="52"></rect>
                  <rect height="24" rx="1.5" width="3" x="128" y="58"></rect>
                  <rect height="44" rx="1.5" width="3" x="136" y="48"></rect>
                  <rect height="68" rx="1.5" width="3" x="144" y="36"></rect>
                  <rect height="80" rx="1.5" width="3" x="152" y="30"></rect>
                  <rect height="50" rx="1.5" width="3" x="160" y="45"></rect>
                </g>
                <path d="M10,78 Q 60,65 100,35 T 160,82 T 220,24 T 270,72 T 330,30 T 380,42 T 430,20 T 470,68" fill="none" stroke="#2457D6" strokeWidth="2"></path>
                <g transform="translate(460, 0)">
                  <line stroke="#003FB3" strokeWidth="2" x1="0" x2="0" y1="0" y2="140"></line>
                  <polygon fill="#003FB3" points="0,0 -5,-7 5,-7"></polygon>
                  <polygon fill="#003FB3" points="0,140 -5,147 5,147"></polygon>
                </g>
              </svg>
              <div className="flex justify-between items-center px-1 font-code-sm text-[10px] text-outline border-t border-surface-container-highest pt-0.5">
                <span>03:40.00</span>
                <span>03:50.00</span>
                <span>04:00.00</span>
                <span>04:10.00</span>
                <span className="text-primary font-bold">04:21.49 [LIVE]</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs mt-space-xs text-on-surface-variant">
              <div className="flex items-center gap-space-xs font-label-caps text-label-caps">
                <span className="text-outline">ZOOM:</span>
                <button className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-semibold hover:bg-surface-container-highest">100%</button>
                <button className="px-space-xs py-0.5 rounded bg-surface-container-low text-outline hover:bg-surface-container-high">150%</button>
                <button className="px-space-xs py-0.5 rounded bg-surface-container-low text-outline hover:bg-surface-container-high">200%</button>
              </div>
              <div className="flex items-center gap-space-sm text-outline font-code-sm text-code-sm">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>F0 Pitch</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span>Jitter Clust</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span>Energy Spl</span>
              </div>
            </div>
          </div>
          {/* Acoustic Prosody & Affective Classification Rack */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <Brain className="text-primary" size={18} />
                <span className="font-headline-md text-headline-md text-on-surface">Calibrated Acoustic Prosody Telemetry</span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">Bi-LSTM (1200ms)</span>
            </div>
            {/* Metric 1: Distress */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-body-sm font-semibold text-on-surface">Possible Distress</span>
                  <span className="font-code-sm text-code-sm text-outline">CI: [86.4% - 91.6%]</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-label-caps">SEVERE TENSION SIGNATURE</span>
                  <span className="font-code-sm text-body-sm font-bold text-error">89.0%</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[86.4%] right-[8.4%] bg-error/25"></div>
                <div className="h-full bg-error rounded-full" style={{ width: '89%' }}></div>
              </div>
              <span className="font-body-sm text-body-sm text-outline">Rapid pitch modulation, fundamental frequency shift compressed into upper vocal range (+3.2σ).</span>
            </div>
            {/* Metric 2: Fear */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-body-sm font-semibold text-on-surface">Possible Fear</span>
                  <span className="font-code-sm text-code-sm text-outline">CI: [81.1% - 86.9%]</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-label-caps">ELEVATED FEAR RESPIRATION</span>
                  <span className="font-code-sm text-body-sm font-bold text-error">84.0%</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[81.1%] right-[13.1%] bg-error/25"></div>
                <div className="h-full bg-error rounded-full" style={{ width: '84%' }}></div>
              </div>
              <span className="font-body-sm text-body-sm text-outline">Micro-tremor presence in glottal pulses; respiration burst frequency elevated to 28 bpm.</span>
            </div>
            {/* Metric 3: Nervousness */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-body-sm font-semibold text-on-surface">Possible Nervousness / Hesitation</span>
                  <span className="font-code-sm text-code-sm text-outline">CI: [70.2% - 77.8%]</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-tertiary font-label-caps text-label-caps">MODERATE INHIBITION</span>
                  <span className="font-code-sm text-body-sm font-bold text-tertiary">74.0%</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[70.2%] right-[22.2%] bg-tertiary/20"></div>
                <div className="h-full bg-tertiary-container rounded-full" style={{ width: '74%' }}></div>
              </div>
              <span className="font-body-sm text-body-sm text-outline">Syllable clipping and delayed response latency; dysfluency rate registered at 4.8 instances / min.</span>
            </div>
            {/* Metric 4: Anger */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-body-sm font-semibold text-on-surface">Possible Anger / Aggression</span>
                  <span className="font-code-sm text-code-sm text-outline">CI: [21.0% - 31.0%]</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-[#247A52] font-label-caps text-label-caps">BASELINE NOMINAL</span>
                  <span className="font-code-sm text-body-sm font-bold text-on-surface-variant">26.0%</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[21.0%] right-[69.0%] bg-surface-container-highest"></div>
                <div className="h-full bg-outline rounded-full" style={{ width: '26%' }}></div>
              </div>
              <span className="font-body-sm text-body-sm text-outline">Spectral tilt remains below assertion threshold; caller exhibits compliant submission rather than belligerence.</span>
            </div>
            {/* Disclaimer */}
            <div className="mt-space-xs p-space-sm rounded bg-surface-container-low flex items-start gap-space-sm">
              <ShieldCheck className="text-outline mt-0.5" size={16} />
              <p className="font-code-sm text-code-sm text-outline leading-tight">
                <span className="font-bold text-on-surface-variant">Editorial Standard:</span> Acoustic prosody metrics represent probabilistic model estimates of speech characteristics. They do not constitute a medical, psychiatric diagnosis or conclusive legal determination of caller veracity.
              </p>
            </div>
          </div>
        </div>
        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-space-md">
          {/* Indicative Urgency Score Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-outline">COMBINED URGENCY METRIC</span>
              <span className="font-code-sm text-code-sm text-outline font-medium">REV 4.2</span>
            </div>
            <div className="flex items-baseline justify-between pt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-xl text-[44px] leading-none font-bold text-error tracking-tight font-code-sm">88</span>
                <span className="font-headline-md text-headline-md text-outline">/ 100</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-space-xs py-1 rounded bg-error text-on-error font-label-caps text-[10px] font-bold tracking-wide uppercase">CRITICAL</span>
                <span className="font-label-caps text-[9px] text-error font-semibold mt-0.5">REVIEW MANDATORY</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-space-xs">
              <div className="grid grid-cols-3 gap-1 h-2 w-full">
                <div className="bg-[#247A52]/30 rounded-l"></div>
                <div className="bg-tertiary-container/30"></div>
                <div className="bg-error rounded-r"></div>
              </div>
              <div className="flex justify-between font-code-sm text-[10px] text-outline">
                <span>0-40 Normal</span>
                <span>41-70 Elevated</span>
                <span className="font-bold text-error">71-100 Critical</span>
              </div>
            </div>
            <div className="mt-space-sm flex flex-col gap-1.5 pt-space-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">SIGNAL WEIGHT CONTRIBUTION</span>
              <div className="flex items-center justify-between py-1 bg-surface-container-low px-space-xs rounded">
                <span className="font-body-sm text-body-sm text-on-surface truncate pr-2">Acoustic Pitch & Tremor</span>
                <span className="font-code-sm text-code-sm font-bold text-error">+38 pts</span>
              </div>
              <div className="flex items-center justify-between py-1 bg-surface-container-low px-space-xs rounded">
                <span className="font-body-sm text-body-sm text-on-surface truncate pr-2">Lexical Coercion Trigger</span>
                <span className="font-code-sm text-code-sm font-bold text-error">+28 pts</span>
              </div>
              <div className="flex items-center justify-between py-1 bg-surface-container-low px-space-xs rounded">
                <span className="font-body-sm text-body-sm text-on-surface truncate pr-2">Speech Velocity (210 WPM)</span>
                <span className="font-code-sm text-code-sm font-bold text-tertiary">+22 pts</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs font-code-sm text-code-sm text-outline">
              <span>Model Freshness:</span>
              <span className="text-secondary font-medium">Updated 0.4s ago</span>
            </div>
          </div>

          {/* Human Supervisory Gate & Operator Actions */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <ShieldCheck className="text-primary" size={18} />
                <span className="font-headline-md text-headline-md text-on-surface">Supervisory Gate</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
            </div>
            <p className="font-body-sm text-body-sm text-outline -mt-space-xs">Authorized duty officer verification. All actions are logged with millisecond timestamps to the evidentiary chain.</p>
            <div className="flex flex-col gap-space-xs">
              <button 
                onClick={acknowledgeReview}
                disabled={acknowledged}
                className={`w-full h-9 rounded font-headline-md text-body-sm transition-colors flex items-center justify-center gap-2 ${
                  acknowledged 
                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' 
                    : 'bg-primary-container hover:bg-primary text-on-primary'
                }`}
              >
                <ShieldCheck size={18} />
                <span>{acknowledged ? 'Acknowledged' : 'Acknowledge for Review'}</span>
              </button>
              <button className="w-full h-8 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-md text-body-sm transition-colors flex items-center justify-center gap-1.5">
                <Bell size={16} className="text-error" />
                <span>Escalate to Cyber Nodal Desk</span>
              </button>
              <button className="w-full h-8 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-headline-md text-body-sm transition-colors flex items-center justify-center gap-1.5">
                <Headphones size={16} />
                <span>Request Supervisor Listen-In</span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <label className="font-label-caps text-label-caps uppercase text-outline">OPERATOR TRIAGE MEMO</label>
              <textarea 
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full p-2 bg-surface-container-low rounded text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary resize-none" 
                placeholder="Enter corroborative observations, caller demeanor, or fraud syndication tags..." 
                rows="3"
              ></textarea>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => insertTag('+ Digital Arrest ')} className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors">+ Digital Arrest</button>
                <button onClick={() => insertTag('+ Severe Coercion ')} className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors">+ Severe Coercion</button>
                <button onClick={() => insertTag('+ Freeze Advised ')} className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors">+ Freeze Advised</button>
              </div>
              <button onClick={saveMemo} className="mt-space-xs h-8 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-md text-body-sm transition-colors flex items-center justify-center gap-1">
                <FileText size={16} />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL: FORENSIC TELEMETRY AUDIT LEDGER */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
        <div className="flex items-center justify-between pb-space-sm mb-space-xs">
          <div className="flex items-center gap-space-xs">
            <FileText className="text-primary" size={18} />
            <span className="font-headline-md text-headline-md text-on-surface">Chronological Telemetry Audit Ledger</span>
          </div>
          <div className="flex items-center gap-space-md font-code-sm text-code-sm text-outline">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
              CHAIN OF CUSTODY VERIFIED
            </span>
            <span className="text-outline-variant">•</span>
            <span>ENGINE CLUSTER: IND-WEST-01</span>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-code-sm text-code-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline font-label-caps text-label-caps uppercase">
                <th className="py-2 px-space-md font-semibold">UTC TIMESTAMP</th>
                <th className="py-2 px-space-md font-semibold">CLASSIFIER EVENT</th>
                <th className="py-2 px-space-md font-semibold">OBSERVED TELEMETRY DELTA</th>
                <th className="py-2 px-space-md font-semibold">CONFIDENCE</th>
                <th className="py-2 px-space-md font-semibold">PIPELINE NODE</th>
                <th className="py-2 px-space-md text-right font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2 px-space-md text-outline">14:28:42.108</td>
                <td className="py-2 px-space-md font-semibold text-error">THRESHOLD_EXCEEDED</td>
                <td className="py-2 px-space-md">Urgency metric crossed critical delta (+14.2 in 10s window)</td>
                <td className="py-2 px-space-md text-[#247A52] font-semibold">96.8%</td>
                <td className="py-2 px-space-md text-outline">CORE_ANALYTICS_02</td>
                <td className="py-2 px-space-md text-right">
                  <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-[10px]">FLAGGED</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2 px-space-md text-outline">14:28:38.412</td>
                <td className="py-2 px-space-md font-semibold text-tertiary">LEXICAL_MATCH_HIGH</td>
                <td className="py-2 px-space-md">Trigger token recognized: "immediate transfer" (Coercion Lexicon V4)</td>
                <td className="py-2 px-space-md text-[#247A52] font-semibold">99.1%</td>
                <td className="py-2 px-space-md text-outline">NLP_STT_WORKER_04</td>
                <td className="py-2 px-space-md text-right">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-[10px]">LOGGED</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2 px-space-md text-outline">14:28:22.905</td>
                <td className="py-2 px-space-md font-semibold text-secondary">SPECTRAL_PITCH_ANOMALY</td>
                <td className="py-2 px-space-md">Fundamental frequency shift +42.8Hz; persistent glottal pulse instability</td>
                <td className="py-2 px-space-md text-[#247A52] font-semibold">91.4%</td>
                <td className="py-2 px-space-md text-outline">DSP_AUDIO_ENGINE</td>
                <td className="py-2 px-space-md text-right">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-[10px]">LOGGED</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LiveOperatorConsole
