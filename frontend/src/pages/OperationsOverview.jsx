import React from 'react'
import { Activity, Clock, AlertTriangle, CheckCircle, Server } from 'lucide-react'

const OperationsOverview = () => {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Operations Overview</h1>
          <p className="font-body-md text-body-md text-outline mt-1">Real-time operational metrics and service status</p>
        </div>
        <span className="px-space-sm py-1 rounded bg-surface-container-low font-code-sm text-code-sm text-outline">Last updated: 14:32:08 UTC</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Active Sessions</span>
            <Activity className="text-primary" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface">12</span>
            <span className="font-body-sm text-body-sm text-[#247A52]">+3 from last hour</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Critical Priority</span>
            <AlertTriangle className="text-error" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-error">4</span>
            <span className="font-body-sm text-body-sm text-outline">Require immediate review</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Pending Triage</span>
            <Clock className="text-tertiary-container" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface">14</span>
            <span className="font-body-sm text-body-sm text-outline">In queue</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Reviewed Today</span>
            <CheckCircle className="text-[#247A52]" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface">87</span>
            <span className="font-body-sm text-body-sm text-[#247A52]">+12% vs yesterday</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h2>
            <span className="font-code-sm text-code-sm text-outline">Demo Data</span>
          </div>
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low">
              <AlertTriangle className="text-error mt-0.5" size={16} />
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Session SV-2026-00418 escalated</p>
                <p className="font-body-sm text-body-sm text-outline">Urgency score crossed critical threshold (88/100)</p>
                <p className="font-code-sm text-code-sm text-outline mt-1">14:28:42 UTC</p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low">
              <CheckCircle className="text-[#247A52] mt-0.5" size={16} />
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Session SV-2026-00415 acknowledged</p>
                <p className="font-body-sm text-body-sm text-outline">Reviewed by Officer D. Varma</p>
                <p className="font-code-sm text-code-sm text-outline mt-1">14:25:18 UTC</p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low">
              <Activity className="text-primary mt-0.5" size={16} />
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface font-medium">New session SV-2026-00419 initiated</p>
                <p className="font-body-sm text-body-sm text-outline">Live streaming started</p>
                <p className="font-code-sm text-code-sm text-outline mt-1">14:22:05 UTC</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Service Status</h2>
            <Server className="text-outline" size={18} />
          </div>
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
                <span className="font-body-sm text-body-sm text-on-surface">Inference API</span>
              </div>
              <span className="font-code-sm text-code-sm text-[#247A52]">Operational</span>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
                <span className="font-body-sm text-body-sm text-on-surface">WebSocket Stream</span>
              </div>
              <span className="font-code-sm text-code-sm text-[#247A52]">Connected (18ms)</span>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
                <span className="font-body-sm text-body-sm text-on-surface">ASR Engine</span>
              </div>
              <span className="font-code-sm text-code-sm text-[#247A52]">Operational</span>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-outline"></span>
                <span className="font-body-sm text-body-sm text-on-surface">Audio Storage</span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">Not configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OperationsOverview
