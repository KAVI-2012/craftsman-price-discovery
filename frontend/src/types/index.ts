export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'procurement';
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PriceInfo {
  original_price: number | null;
  currency: string;
  original_uom?: string;
  common_uom?: string;
  normalized_price_inr: number | null;
  normalized_price_common?: number | null;
  is_uom_normalized?: boolean;
  uom_conversion_status?: string;
  price_type: 'Verified Published' | 'Indicative' | 'Estimated' | 'RFQ' | 'Unavailable';
  tax_included: boolean;
  tax_rate: number;
  shipping_charges: number;
  moq: string;
  availability: string;
  supplier_location: string;
  last_checked_at: string;
}

export interface ComparisonItem {
  result_id: number;
  slot_number: number;
  supplier_name: string;
  product_name: string;
  part_number: string | null;
  manufacturer: string | null;
  description: string | null;
  specifications: Record<string, any>;
  source_url: string;
  match_confidence: number;
  match_classification: 'Exact Match' | 'Compatible Match' | 'High Similarity' | 'Partial Match' | 'Incompatible / No Match' | string;
  is_compatible?: boolean;
  price_info: PriceInfo;
  is_lowest_price: boolean;
  price_delta_percent: number | null;
}

export interface SupplierStatus {
  slot_number: number;
  supplier_name: string;
  status: 'SUCCESS' | 'FAILED';
  items_count: number;
  response_time_ms: number;
  error?: string | null;
}

export interface ComparisonMatrixResponse {
  search_id: number;
  query_text: string;
  part_number: string | null;
  status: string;
  execution_time_seconds: number;
  total_suppliers_queried: number;
  successful_suppliers_count: number;
  failed_suppliers_count: number;
  lowest_price: number | null;
  highest_price: number | null;
  average_price: number | null;
  median_price: number | null;
  potential_savings_amount: number | null;
  potential_savings_percentage: number | null;
  currency: string;
  common_uom?: string;
  items: ComparisonItem[];
  supplier_statuses: SupplierStatus[];
}

export interface SearchHistoryItem {
  id: number;
  query_text: string;
  part_number: string | null;
  category: string | null;
  created_at: string;
  status: string;
  suppliers_succeeded_count: number;
  lowest_price: number | null;
  user_email: string | null;
}

export interface SupplierConnector {
  id: number;
  slot_number: number;
  supplier_name: string;
  adapter_type: string;
  base_url: string;
  search_endpoint: string;
  api_key?: string | null;
  api_secret?: string | null;
  is_enabled: boolean;
  timeout_seconds: number;
  last_status: 'HEALTHY' | 'DEGRADED' | 'ERROR' | 'DISABLED';
  last_checked_at: string;
  success_count: number;
  error_count: number;
  last_error_message?: string | null;
}

export interface DashboardStats {
  total_searches: number;
  total_suppliers_configured: number;
  active_suppliers_count: number;
  successful_connections_rate: number;
  total_products_discovered: number;
  total_potential_savings: number;
  currency: string;
  recent_searches: Array<{
    id: number;
    query_text: string;
    part_number: string | null;
    date: string;
    status: string;
    suppliers_count: number;
    lowest_price: number;
    highest_price: number;
    savings: number;
  }>;
  recent_price_trends: Array<{
    part_number: string;
    supplier_name: string;
    price_inr: number;
    recorded_at: string;
  }>;
  supplier_reliability: Array<{
    slot_number: number;
    supplier_name: string;
    adapter_type: string;
    status: string;
    is_enabled: boolean;
    reliability_rate: number;
    success_count: number;
    error_count: number;
  }>;
}

export interface PriceHistoryResponse {
  part_number: string;
  has_history: boolean;
  total_records: number;
  data_points: Array<{
    id: number;
    supplier_name: string;
    price: number;
    currency: string;
    normalized_price_inr: number;
    recorded_at: string;
  }>;
  supplier_trends: Array<{
    supplier_name: string;
    previous_price: number;
    current_price: number;
    difference: number;
    percentage_change: number;
    trend: 'INCREASED' | 'DECREASED' | 'STABLE' | 'FIRST_OBSERVATION';
  }>;
}

