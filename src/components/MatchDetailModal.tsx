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
  const isHighConfidence = score >= 75;
  const isMediumConfidence = score >= 40 && score < 75;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="sb-card w-full max-w-4xl p-6 sm:p-8 relative my-8 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Confidence Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCEEE5] text-[#1E5F4A] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#1E5F4A]" /> Pairwise Match Comparison
              </span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-slate-900">Match Verdict & Verification</h2>
          </div>

          {/* Prominent Confidence Score Badge (Success >=75%, Warning 40-74%, Error <40%) */}
          <div
            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-white ${
              isHighConfidence
                ? 'bg-[#2C8C63]'
                : isMediumConfidence
                ? 'bg-[#E0A61B] text-slate-950'
                : 'bg-[#C4291F]'
            }`}
          >
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">Confidence Score</p>
              <p className="text-3xl font-heading font-black">
                {match.confidenceScore}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
              {match.confidenceScore}%
            </div>
          </div>
        </div>

        {/* Side-by-Side Item Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Lost Item Card */}
          <div className="sb-card p-5 border border-rose-200 bg-rose-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#C4291F] text-white uppercase tracking-wider">
                Lost Item Report
              </span>
              <span className="text-xs text-slate-500 font-semibold">{lostReport.reporterName}</span>
            </div>

            <div className="h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={lostReport.photoBase64}
                alt={lostReport.description}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="text-sm font-bold text-slate-900">{lostReport.description}</p>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-[#C4291F]" />
                <span>{lostReport.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(lostReport.dateTime).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Found Item Card */}
          <div className="sb-card p-5 border border-[#2C8C63]/20 bg-[#DCEEE5]/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#2C8C63] text-white uppercase tracking-wider">
                Found Item Report
              </span>
              <span className="text-xs text-slate-500 font-semibold">{foundReport.reporterName}</span>
            </div>

            <div className="h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={foundReport.photoBase64}
                alt={foundReport.description}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="text-sm font-bold text-slate-900">{foundReport.description}</p>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-[#2C8C63]" />
                <span>{foundReport.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(foundReport.dateTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* "Why this is a match" Dark Feature Band Explanation Panel */}
        <div className="mb-6 p-6 rounded-2xl bg-[#16332B] text-white space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-[#DCEEE5] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#E0A61B]" /> Why this is a match (Gemini AI Grounded Explanation)
          </div>
          <p className="text-sm text-[#DCEEE5]/90 leading-relaxed font-sans">{match.explanation}</p>
          
          {/* Matched Attribute Pills */}
          {match.matchedAttributes && match.matchedAttributes.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {match.matchedAttributes.map((attr, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-[#2C8C63] text-white flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-white" />
                  {attr}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Pills & Reveal-on-Match Contact Protection */}
        <div className="sb-card p-5 border border-slate-200 bg-[#F3F1EA] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1E5F4A]" />
              <h3 className="font-heading font-extrabold text-slate-900 text-base">
                Reveal-on-Match Contact Protection
              </h3>
            </div>
            <span
              className={`text-xs px-3 py-0.5 rounded-full font-extrabold uppercase ${
                isRevealed
                  ? 'bg-[#DCEEE5] text-[#1E5F4A]'
                  : 'bg-[#E0A61B] text-slate-950'
              }`}
            >
              {isRevealed ? 'Unlocked & Verified' : 'Locked for Privacy'}
            </span>
          </div>

          {isRevealed ? (
            <div className="p-4 rounded-xl bg-white border border-[#2C8C63]/30 space-y-3">
              <p className="text-xs text-[#1E5F4A] font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#2C8C63]" /> Match Confirmed! Direct Contact details are now unlocked.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#F3F1EA]">
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold mb-1">
                    Lost Reporter Details
                  </p>
                  <p className="font-extrabold text-slate-900">{lostReport.reporterName}</p>
                  <p className="text-[#1E5F4A] font-bold mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {lostReport.contactInfo}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#F3F1EA]">
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold mb-1">
                    Found Reporter Details
                  </p>
                  <p className="font-extrabold text-slate-900">{foundReport.reporterName}</p>
                  <p className="text-[#1E5F4A] font-bold mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {foundReport.contactInfo}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs text-slate-600">
              <p>
                Student phone numbers and email addresses remain hidden until you review the AI comparison and confirm this match.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleConfirmMatch}
                  disabled={isUpdating}
                  className="sb-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Match (Filled Pill)
                </button>
                <button
                  onClick={handleDismissMatch}
                  disabled={isUpdating}
                  className="sb-btn-outline px-5 py-2.5 text-xs"
                >
                  Not a Match (Outlined Pill)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
