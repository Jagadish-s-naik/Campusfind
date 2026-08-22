export type ReportType = 'lost' | 'found';

export type CampusLocation =
  | 'Cafe(ground Floor)'
  | 'cafe(6th Floor)'
  | 'NIAT LAB'
  | 'Mayura Block(ground Floor)'
  | 'Seminar Hall'
  | 'Prayer Hall'
  | 'Maintainance Room'
  | 'Computer Lab'
  | 'IT Support room'
  | 'LH 17(C Block)'
  | 'Lift A Block'
  | 'Lift C Block'
  | 'Wash Room';

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
  studentCampusId?: string;
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
  spatialProximity?: 'Same Location' | 'Adjacent Area' | 'Campus Wide';
  temporalProximityHours?: number;
  priorityLevel?: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'ROUTINE';
  createdAt: string;
  status: 'pending' | 'confirmed' | 'dismissed';
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  'Cafe(ground Floor)',
  'cafe(6th Floor)',
  'NIAT LAB',
  'Mayura Block(ground Floor)',
  'Seminar Hall',
  'Prayer Hall',
  'Maintainance Room',
  'Computer Lab',
  'IT Support room',
  'LH 17(C Block)',
  'Lift A Block',
  'Lift C Block',
  'Wash Room',
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
