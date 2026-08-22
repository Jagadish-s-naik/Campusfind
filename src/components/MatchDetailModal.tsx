import type { ItemReport, MatchResult } from '../types';
import { X, Sparkles, CheckCircle, Shield, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { updateMatchStatus } from '../services/db';
import confetti from 'canvas-confetti';
import { useState } from 'react';

interface MatchDetailModalProps {
  match: MatchResult | null;
  lostReport: ItemReport | null;
  foundReport: ItemReport | null;
  onClose: () => void;
  onMatchUpdated: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  lostReport,
  foundReport,
  onClose,
  onMatchUpdated,
}) => {
  const [isRevealed, setIsRevealed] = useState(match?.status === 'confirmed');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!match || !lostReport || !foundReport) return null;

  const score = match.confidenceScore;
  const isHighConfidence = score >= 80;
  const isMediumConfidence = score >= 60 && score < 80;

  const handleConfirmMatch = async () => {
    setIsUpdating(true);
    try {
      await updateMatchStatus(match.id, 'confirmed');
      setIsRevealed(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      onMatchUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismissMatch = async () => {
    setIsUpdating(true);
    try {
      await updateMatchStatus(match.id, 'dismissed');
      onMatchUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-4xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Pairwise Match Analysis
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">AI Match Comparison</h2>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Match Score</p>
              <p
                className={`text-2xl font-heading font-bold ${
                  isHighConfidence
                    ? 'text-emerald-400'
                    : isMediumConfidence
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {match.confidenceScore}%
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                isHighConfidence
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isMediumConfidence
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {match.confidenceScore}%
            </div>
          </div>
        </div>

        {/* AI Explanation Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Grounded Gemini Explanation
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">{match.explanation}</p>
          
          {/* Matched Attribute Pills */}
          {match.matchedAttributes && match.matchedAttributes.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {match.matchedAttributes.map((attr, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-amber-400" />
                  {attr}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Side-by-Side Item Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Lost Item Column */}
          <div className="glass-card rounded-2xl p-5 border border-rose-500/20 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                Lost Item Report
              </span>
              <span className="text-xs text-slate-400 font-mono">{lostReport.reporterName}</span>
            </div>

            <div className="h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={lostReport.photoBase64}
                alt={lostReport.description}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-sm font-medium text-slate-100">{lostReport.description}</p>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{lostReport.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(lostReport.dateTime).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Found Item Column */}
          <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Found Item Report
              </span>
              <span className="text-xs text-slate-400 font-mono">{foundReport.reporterName}</span>
            </div>

            <div className="h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={foundReport.photoBase64}
                alt={foundReport.description}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-sm font-medium text-slate-100">{foundReport.description}</p>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{foundReport.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(foundReport.dateTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reveal-on-Match Privacy Section */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-semibold text-slate-100 text-base">
                Reveal-on-Match Contact Protection
              </h3>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isRevealed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isRevealed ? 'Unlocked & Verified' : 'Locked for Privacy'}
            </span>
          </div>

          {isRevealed ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <p className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Match Confirmed! Direct Contact details are now unlocked.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Lost Reporter Details
                  </p>
                  <p className="font-bold text-slate-200">{lostReport.reporterName}</p>
                  <p className="text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {lostReport.contactInfo}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Found Reporter Details
                  </p>
                  <p className="font-bold text-slate-200">{foundReport.reporterName}</p>
                  <p className="text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {foundReport.contactInfo}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs text-slate-400">
              <p>
                Student phone numbers and email addresses remain hidden until you review the AI comparison and confirm this match.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleConfirmMatch}
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-glow flex items-center gap-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                  Confirm Match & Reveal Contact Info
                </button>
                <button
                  onClick={handleDismissMatch}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
                >
                  Dismiss Suggestion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
