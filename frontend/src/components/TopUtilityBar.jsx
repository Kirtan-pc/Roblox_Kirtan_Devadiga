import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, Clock, Radio, Sun, Moon } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function TopUtilityBar() {
  const { activeCall } = useTriageState();
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-40 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-cyan-400 font-extrabold uppercase tracking-wider">ECHO // SENTINEL-VOICE</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 font-bold">1930 HELPLINE NODE</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center px-3 py-1 bg-slate-950 border border-slate-800 rounded text-center">
        <span className="text-[11px] font-mono text-slate-400">
          ECHO VECNA VERSE &bull; RESPONSIBLE AI CYBERCRIME INTAKE ENGINE
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Light Mode / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-cyan-400" />}
          <span className="hidden sm:inline">{isDarkMode ? "LIGHT" : "DARK"}</span>
        </button>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded text-slate-300 font-mono text-xs">
          <Clock size={14} className="text-cyan-400" />
          <span>{timeStr}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-cyan-900 border border-cyan-700 flex items-center justify-center text-cyan-200 text-xs font-bold font-mono">
          1930
        </div>
      </div>
    </header>
  );
}
