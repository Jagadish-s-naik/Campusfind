import React from 'react';
import { Sparkles, Search, PlusCircle, LayoutDashboard, ShieldCheck, MapPin } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'browse' | 'matches' | 'hotspots';
  setActiveTab: (tab: 'dashboard' | 'browse' | 'matches' | 'hotspots') => void;
  onOpenReportModal: () => void;
  pendingMatchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  pendingMatchCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 bg-[#0b0f19]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                CampusFind <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-widest">Gemini AI</span>
              </span>
              <p className="text-xs text-slate-400 font-sans hidden sm:block">Smart Campus Lost & Found Platform</p>
            </div>
          </div>

          {/* Center Navigation Segment */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-glow font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'browse'
                  ? 'bg-amber-500 text-slate-950 shadow-glow font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse Database
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'matches'
                  ? 'bg-amber-500 text-slate-950 shadow-glow font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Match Inbox
              {pendingMatchCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-300 text-slate-950 animate-pulse">
                  {pendingMatchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('hotspots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'hotspots'
                  ? 'bg-amber-500 text-slate-950 shadow-glow font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Hotspots
            </button>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-glow transition-all active:scale-95"
            >
              <PlusCircle className="w-4.5 h-4.5 stroke-[2.5]" />
              <span className="hidden sm:inline">File a Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80 text-[11px]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'browse' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Search className="w-4 h-4" />
            Browse
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`relative flex flex-col items-center gap-1 ${
              activeTab === 'matches' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Matches
            {pendingMatchCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'hotspots' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Hotspots
          </button>
        </div>
      </div>
    </header>
  );
};
