import React from 'react';
import SidebarNavigation from '../components/SidebarNavigation';
import TopUtilityBar from '../components/TopUtilityBar';

const ApplicationShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarNavigation />
      <div className="pl-64">
        <TopUtilityBar />
        <main className="w-full pt-16 min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ApplicationShell;
