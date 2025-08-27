import { useState, useEffect } from 'react';
import { Heart, Store, MapPin, Trash2, Eye, ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useApp } from '../contexts/AppContext';
import { PriceHistoryChart } from './PriceHistoryChart';
import { generateSeededSeries } from '../lib/chartUtils';
import { StoreDetailModal } from './StoreDetailModal';
import { generateProductPlaceholder } from '../lib/imageUtils';
import { StoreLogo } from './StoreLogo';

export function FavoritesView() {
  const { user, isAuthenticated } = useAuth();
  const { 
    favorites, // 店铺产品收藏（原始）
    productFavorites, 
    storeFavorites, 
    removeFromFavorites,
    removeFromProductFavorites, 
    removeFromStoreFavorites,
    addToCart,
    checkIsInCart,
    refreshFavorites,
    refreshProductFavorites,
    refreshStoreFavorites
  } = useUser();
  const { language, products, supermarkets } = useApp();
  const [activeTab, setActiveTab] = useState<'single' | 'storeProducts' | 'stores'>('single');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const text = {
    en: {
      title: 'My Favorites',
      productFavorites: 'Products',
      storeFavorites: 'Stores',
      storeProductFavorites: 'Store Items',
      noProductFavorites: "You haven't saved any product favorites yet",
      noStoreFavorites: "You haven't saved any store favorites yet",
      noStoreProductFavorites: "You haven't saved any store product favorites yet",
      addToCart: 'Add to Cart',
      alreadyInCart: 'Already in cart',
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
      productFavorites: '单一商品',
      storeFavorites: '店铺',
      storeProductFavorites: '店铺商品',
      noProductFavorites: '您还没有收藏任何商品',
      noStoreFavorites: '您还没有收藏任何店铺',
      noStoreProductFavorites: '您还没有收藏任何店铺商品',
      addToCart: '加入购物车',
      alreadyInCart: '已在购物车中',
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

  // 处理店铺产品收藏删除
  const handleRemoveFromFavorites = async (productId: number) => {
    try {
      const success = await removeFromFavorites(productId);
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
      <div className="flex space-x-0.5 md:space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-hidden">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-2.5 md:py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors min-w-0 ${
            activeTab === 'single'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <div className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="text-xs md:text-sm truncate">{text[language].productFavorites}</span>
            </div>
            <span className="bg-gray-200 text-gray-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs flex-shrink-0">
              {productFavorites.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('storeProducts')}
          className={`flex-1 py-2.5 md:py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors min-w-0 ${
            activeTab === 'storeProducts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <div className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2">
            <div className="flex items-center space-x-1">
              <Store className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="text-xs md:text-sm truncate">{text[language].storeProductFavorites}</span>
            </div>
            <span className="bg-gray-200 text-gray-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs flex-shrink-0">
              {favorites.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex-1 py-2.5 md:py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors min-w-0 ${
            activeTab === 'stores'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <div className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2">
            <div className="flex items-center space-x-1">
              <Store className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="text-xs md:text-sm truncate">{text[language].storeFavorites}</span>
            </div>
            <span className="bg-gray-200 text-gray-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs flex-shrink-0">
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
                          src={favorite.product_image || generateProductPlaceholder(favorite.product_name_en, 80)}
                          alt={language === 'en' ? favorite.product_name_en : favorite.product_name_zh}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.src = generateProductPlaceholder(favorite.product_name_en, 80);
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
                                  height={160}
                                  width={640}
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
                                    <StoreLogo
                                      supermarket={product.supermarket}
                                      supermarketId={product.supermarket?.id || 0}
                                      size={32}
                                      className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                                      language={language}
                                      showDebugInfo={false}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className={`font-medium text-gray-900 text-xs md:text-sm truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
                                        {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">
                                        {product.supermarket?.location}
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
                                      title={checkIsInCart(product.id).inCart ? text[language].alreadyInCart : text[language].addToCart}
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
              <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].noStoreProductFavorites}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {favorites.map((favorite) => {
                // 通过product_id查找完整的产品信息
                const product = products.find(p => p.id === favorite.product_id);
                if (!product) return null; // 如果找不到产品信息，跳过
                
                // Helper function to clean product names
                const cleanProductName = (name: string) => {
                  return name.replace(/\s*\(Store\s+\d+\)\s*$/i, '').trim();
                };
                
                // 计算该店铺中哪些商品在其他店更便宜
                const allSameName = products.filter(p => 
                  cleanProductName(p.name_en).toLowerCase() === cleanProductName(product.name_en).toLowerCase()
                );
                const cheapest = allSameName.reduce((min, p) => p.price < min.price ? p : min, allSameName[0] || product);
                const cheaperElsewhere = cheapest && cheapest.supermarket_id !== product.supermarket_id;
                return (
                  <div key={favorite.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <img 
                        src={product.image || generateProductPlaceholder(product.name_en || product.id || 'product', 64)} 
                        alt={language === 'en' ? product.name_en : product.name_zh}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = generateProductPlaceholder(product.name_en || product.id || 'product', 64);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {product.name_en}
                        </div>
                        <div className="text-sm text-gray-600">
                          {product.supermarket?.name_en}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-lg font-bold">${product.price?.toFixed?.(2) || product.price}</div>
                          <div className="text-xs text-gray-500">{product.unit}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromFavorites(favorite.product_id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={text[language].removeFromFavorites}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                
                // 获取最新的超市信息 - 优先从数据库数据
                let currentSupermarket = favorite.supermarket;
                
                // 如果收藏中的信息不完整或过时，从AppContext的supermarkets中获取最新数据
                const dbSupermarket = supermarkets.find(s => s.id === favorite.supermarket_id);
                if (dbSupermarket) {
                  currentSupermarket = {
                    id: dbSupermarket.id,
                    name_en: dbSupermarket.name_en,
                    name_zh: dbSupermarket.name_zh,
                    location: dbSupermarket.location,
                    logo_url: dbSupermarket.logo_url,
                    latitude: dbSupermarket.lat,
                    longitude: dbSupermarket.lng
                  };
                } else if (!currentSupermarket || !currentSupermarket.name_en) {
                  // 如果数据库中也没有，尝试从products中查找
                  const productStore = storeProducts[0]?.supermarket;
                  if (productStore) {
                    currentSupermarket = {
                      id: productStore.id,
                      name_en: productStore.name_en,
                      name_zh: productStore.name_zh,
                      location: productStore.location,
                      logo_url: productStore.logo_url,
                      latitude: productStore.lat,
                      longitude: productStore.lng
                    };
                  }
                }
                
                return (
                  <div key={favorite.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <StoreLogo
                        supermarket={currentSupermarket}
                        supermarketId={favorite.supermarket_id}
                        size={80}
                        className="w-20 h-20"
                        language={language}
                        showDebugInfo={process.env.NODE_ENV === 'development'}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {language === 'en' ? currentSupermarket?.name_en : currentSupermarket?.name_zh}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className={`${language === 'zh' ? 'font-chinese' : ''}`}>
                            {currentSupermarket?.location}
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
                            
                            // 使用与显示相同的currentSupermarket逻辑
                            if (currentSupermarket && currentSupermarket.name_en) {
                              // 获取该店铺的商品
                              const storeProducts = products.filter(p => p.supermarket_id === favorite.supermarket_id);
                              setSelectedStore(currentSupermarket);
                              setIsStoreModalOpen(true);
                              console.log(`✅ [FavoritesView] 打开店铺详情: ${currentSupermarket.name_en}, 商品数量: ${storeProducts.length}`);
                            } else {
                              console.warn(`⚠️ [FavoritesView] 未找到超市ID ${favorite.supermarket_id} 的详细信息`);
                              alert(language === 'en' 
                                ? 'Store information not found' 
                                : '未找到该店铺的详细信息'
                              );
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