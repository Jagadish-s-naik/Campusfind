import React from 'react';
import type { ItemReport, MatchResult } from '../types';
import { ReportCard } from './ReportCard';
import { PlusCircle, Search, ShieldCheck, Sparkles, Database, Layers, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  reports: ItemReport[];
  matches: MatchResult[];
  onOpenReportModal: () => void;
  onSelectReport: (report: ItemReport) => void;
  onOpenMatchDetail: (match: MatchResult, lost: ItemReport, found: ItemReport) => void;
  onNavigateTab: (tab: 'browse' | 'matches' | 'hotspots') => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  matches,
  onOpenReportModal,
  onSelectReport,
  onOpenMatchDetail,
  onNavigateTab,
  onSeedDemoData,
  isSeeding,
}) => {
  const lostCount = reports.filter((r) => r.type === 'lost').length;
  const foundCount = reports.filter((r) => r.type === 'found').length;
  const topMatches = matches.slice(0, 3);
  const recentReports = reports.slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Hero Banner with Futuristic Glow & Ambient Lighting */}
      <div className="relative glass-card rounded-3xl p-8 sm:p-12 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 overflow-hidden shadow-2xl bg-mesh-pattern">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" /> Powered by Google Gemini Multimodal & Embeddings
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-white leading-none tracking-tight">
            Smart Campus <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">Lost & Found</span> Engine
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl">
            Instantly file lost or found reports. Our Gemini AI engine extracts visual attributes from photos and automatically correlates reports with confidence scores & explanations.
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenReportModal}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-glow flex items-center gap-2.5 transition-all duration-300 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              File Lost or Found Report
            </button>

            <button
              onClick={() => onNavigateTab('browse')}
              className="px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-semibold text-sm flex items-center gap-2.5 transition-all duration-300"
            >
              <Search className="w-4.5 h-4.5 text-amber-400" />
              Browse Active Database
            </button>

            {reports.length === 0 && (
              <button
                onClick={onSeedDemoData}
                disabled={isSeeding}
                className="px-5 py-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                {isSeeding ? 'Seeding Demo Items...' : 'Load Realistic Demo Reports'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Platform Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-700/10 rounded-full blur-xl group-hover:bg-slate-700/20 transition-all" />
          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Reports</p>
          <p className="text-4xl font-heading font-extrabold text-white">{reports.length}</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-950/10 space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <p className="text-xs uppercase font-semibold text-rose-400 tracking-wider">Lost Items</p>
          <p className="text-4xl font-heading font-extrabold text-rose-300">{lostCount}</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10 space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <p className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">Found Items</p>
          <p className="text-4xl font-heading font-extrabold text-emerald-300">{foundCount}</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-950/10 space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <p className="text-xs uppercase font-semibold text-amber-400 tracking-wider">AI Matches</p>
          <p className="text-4xl font-heading font-extrabold text-amber-300">{matches.length}</p>
        </div>
      </div>

      {/* Highlighted AI Matches Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">AI-Identified High Confidence Matches</h2>
          </div>
          <button
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all"
          >
            View Inbox ({matches.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topMatches.map((match) => {
              const lost = reports.find((r) => r.id === match.lostReportId);
              const found = reports.find((r) => r.id === match.foundReportId);
              if (!lost || !found) return null;

              return (
                <div
                  key={match.id}
                  onClick={() => onOpenMatchDetail(match, lost, found)}
                  className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/80 cursor-pointer space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {match.confidenceScore}% Match
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {lost.location === found.location ? 'Same Spot' : 'Nearby'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                      <img src={lost.photoBase64} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold bg-rose-500/90 text-white rounded-md">Lost</span>
                    </div>
                    <div className="h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                      <img src={found.photoBase64} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold bg-emerald-500/90 text-white rounded-md">Found</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    "{match.explanation}"
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center border border-slate-800 text-xs text-slate-400">
            No potential match pairs generated yet. Click "Load Realistic Demo Reports" to populate sample matching reports!
          </div>
        )}
      </div>

      {/* Recent Reports Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-white">Recent Campus Reports</h2>
          <button
            onClick={() => onNavigateTab('browse')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all"
          >
            Browse All ({reports.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} onSelect={onSelectReport} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400 text-sm space-y-4">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p>Database is currently empty.</p>
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glow transition-all"
            >
              Populate Demo Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
