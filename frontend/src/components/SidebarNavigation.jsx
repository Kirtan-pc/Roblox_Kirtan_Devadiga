import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Radio, ListFilter, Activity, BarChart2, FileText, 
  HeartPulse, ShieldCheck, ChevronRight
} from 'lucide-react';

const navigationItems = [
  { name: '1930 Live Console', path: '/', icon: Radio, badge: 'LIVE' },
  { name: 'Dynamic Priority Queue', path: '/queue', icon: ListFilter, count: 3 },
  { name: 'Forensic Workbench', path: '/workbench', icon: Activity },
  { name: 'Operations Overview', path: '/operations', icon: BarChart2 },
  { name: 'Session Details', path: '/sessions', icon: FileText },
  { name: 'System Health', path: '/health', icon: HeartPulse },
  { name: 'Audit & Privacy', path: '/audit', icon: ShieldCheck }
];

export default function SidebarNavigation() {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-50">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-slate-950/80 gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/50">
          <Radio size={18} />
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-wider text-white font-mono flex items-center gap-1.5">
            ECHO <span className="text-cyan-400">// SENTINEL</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-400">1930 CYBER TRIAGE DESK</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          TACTICAL MODULES
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group
                ${isActive 
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-cyan-400/80 group-hover:text-cyan-300" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
              {item.count && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>ECHO / CFCFRMS Ingest Active</span>
        </div>
      </div>
    </aside>
  );
}
