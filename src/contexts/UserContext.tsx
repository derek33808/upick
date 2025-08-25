import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserService } from '../services/UserService';
import { DemoUserData, DemoProductFavorites, DemoStoreFavorites } from '../lib/demo-favorites';
import { supabase } from '../lib/supabase';
import { UserFavorite, CartItem, PriceAlert, ShoppingRoute, RouteOptimization, ProductFavorite, StoreFavorite } from '../types/user';

interface UserContextType {
  // 收藏管理
  favorites: UserFavorite[];
  addToFavorites: (productId: number) => Promise<boolean>;
  removeFromFavorites: (productId: number) => Promise<boolean>;
  checkIsFavorite: (productId: number) => boolean;
  refreshFavorites: () => Promise<void>;

  // 购物车管理
  cart: CartItem[];
  cartStats: {
    total_items: number;
    total_cost: number;
    unique_stores: number;
    items_count: number;
  };
  addToCart: (productId: number, quantity?: number, notes?: string) => Promise<boolean>;
  updateCartQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkIsInCart: (productId: number) => { inCart: boolean; quantity: number };
  refreshCart: () => Promise<void>;

  // 价格提醒
  priceAlerts: PriceAlert[];
  addPriceAlert: (productId: number, targetPrice?: number) => Promise<boolean>;
  refreshPriceAlerts: () => Promise<void>;

  // 购物路线优化
  shoppingRoute: ShoppingRoute | null;
  routeOptimization: RouteOptimization | null;
  calculateOptimalRoute: () => Promise<ShoppingRoute | null>;
  getRouteOptimization: () => Promise<RouteOptimization | null>;

  // 商品收藏
  productFavorites: ProductFavorite[];
  addToProductFavorites: (product: { name_en: string; name_zh: string; image: string; category: string }) => Promise<boolean>;
  removeFromProductFavorites: (productNameEn: string) => Promise<boolean>;
  checkIsProductFavorite: (productNameEn: string) => boolean;
  refreshProductFavorites: () => Promise<void>;

  // 店铺收藏
  storeFavorites: StoreFavorite[];
  addToStoreFavorites: (supermarketId: number) => Promise<boolean>;
  removeFromStoreFavorites: (supermarketId: number) => Promise<boolean>;
  checkIsStoreFavorite: (supermarketId: number) => boolean;
  refreshStoreFavorites: () => Promise<void>;

