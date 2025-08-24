export interface Supermarket {
  id: number;
  name_en: string;
  name_zh: string;
  location: string;
  logo_url: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  rating?: number;
}

export interface Product {
  id: number;
  name_en: string;
  name_zh: string;
  image: string;
  price: number;
  originalPrice?: number;
  unit: string;
  supermarket_id: number;
  supermarket?: Supermarket;
  category: 'vegetable' | 'fruit' | 'meat' | 'seafood' | 'dairy';
  updated_at: string;
  isSpecial?: boolean;
  specialEndDate?: string;
  discount?: number;
  origin?: string;
  freshness?: string;
  rating?: number;
}

export interface Special {
  product_id: number;
  special_price: number;
  start_date: string;
  end_date: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  region?: string;
  language: 'en' | 'zh';
  favoriteProducts: number[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  region?: string;
}

export type Language = 'en' | 'zh';
export type Category = 'all' | 'vegetable' | 'fruit' | 'meat' | 'seafood' | 'dairy';
export type SortBy = 'price_asc' | 'price_desc' | 'updated' | 'name';

export interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRegion: Record<string, number>;
  usersByLanguage: Record<string, number>;
}

export interface AdminUser extends User {
  isAdmin: boolean;
}

export interface UserExportData {
  users: User[];
  stats: UserStats;
  exportDate: string;
}