export type ReportType = 'lost' | 'found';

export type CampusLocation =
  | 'Library Main Entrance'
  | 'Central Cafeteria'
  | 'Student Gym & Fitness Center'
  | 'Hostel Block A'
  | 'Hostel Block B'
  | 'Main Gate Security Office'
  | 'Lecture Hall 1 (Science)'
  | 'Lecture Hall 2 (Engineering)'
  | 'Lecture Hall 3 (Arts)'
  | 'Central Parking Lot'
  | 'Sports Complex'
  | 'Admin Block & Student Affairs';

export interface StructuredAttributes {
  category: string;
  color: string[];
  brand: string;
  distinguishing_features: string[];
  summary: string;
}

export interface ItemReport {
  id: string;
  type: ReportType;
  reporterName: string;
  contactInfo: string;
  photoBase64: string;
  description: string;
  location: CampusLocation;
  locationDetails?: string;
  dateTime: string; // ISO string
  structuredAttributes: StructuredAttributes;
  embedding?: number[];
  createdAt: string; // ISO string
  status: 'active' | 'resolved';
}

export interface MatchResult {
  id: string;
  lostReportId: string;
  foundReportId: string;
  confidenceScore: number; // 0 - 100
  explanation: string;
  matchedAttributes: string[];
  createdAt: string;
  status: 'pending' | 'confirmed' | 'dismissed';
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  'Library Main Entrance',
  'Central Cafeteria',
  'Student Gym & Fitness Center',
  'Hostel Block A',
  'Hostel Block B',
  'Main Gate Security Office',
  'Lecture Hall 1 (Science)',
  'Lecture Hall 2 (Engineering)',
  'Lecture Hall 3 (Arts)',
  'Central Parking Lot',
  'Sports Complex',
  'Admin Block & Student Affairs',
];

export const ITEM_CATEGORIES = [
  'Backpacks & Bags',
  'Electronics & Laptops',
  'Audio & Headphones',
  'Water Bottles & Flasks',
  'ID Cards & Wallets',
  'Keys & Keychains',
  'Books & Notebooks',
  'Apparel & Accessories',
  'Eyewear',
  'Other',
];
