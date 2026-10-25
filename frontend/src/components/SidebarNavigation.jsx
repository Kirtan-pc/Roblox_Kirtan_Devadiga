import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Radio, ListFilter, BarChart2, HeartPulse, ShieldCheck
} from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function SidebarNavigation() {
  const { queue } = useTriageState();

  const navigationItems = [
    { name: '1930 Console', path: '/', icon: Radio, badge: 'LIVE' },
    { name: 'Priority Queue', path: '/queue', icon: ListFilter, count: queue.length },
    { name: 'Operations Overview', path: '/operations', icon: BarChart2 },
    { name: 'System Health', path: '/health', icon: HeartPulse },
    { name: 'Audit & Privacy', path: '/audit', icon: ShieldCheck }
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 flex flex-col z-50 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-24 py-3 flex items-center px-4 border-b border-slate-800 bg-slate-950/95 gap-3.5">
        <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-xl shadow-cyan-950/70 ring-2 ring-cyan-400 shrink-0">
          <img src="/echo-logo.png" alt="ECHO Official Emblem" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-black text-2xl tracking-wider text-white font-mono leading-none">
            ECHO
          </h1>
          <p className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mt-1.5">
            1930 CYBER TRIAGE
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
          CONSOLE MODULES
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group
                ${isActive 
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-cyan-400 group-hover:text-cyan-300" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>ECHO / CFCFRMS Ingest Active</span>
        </div>
      </div>
    </aside>
  );
}
