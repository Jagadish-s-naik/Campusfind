import type { ItemReport } from '../types';
import { MapPin, BarChart3 } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../types';

interface LocationHotspotsViewProps {
  reports: ItemReport[];
}

export const LocationHotspotsView: React.FC<LocationHotspotsViewProps> = ({ reports }) => {
  // Aggregate report counts per campus location
  const locationCounts = CAMPUS_LOCATIONS.map((loc) => {
    const total = reports.filter((r) => r.location === loc).length;
    const lost = reports.filter((r) => r.location === loc && r.type === 'lost').length;
    const found = reports.filter((r) => r.location === loc && r.type === 'found').length;
    return { location: loc, total, lost, found };
  }).sort((a, b) => b.total - a.total);

  const maxCount = Math.max(...locationCounts.map((l) => l.total), 1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#16332B] text-white">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCEEE5] text-[#1E5F4A] flex items-center gap-1.5 w-fit">
            <BarChart3 className="w-3.5 h-3.5" /> Spatial Hotspot Analytics
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-white">Campus Lost & Found Hotspots</h1>
          <p className="text-sm text-[#DCEEE5]/80">
            Analytics breakdown of high-activity campus areas. Identifies where items are most frequently reported lost or recovered.
          </p>
        </div>
      </div>

      {/* Top 3 Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {locationCounts.slice(0, 3).map((hotspot, idx) => (
          <div key={hotspot.location} className="sb-card p-5 bg-white space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-500 font-extrabold">
              <span className="flex items-center gap-1.5 text-[#1E5F4A]">
                <MapPin className="w-4 h-4" /> #{idx + 1} Hotspot
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F8F8F8] text-slate-800">{hotspot.total} Reports</span>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 truncate">{hotspot.location}</h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="text-[#C4291F] font-bold">{hotspot.lost} Lost</span>
              <span className="text-[#2C8C63] font-bold">{hotspot.found} Found</span>
            </div>
          </div>
        ))}
      </div>

      {/* Location Breakdown Bar Chart List */}
      <div className="sb-card p-6 sm:p-8 bg-white space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-extrabold text-slate-900">All Location Frequency Breakdown</h2>
          <span className="text-xs text-slate-500 font-semibold">Ranked by volume</span>
        </div>

        <div className="space-y-4">
          {locationCounts.map((item) => {
            const percentage = Math.round((item.total / maxCount) * 100);
            return (
              <div key={item.location} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1E5F4A]" />
                    {item.location}
                  </span>
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
                    <span className="text-[#C4291F] font-semibold">{item.lost} lost</span>
                    <span className="text-[#2C8C63] font-semibold">{item.found} found</span>
                    <strong className="text-slate-900">{item.total} total</strong>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-3 rounded-full bg-[#F3F1EA] overflow-hidden flex">
                  <div
                    style={{ width: `${item.total > 0 ? percentage : 0}%` }}
                    className="h-full bg-[#2C8C63] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
