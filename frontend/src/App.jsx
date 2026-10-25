import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationShell from './layouts/ApplicationShell';
import LiveOperatorConsole from './pages/LiveOperatorConsole';
import SupervisorTriageQueue from './pages/SupervisorTriageQueue';
import OperationsOverview from './pages/OperationsOverview';
import SystemHealth from './pages/SystemHealth';
import AuditPrivacy from './pages/AuditPrivacy';

function App() {
  return (
    <Router>
      <ApplicationShell>
        <Routes>
          <Route path="/" element={<LiveOperatorConsole />} />
          <Route path="/console" element={<LiveOperatorConsole />} />
          <Route path="/live-sessions" element={<LiveOperatorConsole />} />
          
          <Route path="/queue" element={<SupervisorTriageQueue />} />
          <Route path="/triage-queue" element={<SupervisorTriageQueue />} />
          
          <Route path="/operations" element={<OperationsOverview />} />
          <Route path="/operations-overview" element={<OperationsOverview />} />
          
          <Route path="/health" element={<SystemHealth />} />
          <Route path="/system-health" element={<SystemHealth />} />
          
          <Route path="/audit" element={<AuditPrivacy />} />
          <Route path="/audit-and-privacy" element={<AuditPrivacy />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ApplicationShell>
    </Router>
  );
}

export default App;
