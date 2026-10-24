import React from 'react'
import { ShieldCheck, FileText, Lock } from 'lucide-react'

const AuditPrivacy = () => {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Audit & Privacy</h1>
          <p className="font-body-md text-body-md text-outline mt-1">Access logs, retention, and privacy controls</p>
        </div>
        <span className="px-space-sm py-1 rounded bg-surface-container-low font-code-sm text-code-sm text-outline">Compliance View</span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
        <div className="flex items-center gap-space-xs mb-space-md">
          <FileText className="text-primary" size={18} />
          <h2 className="font-headline-md text-headline-md text-on-surface">Audit Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-highest">
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Timestamp</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">User</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Action</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Session</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2 px-space-md font-code-sm text-code-sm text-outline">2026-10-24 14:28:42 UTC</td>
                <td className="py-2 px-space-md font-body-sm text-body-sm text-on-surface">Officer D. Varma</td>
                <td className="py-2 px-space-md font-body-sm text-body-sm text-on-surface">ACKNOWLEDGE_REVIEW</td>
                <td className="py-2 px-space-md font-code-sm text-code-sm text-on-surface">SV-2026-00418</td>
                <td className="py-2 px-space-md font-code-sm text-code-sm text-outline">10.10.5.42</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2 px-space-md font-code-sm text-code-sm text-outline">2026-10-24 14:25:18 UTC</td>
                <td className="py-2 px-space-md font-body-sm text-body-sm text-on-surface">Officer D. Varma</td>
                <td className="py-2 px-space-md font-body-sm text-body-sm text-on-surface">VIEW_SESSION</td>
                <td className="py-2 px-space-md font-code-sm text-code-sm text-on-surface">SV-2026-00415</td>
                <td className="py-2 px-space-md font-code-sm text-code-sm text-outline">10.10.5.42</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2 px-space-md font-code-sm text-code-sm text-outline">2026-10-24 14:22:05 UTC</td>
                <td className="py-2 px-space-md font-body-sm text-body-sm text-on-surface">System</td>
                <td className="py-2 px-space-md font-body-sm text-body-sm text-on-surface">SESSION_CREATED</td>
                <td className="py-2 px-space-md font-code-sm text-code-sm text-on-surface">SV-2026-00419</td>
                <td className="py-2 px-space-md font-code-sm text-code-sm text-outline">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center gap-space-xs mb-space-md">
            <Lock className="text-primary" size={18} />
            <h2 className="font-headline-md text-headline-md text-on-surface">Privacy Controls</h2>
          </div>
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Audio Retention</p>
                <p className="font-body-sm text-body-sm text-outline">Policy-controlled (not locally cached)</p>
              </div>
              <span className="font-label-caps text-label-caps text-outline">CONFIGURED BY POLICY</span>
            </div>
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Transcript Redaction</p>
                <p className="font-body-sm text-body-sm text-outline">Available via forensic tools</p>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface-variant">AVAILABLE</span>
            </div>
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Access Restrictions</p>
                <p className="font-body-sm text-body-sm text-outline">Role-based access control</p>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-[#247A52]/10 text-[#247A52] font-label-caps text-label-caps">ENFORCED</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <div className="flex items-center gap-space-xs mb-space-md">
            <ShieldCheck className="text-primary" size={18} />
            <h2 className="font-headline-md text-headline-md text-on-surface">Compliance Notice</h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface leading-relaxed mb-space-sm">
            This system is designed for authorized law enforcement use only. All interactions are logged for audit purposes. 
            Emotion predictions are model estimates for triage assistance only and do not constitute legal evidence of deception, guilt, or truthfulness.
          </p>
          <p className="font-body-sm text-body-sm text-outline leading-relaxed">
            Data handling complies with applicable policies. No raw audio is persisted in browser storage. All actions require proper authorization.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuditPrivacy
