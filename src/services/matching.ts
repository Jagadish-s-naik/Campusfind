import type { ItemReport, MatchResult } from '../types';
import { getAllReports, saveMatch, getAllMatches } from './db';
import { cosineSimilarity } from '../utils/similarity';
import { evaluateMatchWithGemini } from './ai';

/**
 * Executes the full matching pipeline when a new report is filed:
 * 1. Vector cosine similarity pre-filtering against opposite-type reports (Top 5 candidates)
 * 2. Pairwise Gemini API evaluation on candidate reports
 * 3. Persists resulting match objects in IndexedDB
 */
export async function triggerMatchingEngine(newReport: ItemReport): Promise<MatchResult[]> {
  const allReports = await getAllReports();
  const existingMatches = await getAllMatches();

  // Find all opposite type reports (Lost vs Found)
  const oppositeType = newReport.type === 'lost' ? 'found' : 'lost';
  const candidates = allReports.filter(
    (r) => r.type === oppositeType && r.status === 'active' && r.id !== newReport.id
  );

  if (candidates.length === 0) {
    return [];
  }

  // Pre-filter step: Calculate vector similarity using stored embeddings
  const scoredCandidates = candidates
    .map((candidate) => {
      let similarityScore = 0;
      if (newReport.embedding && candidate.embedding) {
        similarityScore = cosineSimilarity(newReport.embedding, candidate.embedding);
      } else {
        // Fallback text overlap if embedding vector is missing
        const desc1 = newReport.description.toLowerCase();
        const desc2 = candidate.description.toLowerCase();
        similarityScore = desc1.split(' ').filter((w) => desc2.includes(w)).length / 10;
      }

      // Proximity boost if location matches exactly
      if (newReport.location === candidate.location) {
        similarityScore += 0.25;
      }

      return { candidate, similarityScore };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5); // Take top 5 candidate matches

  const newMatchResults: MatchResult[] = [];

  // Pairwise evaluation using Gemini
  for (const { candidate } of scoredCandidates) {
    const lostReport = newReport.type === 'lost' ? newReport : candidate;
    const foundReport = newReport.type === 'found' ? newReport : candidate;

    // Check if match pair already evaluated
    const existingMatch = existingMatches.find(
      (m) => m.lostReportId === lostReport.id && m.foundReportId === foundReport.id
    );

    if (existingMatch) {
      newMatchResults.push(existingMatch);
      continue;
    }

    // Call Gemini Pairwise API
    const matchData = await evaluateMatchWithGemini(
      {
        description: lostReport.description,
        location: lostReport.location,
        dateTime: lostReport.dateTime,
        attributes: lostReport.structuredAttributes,
      },
      {
        description: foundReport.description,
        location: foundReport.location,
        dateTime: foundReport.dateTime,
        attributes: foundReport.structuredAttributes,
      }
    );

    // Only persist matches with confidence score >= 35%
    if (matchData.confidenceScore >= 35) {
      const matchRecord: MatchResult = {
        id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        lostReportId: lostReport.id,
        foundReportId: foundReport.id,
        confidenceScore: matchData.confidenceScore,
        explanation: matchData.explanation,
        matchedAttributes: matchData.matchedAttributes,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      await saveMatch(matchRecord);
      newMatchResults.push(matchRecord);
    }
  }

  return newMatchResults;
}
