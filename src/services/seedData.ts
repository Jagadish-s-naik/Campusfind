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
    description: 'Black JanSport backpack with a red key fob and laptop inside. Left on a chair near the windows.',
    location: 'Library Main Entrance',
    dateTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_found_1',
    type: 'found',
    reporterName: 'Sarah Chen (Library Desk)',
    contactInfo: 'library-desk@campus.edu | Ext 4410',
    photoBase64: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    description: 'Found a black canvas JanSport backpack with a red keychain attached. Turn in at front reception desk.',
    location: 'Library Main Entrance',
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
    location: 'Central Cafeteria',
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
    description: 'Silver over-ear wireless Apple headphones handed to cafeteria cashier booth.',
    location: 'Central Cafeteria',
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
    location: 'Student Gym & Fitness Center',
    dateTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'sample_found_3',
    type: 'found',
    reporterName: 'Gym Staff Duty',
    contactInfo: 'gym-reception@campus.edu',
    photoBase64: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: 'Green metal water flask with national park stickers left by bench 4.',
    location: 'Student Gym & Fitness Center',
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
    location: 'Lecture Hall 2 (Engineering)',
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

    const report: ItemReport = {
      ...sample,
      structuredAttributes: attributes,
      embedding,
    };

    await saveReport(report);
  }

  // Seed sample match results
  const sampleMatches: MatchResult[] = [
    {
      id: 'match_sample_1',
      lostReportId: 'sample_lost_1',
      foundReportId: 'sample_found_1',
      confidenceScore: 96,
      explanation: 'Both reports detail a black JanSport backpack featuring a red keychain, reported at the Library Main Entrance within 2 hours of each other.',
      matchedAttributes: ['Black JanSport backpack', 'Red keychain attached', 'Library Main Entrance location', 'Matched timestamp window'],
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: 'match_sample_2',
      lostReportId: 'sample_lost_2',
      foundReportId: 'sample_found_2',
      confidenceScore: 88,
      explanation: 'Both reports refer to silver over-ear wireless Apple headphones located at the Central Cafeteria.',
      matchedAttributes: ['Silver Apple headphones', 'Wireless over-ear', 'Central Cafeteria'],
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: 'match_sample_3',
      lostReportId: 'sample_lost_3',
      foundReportId: 'sample_found_3',
      confidenceScore: 91,
      explanation: 'Both items describe a green metal Hydro Flask water bottle with national park stickers lost at the Student Gym.',
      matchedAttributes: ['Green Hydro Flask', 'National Park stickers', 'Student Gym'],
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
  ];

  for (const m of sampleMatches) {
    await saveMatch(m);
  }

  console.log('Initial demo dataset successfully seeded into IndexedDB.');
}

export async function resetAndSeedDemoData(): Promise<void> {
  await clearAllData();
  await seedInitialDemoData();
}
