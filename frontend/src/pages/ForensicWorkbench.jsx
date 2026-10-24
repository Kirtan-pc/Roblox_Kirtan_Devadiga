import React from 'react'
import { Play, Pause, SkipBack, SkipForward, FileText, BarChart3 } from 'lucide-react'

const ForensicWorkbench = () => {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Forensic Workbench</h1>
          <p className="font-body-md text-body-md text-outline mt-1">Post-call recorded audio analysis and review</p>
        </div>
        <span className="px-space-sm py-1 rounded bg-surface-container-low font-code-sm text-code-sm text-outline">Demo Mode</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">SV-2026-00415 - Recorded Session</h2>
                <p className="font-body-sm text-body-sm text-outline mt-1">Duration: 06:42 | Uploaded: 14:10:22 UTC</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded p-space-md mb-space-md">
              <svg className="w-full h-32" viewBox="0 0 800 100" preserveAspectRatio="none">
                <rect height="40" width="4" x="10" y="30" fill="#006781" opacity="0.6" rx="1"></rect>
                <rect height="60" width="4" x="18" y="20" fill="#006781" opacity="0.6" rx="1"></rect>
                <rect height="35" width="4" x="26" y="32" fill="#006781" opacity="0.6" rx="1"></rect>
                <rect height="70" width="4" x="34" y="15" fill="#ba1a1a" opacity="0.8" rx="1"></rect>
                <rect height="65" width="4" x="42" y="17" fill="#ba1a1a" opacity="0.8" rx="1"></rect>
                <rect height="45" width="4" x="50" y="27" fill="#006781" opacity="0.6" rx="1"></rect>
                <rect height="55" width="4" x="60" y="22" fill="#832f00" opacity="0.7" rx="1"></rect>
                <rect height="50" width="4" x="68" y="25" fill="#006781" opacity="0.6" rx="1"></rect>
              </svg>
              <div className="flex justify-between items-center mt-space-sm font-code-sm text-code-sm text-outline">
                <span>00:00</span>
                <span>01:00</span>
                <span>02:00</span>
                <span>03:00</span>
                <span>04:00</span>
                <span>05:00</span>
                <span>06:42</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-space-md">
              <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest">
                <SkipBack size={18} />
              </button>
              <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary">
                <Play size={20} />
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest">
                <SkipForward size={18} />
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <div className="flex items-center gap-space-xs mb-space-md">
              <FileText className="text-primary" size={18} />
              <h2 className="font-headline-md text-headline-md text-on-surface">Transcript with Timestamps</h2>
            </div>
            <div className="flex flex-col gap-space-sm max-h-[400px] overflow-y-auto">
              <div className="flex gap-space-sm p-space-sm rounded hover:bg-surface-container-low transition-colors">
                <span className="font-code-sm text-code-sm text-outline w-12 flex-shrink-0">00:12</span>
                <div className="flex-1">
                  <span className="font-label-caps text-label-caps text-secondary">CALLER</span>
                  <p className="font-transcript-primary text-transcript-primary text-on-surface mt-1">I received a call saying my Aadhaar is blocked...</p>
                </div>
              </div>
              <div className="flex gap-space-sm p-space-sm rounded hover:bg-surface-container-low transition-colors">
                <span className="font-code-sm text-code-sm text-outline w-12 flex-shrink-0">00:45</span>
                <div className="flex-1">
                  <span className="font-label-caps text-label-caps text-primary">OPERATOR</span>
                  <p className="font-transcript-primary text-transcript-primary text-on-surface mt-1">Please verify - this could be a phishing attempt. Never share OTPs or banking details.</p>
                </div>
              </div>
              <div className="flex gap-space-sm p-space-sm rounded hover:bg-surface-container-low transition-colors">
                <span className="font-code-sm text-code-sm text-outline w-12 flex-shrink-0">02:18</span>
                <div className="flex-1">
                  <span className="font-label-caps text-label-caps text-secondary">CALLER</span>
                  <p className="font-transcript-primary text-transcript-primary text-on-surface mt-1">They said digital arrest is issued and I need to transfer money immediately...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <div className="flex items-center gap-space-xs mb-space-md">
              <BarChart3 className="text-primary" size={18} />
              <h2 className="font-headline-md text-headline-md text-on-surface">Emotion Timeline</h2>
            </div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
                <span className="font-body-sm text-body-sm text-on-surface">Distress Peak</span>
                <span className="font-code-sm text-code-sm text-error">02:18 - 92%</span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
                <span className="font-body-sm text-body-sm text-on-surface">Fear Peak</span>
                <span className="font-code-sm text-code-sm text-error">02:25 - 87%</span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
                <span className="font-body-sm text-body-sm text-on-surface">Nervousness</span>
                <span className="font-code-sm text-code-sm text-tertiary">01:30 - 76%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-md">Analyst Notes</h2>
            <textarea 
              className="w-full p-2 bg-surface-container-low rounded text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary resize-none mb-space-sm" 
              placeholder="Add forensic notes..." 
              rows="4"
            ></textarea>
            <button className="w-full h-8 rounded bg-primary-container text-on-primary hover:bg-primary font-body-sm text-body-sm transition-colors">
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForensicWorkbench
