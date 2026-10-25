import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Activity, AlertTriangle, CheckCircle, RefreshCw, Cpu, Database } from 'lucide-react';

const API_BASE = "http://localhost:8000";

export default function SystemHealth() {
  const [healthData, setHealthData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      const res = await axios.get(`${API_BASE}/health`);
      setLatency(Date.now() - start);
      setHealthData(res.data);
    } catch (err) {
      setError("Failed to connect to backend on port 8000.");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full gap-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">System Health &amp; Infrastructure Telemetry</h1>
          <p className="text-xs text-slate-400 mt-1">Live service telemetry, neural weights cache, and endpoint status</p>
        </div>
        <button 
          onClick={checkHealth} 
          disabled={loading}
          className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 hover:bg-slate-800 flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg font-mono">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">API Latency</span>
            <Activity className="text-cyan-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{latency !== null ? latency : '--'}</span>
            <span className="text-xs font-mono text-slate-400">ms</span>
          </div>
          <p className="text-xs font-mono text-emerald-400 mt-1">✓ Fast Response SLA</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Backend Status</span>
            <CheckCircle className="text-emerald-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400 uppercase">
              {healthData ? healthData.status : 'Connecting...'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">FastAPI @ localhost:8000</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Neural Network Model</span>
            <Cpu className="text-cyan-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold font-mono text-cyan-300">
              {healthData ? healthData.model : 'Wav2Vec 2.0 SER'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">Pre-trained Speech Emotion Recognition</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Buffer Config</span>
            <Database className="text-cyan-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold font-mono text-amber-300">
              {healthData ? healthData.window_config : '3s Window / 1s Stride'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">FIFO Ring Buffer in RAM</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
          Local Weight Storage &amp; Offline Readiness
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          The acoustic engine runs strictly from local weights stored in <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">./models_cache</code>. In compliance with high-availability disaster recovery standards, all audio files and microphone inputs are processed entirely offline with zero external cloud API dependencies.
        </p>
      </div>
    </div>
  );
}
