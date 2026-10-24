import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ApplicationShell from './layouts/ApplicationShell'
import OperationsOverview from './pages/OperationsOverview'
import LiveOperatorConsole from './pages/LiveOperatorConsole'
import SupervisorTriageQueue from './pages/SupervisorTriageQueue'
import ForensicWorkbench from './pages/ForensicWorkbench'
import SessionDetails from './pages/SessionDetails'
import SystemHealth from './pages/SystemHealth'
import AuditPrivacy from './pages/AuditPrivacy'

function App() {
  return (
    <Router>
      <ApplicationShell>
        <Routes>
          <Route path="/" element={<Navigate to="/live-sessions" replace />} />
          <Route path="/operations-overview" element={<OperationsOverview />} />
          <Route path="/live-sessions" element={<LiveOperatorConsole />} />
          <Route path="/triage-queue" element={<SupervisorTriageQueue />} />
          <Route path="/forensic-workbench" element={<ForensicWorkbench />} />
          <Route path="/session-details" element={<SessionDetails />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="/audit-and-privacy" element={<AuditPrivacy />} />
        </Routes>
      </ApplicationShell>
    </Router>
  )
}

export default App
