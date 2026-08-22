import type { ItemReport, MatchResult } from '../types';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface MatchInboxViewProps {
  matches: MatchResult[];
  reports: ItemReport[];
  onOpenMatchDetail: (match: MatchResult, lost: ItemReport, found: ItemReport) => void;
}

export const MatchInboxView: React.FC<MatchInboxViewProps> = ({
  matches,
  reports,
  onOpenMatchDetail,
}) => {
  // Sort matches by confidence score descending
  const sortedMatches = [...matches].sort((a, b) => b.confidenceScore - a.confidenceScore);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#16332B] text-white">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCEEE5] text-[#1E5F4A] flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> AI Confidence Triage
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-white">Confidence-Based Match Inbox</h1>
          <p className="text-sm text-[#DCEEE5]/80">
            Potential matches identified by Gemini pairwise comparison. Evaluated based on item attributes, visual features, location proximity, and timeframe.
          </p>
        </div>
      </div>

      {/* Matches List */}
      {sortedMatches.length > 0 ? (
        <div className="space-y-4">
          {sortedMatches.map((match) => {
            const lostReport = reports.find((r) => r.id === match.lostReportId);
            const foundReport = reports.find((r) => r.id === match.foundReportId);

            if (!lostReport || !foundReport) return null;

            const isHigh = match.confidenceScore >= 75;
            const isMedium = match.confidenceScore >= 40 && match.confidenceScore < 75;

            return (
              <div
                key={match.id}
                onClick={() => onOpenMatchDetail(match, lostReport, foundReport)}
                className="sb-card sb-card-hover p-5 cursor-pointer space-y-4 bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {/* Confidence Score Pill (Success >=75%, Warning 40-74%, Error <40%) */}
                    <div
                      className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-sm flex items-center gap-1.5 ${
                        isHigh
                          ? 'bg-[#2C8C63] text-white'
                          : isMedium
                          ? 'bg-[#E0A61B] text-slate-950'
                          : 'bg-[#C4291F] text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {match.confidenceScore}% Confidence
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                      Matched {new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-0.5 rounded-full font-extrabold uppercase ${
                        match.status === 'confirmed'
                          ? 'bg-[#DCEEE5] text-[#1E5F4A]'
                          : match.status === 'dismissed'
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-amber-50 text-[#E0A61B]'
                      }`}
                    >
                      {match.status}
                    </span>
                    <button className="text-xs font-extrabold text-[#1E5F4A] hover:underline flex items-center gap-1 pl-2">
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Side-by-side snippet preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lost Snippet */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                      <img src={lostReport.photoBase64} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <span className="text-[10px] font-extrabold text-[#C4291F] uppercase tracking-wider">Lost Report</span>
                      <p className="font-bold text-slate-900 truncate">{lostReport.description}</p>
                      <p className="text-slate-500 truncate">{lostReport.location}</p>
                    </div>
                  </div>

                  {/* Found Snippet */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#DCEEE5]/30 border border-[#2C8C63]/20">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                      <img src={foundReport.photoBase64} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <span className="text-[10px] font-extrabold text-[#1E5F4A] uppercase tracking-wider">Found Report</span>
                      <p className="font-bold text-slate-900 truncate">{foundReport.description}</p>
                      <p className="text-slate-500 truncate">{foundReport.location}</p>
                    </div>
                  </div>
                </div>

                {/* Explanation sentence */}
                <p className="text-xs text-slate-700 italic line-clamp-2 bg-[#F3F1EA] p-3 rounded-xl">
                  "{match.explanation}"
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sb-card p-12 text-center bg-white space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-heading font-extrabold text-slate-900">No Potential Matches Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            When new lost or found reports are submitted, the Gemini AI engine will automatically scan and post candidates here.
          </p>
        </div>
      )}
    </div>
  );
};
