import React, { useState } from 'react';
import { Filter, Search, ArrowUpDown, PhoneCall, ShieldAlert } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function SupervisorTriageQueue() {
  const { queue } = useTriageState();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredQueue = queue.filter(item => {
    if (search && !item.caller_id.toLowerCase().includes(search.toLowerCase()) && !item.summary.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'critical') return item.urgency_score >= 75;
    if (filter === 'elevated') return item.urgency_score >= 45 && item.urgency_score < 75;
    if (filter === 'standard') return item.urgency_score < 45;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Supervisor Triage Queue</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time dynamic priority queue auto-sorted by urgency score</p>
        </div>
        <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          LIVE QUEUE DEPTH: {queue.length} SESSIONS
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-500" 
              placeholder="Search by caller ID or summary..." 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Filter className="text-slate-400 mr-1" size={16} />
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded border transition ${filter === 'all' ? 'bg-cyan-950 border-cyan-500 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              All ({queue.length})
            </button>
            <button 
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded border transition ${filter === 'critical' ? 'bg-red-950 border-red-500 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              Critical ({queue.filter(i => i.urgency_score >= 75).length})
            </button>
            <button 
              onClick={() => setFilter('elevated')}
              className={`px-3 py-1 rounded border transition ${filter === 'elevated' ? 'bg-amber-950 border-amber-500 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              Elevated ({queue.filter(i => i.urgency_score >= 45 && i.urgency_score < 75).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Priority Rank</th>
                <th className="py-2.5 px-3">Caller Reference</th>
                <th className="py-2.5 px-3">Priority Classification</th>
                <th className="py-2.5 px-3">Incident Summary</th>
                <th className="py-2.5 px-3 text-right">Urgency Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQueue.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-950/50 transition">
                  <td className="py-3 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      idx === 0 ? 'bg-red-600 text-white' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white font-mono">{item.caller_id}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.urgency_score >= 75 ? 'bg-red-950 border border-red-700 text-red-300' :
                      item.urgency_score >= 45 ? 'bg-amber-950 border border-amber-700 text-amber-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {item.priority_tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{item.summary}</td>
                  <td className="py-3 px-3 text-right font-mono font-black text-lg">
                    <span className={item.urgency_score >= 75 ? 'text-red-400' : item.urgency_score >= 45 ? 'text-amber-300' : 'text-cyan-400'}>
                      {item.urgency_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
