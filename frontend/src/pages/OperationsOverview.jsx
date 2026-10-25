import React from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle, Server, ShieldAlert } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function OperationsOverview() {
  const { activeCall, queue } = useTriageState();

  const criticalCount = queue.filter(item => item.urgency_score >= 75).length;
  const elevatedCount = queue.filter(item => item.urgency_score >= 45 && item.urgency_score < 75).length;
  const standardCount = queue.filter(item => item.urgency_score < 45).length;

  return (
    <div className="flex flex-col w-full gap-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Operations Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time operational metrics and 1930 triage volume telemetry</p>
        </div>
        <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400">
          SYSTEM ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Queue Depth</span>
            <Activity className="text-cyan-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">{queue.length}</span>
            <span className="text-xs font-mono text-emerald-400">Sessions</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Telephony ingest buffer</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Critical Priority</span>
            <AlertTriangle className="text-red-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-red-400">{criticalCount}</span>
            <span className="text-xs font-mono text-red-300">Fast-Track</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Score &ge; 75 (Golden Hour / Life-Safety)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Elevated Priority</span>
            <Clock className="text-amber-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-400">{elevatedCount}</span>
            <span className="text-xs font-mono text-amber-300">Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Score 45 – 74</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Standard / Low</span>
            <CheckCircle className="text-cyan-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-cyan-400">{standardCount}</span>
            <span className="text-xs font-mono text-slate-400">Routine</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Filtered / Baseline inquiries</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <ShieldAlert size={16} className="text-cyan-400" />
          Active Telephony Ingress Feed
        </h3>
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <div className="font-mono text-xs text-slate-400">LATEST TRIAGE SESSION:</div>
            <div className="font-bold text-white text-sm font-mono mt-0.5">{activeCall.caller_id}</div>
            <div className="text-xs text-slate-300 mt-1 italic">"{activeCall.transcript}"</div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-black font-mono ${
              activeCall.urgency_score >= 75 ? 'text-red-400' :
              activeCall.urgency_score >= 45 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {activeCall.urgency_score}
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">INDEX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
