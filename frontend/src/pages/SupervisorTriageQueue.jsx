import React, { useState } from 'react'
import { Filter, Search, ArrowUpDown } from 'lucide-react'

const SupervisorTriageQueue = () => {
  const [filter, setFilter] = useState('all')
  
  const sessions = [
    { id: 'SV-2026-00418', status: 'LIVE', priority: 'CRITICAL', urgency: 88, caller: 'Female, ~48y', duration: '04:21', assigned: 'Unassigned', time: '14:28:42' },
    { id: 'SV-2026-00419', status: 'LIVE', priority: 'CRITICAL', urgency: 85, caller: 'Male, ~35y', duration: '02:14', assigned: 'Unassigned', time: '14:22:05' },
    { id: 'SV-2026-00420', status: 'REVIEWING', priority: 'ELEVATED', urgency: 72, caller: 'Female, ~42y', duration: '06:18', assigned: 'Officer D. Varma', time: '14:15:33' },
    { id: 'SV-2026-00421', status: 'PENDING', priority: 'ELEVATED', urgency: 68, caller: 'Male, ~29y', duration: '03:45', assigned: 'Unassigned', time: '14:10:21' },
    { id: 'SV-2026-00422', status: 'PENDING', priority: 'NORMAL', urgency: 38, caller: 'Female, ~31y', duration: '05:02', assigned: 'Unassigned', time: '13:58:14' },
  ]

  const getPriorityColor = (priority) => {
    if (priority === 'CRITICAL') return 'bg-error-container text-on-error-container'
    if (priority === 'ELEVATED') return 'bg-surface-container-highest text-tertiary'
    return 'bg-surface-container-high text-on-surface-variant'
  }

  const getStatusColor = (status) => {
    if (status === 'LIVE') return 'bg-error text-on-error'
    if (status === 'REVIEWING') return 'bg-primary-container text-on-primary'
    return 'bg-surface-container-high text-on-surface-variant'
  }

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Supervisor Triage Queue</h1>
          <p className="font-body-md text-body-md text-outline mt-1">Prioritized sessions requiring human review</p>
        </div>
        <span className="px-space-sm py-1 rounded bg-surface-container-low font-code-sm text-code-sm text-outline">Demo Data</span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
        <div className="flex flex-wrap items-center gap-space-md mb-space-md">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              className="w-full h-8 pl-8 pr-space-md bg-surface-container-low rounded text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary" 
              placeholder="Search by session ID..." 
              type="text" 
            />
          </div>
          <div className="flex items-center gap-space-xs">
            <Filter className="text-outline" size={16} />
            <button 
              onClick={() => setFilter('all')}
              className={`px-space-sm py-1 rounded font-body-sm text-body-sm transition-colors ${filter === 'all' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('critical')}
              className={`px-space-sm py-1 rounded font-body-sm text-body-sm transition-colors ${filter === 'critical' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              Critical
            </button>
            <button 
              onClick={() => setFilter('elevated')}
              className={`px-space-sm py-1 rounded font-body-sm text-body-sm transition-colors ${filter === 'elevated' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              Elevated
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-highest">
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">
                  <div className="flex items-center gap-1">
                    Session ID
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Status</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Priority</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Urgency</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Caller</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Duration</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Assigned</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline">Time</th>
                <th className="py-2 px-space-md font-label-caps text-label-caps uppercase text-outline text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-md">
                    <span className="font-code-sm text-code-sm font-semibold text-on-surface">{session.id}</span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className={`px-space-xs py-0.5 rounded font-label-caps text-label-caps ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className={`px-space-xs py-0.5 rounded font-label-caps text-label-caps ${getPriorityColor(session.priority)}`}>
                      {session.priority}
                    </span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">{session.urgency}/100</span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-body-sm text-body-sm text-on-surface">{session.caller}</span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-code-sm text-code-sm text-outline">{session.duration}</span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{session.assigned}</span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-code-sm text-code-sm text-outline">{session.time}</span>
                  </td>
                  <td className="py-3 px-space-md text-right">
                    <button className="px-space-sm py-1 rounded bg-primary-container text-on-primary hover:bg-primary font-body-sm text-body-sm transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SupervisorTriageQueue
