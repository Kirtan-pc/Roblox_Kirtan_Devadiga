import React from 'react';
import { ShieldCheck, FileText, Lock, Scale, AlertCircle, Database, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AuditPrivacy() {
  return (
    <div className="flex flex-col w-full gap-5 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Audit Trail, Privacy &amp; Statutory Legal Guardrails
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statutory compliance under Digital Personal Data Protection (DPDP) Act 2023 and Bharatiya Sakshya Adhiniyam (BSA) 2023.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 font-mono text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
            <ShieldCheck size={16} />
            DPDP ACT 2023 COMPLIANT
          </span>
        </div>
      </div>

      {/* Compliance & Guardrail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Responsible AI & BSA Disclaimer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 mb-3 text-cyan-600 dark:text-cyan-400">
            <Scale size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Responsible AI &amp; Evidentiary Guardrail (BSA 2023)
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-3">
            Acoustic paralinguistic scores (Distress, Fear, Anger, Nervousness) and computed Urgency Scores (0–100) are strictly heuristic, machine-assisted triage signals to help human operators prioritize assistance during the critical Golden Hour.
          </p>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
            <strong className="text-slate-900 dark:text-white">STATUTORY NOTICE:</strong> Algorithmic triage predictions do NOT constitute forensic evidence of caller honesty, deception, criminal intent, or legal guilt under the Bharatiya Sakshya Adhiniyam (BSA) 2023. All financial bank lien triggers must be confirmed by human dispatchers.
          </div>
        </div>

        {/* Card 2: Transient RAM Processing & DPDP Act */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-600 dark:text-emerald-400">
            <Database size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Transient RAM Processing &amp; Zero Audio Retention
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-3">
            Incoming telephony voice streams are ingested into a 3-second FIFO ring buffer stored exclusively in volatile Random Access Memory (RAM).
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Zero persistent audio logging to disk: Raw audio buffers are purged immediately after acoustic biomarker extraction.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>No biometric voiceprint reconstruction possible from the low-dimensional emotion logits.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Full compliance with Digital Personal Data Protection Act 2023 &amp; IT Act 2000 Section 43A.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Audit Trail Verification */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 mb-3 text-purple-600 dark:text-purple-400">
            <Lock size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Cryptographic Audit Logging
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-3">
            Every dispatch priority classification is stamped with ISO-8601 millisecond timestamps and SHA-256 session digests to prevent tampering during supervisory reviews.
          </p>
          <div className="space-y-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <div>• SHA-256 Checksum Verification: <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span></div>
            <div>• Operator Barge-In Audit Log: <span className="text-emerald-600 dark:text-emerald-400 font-bold">IMMUTABLE</span></div>
            <div>• CFCFRMS Freeze API Telemetry: <span className="text-cyan-600 dark:text-cyan-400 font-bold">SYNCHRONIZED</span></div>
          </div>
        </div>

        {/* Card 4: Algorithmic Fairness & Bias Mitigation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 mb-3 text-amber-500">
            <ShieldAlert size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Algorithmic Fairness &amp; Regional Dialect Support
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-3">
            Acoustic paralinguistic tone analysis functions across Indian accents and dialects without bias against non-native English speakers.
          </p>
          <div className="space-y-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <div>• Hinglish &amp; Code-Switching ASR: <span className="text-emerald-600 dark:text-emerald-400 font-bold">en-IN NATIVE</span></div>
            <div>• Pitch Variance &amp; F0 Normalization: <span className="text-emerald-600 dark:text-emerald-400 font-bold">DYNAMIC ZERO-CROSSING</span></div>
            <div>• Agitation Filter: <span className="text-amber-500 font-bold">PROTECTS QUEUE AGAINST FALSE ALARMS</span></div>
          </div>
        </div>

      </div>

    </div>
  );
}
