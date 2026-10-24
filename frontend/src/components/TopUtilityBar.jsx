import React from 'react'
import { Search, Bell, User, ChevronRight, Clock } from 'lucide-react'

const TopUtilityBar = () => {
  return (
    <header className="fixed top-0 left-72 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-xl gap-space-lg">
      <div className="flex items-center gap-space-lg flex-1">
        <div className="hidden xl:flex items-center gap-space-xs text-outline font-body-sm text-body-sm">
          <span className="hover:text-on-surface cursor-pointer">Investigation</span>
          <ChevronRight size={14} />
          <span className="text-on-surface font-semibold">Console</span>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" size={18} />
          <input 
            className="w-full h-8 pl-8 pr-space-md bg-surface-container-low rounded text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary" 
            placeholder="Search session ID, case ref (e.g. SV-2026-00418)..." 
            type="text" 
          />
        </div>
      </div>
      <div className="hidden 2xl:flex items-center px-space-md py-1 bg-surface-container-low rounded text-center">
        <span className="font-label-caps text-label-caps text-on-surface-variant">AI-ASSISTED TRIAGE — INDICATIVE SIGNALS ONLY. REQUIRES AUTHORIZED HUMAN REVIEW.</span>
      </div>
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded text-outline font-code-sm text-code-sm">
          <Clock size={16} />
          <span>14:32:08 UTC</span>
        </div>
        <button aria-label="Notifications" className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
          <Bell size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="text-on-primary" size={18} />
        </div>
      </div>
    </header>
  )
}

export default TopUtilityBar
