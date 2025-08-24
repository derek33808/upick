import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserService } from '../services/UserService';
import { UserFavorite, CartItem, PriceAlert, ShoppingRoute, RouteOptimization } from '../types/user';

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

  // 状态管理
  isLoading: boolean;
  createDemoAccounts: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
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
        const { data, error } = await supabase.auth.signUp({
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
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // 加载用户数据，但不让单个失败阻止其他数据加载
      const results = await Promise.allSettled([
        refreshFavorites(),
        refreshCart(),
        refreshPriceAlerts()
      ]);
      
      // 记录失败的操作，但不抛出错误
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['favorites', 'cart', 'price alerts'];
          console.warn(`⚠️ Failed to load ${operations[index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('加载用户数据失败:', error);
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
  };

  // 收藏管理
  const addToFavorites = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.addToFavorites(user.id, productId);
      if (result.success) {
        await refreshFavorites();
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加收藏失败:', error);
      return false;
    }
  };

  const removeFromFavorites = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.removeFromFavorites(user.id, productId);
      if (result.success) {
        setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('移除收藏失败:', error);
      return false;
    }
  };

  const checkIsFavorite = (productId: number): boolean => {
    return favorites.some(fav => fav.product_id === productId);
  };

  const refreshFavorites = async () => {
    if (!user) return;
    
    try {
      const favoritesData = await UserService.getUserFavorites(user.id);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('刷新收藏失败:', error);
    }
  };

  // 购物车管理
  const addToCart = async (productId: number, quantity: number = 1, notes?: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.addToCart(user.id, productId, quantity, notes);
      if (result.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加到购物车失败:', error);
      return false;
    }
  };

  const updateCartQuantity = async (productId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.updateCartQuantity(user.id, productId, quantity);
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
      const result = await UserService.removeFromCart(user.id, productId);
      if (result.success) {
        setCart(prev => prev.filter(item => item.product_id !== productId));
        await updateCartStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('从购物车移除失败:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.clearCart(user.id);
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
    const cartItem = cart.find(item => item.product_id === productId);
    return {
      inCart: !!cartItem,
      quantity: cartItem?.quantity || 0
    };
  };

  const refreshCart = async () => {
    if (!user) return;
    
    try {
      const cartData = await UserService.getUserCart(user.id);
      setCart(cartData);
      await updateCartStats();
    } catch (error) {
      console.error('刷新购物车失败:', error);
    }
  };

  const updateCartStats = async () => {
    if (!user) return;
    
    try {
      const stats = await UserService.getCartStats(user.id);
      setCartStats(stats);
    } catch (error) {
      console.error('更新购物车统计失败:', error);
    }
  };

  // 价格提醒
  const addPriceAlert = async (productId: number, targetPrice?: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await UserService.addPriceAlert(user.id, productId, targetPrice);
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
      const alertsData = await UserService.getUserPriceAlerts(user.id);
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
      const route = await UserService.calculateOptimalRoute(user.id);
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
      const optimization = await UserService.getRouteOptimization(user.id);
      setRouteOptimization(optimization);
      return optimization;
    } catch (error) {
      console.error('获取路线优化建议失败:', error);
      return null;
    }
  };

  return (
    <UserContext.Provider value={{
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

      // 状态管理
      isLoading,
      error,
      isLoading,
      createDemoAccounts,
      clearError
    }}>
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