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
      {/* 1. HERO BAND (White Card on Warm Canvas, Large Heading, Dual Pill CTAs) */}
      <div className="sb-card relative rounded-3xl p-8 sm:p-12 bg-white overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#DCEEE5] text-[#1E5F4A]">
            <Sparkles className="w-4 h-4 text-[#1E5F4A]" /> AI-Powered Smart Campus Lost & Found Engine
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-[rgba(0,0,0,0.87)] leading-tight tracking-tight">
            Reunite with what <span className="text-[#1E5F4A] italic font-serif">you lost.</span>
          </h1>

          <p className="text-base sm:text-lg text-[rgba(0,0,0,0.58)] leading-relaxed font-sans max-w-2xl">
            Instantly submit lost or found item reports with photos and details. Our Google Gemini AI engine automatically identifies candidate matches with grounded confidence scores.
          </p>

          {/* Hero Dual Pill CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenReportModal}
              className="sb-btn-primary px-7 py-3.5 text-sm flex items-center gap-2.5 shadow-sm"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              Report Lost Item
            </button>

            <button
              onClick={onOpenReportModal}
              className="sb-btn-outline px-6 py-3.5 text-sm flex items-center gap-2.5"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              Report Found Item
            </button>

            {reports.length === 0 && (
              <button
                onClick={onSeedDemoData}
                disabled={isSeeding}
                className="sb-btn-dark px-5 py-3.5 text-xs flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                {isSeeding ? 'Seeding Demo Items...' : 'Load Realistic Demo Reports'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DEDICATED DARK FEATURE BAND FOR PENDING MATCHES (Promoted core differentiator) */}
      {matches.length > 0 && (
        <div className="rounded-3xl p-8 sm:p-10 bg-[#16332B] text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#2C8C63] text-white">
                <ShieldCheck className="w-4 h-4" /> Core Match Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                You have {matches.length} possible item {matches.length === 1 ? 'match' : 'matches'}
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                Gemini AI identified matching lost & found pairs with grounded attribute explanations.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('matches')}
              className="sb-btn-primary bg-white text-[#16332B] hover:bg-[#DCEEE5] px-6 py-3 text-xs flex items-center gap-2 shrink-0 font-extrabold"
            >
              Open Match Inbox ({matches.length}) <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topMatches.map((match) => {
              const lost = reports.find((r) => r.id === match.lostReportId);
              const found = reports.find((r) => r.id === match.foundReportId);
              if (!lost || !found) return null;

              const isHigh = match.confidenceScore >= 75;
              const isMedium = match.confidenceScore >= 40 && match.confidenceScore < 75;

              return (
                <div
                  key={match.id}
                  onClick={() => onOpenMatchDetail(match, lost, found)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 cursor-pointer space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        isHigh
                          ? 'bg-[#2C8C63] text-white'
                          : isMedium
                          ? 'bg-[#E0A61B] text-slate-950'
                          : 'bg-[#C4291F] text-white'
                      }`}
                    >
                      {match.confidenceScore}% Match
                    </span>
                    <span className="text-[11px] text-white/60 font-medium">
                      {lost.location === found.location ? 'Same Spot' : 'Nearby'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="h-24 rounded-xl overflow-hidden bg-black/40 relative">
                      <img src={lost.photoBase64} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[9px] font-extrabold bg-[#C4291F] text-white rounded-md">Lost</span>
                    </div>
                    <div className="h-24 rounded-xl overflow-hidden bg-black/40 relative">
                      <img src={found.photoBase64} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[9px] font-extrabold bg-[#2C8C63] text-white rounded-md">Found</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 line-clamp-2 italic font-sans bg-black/20 p-2.5 rounded-xl">
                    "{match.explanation}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PLATFORM SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="sb-card p-6 space-y-1">
          <p className="text-xs uppercase font-extrabold text-[rgba(0,0,0,0.58)] tracking-wider">Total Reports</p>
          <p className="text-4xl font-heading font-extrabold text-[rgba(0,0,0,0.87)]">{reports.length}</p>
        </div>

        <div className="sb-card p-6 space-y-1 bg-rose-50/50">
          <p className="text-xs uppercase font-extrabold text-[#C4291F] tracking-wider">Lost Items</p>
          <p className="text-4xl font-heading font-extrabold text-[#C4291F]">{lostCount}</p>
        </div>

        <div className="sb-card p-6 space-y-1 bg-[#DCEEE5]/40">
          <p className="text-xs uppercase font-extrabold text-[#1E5F4A] tracking-wider">Found Items</p>
          <p className="text-4xl font-heading font-extrabold text-[#1E5F4A]">{foundCount}</p>
        </div>

        <div className="sb-card p-6 space-y-1 bg-amber-50/50">
          <p className="text-xs uppercase font-extrabold text-[#E0A61B] tracking-wider">AI Matches</p>
          <p className="text-4xl font-heading font-extrabold text-[rgba(0,0,0,0.87)]">{matches.length}</p>
        </div>
      </div>

      {/* 4. RECENT REPORTS GRID */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-extrabold text-[rgba(0,0,0,0.87)]">Recent Campus Reports</h2>
          <button
            onClick={() => onNavigateTab('browse')}
            className="text-xs font-extrabold text-[#1E5F4A] hover:underline flex items-center gap-1"
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
          <div className="sb-card p-12 text-center text-[rgba(0,0,0,0.58)] text-sm space-y-4">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <p>Database is currently empty.</p>
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding}
              className="sb-btn-primary px-5 py-2.5 text-xs inline-block"
            >
              Populate Demo Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
