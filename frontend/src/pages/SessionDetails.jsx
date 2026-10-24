import React from 'react'
import { FileText, Clock, User, Activity } from 'lucide-react'

const SessionDetails = () => {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Session Details</h1>
          <p className="font-body-md text-body-md text-outline mt-1">Comprehensive session information and history</p>
        </div>
        <span className="px-space-sm py-1 rounded bg-surface-container-low font-code-sm text-code-sm text-outline">Demo Data</span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
        <div className="flex items-center gap-space-xs mb-space-md">
          <FileText className="text-primary" size={18} />
          <h2 className="font-headline-md text-headline-md text-on-surface">Session Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Session ID</span>
            <span className="font-code-sm text-code-sm font-semibold text-on-surface">SV-2026-00418</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Status</span>
            <span className="px-space-xs py-0.5 rounded bg-error text-on-error font-label-caps text-label-caps w-fit">LIVE</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Start Time</span>
            <span className="font-code-sm text-code-sm text-on-surface">2026-10-24 14:28:08 UTC</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Duration</span>
            <span className="font-code-sm text-code-sm text-on-surface">04:21.49</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Urgency Score</span>
            <span className="font-code-sm text-code-sm font-bold text-error">88/100</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Priority</span>
            <span className="font-body-sm text-body-sm text-on-surface">CRITICAL</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Assigned To</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Unassigned</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps uppercase text-outline">Audio Source</span>
            <span className="font-code-sm text-code-sm text-on-surface">SIP-GW-INBOUND#04</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center gap-space-xs mb-space-md">
            <User className="text-primary" size={18} />
            <h2 className="font-headline-md text-headline-md text-on-surface">Caller Information</h2>
          </div>
          <div className="flex flex-col gap-space-sm">
            <div className="flex justify-between p-space-sm bg-surface-container-low rounded">
              <span className="font-body-sm text-body-sm text-outline">Estimated Demographics</span>
              <span className="font-body-sm text-body-sm text-on-surface">Female, ~48 years (Demo)</span>
            </div>
            <div className="flex justify-between p-space-sm bg-surface-container-low rounded">
              <span className="font-body-sm text-body-sm text-outline">Location Cluster</span>
              <span className="font-body-sm text-body-sm text-on-surface">MH-Zone 4</span>
            </div>
            <div className="flex justify-between p-space-sm bg-surface-container-low rounded">
              <span className="font-body-sm text-body-sm text-outline">Route</span>
              <span className="font-body-sm text-body-sm text-on-surface">PSTN-Trunk-09</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center gap-space-xs mb-space-md">
            <Activity className="text-primary" size={18} />
            <h2 className="font-headline-md text-headline-md text-on-surface">Event History</h2>
          </div>
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded">
              <Clock className="text-outline mt-0.5" size={16} />
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface">Session initiated</p>
                <p className="font-code-sm text-code-sm text-outline">14:28:08 UTC</p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded">
              <Clock className="text-outline mt-0.5" size={16} />
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface">Analysis started</p>
                <p className="font-code-sm text-code-sm text-outline">14:28:09 UTC</p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded">
              <Clock className="text-error mt-0.5" size={16} />
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface">Urgency threshold exceeded</p>
                <p className="font-code-sm text-code-sm text-outline">14:28:42 UTC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionDetails
