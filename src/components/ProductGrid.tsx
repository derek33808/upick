import { useMemo, useState } from 'react';
import { Package, MapPin, Star, Heart, Plus, Check, Store } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Product } from '../types';
import { generateProductPlaceholder } from '../lib/imageUtils';

interface ProductGridProps {
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const { 
    language, 
    products, 
    isLoading,
    searchTerm, 
    selectedCategory, 
    selectedSupermarkets, 
    sortBy,
  } = useApp();
  const { user, isAuthenticated } = useAuth();
    const { 
    checkIsFavorite,
    addToFavorites,
    removeFromFavorites,
    checkIsInCart,
    addToCart,
    removeFromCart,
    checkIsProductFavorite,
    addToProductFavorites,
    removeFromProductFavorites
  } = useUser();
  const [updatingFavorites, setUpdatingFavorites] = useState<Set<number>>(new Set());
  const [updatingCart, setUpdatingCart] = useState<Set<number>>(new Set());
  const [updatingProductFavorites, setUpdatingProductFavorites] = useState<Set<number>>(new Set());

  const handleToggleFavorite = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    if (updatingFavorites.has(productId)) return;

    setUpdatingFavorites(prev => new Set(prev.add(productId)));

    try {
      const isFavorite = checkIsFavorite(productId);

      if (isFavorite) {
        await removeFromFavorites(productId);
      } else {
        await addToFavorites(productId);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setUpdatingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleToggleCart = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    if (updatingCart.has(productId)) return;

    setUpdatingCart(prev => new Set(prev.add(productId)));

    try {
      const cartStatus = checkIsInCart(productId);

      if (cartStatus.inCart) {
        await removeFromCart(productId);
      } else {
        await addToCart(productId, 1);
      }
    } catch (error) {
      console.error('购物车操作失败:', error);
    } finally {
      setUpdatingCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };
  
  const handleToggleProductFavorite = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    if (updatingProductFavorites.has(product.id)) return;

    setUpdatingProductFavorites(prev => new Set(prev.add(product.id)));

    try {
      const isProductFavorite = checkIsProductFavorite(product.name_en);

      if (isProductFavorite) {
        await removeFromProductFavorites(product.name_en);
        console.log('商品收藏已移除');
      } else {
        await addToProductFavorites({
          name_en: product.name_en,
          name_zh: product.name_zh,
          image: product.image,
          category: product.category
        });
        console.log('商品已添加到收藏');
      }
    } catch (error) {
      console.error('商品收藏操作失败:', error);
    } finally {
      setUpdatingProductFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-16 bg-gray-100 rounded"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = product.name_en.toLowerCase().includes(searchLower) ||
                         product.name_zh.includes(searchTerm);
        if (!nameMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Supermarket filter
      if (selectedSupermarkets.length > 0 && !selectedSupermarkets.includes(product.supermarket_id)) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name':
          return language === 'en' 
            ? a.name_en.localeCompare(b.name_en)
            : a.name_zh.localeCompare(b.name_zh);
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedSupermarkets, sortBy, language]);

  const text = {
    en: {
      noProducts: 'No products found',
      tryAdjusting: 'Try adjusting your search or filters',
      specialOffers: 'special offers',
      // Button tooltips
      addToFavorites: 'Add this product to favorites',
      removeFromFavorites: 'Remove this product from favorites',
      addToCart: 'Add to shopping cart',
      removeFromCart: 'Remove from shopping cart',
      alreadyInCart: 'Already in shopping cart',
      addProductToFavorites: 'Follow this product type',
      removeProductFromFavorites: 'Unfollow this product type',
      loginRequired: 'Login required for this action'
    },
    zh: {
      noProducts: '未找到商品',
      tryAdjusting: '请尝试调整搜索条件或筛选器',
      specialOffers: '特价商品',
      // Button tooltips
      addToFavorites: '将此商品添加到收藏夹',
      removeFromFavorites: '从收藏夹移除此商品',
      addToCart: '添加到购物车',
      removeFromCart: '从购物车移除',
      alreadyInCart: '已在购物车中',
      addProductToFavorites: '关注此类商品',
      removeProductFromFavorites: '取消关注此类商品',
      loginRequired: '此操作需要登录'
    }
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].noProducts}
        </h3>
        <p className={`text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {language === 'en' ? 'Please check database connection or generate data' : '请检查数据库连接或生成数据'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => {
        const isFavorite = checkIsFavorite(product.id);
        const cartStatus = checkIsInCart(product.id);
        const isUpdatingFav = updatingFavorites.has(product.id);
        const isUpdatingCart = updatingCart.has(product.id);
        
        return (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
          >
            {/* Image Container */}
            <div className="relative">
              <img
                src={product.image}
                alt={language === 'en' ? product.name_en : product.name_zh}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                loading="lazy"
                onLoad={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onError={(e) => {
                  e.currentTarget.src = generateProductPlaceholder(product.id, 300);
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              />
              
              {/* Special Badge */}
              {product.isSpecial && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}% OFF
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex flex-col space-y-2">
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleToggleFavorite(product.id, e)}
                  disabled={isUpdatingFav}
                  title={
                    !isAuthenticated 
                      ? text[language].loginRequired
                      : isFavorite 
                        ? text[language].removeFromFavorites 
                        : text[language].addToFavorites
                  }
                  className={`p-2 rounded-full shadow-md transition-colors ${
                    isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                  } ${isUpdatingFav ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdatingFav ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  )}
                </button>

                {/* Cart Button */}
                <button
                  onClick={(e) => handleToggleCart(product.id, e)}
                  disabled={isUpdatingCart}
                  title={
                    !isAuthenticated 
                      ? text[language].loginRequired
                      : cartStatus.inCart 
                        ? text[language].alreadyInCart 
                        : text[language].addToCart
                  }
                  className={`p-2 rounded-full shadow-md transition-colors ${
                    cartStatus.inCart ? 'bg-green-500 text-white' : 'bg-white text-gray-400 hover:text-green-500'
                  } ${isUpdatingCart ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdatingCart ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : cartStatus.inCart ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>

                {/* 单一产品收藏按钮（按名称） */}
                <button
                  type="button"
                  onClick={(e) => handleToggleProductFavorite(product, e)}
                  disabled={updatingProductFavorites.has(product.id)}
                  title={
                    !isAuthenticated 
                      ? text[language].loginRequired
                      : checkIsProductFavorite(product.name_en) 
                        ? text[language].removeProductFromFavorites 
                        : text[language].addProductToFavorites
                  }
                  className={`p-2 rounded-full shadow-md transition-colors ${
                    checkIsProductFavorite(product.name_en) ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 hover:text-blue-500'
                  } ${updatingProductFavorites.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updatingProductFavorites.has(product.id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Store className={`w-4 h-4 ${checkIsProductFavorite(product.name_en) ? 'fill-current' : ''}`} />
                  )}
                </button>
              </div>
            </div>
              
            <div className="p-4">
              {/* Product Name */}
              <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {language === 'en' ? product.name_en : product.name_zh}
              </h3>
            
              {/* Price */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl font-bold text-primary-600">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {product.unit}
                </span>
              </div>

              {/* Supermarket Info */}
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={product.supermarket?.logo_url}
                  alt={product.supermarket?.name_en}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                </span>
              </div>
              {/* Location & Category */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{product.supermarket?.location}</span>
                </div>
                
                {product.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}