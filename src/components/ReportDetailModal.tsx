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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="sb-card w-full max-w-2xl p-6 sm:p-8 relative my-8 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              isLost
                ? 'bg-[#C4291F] text-white'
                : 'bg-[#2C8C63] text-white'
            }`}
          >
            {report.type} Report
          </span>
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(report.dateTime).toLocaleString()}
          </span>
        </div>

        {/* Photo Container */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200">
          <img src={report.photoBase64} alt={report.description} className="w-full h-full object-cover" />
          
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="bg-[#16332B] px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-md">
              <Tag className="w-3.5 h-3.5 text-[#E0A61B]" />
              {report.structuredAttributes?.category || 'General'}
            </span>
          </div>
        </div>

        {/* Description & Structured Attributes */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-heading font-extrabold text-slate-900">Item Description</h3>
          <p className="text-sm text-slate-800 leading-relaxed font-sans bg-[#F3F1EA] p-4 rounded-xl">
            {report.description}
          </p>

          {/* AI Extracted Attributes */}
          {report.structuredAttributes && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-[#1E5F4A] text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Extracted Visual Attributes
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div><span className="text-slate-400">Brand:</span> <strong>{report.structuredAttributes.brand}</strong></div>
                <div><span className="text-slate-400">Colors:</span> <strong>{report.structuredAttributes.color.join(', ')}</strong></div>
              </div>
              {report.structuredAttributes.distinguishing_features.length > 0 && (
                <div className="text-xs pt-1">
                  <span className="text-slate-400">Features:</span>{' '}
                  <span className="text-slate-800 font-semibold">{report.structuredAttributes.distinguishing_features.join(' • ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location & Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F3F1EA] space-y-1">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Location</span>
            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2C8C63]" />
              {report.location}
            </p>
            {report.locationDetails && <p className="text-slate-600 pl-5">{report.locationDetails}</p>}
          </div>

          <div className="p-3.5 rounded-xl bg-[#F3F1EA] space-y-1">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Reporter Details</span>
            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#2C8C63]" />
              {report.reporterName}
            </p>
            <p className="text-[#1E5F4A] font-bold pl-5 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {report.contactInfo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
