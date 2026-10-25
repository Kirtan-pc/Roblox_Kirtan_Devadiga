import React from 'react';
import { ShieldCheck, FileText, Lock, Scale, AlertCircle, Database } from 'lucide-react';

export default function AuditPrivacy() {
  return (
    <div className="flex flex-col w-full gap-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Audit Trail, Privacy &amp; Legal Guardrails</h1>
          <p className="text-xs text-slate-400 mt-1">Responsible AI framework, non-retention policy, and statutory compliance under Bharatiya Nyaya Sanhita</p>
        </div>
        <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400">
          I4C COMPLIANCE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-cyan-400">
            <Scale size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Responsible AI &amp; Evidentiary Disclaimer</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Acoustic paralinguistic scores (Distress, Fear, Anger, Nervousness) and computed Urgency Indices are strictly indicative triage signals designed to assist helpline officers in prioritizing assistance during the critical Golden Hour. 
          </p>
          <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400 font-mono leading-relaxed">
            SECTION NOTE: Algorithmic triage predictions do NOT constitute forensic evidence of caller honesty, deception, criminal intent, or legal guilt. All lien freezing actions must be corroborated by human officer review.
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <Database size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Transient Audio Processing &amp; Zero Retention</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Incoming telephony audio streams are processed transiently in a 3-second FIFO ring buffer stored purely in volatile RAM (Random Access Memory).
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> No unencrypted biometric voiceprints stored to disk.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Real-time sliding window extracts mathematical biomarkers and discards raw buffer.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> DPDP Act 2023 &amp; IT Act 2000 Section 43A Compliant.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
