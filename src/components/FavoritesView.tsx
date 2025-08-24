import React, { useState, useEffect } from 'react';
import { Heart, Store, MapPin, Star, Clock, TrendingUp, TrendingDown, Trash2, Eye, ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useApp } from '../contexts/AppContext';
import { ProductFavorite, StoreFavorite } from '../types/user';
import { PriceHistoryChart } from './PriceHistoryChart';
import { generateSeededSeries } from '../lib/chartUtils';
import { StoreDetailModal } from './StoreDetailModal';

export function FavoritesView() {
  const { user, isAuthenticated } = useAuth();
  const { 
    favorites, // 店铺产品收藏（原始）
    productFavorites, 
    storeFavorites, 
    removeFromProductFavorites, 
    removeFromStoreFavorites,
    addToCart,
    checkIsInCart,
    refreshFavorites,
    refreshProductFavorites,
    refreshStoreFavorites
  } = useUser();
  const { language, products } = useApp();
  const [activeTab, setActiveTab] = useState<'single' | 'storeProducts' | 'stores'>('single');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const text = {
    en: {
      title: 'My Favorites',
      productFavorites: 'Product Favorites',
      storeFavorites: 'Store Favorites',
      noProductFavorites: 'No product favorites yet',
      noStoreFavorites: 'No store favorites yet',
      addToCart: 'Add to Cart',
      removeFromFavorites: 'Remove',
      viewDetails: 'View Details',
      priceHistory: 'Price History',
      priceRange: 'Price Range',
      storeCount: 'Available at',
      stores: 'stores',
      lastViewed: 'Last viewed',
      category: 'Category',
      addToCartSuccess: 'Added to cart!',
      removeSuccess: 'Removed from favorites',
      error: 'Operation failed'
    },
    zh: {
      title: '我的收藏',
      productFavorites: '商品收藏',
      storeFavorites: '店铺收藏',
      noProductFavorites: '暂无商品收藏',
      noStoreFavorites: '暂无店铺收藏',
      addToCart: '加入购物车',
      removeFromFavorites: '取消收藏',
      viewDetails: '查看详情',
      priceHistory: '价格历史',
      priceRange: '价格范围',
      storeCount: '在售店铺',
      stores: '家店铺',
      lastViewed: '最后查看',
      category: '分类',
      addToCartSuccess: '已加入购物车！',
      removeSuccess: '已取消收藏',
      error: '操作失败'
    }
  };

  // 获取商品在不同店铺的价格信息
  const getProductPrices = (productNameEn: string) => {
    return products.filter(p => 
      p.name_en.toLowerCase() === productNameEn.toLowerCase()
    ).sort((a, b) => a.price - b.price);
  };

  // 获取商品价格统计
  const getProductPriceStats = (productNameEn: string) => {
    const matchingProducts = getProductPrices(productNameEn);
    if (matchingProducts.length === 0) return null;
    
    const prices = matchingProducts.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: matchingProducts.length
    };
  };

  // 处理商品收藏删除
  const handleRemoveProductFavorite = async (productNameEn: string) => {
    try {
      const success = await removeFromProductFavorites(productNameEn);
      if (success) {
        console.log(text[language].removeSuccess);
      }
    } catch (error) {
      console.error(text[language].error, error);
    }
  };

  // 处理店铺收藏删除
  const handleRemoveStoreFavorite = async (supermarketId: number) => {
    try {
      const success = await removeFromStoreFavorites(supermarketId);
      if (success) {
        console.log(text[language].removeSuccess);
      }
    } catch (error) {
      console.error(text[language].error, error);
    }
  };

  // 处理添加到购物车
  const handleAddToCart = async (productId: number) => {
    try {
      const success = await addToCart(productId, 1);
      if (success) {
        console.log(text[language].addToCartSuccess);
      }
    } catch (error) {
      console.error(text[language].error, error);
    }
  };

  // 切换商品展开状态
  const toggleProductExpanded = (productNameEn: string) => {
    console.log(`[FavoritesView] 🔥 toggleProductExpanded 被调用: ${productNameEn}`);
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productNameEn)) {
      console.log(`[FavoritesView] 📌 折叠商品: ${productNameEn}`);
      newExpanded.delete(productNameEn);
    } else {
      console.log(`[FavoritesView] 📌 展开商品: ${productNameEn}`);
      newExpanded.add(productNameEn);
    }
    setExpandedProducts(newExpanded);
    console.log(`[FavoritesView] 📌 当前展开商品数: ${newExpanded.size}`);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].title}
          </h2>
          <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
            Please login to view your favorites
          </p>
        </div>
      </div>
    );
  }

  // 初次进入页面时刷新一次
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshFavorites();
      refreshProductFavorites();
      refreshStoreFavorites();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const handler = () => {
      if (isAuthenticated && user) {
        refreshFavorites();
        refreshProductFavorites();
      }
    };
    const handler2 = () => {
      if (isAuthenticated && user) refreshStoreFavorites();
    };
    window.addEventListener('favoritesUpdated', handler);
    window.addEventListener('storeFavoritesUpdated', handler2);
    return () => {
      window.removeEventListener('favoritesUpdated', handler);
      window.removeEventListener('storeFavoritesUpdated', handler2);
    };
  }, [isAuthenticated, user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h1>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          Manage your favorite products and stores
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>{text[language].productFavorites}</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {productFavorites.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('storeProducts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'storeProducts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Store className="w-4 h-4" />
            <span>Store Product Favorites</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {favorites.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stores'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Store className="w-4 h-4" />
            <span>{text[language].storeFavorites}</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {storeFavorites.length}
            </span>
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'single' ? (
        /* Product Favorites */
        <div className="space-y-4 md:space-y-6">
          {productFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].noProductFavorites}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {productFavorites.map((favorite) => {
                const priceStats = getProductPriceStats(favorite.product_name_en);
                const matchingProducts = getProductPrices(favorite.product_name_en);
                const isExpanded = expandedProducts.has(favorite.product_name_en);

                return (
                  <div key={favorite.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
                    {/* Product Header */}
                    <div className="flex items-start space-x-3 md:space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <img
                          src={favorite.product_image || '/public/logo.svg'}
                          alt={language === 'en' ? favorite.product_name_en : favorite.product_name_zh}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAzMkMyOCAyOS43OTA5IDI5Ljc5MDkgMjggMzIgMjhIMzZDMzguMjA5MSAyOCA0MCAyOS43OTA5IDQwIDMyVjM2QzQwIDM4LjIwOTEgMzguMjA5MSA0MCAzNiA0MEgzMkMyOS43OTA5IDQwIDI4IDM4LjIwOTEgMjggMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik00MiA0NEM0MiA0MS43OTA5IDQzLjc5MDkgNDAgNDYgNDBINTBDNTIuMjA5MSA0MCA1NCA0MS43OTA5IDU0IDQ0VjQ4QzU0IDUwLjIwOTEgNTIuMjA5MSA1MiA1MCA1Mkg0NkM0My43OTA5IDUyIDQyIDUwLjIwOTEgNDIgNDhWNDRaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNiA0NkMzMS41MjI5IDQ2IDM2IDQxLjUyMjkgMzYgMzZDMzYgMzAuNDc3MSAzMS41MjI5IDI2IDI2IDI2QzIwLjQ3NzEgMjYgMTYgMzAuNDc3MSAxNiAzNkMxNiA0MS41MjI5IDIwLjQ3NzEgNDYgMjYgNDZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {language === 'en' ? favorite.product_name_en : favorite.product_name_zh}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs md:text-sm text-gray-600">
                          <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                            {text[language].category}: {favorite.product_category}
                          </span>
                          <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                            {text[language].storeCount}: {matchingProducts.length} {text[language].stores}
                          </span>
                        </div>
                        {priceStats && (
                          <div className="mt-2">
                            <div className={`text-xs md:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                              {text[language].priceRange}: ${priceStats.min.toFixed(2)} - ${priceStats.max.toFixed(2)}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              Avg: ${priceStats.avg.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveProductFavorite(favorite.product_name_en)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expandable Details */}
                    <div className="space-y-3 md:space-y-4 mt-4">
                      <button
                        onClick={() => toggleProductExpanded(favorite.product_name_en)}
                        className={`w-full flex items-center justify-center space-x-2 py-2.5 md:py-2 px-3 md:px-4 rounded-lg transition-colors text-xs md:text-sm font-medium ${
                          isExpanded
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        <span>
                          {isExpanded ? 'Hide Details' : text[language].viewDetails}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-200">
                          {/* Price History Chart */}
                          {priceStats && (
                            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                              <h4 className={`text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 ${language === 'zh' ? 'font-chinese' : ''}`}>
                                {text[language].priceHistory}
                              </h4>
                              <div className="overflow-hidden rounded-lg">
                                <PriceHistoryChart 
                                  prices={generateSeededSeries(favorite.product_name_en, priceStats.avg, 90)} 
                                  height={100}
                                />
                              </div>
                            </div>
                          )}
                  
                          {/* Store List */}
                          <div>
                            <h4 className={`text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 ${language === 'zh' ? 'font-chinese' : ''}`}>
                              {text[language].storeCount} ({matchingProducts.length})
                            </h4>
                            <div className="space-y-2">
                              {matchingProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                                    <img
                                      src={product.supermarket?.logo_url}
                                      alt={product.supermarket?.name_en}
                                      className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiA4SDE4VjI0SDE2VjhaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik04IDE2VjE4SDI0VjE2SDhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                                      }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className={`font-medium text-gray-900 text-xs md:text-sm truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
                                        {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">
                                        {product.location}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    <div className="text-right">
                                      <div className="font-bold text-gray-900 text-sm md:text-base">${product.price.toFixed(2)}</div>
                                      <div className="text-xs text-gray-500">{product.unit}</div>
                                    </div>
                                    <button
                                      onClick={() => handleAddToCart(product.id)}
                                      className="p-1.5 md:p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                      disabled={checkIsInCart(product.id).inCart}
                                    >
                                      {checkIsInCart(product.id).inCart ? (
                                        <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                                      ) : (
                                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                          {text[language].lastViewed}: {new Date(favorite.last_viewed_at || favorite.created_at).toLocaleDateString()}
                        </span>
                        <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                          Added: {new Date(favorite.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'storeProducts' ? (
        /* Store Product Favorites */
        <div className="space-y-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>No store product favorites</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {favorites.map((favorite) => {
                // 计算该店铺中哪些商品在其他店更便宜
                const allSameName = products.filter(p => 
                  p.name_en.toLowerCase() === favorite.product?.name_en?.toLowerCase()
                );
                const cheapest = allSameName.reduce((min, p) => p.price < min.price ? p : min, allSameName[0] || (favorite.product as any));
                const cheaperElsewhere = cheapest && cheapest.supermarket_id !== favorite.product?.supermarket_id;
                return (
                  <div key={favorite.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <img src={favorite.product?.image_url} className="w-16 h-16 object-cover rounded-lg"/>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {favorite.product?.name_en}
                        </div>
                        <div className="text-sm text-gray-600">
                          {favorite.product?.supermarket?.name_en}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${favorite.product?.price?.toFixed?.(2) || favorite.product?.price}</div>
                        <div className="text-xs text-gray-500">{favorite.product?.unit}</div>
                      </div>
                    </div>
                    {cheaperElsewhere && (
                      <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        {language==='en' ? 'Cheaper at' : '他店更便宜：'} {cheapest.supermarket?.name_en || cheapest.supermarket?.name_zh} ${cheapest.price.toFixed(2)}
                </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Store Favorites */
        <div className="space-y-6">
          {storeFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].noStoreFavorites}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {storeFavorites.map((favorite) => {
                // 获取该店铺的商品数量
                const storeProducts = products.filter(p => p.supermarket_id === favorite.supermarket_id);
                const storeProductCount = storeProducts.length;
                
                return (
                  <div key={favorite.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={favorite.supermarket?.logo_url}
                        alt={language === 'en' ? favorite.supermarket?.name_en : favorite.supermarket?.name_zh}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjgiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0zIDlsOSA5bTAtMUw5IDEwbS41IDNsMS41IDEuNUwxNy0xMCIvPgo8cGF0aCBkPSJNMjAuNSAxNC41YzAtMS4zOC0uNS0yLTEuNS0ycy0xLjUuNjItMS41IDJBNCwgNCAwIDEgMSAyMC41IDE0LjVaIi8+CjxwYXRoIGQ9Ik0yLjk3IDExLjUiLz4KPHBhdGggZD0iTTUgMTUuNSIvPgo8cGF0aCBkPSJNOSAxOSIvPgo8cGF0aCBkPSJNMTIgMTQiLz4KPHN0b3JlIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0yIDdjMCAuNjAzLjY5IDEgMS4yMjcgMWExLjEgMS4xIDAgMCAwIDEuMDc4LS42IDQuOCAwIDAgMCAxLjAzLS44TDggN00yMCA3SDh2MDMuMzg2LS44NjZhLjUuNSAwIDAgMSAuNS0uNUg5djQuNmEyIDIgMCAxIDEgNCAwdi0yTTkgNy41djQiLz4KPHA+CiPCUUhMUCBsaW5lPSdqdWluJz4KPC9zdG9yZT4KPC9zdmc+Cjx0ZXh0IHg9IjQwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPkxPR088L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {language === 'en' ? favorite.supermarket?.name_en : favorite.supermarket?.name_zh}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                            {favorite.supermarket?.location}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                            {storeProductCount} products available
                    </span>
                  </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStoreFavorite(favorite.supermarket_id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                          Added: {new Date(favorite.created_at).toLocaleDateString()}
                        </span>
                    <button
                      onClick={() => {
                            console.log(`[FavoritesView] 🏪 查看店铺详情: ${favorite.supermarket_id}`);
                            // 查找该店铺的所有商品并显示详情
                            const storeProducts = products.filter(p => p.supermarket_id === favorite.supermarket_id);
                            const store = storeProducts[0]?.supermarket;
                            
                            if (store && storeProducts.length > 0) {
                              setSelectedStore(store);
                              setIsStoreModalOpen(true);
                            } else {
                              alert('未找到该店铺的详细信息');
                            }
                          }}
                          className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      {text[language].viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>
      )}
      
      {/* Store Detail Modal */}
      <StoreDetailModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        store={selectedStore}
        storeProducts={selectedStore ? products.filter(p => p.supermarket_id === selectedStore.id) : []}
        language={language}
      />
    </div>
  );
}