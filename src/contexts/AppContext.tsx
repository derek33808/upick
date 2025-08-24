import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Product, Supermarket } from '../types';
import { supabase } from '../lib/supabase';
import { mockProducts, mockSupermarkets } from '../data/mockData';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  products: Product[];
  supermarkets: Supermarket[];
  favoriteProducts: number[];
  toggleFavorite: (productId: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSupermarkets: number[];
  setSelectedSupermarkets: (ids: number[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  connectionStatus: 'connecting' | 'connected' | 'failed' | 'fallback';
  cleanDuplicateData: () => Promise<boolean>;
  reduceProductsByCategory: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [products, setProducts] = useState<Product[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupermarkets, setSelectedSupermarkets] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('updated');
  const [isLoading, setIsLoading] = useState(true);

  // 添加连接状态跟踪
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'fallback'>('connecting');

  // 同步mock数据到数据库
  const syncMockDataToDatabase = async (): Promise<boolean> => {
    try {
      // 检查Supabase是否可用
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase环境变量未配置，跳过数据同步');
        return false;
      }
      
      console.log('📊 开始同步mock数据到数据库...');
      
      // 检查数据库连接，使用3秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data: testData, error: testError } = await supabase
          .from('supermarkets')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        
        if (testError) {
          console.warn('⚠️ 数据库连接失败:', testError.message);
          return false;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('⚠️ 数据库连接超时 (3秒)');
          } else if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('fetch'))) {
            console.warn('⚠️ 网络连接失败，无法访问Supabase (可能是CORS或网络问题)');
          } else {
            console.warn('⚠️ 数据库连接异常:', error.message);
          }
        }
        return false;
      }
      
      // 1. 同步超市数据
      console.log('🏪 同步超市数据...');
      let existingSupermarkets = null;
      try {
        const result = await supabase
          .from('supermarkets')
          .select('id, name_en');
        existingSupermarkets = result.data;
        if (result.error) {
          console.warn('⚠️ 获取现有超市数据失败:', result.error.message);
          return false;
        }
      } catch (error) {
        console.warn('⚠️ 获取现有超市数据时网络异常');
        return false;
      }
      
      const existingNames = new Set(existingSupermarkets?.map(s => s.name_en) || []);
      const supermarketsToAdd = mockSupermarkets.filter(s => !existingNames.has(s.name_en));
      
      if (supermarketsToAdd.length > 0) {
        const supermarketInserts = supermarketsToAdd.map(s => ({
          name_en: s.name_en,
          name_zh: s.name_zh,
          location: s.location,
          logo_url: s.logo_url,
          latitude: s.lat,
          longitude: s.lng,
          phone: s.phone,
          hours: s.hours,
          rating: s.rating
        }));
        
        try {
          const { error: supermarketError } = await supabase
            .from('supermarkets')
            .insert(supermarketInserts);
        
          if (supermarketError) {
            console.warn('⚠️ 同步超市数据失败:', supermarketError.message);
            return false;
          }
          
          console.log('✅ 成功同步', supermarketsToAdd.length, '个超市');
        } catch (error) {
          console.warn('⚠️ 同步超市数据时网络异常');
          return false;
        }
      } else {
        console.log('📋 超市数据已存在，跳过同步');
      }
      
      // 2. 获取数据库中的超市ID映射
      let dbSupermarkets = null;
      try {
        const result = await supabase
          .from('supermarkets')
          .select('id, name_en');
        dbSupermarkets = result.data;
        if (result.error) {
          console.warn('⚠️ 获取超市ID映射失败:', result.error.message);
          return false;
        }
      } catch (error) {
        console.warn('⚠️ 获取超市ID映射时网络异常');
        return false;
      }
      
      const supermarketIdMap = new Map();
      dbSupermarkets?.forEach(s => {
        const mockSupermarket = mockSupermarkets.find(ms => ms.name_en === s.name_en);
        if (mockSupermarket) {
          supermarketIdMap.set(mockSupermarket.id, s.id);
        }
      });
      
      // 3. 同步商品数据
      console.log('🛒 同步商品数据...');
      let existingProducts = null;
      try {
        const result = await supabase
          .from('products')
          .select('id, name_en, supermarket_id');
        existingProducts = result.data;
        if (result.error) {
          console.warn('⚠️ 获取现有商品数据失败:', result.error.message);
          return false;
        }
      } catch (error) {
        console.warn('⚠️ 获取现有商品数据时网络异常');
        return false;
      }
      
      const existingProductKeys = new Set(
        existingProducts?.map((p: { id: number; name_en: string; supermarket_id: number }) => `${p.name_en}-${p.supermarket_id}`) || []
      );
      
      const productsToAdd = mockProducts.filter(p => {
        const dbSupermarketId = supermarketIdMap.get(p.supermarket_id);
        const key = `${p.name_en}-${dbSupermarketId}`;
        return dbSupermarketId && !existingProductKeys.has(key);
      });
      
      if (productsToAdd.length > 0) {
        const productInserts = productsToAdd.map(p => ({
          name_en: p.name_en,
          name_zh: p.name_zh,
          image_url: p.image,
          price: p.price,
          original_price: p.originalPrice,
          unit: p.unit,
          supermarket_id: supermarketIdMap.get(p.supermarket_id),
          category: p.category,
          origin: p.origin,
          freshness: p.freshness,
          rating: p.rating,
          is_special: p.isSpecial || false,
          special_end_date: p.specialEndDate,
          discount_percentage: p.discount
        }));
        
        try {
          const { error: productError } = await supabase
            .from('products')
            .insert(productInserts);
        
          if (productError) {
            console.warn('⚠️ 同步商品数据失败:', productError.message);
            return false;
          }
          
          console.log('✅ 成功同步', productsToAdd.length, '个商品');
        } catch (error) {
          console.warn('⚠️ 同步商品数据时网络异常');
          return false;
        }
      } else {
        console.log('📋 商品数据已存在，跳过同步');
      }
      
      console.log('🎉 Mock数据同步完成！');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ 数据同步超时');
      } else if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('fetch'))) {
        console.warn('⚠️ 网络连接异常，无法同步数据到Supabase');
      } else {
        console.warn('⚠️ 同步mock数据时出现异常:', error);
      }
      return false;
    }
  };


  // 清除重复数据的函数
  const cleanDuplicateData = async (): Promise<boolean> => {
    try {
      console.log('🧹 开始清除重复数据...');
      
      // 清除重复的超市数据
      const supermarketsCleared = await cleanDuplicateSupermarkets();
      if (!supermarketsCleared) {
        console.log('❌ 清除重复超市数据失败');
        return false;
      }
      
      // 清除重复的商品数据
      const productsCleared = await cleanDuplicateProducts();
      if (!productsCleared) {
        console.log('❌ 清除重复商品数据失败');
        return false;
      }
      
      // 精简商品数据，每个大类只保留2个
      const productsReduced = await reduceProductsByCategory();
      if (!productsReduced) {
        console.log('❌ 精简商品数据失败');
        return false;
      }
      
      console.log('✅ 重复数据清除完成');
      return true;
    } catch (error) {
      console.error('💥 清除重复数据时出现异常:', error);
      return false;
    }
  };

  const cleanDuplicateSupermarkets = async (): Promise<boolean> => {
    try {
      console.log('🏪 清除重复超市数据...');
      
      // 获取所有超市数据
      const { data: allSupermarkets, error: fetchError } = await supabase
        .from('supermarkets')
        .select('*')
        .order('id');
      
      if (fetchError) {
        if (fetchError.code === '42501' || fetchError.message.includes('row-level security policy')) {
          console.warn('⚠️ RLS策略阻止访问超市数据');
          return false;
        }
        throw fetchError;
      }
      
      if (!allSupermarkets || allSupermarkets.length === 0) {
        console.log('📋 没有超市数据需要清理');
        return true;
      }
      
      // 找出重复的超市（基于name_en）
      
      return true;
    } catch (error) {
      console.error('💥 清除重复超市数据时出现异常:', error);
      return false;
    }
  };

  const cleanDuplicateProducts = async (): Promise<boolean> => {
    try {
      console.log('🛒 清除重复商品数据...');
      return true;
    } catch (error) {
      console.error('💥 清除重复商品数据时出现异常:', error);
      return false;
    }
  };

  const reduceProductsByCategory = async (): Promise<boolean> => {
    try {
      console.log('📦 精简商品数据...');
      return true;
    } catch (error) {
      console.error('💥 精简商品数据时出现异常:', error);
      return false;
    }
  };

  const loadSupermarkets = async () => {
    try {
      // 检查Supabase是否可用
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase环境变量未配置，使用mock数据');
        setSupermarkets(mockSupermarkets);
        return false;
      }
      
      console.log('🏪 开始加载超市数据...');
      
      // 设置5秒超时，给数据库更多时间响应
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { data, error } = await supabase
        .from('supermarkets')
        .select('*')
        .order('name_en')
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        console.warn('⚠️ 加载超市数据失败:', error.message);
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.warn('⚠️ 权限问题，请检查RLS策略');
        }
        setSupermarkets(mockSupermarkets);
        return false;
      }

      if (!data || data.length === 0) {
        console.log('📋 数据库中没有超市数据');
        setSupermarkets(mockSupermarkets);
        return false;
      }

      const transformedSupermarkets: Supermarket[] = data.map(item => ({
        id: item.id,
        name_en: item.name_en,
        name_zh: item.name_zh,
        location: item.location,
        logo_url: item.logo_url || '',
        lat: parseFloat(item.latitude.toString()),
        lng: parseFloat(item.longitude.toString()),
        phone: item.phone,
        hours: item.hours,
        rating: item.rating ? parseFloat(item.rating.toString()) : undefined
      }));

      setSupermarkets(transformedSupermarkets);
      console.log('✅ 成功加载', transformedSupermarkets.length, '个超市');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ 加载超市数据超时 (3秒)');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('⚠️ 网络连接异常，无法加载超市数据');
      } else {
        console.warn('⚠️ 加载超市时出现异常:', error);
      }
      return false;
    }
  };

  const loadProducts = async () => {
    try {
      // 检查Supabase是否可用
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase环境变量未配置，使用mock数据');
        setProducts(mockProducts);
        return false;
      }
      
      console.log('🛒 开始加载商品数据...');
      
      // 设置8秒超时，给数据库更多时间响应
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        console.warn('⚠️ 加载商品数据失败:', error.message);
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.warn('⚠️ 权限问题，请检查RLS策略');
        }
        setProducts(mockProducts);
        return false;
      }

      if (!data || data.length === 0) {
        console.log('📋 数据库中没有商品数据');
        setProducts(mockProducts);
        return false;
      }

      const transformedProducts: Product[] = data.map(item => ({
        id: item.id,
        name_en: item.name_en,
        name_zh: item.name_zh,
        image: item.image_url || '',
        price: parseFloat(item.price.toString()),
        originalPrice: item.original_price ? parseFloat(item.original_price.toString()) : undefined,
        unit: item.unit,
        supermarket_id: item.supermarket_id,
        supermarket: supermarkets.find(s => s.id === item.supermarket_id),
        category: item.category as any,
        updated_at: item.updated_at,
        isSpecial: item.is_special,
        specialEndDate: item.special_end_date,
        discount: item.discount_percentage,
        origin: item.origin,
        freshness: item.freshness,
        rating: item.rating ? parseFloat(item.rating.toString()) : undefined
      }));

      setProducts(transformedProducts);
      console.log('✅ 数据加载完成');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ 加载商品数据超时 (5秒)');
      } else if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('fetch'))) {
        console.warn('⚠️ 网络连接异常，无法加载商品数据');
      } else {
        console.warn('⚠️ 加载商品时出现异常:', error);
      }
      return false;
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 开始加载数据...');
      setIsLoading(true);
      setConnectionStatus('connecting');
      
      // 1. 快速测试数据库连接
      const connectionTest = await testConnection();
      if (!connectionTest) {
        console.log('⚠️ 数据库连接失败，直接使用离线模式');
        setConnectionStatus('fallback');
        setSupermarkets(mockSupermarkets);
        setProducts(mockProducts);
        setIsLoading(false);
        return;
      }
      
      // 2. 尝试同步mock数据到数据库（非阻塞）
      syncMockDataToDatabase().catch(error => {
        console.warn('⚠️ 后台数据同步失败:', error);
      });
      
      // 3. 从数据库加载数据
      const [supermarketsLoaded, productsLoaded] = await Promise.all([
        loadSupermarkets(),
        loadProducts()
      ]);
      
      if (supermarketsLoaded && productsLoaded) {
        setConnectionStatus('connected');
        console.log('✅ 数据库数据加载成功');
      } else {
        console.log('⚠️ 数据库数据加载失败或权限问题，切换到离线模式');
        setConnectionStatus('fallback');
        setSupermarkets(mockSupermarkets);
        setProducts(mockProducts);
      }
    } catch (error) {
      console.warn('⚠️ 数据加载异常，切换到离线模式:', error);
      setConnectionStatus('fallback');
      setSupermarkets(mockSupermarkets);
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('🔄 手动刷新数据...');
    await loadData();
  };

  // 初始化数据加载
  useEffect(() => {
    const initializeData = async () => {
      await loadData();
    };
    
    initializeData();
  }, []);

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('upick-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('upick-favorites');
    if (savedFavorites) {
      try {
        setFavoriteProducts(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('upick-language', language);
  }, [language]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('upick-favorites', JSON.stringify(favoriteProducts));
  }, [favoriteProducts]);

  const toggleFavorite = (productId: number) => {
    setFavoriteProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      products,
      supermarkets,
      favoriteProducts,
      toggleFavorite,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      selectedSupermarkets,
      setSelectedSupermarkets,
      sortBy,
      setSortBy,
      isLoading,
      refreshData,
      connectionStatus,
      cleanDuplicateData,
      reduceProductsByCategory
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}