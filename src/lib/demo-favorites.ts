// Demo favorites and cart management for testing when Supabase is not available
interface DemoFavorite {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
}

interface DemoCartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  notes?: string;
  added_at: string;
  updated_at: string;
}

export class DemoUserData {
  private static favorites: DemoFavorite[] = [];
  private static cart: DemoCartItem[] = [];
  private static nextId = 1;

  // Favorites management
  static async addToFavorites(userId: string, productId: number): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🎭 [DEMO] Adding to favorites:', { userId, productId });
      
      // Check if already exists
      const exists = this.favorites.some(f => f.user_id === userId && f.product_id === productId);
      if (exists) {
        // Idempotent behavior: treat as success to match backend unique constraint handling
        return { success: true };
      }

      const favorite: DemoFavorite = {
        id: this.nextId++,
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString()
      };

      this.favorites.push(favorite);
      this.saveFavorites();
      
      console.log('✅ [DEMO] Added to favorites successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [DEMO] Failed to add to favorites:', error);
      return { success: false, error };
    }
  }

  static async removeFromFavorites(userId: string, productId: number): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🎭 [DEMO] Removing from favorites:', { userId, productId });
      
      const initialLength = this.favorites.length;
      this.favorites = this.favorites.filter(f => !(f.user_id === userId && f.product_id === productId));
      
      if (this.favorites.length === initialLength) {
        return { success: false, error: 'Not found in favorites' };
      }

      this.saveFavorites();
      
      console.log('✅ [DEMO] Removed from favorites successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [DEMO] Failed to remove from favorites:', error);
      return { success: false, error };
    }
  }

  static async getUserFavorites(userId: string): Promise<DemoFavorite[]> {
    try {
      console.log('🎭 [DEMO] Getting user favorites for:', userId);
      return this.favorites.filter(f => f.user_id === userId);
    } catch (error) {
      console.error('❌ [DEMO] Failed to get favorites:', error);
      return [];
    }
  }

  static checkIsFavorite(userId: string, productId: number): boolean {
    return this.favorites.some(f => f.user_id === userId && f.product_id === productId);
  }

  // Cart management
  static async addToCart(userId: string, productId: number, quantity: number = 1, notes?: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🎭 [DEMO] Adding to cart:', { userId, productId, quantity });
      
      // Check if item already exists
      const existingIndex = this.cart.findIndex(c => c.user_id === userId && c.product_id === productId);
      
      if (existingIndex >= 0) {
        // Update existing item
        this.cart[existingIndex].quantity = quantity;
        this.cart[existingIndex].notes = notes;
        this.cart[existingIndex].updated_at = new Date().toISOString();
      } else {
        // Add new item
        const cartItem: DemoCartItem = {
          id: this.nextId++,
          user_id: userId,
          product_id: productId,
          quantity,
          notes,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.cart.push(cartItem);
      }

      this.saveCart();
      
      console.log('✅ [DEMO] Added to cart successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [DEMO] Failed to add to cart:', error);
      return { success: false, error };
    }
  }

  static async removeFromCart(userId: string, productId: number): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🎭 [DEMO] Removing from cart:', { userId, productId });
      
      const initialLength = this.cart.length;
      this.cart = this.cart.filter(c => !(c.user_id === userId && c.product_id === productId));
      
      if (this.cart.length === initialLength) {
        return { success: false, error: 'Not found in cart' };
      }

      this.saveCart();
      
      console.log('✅ [DEMO] Removed from cart successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [DEMO] Failed to remove from cart:', error);
      return { success: false, error };
    }
  }

  static async updateCartQuantity(userId: string, productId: number, quantity: number): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🎭 [DEMO] Updating cart quantity:', { userId, productId, quantity });
      
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId);
      }

      const itemIndex = this.cart.findIndex(c => c.user_id === userId && c.product_id === productId);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Item not found in cart' };
      }

      this.cart[itemIndex].quantity = quantity;
      this.cart[itemIndex].updated_at = new Date().toISOString();
      
      this.saveCart();
      
      console.log('✅ [DEMO] Updated cart quantity successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [DEMO] Failed to update cart quantity:', error);
      return { success: false, error };
    }
  }

  static async getUserCart(userId: string): Promise<DemoCartItem[]> {
    try {
      console.log('🎭 [DEMO] Getting user cart for:', userId);
      return this.cart.filter(c => c.user_id === userId);
    } catch (error) {
      console.error('❌ [DEMO] Failed to get cart:', error);
      return [];
    }
  }

  static checkIsInCart(userId: string, productId: number): { inCart: boolean; quantity: number } {
    const item = this.cart.find(c => c.user_id === userId && c.product_id === productId);
    return {
      inCart: !!item,
      quantity: item?.quantity || 0
    };
  }

  static async clearCart(userId: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🎭 [DEMO] Clearing cart for:', userId);
      
      this.cart = this.cart.filter(c => c.user_id !== userId);
      this.saveCart();
      
      console.log('✅ [DEMO] Cart cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [DEMO] Failed to clear cart:', error);
      return { success: false, error };
    }
  }

  // Persistence helpers
  private static saveFavorites() {
    try {
      localStorage.setItem('demo-favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }

  private static saveCart() {
    try {
      localStorage.setItem('demo-cart', JSON.stringify(this.cart));
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error);
    }
  }

  private static loadFavorites() {
    try {
      const saved = localStorage.getItem('demo-favorites');
      if (saved) {
        this.favorites = JSON.parse(saved);
        console.log('🎭 [DEMO] Loaded favorites from localStorage:', this.favorites.length);
      }
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error);
      this.favorites = [];
    }
  }

  private static loadCart() {
    try {
      const saved = localStorage.getItem('demo-cart');
      if (saved) {
        this.cart = JSON.parse(saved);
        console.log('🎭 [DEMO] Loaded cart from localStorage:', this.cart.length);
      }
    } catch (error) {
      console.warn('Failed to load cart from localStorage:', error);
      this.cart = [];
    }
  }

  // Initialize demo data
  static initialize() {
    this.loadFavorites();
    this.loadCart();
    
    // Set next ID based on existing data
    const maxFavId = this.favorites.length > 0 ? Math.max(...this.favorites.map(f => f.id)) : 0;
    const maxCartId = this.cart.length > 0 ? Math.max(...this.cart.map(c => c.id)) : 0;
    this.nextId = Math.max(maxFavId, maxCartId) + 1;
    
    console.log('🎭 [DEMO] Demo user data initialized');
  }

  // Clear all demo data
  static clearAll() {
    this.favorites = [];
    this.cart = [];
    this.nextId = 1;
    localStorage.removeItem('demo-favorites');
    localStorage.removeItem('demo-cart');
    console.log('🎭 [DEMO] All demo data cleared');
  }
}

// 新增：商品收藏管理
export const DemoProductFavorites = {
  addToProductFavorites: (userId: string, product: { name_en: string; name_zh: string; image: string; category: string }) => {
    const key = `product_favorites_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    // 检查是否已存在
    const exists = existing.find((f: any) => 
      f.product_name_en.toLowerCase() === product.name_en.toLowerCase()
    );
    
    if (!exists) {
      const newFavorite = {
        id: Date.now(),
        user_id: userId,
        product_name_en: product.name_en,
        product_name_zh: product.name_zh,
        product_image: product.image,
        product_category: product.category,
        created_at: new Date().toISOString(),
        last_viewed_at: new Date().toISOString()
      };
      
      existing.push(newFavorite);
      localStorage.setItem(key, JSON.stringify(existing));
      return true;
    }
    
    return false;
  },

  removeFromProductFavorites: (userId: string, productNameEn: string) => {
    const key = `product_favorites_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    const filtered = existing.filter((f: any) => 
      f.product_name_en.toLowerCase() !== productNameEn.toLowerCase()
    );
    
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  },

  getUserProductFavorites: (userId: string) => {
    const key = `product_favorites_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  checkIsProductFavorite: (userId: string, productNameEn: string) => {
    const favorites = DemoProductFavorites.getUserProductFavorites(userId);
    return favorites.some((f: any) => 
      f.product_name_en.toLowerCase() === productNameEn.toLowerCase()
    );
  },

  updateProductFavoriteLastViewed: (userId: string, productNameEn: string) => {
    const key = `product_favorites_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    const updated = existing.map((f: any) => {
      if (f.product_name_en.toLowerCase() === productNameEn.toLowerCase()) {
        return { ...f, last_viewed_at: new Date().toISOString() };
      }
      return f;
    });
    
    localStorage.setItem(key, JSON.stringify(updated));
  }
};

// 新增：店铺收藏管理
export const DemoStoreFavorites = {
  addToStoreFavorites: (userId: string, supermarketId: number) => {
    console.log(`[DemoStoreFavorites] 添加店铺收藏: userId=${userId}, supermarketId=${supermarketId}`);
    const key = `store_favorites_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    // 检查是否已存在
    const exists = existing.find((f: any) => f.supermarket_id === supermarketId);
    console.log(`[DemoStoreFavorites] 检查是否存在: exists=${!!exists}, 当前收藏数=${existing.length}`);
    
    if (!exists) {
      // 获取店铺信息以包含完整数据
      const mockSupermarkets = [
        {
          id: 1,
          name_en: "Pak'nSave Riccarton",
          name_zh: "派克储蓄超市",
          location: "Riccarton",
          logo_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center",
          lat: -43.53,
          lng: 172.62,
          phone: "+64 3 348 8052",
          hours: "7:00 AM - 10:00 PM",
          rating: 4.2
        },
        {
          id: 2,
          name_en: "Countdown Westfield",
          name_zh: "倒计时超市",
          location: "Riccarton",
          logo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
          lat: -43.53,
          lng: 172.61,
          phone: "+64 3 348 7766",
          hours: "6:00 AM - 12:00 AM",
          rating: 4.0
        },
        {
          id: 3,
          name_en: "New World Riccarton",
          name_zh: "新世界超市",
          location: "Riccarton",
          logo_url: "https://images.unsplash.com/photo-1604719312566-878b4afe3202?w=200&h=200&fit=crop&crop=center",
          lat: -43.528,
          lng: 172.615,
          phone: "+64 3 349 7018",
          hours: "7:00 AM - 10:00 PM",
          rating: 4.1
        },
        {
          id: 4,
          name_en: "FreshChoice Barrington",
          name_zh: "新鲜选择超市",
          location: "Barrington",
          logo_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&crop=center",
          lat: -43.540,
          lng: 172.610,
          phone: "+64 3 338 3045",
          hours: "7:00 AM - 9:00 PM",
          rating: 4.3
        },
        {
          id: 5,
          name_en: "Countdown Northlands",
          name_zh: "倒计时北地超市",
          location: "Papanui",
          logo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
          lat: -43.485,
          lng: 172.605,
          phone: "+64 3 352 5050",
          hours: "6:00 AM - 12:00 AM",
          rating: 4.1
        },
        {
          id: 6,
          name_en: "Pak'nSave Hornby",
          name_zh: "派克储蓄霍恩比店",
          location: "Hornby",
          logo_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center",
          lat: -43.535,
          lng: 172.520,
          phone: "+64 3 349 8800",
          hours: "7:00 AM - 10:00 PM",
          rating: 4.0
        },
        {
          id: 7,
          name_en: "New World Bishopdale",
          name_zh: "新世界主教谷店",
          location: "Bishopdale",
          logo_url: "https://images.unsplash.com/photo-1604719312566-878b4afe3202?w=200&h=200&fit=crop&crop=center",
          lat: -43.495,
          lng: 172.555,
          phone: "+64 3 359 4040",
          hours: "7:00 AM - 10:00 PM",
          rating: 4.2
        },
        {
          id: 8,
          name_en: "Countdown Eastgate",
          name_zh: "倒计时东门店",
          location: "Linwood",
          logo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
          lat: -43.550,
          lng: 172.680,
          phone: "+64 3 381 4500",
          hours: "6:00 AM - 12:00 AM",
          rating: 3.9
        },
        {
          id: 9,
          name_en: "Four Square Addington",
          name_zh: "四方超市",
          location: "Addington",
          logo_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center",
          lat: -43.545,
          lng: 172.595,
          phone: "+64 3 338 2020",
          hours: "7:00 AM - 9:00 PM",
          rating: 4.0
        }
      ];
      
      const supermarket = mockSupermarkets.find(s => s.id === supermarketId);
      
      const newFavorite = {
        id: Date.now(),
        user_id: userId,
        supermarket_id: supermarketId,
        created_at: new Date().toISOString(),
        supermarket: supermarket ? {
          id: supermarket.id,
          name_en: supermarket.name_en,
          name_zh: supermarket.name_zh,
          location: supermarket.location,
          logo_url: supermarket.logo_url,
          latitude: supermarket.lat,
          longitude: supermarket.lng
        } : undefined
      };
      
      existing.push(newFavorite);
      localStorage.setItem(key, JSON.stringify(existing));
      console.log(`[DemoStoreFavorites] 成功添加，新收藏数=${existing.length}`);
      return true;
    }
    
    console.log(`[DemoStoreFavorites] 已存在，不重复添加`);
    return false;
  },

  removeFromStoreFavorites: (userId: string, supermarketId: number) => {
    console.log(`[DemoStoreFavorites] 移除店铺收藏: userId=${userId}, supermarketId=${supermarketId}`);
    const key = `store_favorites_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    const originalLength = existing.length;
    const filtered = existing.filter((f: any) => f.supermarket_id !== supermarketId);
    
    localStorage.setItem(key, JSON.stringify(filtered));
    console.log(`[DemoStoreFavorites] 移除完成: ${originalLength} -> ${filtered.length}`);
    return true;
  },

  getUserStoreFavorites: (userId: string) => {
    const key = `store_favorites_${userId}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    
    // 确保每个收藏都有完整的店铺信息
    const mockSupermarkets = [
      {
        id: 1,
        name_en: "Pak'nSave Riccarton",
        name_zh: "派克储蓄超市",
        location: "Riccarton",
        logo_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center",
        lat: -43.53,
        lng: 172.62
      },
      {
        id: 2,
        name_en: "Countdown Westfield",
        name_zh: "倒计时超市",
        location: "Riccarton",
        logo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
        lat: -43.53,
        lng: 172.61
      },
      {
        id: 3,
        name_en: "New World Riccarton",
        name_zh: "新世界超市",
        location: "Riccarton",
        logo_url: "https://images.unsplash.com/photo-1604719312566-878b4afe3202?w=200&h=200&fit=crop&crop=center",
        lat: -43.528,
        lng: 172.615
      },
      {
        id: 4,
        name_en: "FreshChoice Barrington",
        name_zh: "新鲜选择超市",
        location: "Barrington",
        logo_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&crop=center",
        lat: -43.540,
        lng: 172.610
      },
      {
        id: 5,
        name_en: "Countdown Northlands",
        name_zh: "倒计时北地超市",
        location: "Papanui",
        logo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
        lat: -43.485,
        lng: 172.605
      },
      {
        id: 6,
        name_en: "Pak'nSave Hornby",
        name_zh: "派克储蓄霍恩比店",
        location: "Hornby",
        logo_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center",
        lat: -43.535,
        lng: 172.520
      },
      {
        id: 7,
        name_en: "New World Bishopdale",
        name_zh: "新世界主教谷店",
        location: "Bishopdale",
        logo_url: "https://images.unsplash.com/photo-1604719312566-878b4afe3202?w=200&h=200&fit=crop&crop=center",
        lat: -43.495,
        lng: 172.555
      },
      {
        id: 8,
        name_en: "Countdown Eastgate",
        name_zh: "倒计时东门店",
        location: "Linwood",
        logo_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
        lat: -43.550,
        lng: 172.680
      },
      {
        id: 9,
        name_en: "Four Square Addington",
        name_zh: "四方超市",
        location: "Addington",
        logo_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center",
        lat: -43.545,
        lng: 172.595
      }
    ];
    
    // 为没有完整店铺信息的收藏补充数据
    return favorites.map((favorite: any) => {
      if (!favorite.supermarket || !favorite.supermarket.logo_url) {
        const supermarket = mockSupermarkets.find(s => s.id === favorite.supermarket_id);
        if (supermarket) {
          favorite.supermarket = {
            id: supermarket.id,
            name_en: supermarket.name_en,
            name_zh: supermarket.name_zh,
            location: supermarket.location,
            logo_url: supermarket.logo_url,
            latitude: supermarket.lat,
            longitude: supermarket.lng
          };
        }
      }
      return favorite;
    });
  },

  checkIsStoreFavorite: (userId: string, supermarketId: number) => {
    const favorites = DemoStoreFavorites.getUserStoreFavorites(userId);
    return favorites.some((f: any) => f.supermarket_id === supermarketId);
  }
};

// Initialize demo data
DemoUserData.initialize();
