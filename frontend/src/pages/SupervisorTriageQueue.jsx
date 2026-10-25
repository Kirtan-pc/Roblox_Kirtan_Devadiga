import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, ArrowUpDown, PhoneCall, ShieldAlert, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function SupervisorTriageQueue() {
  const { queue, updateTriage } = useTriageState();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const sortedQueue = [...queue].sort((a, b) => b.urgency_score - a.urgency_score);

  const filteredQueue = sortedQueue.filter(item => {
    if (search && !item.caller_id.toLowerCase().includes(search.toLowerCase()) && !item.summary.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'critical') return item.urgency_score >= 75;
    if (filter === 'elevated') return item.urgency_score >= 45 && item.urgency_score < 75;
    if (filter === 'standard') return item.urgency_score < 45;
    return true;
  });

  const handleSelectCall = (item) => {
    updateTriage({
      caller_id: item.caller_id,
      urgency_score: item.urgency_score,
      priority_tier: item.priority_tier,
      transcript: item.summary,
      triage_directive: `Loaded from Supervisor Priority Queue: ${item.priority_tier} - Caller ${item.caller_id}`,
      golden_hour_alert: item.urgency_score >= 75,
      emergency_escalation: item.urgency_score >= 85
    });
    navigate('/');
  };

  return (
    <div className="flex flex-col w-full gap-5 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
            1930 Priority Triage Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic priority queue auto-sorted descending by Late-Fusion Urgency Score. Click any call to inspect in 1930 Console.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-xs font-mono text-cyan-700 dark:text-cyan-300 font-bold">
            QUEUE DEPTH: {queue.length} SESSIONS
          </span>
        </div>
      </div>

      {/* Main Queue Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
        
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-cyan-500 shadow-inner" 
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
              className={`px-3 py-1.5 rounded-lg border font-bold transition shadow-sm ${
                filter === 'all' 
                  ? 'bg-cyan-600 text-white border-cyan-600' 
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({queue.length})
            </button>
            <button 
              onClick={() => setFilter('critical')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition shadow-sm ${
                filter === 'critical' 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Critical ({queue.filter(i => i.urgency_score >= 75).length})
            </button>
            <button 
              onClick={() => setFilter('elevated')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition shadow-sm ${
                filter === 'elevated' 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Elevated ({queue.filter(i => i.urgency_score >= 45 && i.urgency_score < 75).length})
            </button>
          </div>
        </div>

        {/* Dynamic Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Caller Reference</th>
                <th className="py-2.5 px-3">Classification &amp; Tier</th>
                <th className="py-2.5 px-3">Incident Summary</th>
                <th className="py-2.5 px-3 text-right">Urgency Index</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredQueue.map((item, idx) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleSelectCall(item)}
                  className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer transition group"
                >
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-black text-xs ${
                      idx === 0 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : item.urgency_score >= 75
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-300 dark:border-red-800'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-cyan-400'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {item.caller_id}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      item.urgency_score >= 75 ? 'bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300' :
                      item.urgency_score >= 45 ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.priority_tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300 text-xs max-w-md truncate">
                    {item.summary}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-lg">
                    <span className={item.urgency_score >= 75 ? 'text-red-600 dark:text-red-400' : item.urgency_score >= 45 ? 'text-amber-500' : 'text-cyan-600 dark:text-cyan-400'}>
                      {item.urgency_score}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 ml-auto transition shadow-sm">
                      <span>Inspect</span>
                      <ArrowRight size={13} />
                    </button>
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
