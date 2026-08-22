import type { ItemReport } from '../types';
import { ReportCard } from './ReportCard';
import { Search, RefreshCw, Layers, Filter, X } from 'lucide-react';
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
      <div className="rounded-3xl p-6 sm:p-8 bg-[#16332B] text-white">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCEEE5] text-[#1E5F4A]">
            Real-time Directory
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-white">Search & Browse Campus Reports</h1>
          <p className="text-sm text-[#DCEEE5]/80">
            Search active lost and found items across all campus locations. Filter by item category, campus area, or report type.
          </p>
        </div>
      </div>

      {/* Sticky Filter Control Bar (Collapses on Mobile to a Filter Pill + Slide Panel) */}
      <div className="sticky top-20 z-30 sb-card p-4 bg-white space-y-4">
        {/* Mobile Filter Toggle Pill */}
        <div className="flex sm:hidden items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="sb-btn-outline px-4 py-2 text-xs flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {mobileFilterOpen ? 'Close Filter Panel' : 'Filter & Search Options'}
          </button>
          <span className="text-xs font-bold text-[#1E5F4A]">{filteredReports.length} results</span>
        </div>

        {/* Filter Controls (Visible on desktop, collapsible on mobile) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${mobileFilterOpen ? 'block' : 'hidden sm:grid'}`}>
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search keyword, brand, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-lg sb-input text-sm text-slate-900 bg-white"
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
              className="w-full px-3 py-2.5 rounded-lg sb-input text-sm text-slate-900 bg-white"
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
              className="w-full px-3 py-2.5 rounded-lg sb-input text-sm text-slate-900 bg-white"
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
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-[#1E5F4A] font-bold">{filteredReports.length}</strong> of{' '}
            <strong>{reports.length}</strong> reports
          </span>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 hover:text-[#1E5F4A] transition-colors text-slate-600 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Responsive Grid Collapse (4-up desktop / 2-up tablet / 1-up mobile) */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} onSelect={onSelectReport} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="sb-card p-12 text-center bg-white space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F3F1EA] flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-extrabold text-slate-900">No Matching Reports Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all campus items.
          </p>
          <button
            onClick={handleResetFilters}
            className="sb-btn-outline px-4 py-2 text-xs inline-block mt-2"
          >
            Clear Search Filters
          </button>
        </div>
      )}
    </div>
  );
};
