import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error('❌ Supabase环境变量未配置');
  console.log('请在.env文件中配置:');
  console.log('VITE_SUPABASE_URL=https://yqnvmjbizbgtapfffgdt.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your_anon_key_here');
}

// Create a mock client if environment variables are not configured
const createMockClient = () => {
  // Create a chainable mock query builder
  const createMockQueryBuilder = (defaultResponse: any) => {
    const mockBuilder = {
      select: () => mockBuilder,
      insert: () => mockBuilder,
      update: () => mockBuilder,
      delete: () => mockBuilder,
      upsert: () => mockBuilder,
      eq: () => mockBuilder,
      order: () => mockBuilder,
      limit: () => mockBuilder,
      single: () => mockBuilder,
      then: (resolve: (value: any) => void) => {
        resolve(defaultResponse);
        return Promise.resolve(defaultResponse);
      },
      catch: (_reject: (error: any) => void) => {
        return Promise.resolve(defaultResponse);
      },
      or: () => mockBuilder
    };
    return mockBuilder;
  };

  return {
    from: (table: string) => {
      const defaultResponse = { data: [], error: { message: 'Supabase not configured' } };
      return createMockQueryBuilder(defaultResponse);
    },
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  };
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        debug: true
      },
      // Important: do NOT set global Authorization header with anon key,
      // supabase-js will attach the user's access token automatically.
      // Setting Authorization here would override the per-request auth token
      // and cause 401/RLS errors on row-level secured tables.
      global: {
        headers: {
          'x-client-info': 'upick-grocery-app',
          'apikey': supabaseAnonKey
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : createMockClient();

// Connection status cache
let connectionCache: { status: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute

// 限制并发连接数
let activeConnections = 0;
const MAX_CONCURRENT_CONNECTIONS = 3;

// 连接队列
const connectionQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

// 处理连接队列
const processConnectionQueue = async () => {
  if (isProcessingQueue || connectionQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (connectionQueue.length > 0 && activeConnections < MAX_CONCURRENT_CONNECTIONS) {
    const task = connectionQueue.shift();
    if (task) {
      activeConnections++;
      task().finally(() => {
        activeConnections--;
      });
    }
  }
  
  isProcessingQueue = false;
};

// 添加到连接队列
const queueConnection = <T>(task: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    connectionQueue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processConnectionQueue();
  });
};

// 测试数据库连接（带缓存和队列）
export const testConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase未配置，使用模拟模式');
    return false;
  }

  // Check cache first
  if (connectionCache && (Date.now() - connectionCache.timestamp < CACHE_DURATION)) {
    console.log('🔄 使用缓存的连接状态:', connectionCache.status);
    return connectionCache.status;
  }

  try {
    return await queueConnection(async () => {
      console.log('🔌 测试Supabase连接...');
      
      // 使用最简单的查询测试连接，设置8秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        // 测试最基本的连接 - 使用公共表
        const { data, error } = await supabase
          .from('supermarkets')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);
        
        clearTimeout(timeoutId);
        
        const isConnected = !error;
        
        // Update cache
        connectionCache = {
          status: isConnected,
          timestamp: Date.now()
        };
        
        if (error) {
          console.warn('⚠️ 数据库连接测试失败:', error.message);
          return false;
        }
        
        console.log('✅ 数据库连接成功');
        return true;
      } catch (requestError) {
        clearTimeout(timeoutId);
        throw requestError;
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⚠️ 数据库连接超时 (8秒)');
    } else {
      console.warn('⚠️ 数据库连接测试异常:', error);
    }
    
    // Cache the failure
    connectionCache = {
      status: false,
      timestamp: Date.now()
    };
    
    return false;
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          region?: string;
          language: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
          last_login_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          region?: string;
          language?: string;
          avatar_url?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          region?: string;
          language?: string;
          avatar_url?: string;
          updated_at?: string;
          last_login_at?: string;
        };
      };
      supermarkets: {
        Row: {
          id: number;
          name_en: string;
          name_zh: string;
          location: string;
          logo_url?: string;
          latitude: number;
          longitude: number;
          phone?: string;
          hours?: string;
          rating?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name_en: string;
          name_zh: string;
          location: string;
          logo_url?: string;
          latitude: number;
          longitude: number;
          phone?: string;
          hours?: string;
          rating?: number;
        };
        Update: {
          name_en?: string;
          name_zh?: string;
          location?: string;
          logo_url?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          hours?: string;
          rating?: number;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: number;
          name_en: string;
          name_zh: string;
          image_url?: string;
          price: number;
          original_price?: number;
          unit: string;
          supermarket_id: number;
          category: string;
          origin?: string;
          freshness?: string;
          rating?: number;
          is_special: boolean;
          special_end_date?: string;
          discount_percentage?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name_en: string;
          name_zh: string;
          image_url?: string;
          price: number;
          original_price?: number;
          unit: string;
          supermarket_id: number;
          category: string;
          origin?: string;
          freshness?: string;
          rating?: number;
          is_special?: boolean;
          special_end_date?: string;
          discount_percentage?: number;
        };
        Update: {
          name_en?: string;
          name_zh?: string;
          image_url?: string;
          price?: number;
          original_price?: number;
          unit?: string;
          supermarket_id?: number;
          category?: string;
          origin?: string;
          freshness?: string;
          rating?: number;
          is_special?: boolean;
          special_end_date?: string;
          discount_percentage?: number;
          updated_at?: string;
        };
      };
      user_favorites: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: number;
        };
        Update: {
          user_id?: string;
          product_id?: number;
        };
      };
      price_history: {
        Row: {
          id: number;
          product_id: number;
          price: number;
          original_price?: number;
          is_special: boolean;
          recorded_at: string;
        };
        Insert: {
          product_id: number;
          price: number;
          original_price?: number;
          is_special?: boolean;
        };
        Update: {
          product_id?: number;
          price?: number;
          original_price?: number;
          is_special?: boolean;
        };
      };
    };
  };
}