  // 状态管理
  isLoading: boolean;
  createDemoAccounts: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // 状态管理
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartStats, setCartStats] = useState({
    total_items: 0,
    total_cost: 0,
    unique_stores: 0,
    items_count: 0
  });
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [shoppingRoute, setShoppingRoute] = useState<ShoppingRoute | null>(null);
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productFavorites, setProductFavorites] = useState<ProductFavorite[]>([]);
  const [storeFavorites, setStoreFavorites] = useState<StoreFavorite[]>([]);

  const clearError = () => setError(null);
  const createDemoAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    const demoAccounts = [
      { email: 'admin@upick.life', password: 'admin123', name: 'Administrator' },
      { email: 'user@upick.life', password: 'user123', name: 'Demo User' },
      { email: 'test@upick.life', password: 'test123', name: 'Test User' }
    ];
    
    const results = [];
    
    for (const account of demoAccounts) {
      try {
        const { error } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              full_name: account.name
            }
          }
        });
        
        if (error) {
          results.push(`${account.email}: ${error.message}`);
        } else {
          results.push(`${account.email}: 创建成功`);
        }
      } catch (err) {
        results.push(`${account.email}: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    }
    
    setIsLoading(false);
    
    if (results.some(r => r.includes('创建成功'))) {
      setError(`演示账户创建结果:\n${results.join('\n')}`);
    } else {
      setError(`创建失败:\n${results.join('\n')}`);
    }
  };


  // 当用户登录状态改变时，加载用户数据
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      clearUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // 准备加载任务列表
      const tasks = [
        refreshFavorites(),
        refreshCart(),
        refreshProductFavorites(),
        refreshStoreFavorites(),
        !isDemoMode ? refreshPriceAlerts() : Promise.resolve()
      ];
      
      // 加载用户数据，但不让单个失败阻止其他数据加载
      const results = await Promise.allSettled(tasks);
      
      // 记录失败的操作，但不抛出错误
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = isDemoMode 
            ? ['favorites', 'cart', 'product favorites', 'store favorites'] 
            : ['favorites', 'cart', 'price alerts', 'product favorites', 'store favorites'];
          console.warn(`⚠️ Failed to load ${operations[index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('❌ [USER] Load user data failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserData = () => {
    setFavorites([]);
    setCart([]);
    setCartStats({ total_items: 0, total_cost: 0, unique_stores: 0, items_count: 0 });
    setPriceAlerts([]);
    setShoppingRoute(null);
    setRouteOptimization(null);
    setProductFavorites([]);
    setStoreFavorites([]);
  };

  // 检测演示模式
  useEffect(() => {
    if (user?.id && typeof user.id === 'string' && user.id.startsWith('demo-')) {
      if (!isDemoMode) {
        setIsDemoMode(true);
        console.log('🎭 [USER] Demo mode detected for user:', user.id);
      }
    } else {
      if (isDemoMode) {
        setIsDemoMode(false);
      }
    }
  }, [user?.id, isDemoMode]);

  // 收藏管理
  const addToFavorites = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      let result;
      if (isDemoMode) {
        console.log('🎭 [USER] Using demo favorites for add');
        result = await DemoUserData.addToFavorites(user.id.toString(), productId);
      } else {
        result = await UserService.addToFavorites(user.id.toString(), productId);
      }
      
      if (result.success) {
        await refreshFavorites();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [USER] Add to favorites failed:', error);
      
      // Try demo mode as fallback
      if (!isDemoMode) {
        console.log('🎭 [USER] Trying demo mode as fallback for add favorites');
        setIsDemoMode(true);
        try {
          const result = await DemoUserData.addToFavorites(user.id.toString(), productId);
          if (result.success) {
            await refreshFavorites();
            return true;
          }
        } catch (demoError) {
          console.error('❌ [USER] Demo fallback also failed:', demoError);
        }
      }
      
      return false;
    }
  };

  const removeFromFavorites = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      let result;
      if (isDemoMode) {
        console.log('🎭 [USER] Using demo favorites for remove');
        result = await DemoUserData.removeFromFavorites(user.id.toString(), productId);
      } else {
        result = await UserService.removeFromFavorites(user.id.toString(), productId);
      }
      
      if (result.success) {
        setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [USER] Remove from favorites failed:', error);
      
      // Try demo mode as fallback
      if (!isDemoMode) {
        console.log('🎭 [USER] Trying demo mode as fallback for remove favorites');
        setIsDemoMode(true);
        try {
          const result = await DemoUserData.removeFromFavorites(user.id.toString(), productId);
          if (result.success) {
            setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
            return true;
          }
        } catch (demoError) {
          console.error('❌ [USER] Demo fallback also failed:', demoError);
        }
      }
      
      return false;
    }
  };

  const checkIsFavorite = (productId: number): boolean => {
    if (isDemoMode && user) {
      return DemoUserData.checkIsFavorite(user.id.toString(), productId);
    }
    return favorites.some(fav => fav.product_id === productId);
  };

  const refreshFavorites = async () => {
    if (!user) return;
    
    try {
      if (isDemoMode) {
        console.log('🎭 [USER] Refreshing demo favorites');
        const demoFavorites = await DemoUserData.getUserFavorites(user.id.toString());
        // Convert demo favorites to UserFavorite format
        const convertedFavorites: UserFavorite[] = demoFavorites.map(f => ({
          id: f.id,
          user_id: f.user_id,
          product_id: f.product_id,
          created_at: f.created_at,
          product: undefined // Will be populated by other components if needed
        }));
        setFavorites(convertedFavorites);
      } else {
        const favoritesData = await UserService.getUserFavorites(user.id.toString());
      setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('❌ [USER] Refresh favorites failed:', error);
      
      // Try demo mode as fallback
      if (!isDemoMode) {
        console.log('🎭 [USER] Trying demo mode as fallback for refresh favorites');
        setIsDemoMode(true);
        try {
          const demoFavorites = await DemoUserData.getUserFavorites(user.id.toString());
          const convertedFavorites: UserFavorite[] = demoFavorites.map(f => ({
            id: f.id,
            user_id: f.user_id,
            product_id: f.product_id,
            created_at: f.created_at,
            product: undefined
          }));
          setFavorites(convertedFavorites);
        } catch (demoError) {
          console.error('❌ [USER] Demo fallback also failed:', demoError);
        }
      }
    }
  };

  // 购物车管理
  const addToCart = async (productId: number, quantity: number = 1, notes?: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      let result;
      if (isDemoMode) {
        console.log('🎭 [USER] Using demo cart for add');
        result = await DemoUserData.addToCart(user.id.toString(), productId, quantity, notes);
      } else {
        result = await UserService.addToCart(user.id.toString(), productId, quantity, notes);
      }
      
      if (result.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [USER] Add to cart failed:', error);
      
      // Try demo mode as fallback
      if (!isDemoMode) {
        console.log('🎭 [USER] Trying demo mode as fallback for add to cart');
        setIsDemoMode(true);
        try {
          const result = await DemoUserData.addToCart(user.id.toString(), productId, quantity, notes);
          if (result.success) {
            await refreshCart();
            return true;
          }
        } catch (demoError) {
          console.error('❌ [USER] Demo fallback also failed:', demoError);
        }
      }
      
      return false;
    }
  };

  const updateCartQuantity = async (productId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.updateCartQuantity(user.id.toString(), productId, quantity);
      if (result.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新购物车数量失败:', error);
      return false;
    }
  };

  const removeFromCart = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      let result;
      if (isDemoMode) {
        console.log('🎭 [USER] Using demo cart for remove');
        result = await DemoUserData.removeFromCart(user.id.toString(), productId);
      } else {
        result = await UserService.removeFromCart(user.id.toString(), productId);
      }
      
      if (result.success) {
        setCart(prev => prev.filter(item => item.product_id !== productId));
        if (!isDemoMode) {
        await updateCartStats();
        } else {
          // Update demo cart stats
          const currentCart = cart.filter(item => item.product_id !== productId);
          setCartStats({
            total_items: currentCart.length,
            total_cost: currentCart.reduce((sum, item) => sum + (item.quantity * 5), 0),
            unique_stores: 1,
            items_count: currentCart.reduce((sum, item) => sum + item.quantity, 0)
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [USER] Remove from cart failed:', error);
      
      // Try demo mode as fallback
      if (!isDemoMode) {
        console.log('🎭 [USER] Trying demo mode as fallback for remove from cart');
        setIsDemoMode(true);
        try {
          const result = await DemoUserData.removeFromCart(user.id.toString(), productId);
          if (result.success) {
            setCart(prev => prev.filter(item => item.product_id !== productId));
            return true;
          }
        } catch (demoError) {
          console.error('❌ [USER] Demo fallback also failed:', demoError);
        }
      }
      
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.clearCart(user.id.toString());
      if (result.success) {
        setCart([]);
        setCartStats({ total_items: 0, total_cost: 0, unique_stores: 0, items_count: 0 });
        setShoppingRoute(null);
        setRouteOptimization(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('清空购物车失败:', error);
      return false;
    }
  };

  const checkIsInCart = (productId: number): { inCart: boolean; quantity: number } => {
    if (isDemoMode && user) {
      return DemoUserData.checkIsInCart(user.id.toString(), productId);
    }
    const cartItem = cart.find(item => item.product_id === productId);
    return {
      inCart: !!cartItem,
      quantity: cartItem?.quantity || 0
    };
  };

  const refreshCart = async () => {
    if (!user) return;
    
    try {
      if (isDemoMode) {
        console.log('🎭 [USER] Refreshing demo cart');
        const demoCart = await DemoUserData.getUserCart(user.id.toString());
        // Convert demo cart to CartItem format
        const convertedCart: CartItem[] = demoCart.map(c => ({
          id: c.id,
          user_id: c.user_id,
          product_id: c.product_id,
          quantity: c.quantity,
          notes: c.notes || undefined,
          added_at: c.added_at,
          updated_at: c.updated_at,
          product: undefined
        }));
        setCart(convertedCart);
        // 简单计算演示模式的购物车统计
        setCartStats({
          total_items: convertedCart.length,
          total_cost: convertedCart.reduce((sum, item) => sum + (item.quantity * 5), 0), // Mock price
          unique_stores: 1,
          items_count: convertedCart.reduce((sum, item) => sum + item.quantity, 0)
        });
      } else {
        const cartData = await UserService.getUserCart(user.id.toString());
      setCart(cartData);
      await updateCartStats();
      }
    } catch (error) {
      console.error('❌ [USER] Refresh cart failed:', error);
      
      // Try demo mode as fallback
      if (!isDemoMode) {
        console.log('🎭 [USER] Trying demo mode as fallback for refresh cart');
        setIsDemoMode(true);
        try {
          const demoCart = await DemoUserData.getUserCart(user.id.toString());
          const convertedCart: CartItem[] = demoCart.map(c => ({
            id: c.id,
            user_id: c.user_id,
            product_id: c.product_id,
            quantity: c.quantity,
            notes: c.notes || undefined,
            added_at: c.added_at,
            updated_at: c.updated_at,
            product: undefined
          }));
          setCart(convertedCart);
          await updateCartStats();
        } catch (demoError) {
          console.error('❌ [USER] Demo fallback also failed:', demoError);
        }
      }
    }
  };

  const updateCartStats = async () => {
    if (!user) return;
    
    try {
      const stats = await UserService.getCartStats(user.id.toString());
      setCartStats(stats);
    } catch (error) {
      console.error('更新购物车统计失败:', error);
    }
  };

  // 价格提醒
  const addPriceAlert = async (productId: number, targetPrice?: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.addPriceAlert(user.id.toString(), productId, targetPrice);
      if (result.success) {
        await refreshPriceAlerts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加价格提醒失败:', error);
      return false;
    }
  };

  const refreshPriceAlerts = async () => {
    if (!user) return;
    
    try {
      const alertsData = await UserService.getUserPriceAlerts(user.id.toString());
      setPriceAlerts(alertsData);
    } catch (error) {
      console.error('刷新价格提醒失败:', error);
    }
  };

  // 购物路线优化
  const calculateOptimalRoute = async (): Promise<ShoppingRoute | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const route = await UserService.calculateOptimalRoute(user.id.toString());
      setShoppingRoute(route);
      return route;
    } catch (error) {
      console.error('计算最佳路线失败:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteOptimization = async (): Promise<RouteOptimization | null> => {
    if (!user) return null;
    
    try {
      const optimization = await UserService.getRouteOptimization(user.id.toString());
      setRouteOptimization(optimization);
      return optimization;
    } catch (error) {
      console.error('获取路线优化建议失败:', error);
      return null;
    }
  };

  // 商品收藏管理
  const addToProductFavorites = async (product: { name_en: string; name_zh: string; image: string; category: string }) => {
    if (!user?.id) return false;
    
    try {
      if (isDemoMode) {
        const success = DemoProductFavorites.addToProductFavorites(user.id.toString(), product);
        if (success) await refreshProductFavorites();
        return success;
      }
      // 真实后端暂未实现：回退到演示模式
      const success = DemoProductFavorites.addToProductFavorites(user.id.toString(), product);
      if (success) {
        if (!isDemoMode) setIsDemoMode(true);
        await refreshProductFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to add product to favorites:', error);
      // 失败时兜底到演示模式
      try {
        const success = DemoProductFavorites.addToProductFavorites(user.id.toString(), product);
        if (success) {
          if (!isDemoMode) setIsDemoMode(true);
          await refreshProductFavorites();
        }
        return success;
      } catch {
        return false;
      }
    }
  };

  const removeFromProductFavorites = async (productNameEn: string) => {
    if (!user?.id) return false;
    
    try {
      if (isDemoMode) {
        const success = DemoProductFavorites.removeFromProductFavorites(user.id.toString(), productNameEn);
        if (success) await refreshProductFavorites();
        return success;
      }
      // 真实后端暂未实现：回退到演示模式
      const success = DemoProductFavorites.removeFromProductFavorites(user.id.toString(), productNameEn);
      if (success) {
        if (!isDemoMode) setIsDemoMode(true);
        await refreshProductFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to remove product from favorites:', error);
      try {
        const success = DemoProductFavorites.removeFromProductFavorites(user.id.toString(), productNameEn);
        if (success) {
          if (!isDemoMode) setIsDemoMode(true);
          await refreshProductFavorites();
        }
        return success;
      } catch {
        return false;
      }
    }
  };

  const checkIsProductFavorite = (productNameEn: string) => {
    if (!user?.id) return false;
    return productFavorites.some(f => 
      f.product_name_en.toLowerCase() === productNameEn.toLowerCase()
    );
  };

  const refreshProductFavorites = async () => {
    if (!user?.id) return;
    
    try {
      if (isDemoMode) {
        const demoFavorites = DemoProductFavorites.getUserProductFavorites(user.id.toString());
        setProductFavorites(demoFavorites);
      } else {
        // 真实后端暂未实现：使用演示数据
        const demoFavorites = DemoProductFavorites.getUserProductFavorites(user.id.toString());
        setProductFavorites(demoFavorites);
      }
    } catch (error) {
      console.error('Failed to refresh product favorites:', error);
    }
  };

  // 店铺收藏管理
  const addToStoreFavorites = async (supermarketId: number) => {
    if (!user?.id) return false;
    
    try {
      if (isDemoMode) {
        const success = DemoStoreFavorites.addToStoreFavorites(user.id.toString(), supermarketId);
        if (success) await refreshStoreFavorites();
        return success;
      }
      // 真实后端暂未实现：回退到演示模式
      const success = DemoStoreFavorites.addToStoreFavorites(user.id.toString(), supermarketId);
      if (success) {
        if (!isDemoMode) setIsDemoMode(true);
        // 立即刷新状态
        await refreshStoreFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to add store to favorites:', error);
      try {
        const success = DemoStoreFavorites.addToStoreFavorites(user.id.toString(), supermarketId);
        if (success) {
          if (!isDemoMode) setIsDemoMode(true);
          await refreshStoreFavorites();
        }
        return success;
      } catch {
        return false;
      }
    }
  };

  const removeFromStoreFavorites = async (supermarketId: number) => {
    if (!user?.id) return false;
    
    try {
      if (isDemoMode) {
        const success = DemoStoreFavorites.removeFromStoreFavorites(user.id.toString(), supermarketId);
        if (success) await refreshStoreFavorites();
        return success;
      }
      const success = DemoStoreFavorites.removeFromStoreFavorites(user.id.toString(), supermarketId);
      if (success) {
        if (!isDemoMode) setIsDemoMode(true);
        await refreshStoreFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to remove store from favorites:', error);
      try {
        const success = DemoStoreFavorites.removeFromStoreFavorites(user.id.toString(), supermarketId);
        if (success) {
          if (!isDemoMode) setIsDemoMode(true);
          await refreshStoreFavorites();
        }
        return success;
      } catch {
        return false;
      }
    }
  };

  const checkIsStoreFavorite = (supermarketId: number) => {
    if (!user?.id) return false;
    const isFavorited = storeFavorites.some(f => f.supermarket_id === supermarketId);
    console.log(`[UserContext] checkIsStoreFavorite(${supermarketId}): ${isFavorited}, 总收藏数: ${storeFavorites.length}`);
    return isFavorited;
  };

  const refreshStoreFavorites = async () => {
    if (!user?.id) return;
    
    try {
      // 总是从演示数据中读取，确保兼容性
      const demoFavorites = DemoStoreFavorites.getUserStoreFavorites(user.id.toString());
      console.log(`[UserContext] refreshStoreFavorites: 读取到 ${demoFavorites.length} 个店铺收藏`);
      
      // 详细输出每个收藏的店铺信息
      demoFavorites.forEach((favorite: any, index: number) => {
        console.log(`[UserContext] 店铺收藏 ${index + 1}:`, {
          supermarket_id: favorite.supermarket_id,
          supermarket_name: favorite.supermarket?.name_en,
          has_logo: !!favorite.supermarket?.logo_url,
          logo_url: favorite.supermarket?.logo_url
        });
      });
      
      setStoreFavorites(demoFavorites);
    } catch (error) {
      console.error('Failed to refresh store favorites:', error);
      setStoreFavorites([]);
    }
  };

  const value: UserContextType = {
      // 收藏管理
      favorites,
      addToFavorites,
      removeFromFavorites,
      checkIsFavorite,
      refreshFavorites,

      // 购物车管理
      cart,
      cartStats,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkIsInCart,
      refreshCart,

      // 价格提醒
      priceAlerts,
      addPriceAlert,
      refreshPriceAlerts,

      // 购物路线优化
      shoppingRoute,
      routeOptimization,
      calculateOptimalRoute,
      getRouteOptimization,

    // 商品收藏
    productFavorites,
    addToProductFavorites,
    removeFromProductFavorites,
    checkIsProductFavorite,
    refreshProductFavorites,

    // 店铺收藏
    storeFavorites,
    addToStoreFavorites,
    removeFromStoreFavorites,
    checkIsStoreFavorite,
    refreshStoreFavorites,

      // 状态管理
      isLoading,
      error,
      createDemoAccounts,
      clearError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}