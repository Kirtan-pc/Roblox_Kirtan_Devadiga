import React from 'react'
import { Server, Activity, AlertTriangle, CheckCircle } from 'lucide-react'

const SystemHealth = () => {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">System Health</h1>
          <p className="font-body-md text-body-md text-outline mt-1">Service telemetry and infrastructure status</p>
        </div>
        <span className="px-space-sm py-1 rounded bg-surface-container-low font-code-sm text-code-sm text-outline">Demo/Monitoring Data</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">API Latency</span>
            <Activity className="text-primary" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface">18</span>
            <span className="font-body-md text-body-md text-outline">ms</span>
          </div>
          <p className="font-body-sm text-body-sm text-[#247A52] mt-1">Within SLA</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Queue Depth</span>
            <Server className="text-primary" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface">14</span>
            <span className="font-body-md text-body-md text-outline">sessions</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Error Rate</span>
            <AlertTriangle className="text-[#247A52]" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface">0.02</span>
            <span className="font-body-md text-body-md text-outline">%</span>
          </div>
          <p className="font-body-sm text-body-sm text-[#247A52] mt-1">Healthy</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline">Model Version</span>
            <CheckCircle className="text-primary" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">v4.2.1</span>
          </div>
          <p className="font-body-sm text-body-sm text-outline mt-1">Bi-LSTM + Fusion</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-space-md">Service Components</h2>
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">FastAPI Inference Engine</p>
                <p className="font-code-sm text-code-sm text-outline">Port 8000</p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-[#247A52]">Operational</span>
          </div>
          <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">WebSocket Gateway</p>
                <p className="font-code-sm text-code-sm text-outline">ws://localhost:8000/ws</p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-[#247A52]">Connected</span>
          </div>
          <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Wav2Vec 2.0 Model</p>
                <p className="font-code-sm text-code-sm text-outline">Loaded in memory</p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-[#247A52]">Ready</span>
          </div>
          <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-outline"></span>
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Audio Storage Backend</p>
                <p className="font-code-sm text-code-sm text-outline">Not configured</p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-outline">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth
