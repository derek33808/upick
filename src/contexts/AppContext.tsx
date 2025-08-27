import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Product, Supermarket } from '../types';
import { supabase } from '../lib/supabase';
import { mockProducts, mockSupermarkets } from '../data/mockData';
import { SupermarketService } from '../services/SupermarketService';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  products: Product[];
  supermarkets: Supermarket[];
  productsFromDb: boolean;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [products, setProducts] = useState<Product[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [productsFromDb, setProductsFromDb] = useState<boolean>(false);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupermarkets, setSelectedSupermarkets] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('updated');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'fallback'>('connecting');

  const loadSupermarkets = async () => {
    try {
      console.log('🏪 开始从数据库加载超市数据...');
      
      const supermarketsData = await SupermarketService.getAllSupermarkets();
      
      if (supermarketsData.length > 0) {
        setSupermarkets(supermarketsData);
        console.log('✅ 成功从数据库加载', supermarketsData.length, '个超市');
        return supermarketsData; // 返回实际数据
      } else {
        console.log('📋 数据库中没有超市数据，使用mock数据');
        setSupermarkets(mockSupermarkets);
        return mockSupermarkets; // 返回mock数据
      }
    } catch (error) {
      console.warn('⚠️ 加载超市数据失败，使用mock数据:', error);
      setSupermarkets(mockSupermarkets);
      return mockSupermarkets; // 返回mock数据
    }
  };

  const loadProducts = async (supermarketsData: Supermarket[]) => {
    try {
      console.log('🛒 开始从数据库加载商品数据...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('⚠️ 加载商品数据失败:', error.message);
        setProducts(mockProducts);
        setProductsFromDb(false);
        return false;
      }

      if (!data || data.length === 0) {
        console.log('📋 数据库中没有商品数据');
        setProducts(mockProducts);
        setProductsFromDb(false);
        return false;
      }

      // 创建超市ID映射（将旧的mock数据ID映射到实际的数据库超市ID）
      console.log('🏪 [AppContext] 可用超市数量:', supermarketsData.length);
      console.log('🏪 [AppContext] 超市ID列表:', supermarketsData.map(s => `${s.id}:${s.name_en}`));
      
      const supermarketIdMapping: { [key: number]: number } = {
        1: supermarketsData[0]?.id || 8,  // 映射到第一个可用超市
        2: supermarketsData[1]?.id || 14, // 映射到第二个可用超市  
        3: supermarketsData[2]?.id || 23, // 映射到第三个可用超市
        4: supermarketsData[3]?.id || 30, // 映射到第四个可用超市
        5: supermarketsData[4]?.id || 37, // 映射到第五个可用超市
        6: supermarketsData[5]?.id || supermarketsData[0]?.id || 8,
        7: supermarketsData[6]?.id || supermarketsData[1]?.id || 14,
        8: supermarketsData[7]?.id || supermarketsData[2]?.id || 23,
        9: supermarketsData[8]?.id || supermarketsData[3]?.id || 30,
        10: supermarketsData[9]?.id || supermarketsData[4]?.id || 37
      };
      
      console.log('🔗 [AppContext] 超市ID映射表:', supermarketIdMapping);

      const transformedProducts: Product[] = data.map((item: any) => {
        // 使用映射后的超市ID
        const mappedSupermarketId = supermarketIdMapping[item.supermarket_id] || item.supermarket_id;
        const supermarket = supermarketsData.find(s => s.id === mappedSupermarketId);
        
        // Debug first few products
        if (data.indexOf(item) < 3) {
          console.log(`🔍 [AppContext] 商品 ${item.name_en}:`, {
            原始超市ID: item.supermarket_id,
            映射后超市ID: mappedSupermarketId,
            找到超市: !!supermarket,
            超市名称: supermarket?.name_en
          });
        }
        
        return {
          id: item.id,
          name_en: item.name_en,
          name_zh: item.name_zh,
          image: item.image_url || '',
          price: parseFloat(item.price.toString()),
          originalPrice: item.original_price ? parseFloat(item.original_price.toString()) : undefined,
          unit: item.unit,
          supermarket_id: mappedSupermarketId,
          supermarket: supermarket,
          category: item.category as any,
          updated_at: item.updated_at,
          isSpecial: item.is_special,
          specialEndDate: item.special_end_date,
          discount: item.discount_percentage,
          origin: item.origin,
          freshness: item.freshness,
          rating: item.rating ? parseFloat(item.rating.toString()) : undefined
        };
      });

      setProducts(transformedProducts);
      setProductsFromDb(true);
      console.log('✅ 成功加载', transformedProducts.length, '个商品');
      return true;
    } catch (error) {
      console.warn('⚠️ 加载商品数据失败:', error);
      setProducts(mockProducts);
      setProductsFromDb(false);
      return false;
    }
  };

  const loadData = async () => {
    try {
      setConnectionStatus('connecting');
      setIsLoading(true);
      
      // 先加载超市数据并获取实际数据
      const supermarketsData = await loadSupermarkets();
      
      // 将超市数据传递给商品加载函数
      const productsLoaded = await loadProducts(supermarketsData);
      
      if (productsLoaded) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('fallback');
      }
      
    } catch (error) {
      console.error('⚠️ 数据加载失败:', error);
      setConnectionStatus('failed');
      setProducts(mockProducts);
      setSupermarkets(mockSupermarkets);
      setProductsFromDb(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('🔄 刷新数据...');
    await loadData();
  };

  const toggleFavorite = (productId: number) => {
    setFavoriteProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      products,
      supermarkets,
      productsFromDb,
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
      connectionStatus
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
