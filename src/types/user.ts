export interface UserFavorite {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
  product?: {
    id: number;
    name_en: string;
    name_zh: string;
    image_url: string;
    price: number;
    original_price?: number;
    unit: string;
    category: string;
    supermarket_id: number;
    is_special: boolean;
    discount_percentage?: number;
    supermarket?: {
      id: number;
      name_en: string;
      name_zh: string;
      location: string;
      logo_url: string;
      latitude: number;
      longitude: number;
    };
  };
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  notes?: string;
  added_at: string;
  updated_at: string;
  product?: {
    id: number;
    name_en: string;
    name_zh: string;
    image_url: string;
    price: number;
    original_price?: number;
    unit: string;
    category: string;
    supermarket_id: number;
    is_special: boolean;
    discount_percentage?: number;
    supermarket?: {
      id: number;
      name_en: string;
      name_zh: string;
      location: string;
      logo_url: string;
      latitude: number;
      longitude: number;
    };
  };
}

export interface PriceAlert {
  id: number;
  user_id: string;
  product_id: number;
  target_price?: number;
  alert_enabled: boolean;
  last_notified_at?: string;
  created_at: string;
  product?: {
    id: number;
    name_en: string;
    name_zh: string;
    image_url: string;
    price: number;
    unit: string;
    supermarket?: {
      name_en: string;
      name_zh: string;
    };
  };
}

export interface ShoppingRoute {
  stores: Array<{
    id: number;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    products: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
      total_cost: number;
    }>;
    store_total: number;
    estimated_time_minutes: number;
  }>;
  total_cost: number;
  total_time_minutes: number;
  total_distance_km: number;
  efficiency_score: number;
}

export interface RouteOptimization {
  original_cost: number;
  optimized_cost: number;
  savings: number;
  time_estimate: number;
  stores_to_visit: number;
}