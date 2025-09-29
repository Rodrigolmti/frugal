export interface StoreInfo {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  color: string;
  website: string;
}

export const CANADIAN_STORES: StoreInfo[] = [
  {
    id: 'real-canadian-superstore',
    name: 'Real Canadian Superstore',
    displayName: 'Superstore',
    color: 'bg-red-500',
    website: 'https://www.realcanadiansuperstore.ca',
  },
  {
    id: 'safeway',
    name: 'Safeway',
    displayName: 'Safeway',
    color: 'bg-green-600',
    website: 'https://www.safeway.ca',
  },
  {
    id: 'no-frills',
    name: 'No Frills',
    displayName: 'No Frills',
    color: 'bg-yellow-500',
    website: 'https://www.nofrills.ca',
  },
  {
    id: 'sobeys',
    name: 'Sobeys',
    displayName: 'Sobeys',
    color: 'bg-blue-600',
    website: 'https://www.sobeys.com',
  },
  {
    id: 'save-on-foods',
    name: 'Save-On-Foods',
    displayName: 'Save-On-Foods',
    color: 'bg-green-600',
    website: 'https://www.saveonfoods.com',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    displayName: 'Walmart',
    color: 'bg-blue-600',
    website: 'https://www.walmart.ca',
  },
];

export const STORE_COLORS = {
  'real-canadian-superstore': '#dc2626', // red-600
  'safeway': '#059669', // emerald-600
  'no-frills': '#d97706', // amber-600
  'sobeys': '#2563eb', // blue-600
  'save-on-foods': '#059669', // emerald-600
  'walmart': '#2563eb', // blue-600
} as const;
