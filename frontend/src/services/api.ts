import axios from 'axios';
import {
  ComparisonMatrixResponse,
  SearchHistoryItem,
  SupplierConnector,
  DashboardStats,
  PriceHistoryResponse,
  User
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('craftsman_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('craftsman_token');
        localStorage.removeItem('craftsman_user');
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async listUsers(): Promise<User[]> {
    const res = await api.get('/auth/users');
    return res.data;
  },

  async createUser(userData: any): Promise<User> {
    const res = await api.post('/auth/users', userData);
    return res.data;
  },

  async toggleUserActive(userId: number): Promise<User> {
    const res = await api.put(`/auth/users/${userId}/toggle`);
    return res.data;
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  // Search
  async searchProduct(payload: {
    query: string;
    part_number?: string;
    category?: string;
    target_currency?: string;
    manufacturer?: string;
    specifications?: Record<string, any>;
  }): Promise<ComparisonMatrixResponse> {
    const res = await api.post('/search', payload);
    return res.data;
  },

  async getSearchResults(searchId: number): Promise<ComparisonMatrixResponse> {
    const res = await api.get(`/search/${searchId}/results`);
    return res.data;
  },

  async getSearchHistory(limit = 50): Promise<SearchHistoryItem[]> {
    const res = await api.get(`/search/history?limit=${limit}`);
    return res.data;
  },

  // Suppliers & Connectors
  async getConnectors(): Promise<SupplierConnector[]> {
    const res = await api.get('/suppliers/connectors');
    return res.data;
  },

  async updateConnector(slotNumber: number, data: Partial<SupplierConnector>): Promise<SupplierConnector> {
    const res = await api.put(`/suppliers/connectors/${slotNumber}`, data);
    return res.data;
  },

  async toggleConnector(slotNumber: number): Promise<SupplierConnector> {
    const res = await api.post(`/suppliers/connectors/${slotNumber}/toggle`);
    return res.data;
  },

  async testConnector(slotNumber: number): Promise<{
    slot_number: number;
    supplier_name: string;
    status: string;
    latency_ms: number;
    message: string;
  }> {
    const res = await api.post(`/suppliers/connectors/${slotNumber}/test`);
    return res.data;
  },

  // Price History
  async getPartPriceHistory(partNumber: string): Promise<PriceHistoryResponse> {
    const res = await api.get(`/comparison/history/${encodeURIComponent(partNumber)}`);
    return res.data;
  },

  // Reports
  getExcelExportUrl(searchId: number): string {
    return `${API_BASE}/reports/export/excel/${searchId}`;
  },

  getPdfExportUrl(searchId: number): string {
    return `${API_BASE}/reports/export/pdf/${searchId}`;
  },

  // Excel BOM Batch Discovery
  async uploadExcelBOM(file: File): Promise<{
    success: boolean;
    filename: string;
    total_items: number;
    items: Array<{
      row_number: number;
      item_code: string;
      raw_description: string;
      clean_query: string;
      extracted_part_number: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/search/upload-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async runBatchSearch(items: Array<{
    item_code: string;
    raw_description?: string;
    clean_query?: string;
    part_number?: string;
  }>, target_currency = 'INR'): Promise<{
    total_items: number;
    results: any[];
  }> {
    const res = await api.post('/search/batch-search', {
      items,
      target_currency,
    });
    return res.data;
  },

  async exportBatchExcel(results: any[]): Promise<Blob> {
    const res = await api.post('/search/export-batch-excel', { results }, {
      responseType: 'blob'
    });
    return res.data;
  },

  getSampleTemplateUrl(): string {
    return `${API_BASE}/search/sample-template`;
  }
};

