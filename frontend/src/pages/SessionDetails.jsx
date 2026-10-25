import React from 'react';
import { FileText, Clock, User, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function SessionDetails() {
  const { activeCall } = useTriageState();

  return (
    <div className="flex flex-col w-full gap-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Session Investigation Details</h1>
          <p className="text-xs text-slate-400 mt-1">Deep-dive acoustic telemetry, transcript entity extraction, and evidentiary record</p>
        </div>
        <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400">
          SESSION AUDIT LOG
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col gap-1 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Session Identifier</span>
            <span className="font-mono text-sm font-bold text-white">{activeCall.caller_id}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Urgency Score</span>
            <span className={`font-mono text-xl font-black ${
              activeCall.urgency_score >= 75 ? 'text-red-400' :
              activeCall.urgency_score >= 45 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {activeCall.urgency_score} / 100
            </span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Peak Distress Window</span>
            <span className="font-mono text-sm font-bold text-cyan-300">{activeCall.peak_window_timestamp}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Emergency Protocol</span>
            <span className={`font-mono text-sm font-bold ${activeCall.emergency_escalation ? 'text-amber-400' : 'text-slate-400'}`}>
              {activeCall.emergency_escalation ? 'ACTIVE (Dial-112/CFCFRMS)' : 'STANDARD'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg mb-6">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-2">Transcript &amp; Threat Lexical Entities</h3>
          <p className="text-sm text-slate-200 italic mb-3">"{activeCall.transcript}"</p>
          <div className="flex flex-wrap gap-2">
            {activeCall.matched_keywords && activeCall.matched_keywords.length > 0 ? (
              activeCall.matched_keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-red-950 border border-red-600 text-red-300 text-xs font-mono rounded">
                  ENTITY: {kw.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="text-xs font-mono text-slate-500">No high-risk entities detected.</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-1">Triage Protocol Directive</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{activeCall.triage_directive}</p>
        </div>
      </div>
    </div>
  );
}
