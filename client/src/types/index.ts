export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  url: string;
  store: string;
  inStock: boolean;
  unit: string;
  description: string;
  size?: string;
  weight?: string;
  offer?: string;
  brand?: string;
}

export interface StoreSearchResult {
  storeName: string;
  products: Product[];
  error: string | null;
}

export interface SearchResults {
  searchTerm: string;
  results: Record<string, StoreSearchResult>;
  timestamp: string;
}

// Progressive loading types
export type StoreLoadingStatus = 'pending' | 'loading' | 'completed' | 'error';

export interface StoreProgress {
  id: string;
  name: string;
  status: StoreLoadingStatus;
  progress: number;
  products?: Product[];
  error?: string | null;
}

export interface StreamingSearchState {
  searchTerm: string;
  stores: Record<string, StoreProgress>;
  isComplete: boolean;
  hasError: boolean;
}

// Streaming API event types
export interface ProgressEvent {
  type: 'progress';
  searchTerm: string;
  stores: StoreProgress[];
  timestamp: string;
}

export interface StoreUpdateEvent {
  type: 'store_update';
  storeId: string;
  status: StoreLoadingStatus;
  progress: number;
  timestamp: string;
}

export interface StoreCompleteEvent {
  type: 'store_complete';
  storeId: string;
  storeName: string;
  status: StoreLoadingStatus;
  progress: number;
  products: Product[];
  error: string | null;
  timestamp: string;
}

export interface CompleteEvent {
  type: 'complete';
  timestamp: string;
}

export interface ErrorEvent {
  type: 'error';
  error: string;
  timestamp: string;
}

export type StreamingEvent = ProgressEvent | StoreUpdateEvent | StoreCompleteEvent | CompleteEvent | ErrorEvent;

export interface Store {
  id: string;
  name: string;
  baseUrl: string;
}

export interface ComparisonProduct {
  storeId: string;
  product: Product;
}
