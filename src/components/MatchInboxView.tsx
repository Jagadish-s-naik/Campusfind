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
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> AI Confidence Triage
          </span>
          <h1 className="text-3xl font-heading font-bold text-white">Confidence-Based Match Inbox</h1>
          <p className="text-sm text-slate-400">
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

            const isHigh = match.confidenceScore >= 80;
            const isMedium = match.confidenceScore >= 60 && match.confidenceScore < 80;

            return (
              <div
                key={match.id}
                onClick={() => onOpenMatchDetail(match, lostReport, foundReport)}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 cursor-pointer space-y-4 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    {/* Confidence Score Pill */}
                    <div
                      className={`px-3 py-1.5 rounded-xl font-heading font-bold text-sm flex items-center gap-1.5 ${
                        isHigh
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {match.confidenceScore}% Confidence
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      Matched {new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        match.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : match.status === 'dismissed'
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {match.status}
                    </span>
                    <button className="text-xs font-semibold text-amber-400 group-hover:text-amber-300 flex items-center gap-1 pl-2">
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Side-by-side snippet preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lost Snippet */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-rose-500/20">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-950">
                      <img src={lostReport.photoBase64} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Lost Report</span>
                      <p className="font-semibold text-slate-200 truncate">{lostReport.description}</p>
                      <p className="text-slate-400 truncate">{lostReport.location}</p>
                    </div>
                  </div>

                  {/* Found Snippet */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-950">
                      <img src={foundReport.photoBase64} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Found Report</span>
                      <p className="font-semibold text-slate-200 truncate">{foundReport.description}</p>
                      <p className="text-slate-400 truncate">{foundReport.location}</p>
                    </div>
                  </div>
                </div>

                {/* Explanation sentence */}
                <p className="text-xs text-slate-300 italic line-clamp-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  "{match.explanation}"
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-heading font-semibold text-slate-200">No Potential Matches Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            When new lost or found reports are submitted, the Gemini AI engine will automatically scan and post candidates here.
          </p>
        </div>
      )}
    </div>
  );
};
