import React, { useState } from 'react';
import { Sparkles, Search, Plus, LayoutDashboard, ShieldCheck, MapPin, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Platform Title */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#1E5F4A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2C8C63] transition-colors">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl text-[rgba(0,0,0,0.87)] tracking-tight flex items-center gap-2">
                  CampusFind
                </span>
                <p className="text-xs text-[rgba(0,0,0,0.58)] font-sans hidden sm:block">Smart Campus Lost & Found</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1E5F4A] text-white shadow-sm'
                    : 'text-[rgba(0,0,0,0.7)] hover:text-[#1E5F4A] hover:bg-[#F3F1EA]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Home
              </button>

              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'browse'
                    ? 'bg-[#1E5F4A] text-white shadow-sm'
                    : 'text-[rgba(0,0,0,0.7)] hover:text-[#1E5F4A] hover:bg-[#F3F1EA]'
                }`}
              >
                <Search className="w-4 h-4" />
                Browse
              </button>

              <button
                onClick={() => setActiveTab('matches')}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'matches'
                    ? 'bg-[#1E5F4A] text-white shadow-sm'
                    : 'text-[rgba(0,0,0,0.7)] hover:text-[#1E5F4A] hover:bg-[#F3F1EA]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Match Inbox
                {pendingMatchCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-[#E0A61B] text-slate-950">
                    {pendingMatchCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('hotspots')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'hotspots'
                    ? 'bg-[#1E5F4A] text-white shadow-sm'
                    : 'text-[rgba(0,0,0,0.7)] hover:text-[#1E5F4A] hover:bg-[#F3F1EA]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Hotspots
              </button>
            </nav>

            {/* Action Area & Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenReportModal}
                className="sb-btn-primary px-5 py-2.5 text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Submit Report</span>
                <span className="sm:hidden">Report</span>
              </button>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-slate-700 hover:bg-[#F3F1EA] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Hamburger Drawer Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-[#FFFFFF] px-4 pt-3 pb-4 space-y-2 animate-in slide-in-from-top duration-200">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold ${
                activeTab === 'dashboard' ? 'bg-[#1E5F4A] text-white' : 'text-slate-700 hover:bg-[#F3F1EA]'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('browse');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold ${
                activeTab === 'browse' ? 'bg-[#1E5F4A] text-white' : 'text-slate-700 hover:bg-[#F3F1EA]'
              }`}
            >
              <Search className="w-5 h-5" />
              Browse Database
            </button>
            <button
              onClick={() => {
                setActiveTab('matches');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-bold ${
                activeTab === 'matches' ? 'bg-[#1E5F4A] text-white' : 'text-slate-700 hover:bg-[#F3F1EA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                Match Inbox
              </div>
              {pendingMatchCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-black rounded-full bg-[#E0A61B] text-slate-950">
                  {pendingMatchCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('hotspots');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold ${
                activeTab === 'hotspots' ? 'bg-[#1E5F4A] text-white' : 'text-slate-700 hover:bg-[#F3F1EA]'
              }`}
            >
              <MapPin className="w-5 h-5" />
              Hotspots
            </button>
          </div>
        )}
      </header>

      {/* Persistent Floating Quick-Report CTA Button (Starbucks 56px Frap style persistent across all screens) */}
      <button
        onClick={onOpenReportModal}
        className="sb-fab group"
        title="Quick File Lost or Found Report"
        aria-label="Quick File Report"
      >
        <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </>
  );
};
