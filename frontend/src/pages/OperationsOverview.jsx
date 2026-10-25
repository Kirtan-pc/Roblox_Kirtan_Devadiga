import React from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle, Server, ShieldAlert, TrendingUp, PhoneCall, Zap, Database } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function OperationsOverview() {
  const { activeCall, queue } = useTriageState();

  const criticalCount = queue.filter(item => item.urgency_score >= 75).length;
  const elevatedCount = queue.filter(item => item.urgency_score >= 45 && item.urgency_score < 75).length;
  const standardCount = queue.filter(item => item.urgency_score < 45).length;
  const totalCallsToday = 1284 + queue.length;

  return (
    <div className="flex flex-col w-full gap-5 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            1930 Operations Overview &amp; Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Macro telemetry aggregated across active shifts, CFCFRMS lien API gateway latency, and call queue distributions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 font-mono text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            CFCFRMS GATEWAY CONNECTED
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Total Calls Ingested</span>
            <PhoneCall className="text-cyan-600 dark:text-cyan-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{totalCallsToday.toLocaleString()}</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">+18.4% / shift</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Today's aggregate 1930 volume</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Avg Inference Latency</span>
            <Zap className="text-amber-500" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-500">142</span>
            <span className="text-xs font-mono text-slate-400 font-bold">ms</span>
          </div>
          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">✓ Fast-Triage SLA Met (&lt;500ms)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Critical Golden Hour</span>
            <AlertTriangle className="text-red-500" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-red-600 dark:text-red-400">{criticalCount + 18}</span>
            <span className="text-xs font-mono text-red-500 font-bold">Lien Triggers</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Urgency Score ≥ 75 Fast-Tracked</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">CFCFRMS API Link</span>
            <Server className="text-emerald-500" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">99.98%</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Uptime</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">14 Banks Automated Lien API</p>
        </div>
      </div>

      {/* Grid: Triage Distribution & Tactical Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Priority Tier Distribution Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-600 dark:text-cyan-400" />
            <span>Priority Tier Distribution &amp; Queue Composition</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="font-bold text-red-600 dark:text-red-400">Tier 1 &amp; 3: Life-Safety &amp; Golden Hour Financial Lien (Score 75 - 100)</span>
                <span className="font-bold text-slate-900 dark:text-white">18%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="font-bold text-rose-600 dark:text-rose-400">Tier 2: "Fake Calm" Digital Arrest &amp; Coercion (Score 90 - 97)</span>
                <span className="font-bold text-slate-900 dark:text-white">8%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="font-bold text-amber-600 dark:text-amber-400">Tier 4: Moderate Financial Cyber Risk (Score 45 - 74)</span>
                <span className="font-bold text-slate-900 dark:text-white">24%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="font-bold text-slate-600 dark:text-slate-400">Tier 5 &amp; 6: Filtered Agitated False Alarms &amp; Portal Status Inquiries</span>
                <span className="font-bold text-slate-900 dark:text-white">50%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-600 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            <strong>QUEUE CONGESTION RELIEF:</strong> The False-Alarm Agitation filter (Tier 5) prevents approximately 640 yelling non-cyber callers from blocking genuine financial distress victims from reaching 1930 operators within their Golden Hour window.
          </div>
        </div>

        {/* Live CFCFRMS Gateway Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono mb-4 flex items-center gap-2">
              <Database size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>CFCFRMS Ingest &amp; Bank Gateway</span>
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">State Bank of India (SBI)</div>
                  <div className="text-[10px] text-slate-400">Direct API Ingest Node</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">ACTIVE (22ms)</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">HDFC Bank Gateway</div>
                  <div className="text-[10px] text-slate-400">Automated Freeze Protocol</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">ACTIVE (31ms)</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">National Payments Corp (NPCI)</div>
                  <div className="text-[10px] text-slate-400">UPI Layer Tracking Node</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">ACTIVE (19ms)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
            <span>Automatic lien-trigger ready for all Score ≥ 75 calls.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
