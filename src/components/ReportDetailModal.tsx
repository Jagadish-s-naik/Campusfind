import type { ItemReport } from '../types';
import { X, MapPin, Calendar, User, Phone, Tag, Sparkles } from 'lucide-react';

interface ReportDetailModalProps {
  report: ItemReport | null;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const isLost = report.type === 'lost';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLost
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {report.type} Report
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(report.dateTime).toLocaleString()}
          </span>
        </div>

        {/* Photo Container */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 bg-slate-950 border border-slate-800">
          <img src={report.photoBase64} alt={report.description} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-amber-300 border border-amber-500/20 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              {report.structuredAttributes?.category || 'General'}
            </span>
          </div>
        </div>

        {/* Description & Structured Attributes */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-heading font-bold text-white">Item Description</h3>
          <p className="text-sm text-slate-200 leading-relaxed font-sans glass-card p-4 rounded-xl border-slate-800">
            {report.description}
          </p>

          {/* AI Extracted Attributes */}
          {report.structuredAttributes && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Extracted Visual Attributes
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div><span className="text-slate-500">Brand:</span> <strong>{report.structuredAttributes.brand}</strong></div>
                <div><span className="text-slate-500">Colors:</span> <strong>{report.structuredAttributes.color.join(', ')}</strong></div>
              </div>
              {report.structuredAttributes.distinguishing_features.length > 0 && (
                <div className="text-xs pt-1">
                  <span className="text-slate-500">Features:</span>{' '}
                  <span className="text-slate-300">{report.structuredAttributes.distinguishing_features.join(' • ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location & Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Location</span>
            <p className="font-bold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              {report.location}
            </p>
            {report.locationDetails && <p className="text-slate-400 pl-5">{report.locationDetails}</p>}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Reporter Details</span>
            <p className="font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              {report.reporterName}
            </p>
            <p className="text-amber-400 font-mono pl-5 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {report.contactInfo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
