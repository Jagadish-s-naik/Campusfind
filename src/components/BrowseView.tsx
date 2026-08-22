import type { ItemReport } from '../types';
import { ReportCard } from './ReportCard';
import { Search, RefreshCw, Layers } from 'lucide-react';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../types';
import { useState } from 'react';

interface BrowseViewProps {
  reports: ItemReport[];
  onSelectReport: (report: ItemReport) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({ reports, onSelectReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredReports = reports.filter((report) => {
    // Type Filter
    if (selectedType !== 'all' && report.type !== selectedType) return false;

    // Location Filter
    if (selectedLocation !== 'all' && report.location !== selectedLocation) return false;

    // Category Filter
    if (
      selectedCategory !== 'all' &&
      report.structuredAttributes?.category !== selectedCategory
    )
      return false;

    // Search term check
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDesc = report.description.toLowerCase().includes(term);
      const matchLoc = report.location.toLowerCase().includes(term);
      const matchReporter = report.reporterName.toLowerCase().includes(term);
      const matchBrand = report.structuredAttributes?.brand.toLowerCase().includes(term);

      return matchDesc || matchLoc || matchReporter || matchBrand;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedLocation('all');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Real-time Database
          </span>
          <h1 className="text-3xl font-heading font-bold text-white">Search & Browse Campus Reports</h1>
          <p className="text-sm text-slate-400">
            Search active lost and found items across all campus locations. Filter by item category, campus area, or report type.
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search keyword, brand, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-100 bg-slate-900"
            >
              <option value="all">All Types (Lost & Found)</option>
              <option value="lost">Lost Items Only</option>
              <option value="found">Found Items Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-100 bg-slate-900"
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-100 bg-slate-900"
            >
              <option value="all">All Campus Locations</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Meta Info & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-amber-400">{filteredReports.length}</strong> of{' '}
            <strong>{reports.length}</strong> reports
          </span>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 hover:text-amber-400 transition-colors text-slate-400 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} onSelect={onSelectReport} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-slate-200">No Matching Reports Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all campus items.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 transition-colors inline-block mt-2"
          >
            Clear Search Filters
          </button>
        </div>
      )}
    </div>
  );
};
