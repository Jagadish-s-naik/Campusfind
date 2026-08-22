import type { ItemReport } from '../types';
import { MapPin, Calendar, Tag, Sparkles } from 'lucide-react';

interface ReportCardProps {
  report: ItemReport;
  onSelect: (report: ItemReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onSelect }) => {
  const isLost = report.type === 'lost';
  const formattedDate = new Date(report.dateTime).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onSelect(report)}
      className="sb-card sb-card-hover p-4 flex flex-col justify-between group cursor-pointer relative overflow-hidden bg-white"
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isLost ? 'bg-[#C4291F]' : 'bg-[#2C8C63]'
        }`}
      />

      {/* Header Badge & Date */}
      <div className="flex items-center justify-between mb-3 pt-1">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
            isLost
              ? 'bg-rose-50 text-[#C4291F] border border-rose-200'
              : 'bg-[#DCEEE5] text-[#1E5F4A] border border-[#2C8C63]/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLost ? 'bg-[#C4291F]' : 'bg-[#2C8C63]'}`} />
          {report.type}
        </span>
        <span className="text-xs text-[rgba(0,0,0,0.58)] flex items-center gap-1 font-sans">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formattedDate}
        </span>
      </div>

      {/* Image Thumbnail with smooth fade-in */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3.5 bg-slate-100 border border-slate-200">
        <img
          src={report.photoBase64}
          alt={report.structuredAttributes?.summary || report.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out opacity-95 group-hover:opacity-100"
          loading="lazy"
        />
        
        {/* Floating Category Pill */}
        <span className="absolute bottom-3 left-3 bg-[#16332B] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
          <Tag className="w-3 h-3 text-[#E0A61B]" />
          {report.structuredAttributes?.category || 'Uncategorized'}
        </span>

        {/* AI Verified Badge */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-[#1E5F4A] border border-[#1E5F4A]/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#1E5F4A]" /> AI Logged
        </span>
      </div>

      {/* Description Snippet */}
      <div className="space-y-2 flex-grow">
        <h3 className="text-sm font-bold text-[rgba(0,0,0,0.87)] line-clamp-2 group-hover:text-[#1E5F4A] transition-colors leading-snug">
          {report.description}
        </h3>

        {/* Extracted Attribute Chips */}
        {report.structuredAttributes && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {report.structuredAttributes.brand !== 'Unknown' && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F8F8F8] text-slate-800 font-semibold border border-slate-200">
                {report.structuredAttributes.brand}
              </span>
            )}
            {report.structuredAttributes.color.slice(0, 2).map((c, i) => (
              <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F8F8F8] text-slate-600 capitalize">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Location & Reporter */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[rgba(0,0,0,0.58)]">
        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
          <MapPin className="w-3.5 h-3.5 text-[#2C8C63] shrink-0" />
          <span className="truncate font-semibold text-[rgba(0,0,0,0.87)]">{report.location}</span>
        </div>
        <span className="text-[11px] text-slate-400 truncate max-w-[20%] text-right font-medium">
          {report.reporterName.split(' ')[0]}
        </span>
      </div>
    </div>
  );
};
