import axios from 'axios';
import { SearchResults, Store } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds timeout for scraping operations
});

export const searchProducts = async (searchTerm: string): Promise<SearchResults> => {
  const response = await api.get(`/stores/search?q=${encodeURIComponent(searchTerm)}`);
  return response.data;
};

export const getStores = async (): Promise<Store[]> => {
  const response = await api.get('/stores');
  return response.data;
};

export const getProductDetails = async (storeId: string, productId: string) => {
  const response = await api.get(`/stores/${storeId}/product/${productId}`);
  return response.data;
};
