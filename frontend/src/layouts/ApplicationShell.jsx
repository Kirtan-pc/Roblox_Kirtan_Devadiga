import React from 'react'
import SidebarNavigation from '../components/SidebarNavigation'
import TopUtilityBar from '../components/TopUtilityBar'

const ApplicationShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface">
      <SidebarNavigation />
      <div className="pl-72">
        <TopUtilityBar />
        <main className="w-full pt-14 bg-surface min-h-screen px-space-xl py-space-lg">
          {children}
        </main>
      </div>
    </div>
  )
}

export default ApplicationShell
