import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Grid3X3, 
  Radio, 
  Filter, 
  SlidersHorizontal, 
  FileText, 
  Server, 
  ShieldCheck,
  AudioLines,
  Badge
} from 'lucide-react'

const navItems = [
  { path: '/operations-overview', label: 'Operations Overview', icon: Grid3X3 },
  { path: '/live-sessions', label: 'Live Sessions', icon: Radio, hasPulse: true },
  { path: '/triage-queue', label: 'Triage Queue', icon: Filter, badge: '14' },
  { path: '/forensic-workbench', label: 'Forensic Workbench', icon: SlidersHorizontal },
  { path: '/session-details', label: 'Session Details', icon: FileText },
  { path: '/system-health', label: 'System Health', icon: Server },
  { path: '/audit-and-privacy', label: 'Audit & Privacy', icon: ShieldCheck },
]

const SidebarNavigation = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between">
      <div className="flex flex-col">
        <div className="h-14 px-space-lg flex flex-col justify-center bg-surface-container-lowest">
          <div className="flex items-center gap-space-xs">
            <AudioLines className="text-primary" size={20} />
            <span className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface">SENTINEL-VOICE</span>
          </div>
          <span className="font-label-caps text-label-caps uppercase text-outline">SPEECH INTELLIGENCE & CALL REVIEW</span>
        </div>
        <nav className="flex flex-col gap-space-xs px-space-sm pt-space-md">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-space-md py-space-sm rounded transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-headline-md'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <div className="flex items-center gap-space-md">
                  <Icon size={18} />
                  <span className="font-body-md text-body-md">{item.label}</span>
                </div>
                {item.hasPulse && (
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                )}
                {item.badge && (
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-on-surface font-code-sm text-code-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest">
        <div className="flex items-center justify-between px-space-sm py-1 rounded bg-surface-container-low">
          <span className="font-label-caps text-label-caps uppercase text-outline">ENV</span>
          <span className="font-code-sm text-code-sm text-on-surface-variant uppercase">DEMO / SIMULATION</span>
        </div>
        <div className="flex items-center justify-between pt-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center">
              <Badge className="text-primary" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-body-sm font-semibold text-on-surface leading-none">Officer D. Varma</span>
              <span className="font-body-sm text-code-sm text-outline leading-tight">Duty Supervisor</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-xs px-space-xs">
          <span className="w-2 h-2 rounded-full bg-[#247A52]"></span>
          <span className="font-code-sm text-code-sm text-on-surface-variant">WS ACTIVE 18ms</span>
        </div>
      </div>
    </aside>
  )
}

export default SidebarNavigation
