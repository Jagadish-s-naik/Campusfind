import type { ItemReport, MatchResult } from './types';
import { getAllReports, getAllMatches } from './services/db';
import { seedInitialDemoData, resetAndSeedDemoData } from './services/seedData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BrowseView } from './components/BrowseView';
import { MatchInboxView } from './components/MatchInboxView';
import { LocationHotspotsView } from './components/LocationHotspotsView';
import { SubmitReportModal } from './components/SubmitReportModal';
import { MatchDetailModal } from './components/MatchDetailModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'browse' | 'matches' | 'hotspots'>('dashboard');
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ItemReport | null>(null);
  const [activeMatchPair, setActiveMatchPair] = useState<{
    match: MatchResult;
    lost: ItemReport;
    found: ItemReport;
  } | null>(null);

  const loadData = async () => {
    try {
      await seedInitialDemoData();
      const r = await getAllReports();
      const m = await getAllMatches();
      setReports(r);
      setMatches(m);
    } catch (err) {
      console.error('Failed to load DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportSubmitted = async () => {
    await loadData();
    setActiveTab('matches');
  };

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      await resetAndSeedDemoData();
      await loadData();
    } catch (err) {
      console.error('Error seeding data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const pendingMatchCount = matches.filter((m) => m.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-300">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        pendingMatchCount={pendingMatchCount}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Initializing Local Campus Database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                reports={reports}
                matches={matches}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onSelectReport={setSelectedReport}
                onOpenMatchDetail={(m, l, f) => setActiveMatchPair({ match: m, lost: l, found: f })}
                onNavigateTab={setActiveTab}
                onSeedDemoData={handleSeedDemoData}
                isSeeding={isSeeding}
              />
            )}

            {activeTab === 'browse' && (
              <BrowseView reports={reports} onSelectReport={setSelectedReport} />
            )}

            {activeTab === 'matches' && (
              <MatchInboxView
                matches={matches}
                reports={reports}
                onOpenMatchDetail={(m, l, f) => setActiveMatchPair({ match: m, lost: l, found: f })}
              />
            )}

            {activeTab === 'hotspots' && <LocationHotspotsView reports={reports} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-slate-800 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-200">CampusFind AI</span>
            <span>— Hackathon Submission for PromptWars x YenTech</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={handleSeedDemoData}
              disabled={isSeeding}
              className="text-amber-400 hover:underline font-mono"
            >
              Reset Demo Dataset
            </button>
          </div>
        </div>
      </footer>

      {/* Report Submission Modal */}
      <SubmitReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={handleReportSubmitted}
      />

      {/* Match Detail Side-by-Side Modal */}
      <MatchDetailModal
        match={activeMatchPair?.match || null}
        lostReport={activeMatchPair?.lost || null}
        foundReport={activeMatchPair?.found || null}
        onClose={() => setActiveMatchPair(null)}
        onMatchUpdated={loadData}
      />

      {/* Single Report View Modal */}
      <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
