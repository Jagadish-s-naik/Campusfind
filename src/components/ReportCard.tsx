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
      className="glass-card glass-card-hover rounded-3xl p-4 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
    >
      {/* Subtle Gradient Glow Top Border */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isLost ? 'from-rose-500 via-amber-500 to-rose-600' : 'from-emerald-500 via-teal-400 to-emerald-600'
        }`}
      />

      {/* Header Badge & Date */}
      <div className="flex items-center justify-between mb-3.5 pt-1">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
            isLost
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLost ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
          {report.type}
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {formattedDate}
        </span>
      </div>

      {/* Image Thumbnail with Overlay */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-3.5 bg-slate-950 border border-slate-800/80 group-hover:border-slate-700 transition-colors">
        <img
          src={report.photoBase64}
          alt={report.structuredAttributes?.summary || report.description}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* Floating Category Pill */}
        <span className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
          <Tag className="w-3 h-3 text-amber-400" />
          {report.structuredAttributes?.category || 'Uncategorized'}
        </span>

        {/* AI Verified Badge */}
        <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700/60 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> AI Logged
        </span>
      </div>

      {/* Description Snippet */}
      <div className="space-y-2.5 flex-grow">
        <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
          {report.description}
        </h3>

        {/* Extracted Attribute Chips */}
        {report.structuredAttributes && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {report.structuredAttributes.brand !== 'Unknown' && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                {report.structuredAttributes.brand}
              </span>
            )}
            {report.structuredAttributes.color.slice(0, 2).map((c, i) => (
              <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 capitalize">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Location & Reporter */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate text-slate-300 font-medium">{report.location}</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono truncate max-w-[20%] text-right">
          {report.reporterName.split(' ')[0]}
        </span>
      </div>
    </div>
  );
};
