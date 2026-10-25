import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, Clock, Radio, Sun, Moon } from 'lucide-react';
import { useTriageState } from '../store/triageStore';

export default function TopUtilityBar() {
  const { activeCall } = useTriageState();
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    const savedTheme = localStorage.getItem('sentinel_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sentinel_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sentinel_theme', 'light');
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
          <span className="text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-wider text-sm">ECHO</span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">1930 HELPLINE NODE</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center">
        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
          ECHO VECNA VERSE &bull; DUAL-STREAM ACOUSTIC PARALINGUISTIC TRIAGE ENGINE
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Light Mode / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-mono font-bold shadow-sm"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-cyan-600" />}
          <span>{isDarkMode ? "LIGHT MODE" : "DARK MODE"}</span>
        </button>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded text-slate-700 dark:text-slate-300 font-mono text-xs">
          <Clock size={14} className="text-cyan-600 dark:text-cyan-400" />
          <span>{timeStr}</span>
        </div>
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-cyan-400 shadow-md shadow-cyan-900/40 flex items-center justify-center shrink-0" title="ECHO // I4C 1930 Helpline Official Emblem">
            <img src="/echo-logo.png" alt="ECHO Official Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-mono text-sm font-black text-slate-900 dark:text-white leading-none">ECHO</span>
            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold leading-none mt-1">1930 NODE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
