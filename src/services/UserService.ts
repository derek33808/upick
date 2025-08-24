import { supabase } from '../lib/supabase';
import { UserFavorite, CartItem, PriceAlert, ShoppingRoute, RouteOptimization } from '../types/user';

export class UserService {
  /**
   * 收藏管理
   */
  static async addToFavorites(userId: string, productId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: userId,
          product_id: productId
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: true }; // Already exists, treat as success
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('添加收藏失败:', error);
      return { success: false, error };
    }
  }

  static async removeFromFavorites(userId: string, productId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('移除收藏失败:', error);
      return { success: false, error };
    }
  }

  static async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          product:products (
            *,
            supermarket:supermarkets(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('⚠️ user_favorites table not found. Please run database migrations.');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('获取收藏失败:', error);
      return [];
    }
  }

  static async checkIsFavorite(userId: string, productId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId);

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 购物车管理
   */
  static async addToCart(userId: string, productId: number, quantity: number = 1, notes?: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .upsert([{
          user_id: userId,
          product_id: productId,
          quantity: quantity,
          notes: notes,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'user_id,product_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('添加到购物车失败:', error);
      return { success: false, error };
    }
  }

  static async updateCartQuantity(userId: string, productId: number, quantity: number): Promise<{ success: boolean; error?: any }> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId);
      }

      const { error } = await supabase
        .from('shopping_cart')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('更新购物车数量失败:', error);
      return { success: false, error };
    }
  }

  static async removeFromCart(userId: string, productId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('从购物车移除失败:', error);
      return { success: false, error };
    }
  }

  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          product:products (
            *,
            supermarket:supermarkets(*)
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取购物车失败:', error);
      return [];
    }
  }

  static async clearCart(userId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('清空购物车失败:', error);
      return { success: false, error };
    }
  }

  static async checkIsInCart(userId: string, productId: number): Promise<{ inCart: boolean; quantity: number }> {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select('quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error || !data) {
        return { inCart: false, quantity: 0 };
      }

      return { inCart: true, quantity: data.quantity };
    } catch (error) {
      return { inCart: false, quantity: 0 };
    }
  }

  /**
   * 价格提醒管理
   */
  static async addPriceAlert(userId: string, productId: number, targetPrice?: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .upsert([{
          user_id: userId,
          product_id: productId,
          target_price: targetPrice,
          alert_enabled: true
        }], {
          onConflict: 'user_id,product_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('添加价格提醒失败:', error);
      return { success: false, error };
    }
  }

  static async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          product:products (
            id,
            name_en,
            name_zh,
            image_url,
            price,
            unit,
            supermarket:supermarkets (
              name_en,
              name_zh
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取价格提醒失败:', error);
      return [];
    }
  }

  /**
   * 购物路线优化
   */
  static async calculateOptimalRoute(userId: string): Promise<ShoppingRoute | null> {
    try {
      const cartItems = await this.getUserCart(userId);
      if (cartItems.length === 0) return null;

      // 按超市分组商品
      const storeGroups = new Map<number, CartItem[]>();
      
      cartItems.forEach(item => {
        const storeId = item.product?.supermarket_id;
        if (storeId) {
          if (!storeGroups.has(storeId)) {
            storeGroups.set(storeId, []);
          }
          storeGroups.get(storeId)!.push(item);
        }
      });

      // 为每个超市计算购物信息
      const stores = Array.from(storeGroups.entries()).map(([storeId, items]) => {
        const supermarket = items[0].product?.supermarket;
        if (!supermarket) return null;

        const products = items.map(item => ({
          id: item.product_id,
          name: item.product?.name_en || '',
          quantity: item.quantity,
          price: item.product?.price || 0,
          total_cost: (item.product?.price || 0) * item.quantity
        }));

        const store_total = products.reduce((sum, p) => sum + p.total_cost, 0);

        return {
          id: storeId,
          name: supermarket.name_en,
          location: supermarket.location,
          latitude: supermarket.latitude,
          longitude: supermarket.longitude,
          products,
          store_total,
          estimated_time_minutes: Math.max(15, products.length * 3) // 基础15分钟 + 每个商品3分钟
        };
      }).filter(Boolean) as any[];

      // 按距离和商品数量优化顺序（简化版）
      stores.sort((a, b) => {
        // 优先考虑商品数量多的店铺
        const scoreA = a.products.length * 10 - a.estimated_time_minutes;
        const scoreB = b.products.length * 10 - b.estimated_time_minutes;
        return scoreB - scoreA;
      });

      const total_cost = stores.reduce((sum, store) => sum + store.store_total, 0);
      const total_time_minutes = stores.reduce((sum, store) => sum + store.estimated_time_minutes, 0);
      const total_distance_km = stores.length * 5; // 简化：每个店铺间5公里
      const efficiency_score = Math.max(0, 100 - (stores.length - 1) * 15); // 店铺越少效率越高

      return {
        stores,
        total_cost,
        total_time_minutes,
        total_distance_km,
        efficiency_score
      };
    } catch (error) {
      console.error('计算最佳路线失败:', error);
      return null;
    }
  }

  /**
   * 获取购物车统计
   */
  static async getCartStats(userId: string) {
    try {
      const cartItems = await this.getUserCart(userId);
      
      const total_items = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const total_cost = cartItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );
      const unique_stores = new Set(cartItems.map(item => item.product?.supermarket_id)).size;

      return {
        total_items,
        total_cost,
        unique_stores,
        items_count: cartItems.length
      };
    } catch (error) {
      console.error('获取购物车统计失败:', error);
      return {
        total_items: 0,
        total_cost: 0,
        unique_stores: 0,
        items_count: 0
      };
    }
  }

  /**
   * 价格比较和优化建议
   */
  static async getRouteOptimization(userId: string): Promise<RouteOptimization | null> {
    try {
      const cartItems = await this.getUserCart(userId);
      if (cartItems.length === 0) return null;

      // 计算当前购物车总价
      const original_cost = cartItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );

      // 获取所有相同商品的最低价格
      const productIds = cartItems.map(item => item.product_id);
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) throw error;

      // 计算最优价格
      let optimized_cost = 0;
      const storesNeeded = new Set<number>();

      cartItems.forEach(cartItem => {
        const sameProducts = allProducts?.filter(p => 
          p.name_en.toLowerCase() === cartItem.product?.name_en.toLowerCase()
        ) || [];
        
        const cheapestProduct = sameProducts.reduce((min, current) => 
          current.price < min.price ? current : min, cartItem.product!
        );

        optimized_cost += cheapestProduct.price * cartItem.quantity;
        storesNeeded.add(cheapestProduct.supermarket_id);
      });

      const savings = original_cost - optimized_cost;
      const time_estimate = storesNeeded.size * 20; // 每个店20分钟
      const stores_to_visit = storesNeeded.size;

      return {
        original_cost,
        optimized_cost,
        savings,
        time_estimate,
        stores_to_visit
      };
    } catch (error) {
      console.error('获取路线优化建议失败:', error);
      return null;
    }
  }
}