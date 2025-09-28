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

export interface Store {
  id: string;
  name: string;
  baseUrl: string;
}

export interface ComparisonProduct {
  storeId: string;
  product: Product;
}
