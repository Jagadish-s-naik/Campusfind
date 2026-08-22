import type { DBSchema, IDBPDatabase } from 'idb';
import type { ItemReport, MatchResult } from '../types';
import { openDB } from 'idb';

interface CampusFindDB extends DBSchema {
  reports: {
    key: string;
    value: ItemReport;
    indexes: {
      'by-type': string;
      'by-location': string;
      'by-status': string;
      'by-date': string;
    };
  };
  matches: {
    key: string;
    value: MatchResult;
    indexes: {
      'by-lost-id': string;
      'by-found-id': string;
      'by-confidence': number;
      'by-status': string;
    };
  };
}

const DB_NAME = 'CampusFindDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CampusFindDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CampusFindDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create Reports Store
        const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
        reportStore.createIndex('by-type', 'type');
        reportStore.createIndex('by-location', 'location');
        reportStore.createIndex('by-status', 'status');
        reportStore.createIndex('by-date', 'createdAt');

        // Create Matches Store
        const matchStore = db.createObjectStore('matches', { keyPath: 'id' });
        matchStore.createIndex('by-lost-id', 'lostReportId');
        matchStore.createIndex('by-found-id', 'foundReportId');
        matchStore.createIndex('by-confidence', 'confidenceScore');
        matchStore.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
}

// Database helper operations

export async function saveReport(report: ItemReport): Promise<void> {
  const db = await getDB();
  await db.put('reports', report);
}

export async function getReportById(id: string): Promise<ItemReport | undefined> {
  const db = await getDB();
  return db.get('reports', id);
}

export async function getAllReports(): Promise<ItemReport[]> {
  const db = await getDB();
  const reports = await db.getAll('reports');
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getReportsByType(type: 'lost' | 'found'): Promise<ItemReport[]> {
  const db = await getDB();
  return db.getAllFromIndex('reports', 'by-type', type);
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('reports', id);
}

export async function saveMatch(match: MatchResult): Promise<void> {
  const db = await getDB();
  await db.put('matches', match);
}

export async function getAllMatches(): Promise<MatchResult[]> {
  const db = await getDB();
  const matches = await db.getAll('matches');
  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export async function getMatchesForReport(reportId: string): Promise<MatchResult[]> {
  const db = await getDB();
  const all = await db.getAll('matches');
  return all.filter((m) => m.lostReportId === reportId || m.foundReportId === reportId);
}

export async function updateMatchStatus(matchId: string, status: 'confirmed' | 'dismissed'): Promise<void> {
  const db = await getDB();
  const match = await db.get('matches', matchId);
  if (match) {
    match.status = status;
    await db.put('matches', match);
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('reports');
  await db.clear('matches');
}
