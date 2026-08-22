import type { ItemReport, MatchResult } from '../types';
import { saveReport, saveMatch, getAllReports, clearAllData } from './db';
import { extractStructuredAttributes, generateItemEmbedding } from './ai';

const SAMPLE_REPORTS: Array<Omit<ItemReport, 'structuredAttributes' | 'embedding'>> = [
  {
    id: 'sample_lost_1',
    type: 'lost',
    reporterName: 'Alex Rivera',
    contactInfo: 'alex.rivera@student.campus.edu | 555-0192',
    photoBase64: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    description: 'Black JanSport backpack with a red key fob and laptop inside. Left on a chair near the tables.',
    location: 'Cafe(ground Floor)',
    dateTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_found_1',
    type: 'found',
    reporterName: 'Sarah Chen (Cafe Staff)',
    contactInfo: 'cafe-desk@campus.edu | Ext 4410',
    photoBase64: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    description: 'Found a black canvas JanSport backpack with a red keychain attached. Turn in at ground floor cafe counter.',
    location: 'Cafe(ground Floor)',
    dateTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_lost_2',
    type: 'lost',
    reporterName: 'Marcus Vance',
    contactInfo: 'mvance@campus.edu',
    photoBase64: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Silver Apple AirPods Max headphones in smart case. Scratched right ear cup.',
    location: 'cafe(6th Floor)',
    dateTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_found_2',
    type: 'found',
    reporterName: 'David Miller',
    contactInfo: 'david.m@campus.edu',
    photoBase64: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Silver over-ear wireless Apple headphones handed to 6th floor cafe counter.',
    location: 'cafe(6th Floor)',
    dateTime: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_lost_3',
    type: 'lost',
    reporterName: 'Emily Watson',
    contactInfo: 'emily.watson@student.edu',
    photoBase64: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: '32oz Hydro Flask water bottle, matte olive green color with sticker of Yellowstone Park.',
    location: 'NIAT LAB',
    dateTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_found_3',
    type: 'found',
    reporterName: 'Lab Staff Duty',
    contactInfo: 'niat-lab@campus.edu',
    photoBase64: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: 'Green metal water flask with national park stickers left by bench in NIAT LAB.',
    location: 'NIAT LAB',
    dateTime: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_lost_4',
    type: 'lost',
    reporterName: 'Jordan Reed',
    contactInfo: 'jreed@student.edu',
    photoBase64: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    description: 'Campus Student ID Card for Jordan Reed, Computer Science Department.',
    location: 'LH 17(C Block)',
    dateTime: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'active',
  },
];

export async function seedInitialDemoData(): Promise<void> {
  const existing = await getAllReports();
  if (existing.length > 0) return; // Don't seed if data already exists

  console.log('Seeding initial campus demo reports...');

  for (const sample of SAMPLE_REPORTS) {
    const attributes = await extractStructuredAttributes(sample.photoBase64, sample.description, sample.type);
    const embedding = await generateItemEmbedding(`${attributes.category} ${attributes.brand} ${sample.description}`);

    const fullReport: ItemReport = {
      ...sample,
      structuredAttributes: attributes,
      embedding,
    };

    await saveReport(fullReport);
  }

  // Pre-calculate sample match pair between sample_lost_1 and sample_found_1
  const lost1 = await getAllReports().then((rs) => rs.find((r) => r.id === 'sample_lost_1'));
  const found1 = await getAllReports().then((rs) => rs.find((r) => r.id === 'sample_found_1'));

  if (lost1 && found1) {
    const match: MatchResult = {
      id: 'sample_match_1',
      lostReportId: lost1.id,
      foundReportId: found1.id,
      confidenceScore: 94,
      explanation: 'High confidence match: Both reports describe a black JanSport backpack with a red key fob/keychain located at Cafe(ground Floor) within a 2-hour window.',
      matchedAttributes: ['JanSport Brand', 'Black Color', 'Red Keychain/Key Fob', 'Cafe(ground Floor) Location'],
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    await saveMatch(match);
  }

  // Pre-calculate sample match pair between sample_lost_2 and sample_found_2
  const lost2 = await getAllReports().then((rs) => rs.find((r) => r.id === 'sample_lost_2'));
  const found2 = await getAllReports().then((rs) => rs.find((r) => r.id === 'sample_found_2'));

  if (lost2 && found2) {
    const match2: MatchResult = {
      id: 'sample_match_2',
      lostReportId: lost2.id,
      foundReportId: found2.id,
      confidenceScore: 91,
      explanation: 'High confidence match: Both reports describe silver wireless Apple AirPods Max headphones handed in at cafe(6th Floor).',
      matchedAttributes: ['Apple Brand', 'AirPods Max / Wireless Headphones', 'Silver Color', 'cafe(6th Floor)'],
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    await saveMatch(match2);
  }
}

export async function resetAndSeedDemoData(): Promise<void> {
  await clearAllData();
  await seedInitialDemoData();
}
