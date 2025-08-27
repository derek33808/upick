import { ArrowLeft, MapPin, Star, Clock, Zap, TrendingUp, TrendingDown, Navigation, Heart, LogIn, Plus, Check, Package, Award, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Product, Supermarket } from '../types';
import { useState, useEffect, useMemo, useRef } from 'react';
import { PriceHistoryChart } from './PriceHistoryChart';
import { generateSeededSeries } from '../lib/chartUtils';
import { generateProductPlaceholder } from '../lib/imageUtils';
import { StoreDetailModal } from './StoreDetailModal';

interface ProductCompareViewProps {
  productName: string;
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

export function ProductCompareView({ productName, onBack, onProductClick }: ProductCompareViewProps) {
  const { language, products } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites, addToCart, removeFromCart, checkIsFavorite, checkIsInCart } = useUser();
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [favoriteStates, setFavoriteStates] = useState<Map<number, boolean>>(new Map());
  const [shoppingListStates, setShoppingListStates] = useState<Map<number, boolean>>(new Map());
  const [updatingStates, setUpdatingStates] = useState<Map<number, { favorite: boolean; shopping: boolean }>>(new Map());
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Supermarket | null>(null);

  const text = {
    en: {
      back: 'Back to Category',
      priceComparison: 'Price Comparison',
      cheapest: 'Cheapest',
      mostExpensive: 'Most Expensive',
      averagePrice: 'Average Price',
      updated: 'Updated',
      special: 'Special Offer',
      youSave: 'You Save',
      endingSoon: 'Ending Soon',
      noProducts: 'No products found with this name',
      viewOnMap: 'View on Map',
      getDirections: 'Get Directions',
      priceUpdated: 'Price updated',
      historicalLow: '30-day low',
      currentHigher: 'Current price higher than 30-day low',
      currentIsLowest: 'Current price is 30-day lowest!',
      stores: 'stores',
      priceHistory: 'Price History Analysis',
      supermarket: 'Supermarket',
      currentPrice: 'Current Price',
      lastUpdated: 'Last Updated',
      viewDetails: 'View Details',
      productDetails: 'Product Details',
      origin: 'Origin',
      freshness: 'Freshness',
      rating: 'Rating',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      addToShoppingList: 'Add to Shopping List',
      removeFromShoppingList: 'Remove from Shopping List',
      alreadyInShoppingList: 'Already in Shopping List',
      loginToFavorite: 'Login to Add Favorites',
      loginToShoppingList: 'Login to Add to Shopping List',
      favoriteAdded: 'Added to favorites!',
      favoriteRemoved: 'Removed from favorites!',
      shoppingListAdded: 'Added to shopping list!',
      shoppingListRemoved: 'Removed from shopping list!',
      closeDetails: 'Close Details',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      storeDetails: 'Store Details'
    },
    zh: {
      back: '返回分类',
      priceComparison: '价格比较',
      cheapest: '最便宜',
      mostExpensive: '最贵',
      averagePrice: '平均价格',
      updated: '更新于',
      special: '特价优惠',
      youSave: '节省',
      endingSoon: '即将结束',
      noProducts: '未找到该商品',
      viewOnMap: '查看地图',
      getDirections: '获取路线',
      priceUpdated: '价格更新于',
      historicalLow: '30天最低价',
      currentHigher: '当前价格高于30天最低价',
      currentIsLowest: '当前价格是近30天最低价！',
      stores: '家超市',
      priceHistory: '价格历史分析',
      supermarket: '超市名称',
      currentPrice: '当前价格',
      lastUpdated: '更新时间',
      viewDetails: '查看详情',
      productDetails: '商品详情',
      origin: '产地',
      freshness: '新鲜度',
      rating: '评分',
      addToFavorites: '添加收藏',
      removeFromFavorites: '取消收藏',
      addToShoppingList: '加入购物清单',
      removeFromShoppingList: '从清单中移除',
      alreadyInShoppingList: '已在清单中',
      loginToFavorite: '登录后收藏',
      loginToShoppingList: '登录后添加到清单',
      favoriteAdded: '已添加到收藏！',
      favoriteRemoved: '已从收藏中移除！',
      shoppingListAdded: '已加入购物清单！',
      shoppingListRemoved: '已从清单中移除！',
      closeDetails: '关闭详情',
      showDetails: '显示详情',
      hideDetails: '隐藏详情',
      storeDetails: '超市详情'
    }
  };

  // Helper function to clean product names by removing store suffixes
  const cleanProductName = (name: string) => {
    return name.replace(/\s*\(Store\s+\d+\)\s*$/i, '').trim();
  };

  // Filter products by name (case insensitive) with name cleaning
  const matchingProducts = products.filter(product => 
    cleanProductName(product.name_en).toLowerCase() === cleanProductName(productName).toLowerCase()
  ).sort((a, b) => a.price - b.price);

  // Debug: Log supermarket data for the first few products
  if (matchingProducts.length > 0) {
    console.log('🔍 [ProductCompareView] Debug supermarket data:');
    matchingProducts.slice(0, 3).forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.id,
        name: product.name_en,
        supermarket_id: product.supermarket_id,
        supermarket: product.supermarket,
        hasLogo: !!product.supermarket?.logo_url,
        hasName: !!product.supermarket?.name_en
      });
    });
  }

  // Stable series for header chart
  const stableEndDateRef = useRef<Date>(new Date());

  const headerSeries = useMemo(() => {
    const base = matchingProducts[0]?.price || 5;
    const seedKey = `name:${productName}|${Math.round(base * 100)}`;
    return generateSeededSeries(seedKey, base, 90);
  }, [productName, matchingProducts.length > 0 ? matchingProducts[0].price : 0]);

  const handleGetDirections = (product: Product) => {
    if (product.supermarket?.lat && product.supermarket?.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${product.supermarket.lat},${product.supermarket.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleViewOnMap = (product: Product) => {
    if (product.supermarket?.lat && product.supermarket?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${product.supermarket.lat},${product.supermarket.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleStoreDetailsClick = (product: Product) => {
    if (product.supermarket) {
      setSelectedStore(product.supermarket);
      setIsStoreModalOpen(true);
    }
  };

  // Load user's favorite and shopping list status for all products
  useEffect(() => {
    if (isAuthenticated && user && matchingProducts.length > 0) {
      const newFavoriteStates = new Map<number, boolean>();
      const newShoppingStates = new Map<number, boolean>();
      
      matchingProducts.forEach(product => {
        // Use global state instead of direct API calls
        const isFavorite = checkIsFavorite(product.id);
        const cartStatus = checkIsInCart(product.id);
        
        newFavoriteStates.set(product.id, isFavorite);
        newShoppingStates.set(product.id, cartStatus.inCart);
      });
      
      setFavoriteStates(newFavoriteStates);
      setShoppingListStates(newShoppingStates);
    }
  }, [isAuthenticated, user?.id, matchingProducts.length]);

  const handleFavoriteToggle = async (productId: number) => {
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    setUpdatingStates(prev => new Map(prev.set(productId, { 
      ...prev.get(productId), 
      favorite: true, 
      shopping: prev.get(productId)?.shopping || false 
    })));
    
    try {
      const isFavorite = favoriteStates.get(productId) || false;
      let success = false;
      
      if (isFavorite) {
        success = await removeFromFavorites(productId);
        if (success) {
          setFavoriteStates(prev => new Map(prev.set(productId, false)));
          console.log(text[language].favoriteRemoved);
        }
      } else {
        success = await addToFavorites(productId);
        if (success) {
          setFavoriteStates(prev => new Map(prev.set(productId, true)));
          console.log(text[language].favoriteAdded);
        }
      }
      
      if (success) {
        // 触发全局状态更新
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      }
    } catch (error) {
      console.error('❌ [COMPARE] Favorite operation failed:', error);
    } finally {
      setUpdatingStates(prev => new Map(prev.set(productId, { 
        ...prev.get(productId), 
        favorite: false, 
        shopping: prev.get(productId)?.shopping || false 
      })));
    }
  };

  const handleShoppingListToggle = async (productId: number) => {
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    setUpdatingStates(prev => new Map(prev.set(productId, { 
      ...prev.get(productId), 
      favorite: prev.get(productId)?.favorite || false,
      shopping: true 
    })));
    
    try {
      const isInShoppingList = shoppingListStates.get(productId) || false;
      let success = false;
      
      if (isInShoppingList) {
        success = await removeFromCart(productId);
        if (success) {
          setShoppingListStates(prev => new Map(prev.set(productId, false)));
          console.log(text[language].shoppingListRemoved);
        }
      } else {
        success = await addToCart(productId, 1);
        if (success) {
          setShoppingListStates(prev => new Map(prev.set(productId, true)));
          console.log(text[language].shoppingListAdded);
        }
      }
      
      if (success) {
        // 触发全局状态更新
        window.dispatchEvent(new CustomEvent('shoppingListUpdated'));
      }
    } catch (error) {
      console.error('❌ [COMPARE] Shopping cart operation failed:', error);
    } finally {
      setUpdatingStates(prev => new Map(prev.set(productId, { 
        ...prev.get(productId), 
        favorite: prev.get(productId)?.favorite || false,
        shopping: false 
      })));
    }
  };

  const toggleExpanded = (productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  if (matchingProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className={`text-sm font-medium ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].back}
            </span>
          </button>
        </div>
        
        <div className="text-center py-12">
          <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].noProducts}
          </p>
        </div>
      </div>
    );
  }

  const prices = matchingProducts.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const cheapestProduct = matchingProducts.find(p => p.price === minPrice);
  const expensiveProduct = matchingProducts.find(p => p.price === maxPrice);
  const historicalLow = useMemo(() => {
    if (headerSeries.length === 0) return 0;
    return Math.min(...headerSeries);
  }, [headerSeries]);
  const isCurrentLowest = minPrice <= historicalLow;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className={`text-sm font-medium ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].back}
          </span>
        </button>
      </div>

      {/* Product Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <img
            src={matchingProducts[0].image}
            alt={language === 'en' ? matchingProducts[0].name_en : matchingProducts[0].name_zh}
            className="w-24 h-24 object-cover rounded-xl shadow-lg mx-auto sm:mx-0"
            onError={(e) => {
              e.currentTarget.src = generateProductPlaceholder(productName, 96);
            }}
          />
          <div className="text-center sm:text-left">
            <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? matchingProducts[0].name_en : matchingProducts[0].name_zh}
            </h1>
            <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].priceComparison} • {matchingProducts.length} {text[language].stores}
            </p>
            
            {/* Historical Price Info */}
            <div className="mt-3">
              {isCurrentLowest ? (
                <div className={`inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                  <TrendingDown className="w-4 h-4" />
                  <span>🎉 {text[language].currentIsLowest}</span>
                </div>
              ) : (
                <div className={`inline-flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>📈 {text[language].currentHigher} ${historicalLow.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className={`text-sm font-semibold text-green-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].cheapest}
              </div>
              <div className="text-3xl font-bold text-green-600">${minPrice.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {cheapestProduct?.supermarket?.logo_url ? (
              <img
                src={cheapestProduct.supermarket.logo_url}
                alt={cheapestProduct.supermarket.name_en}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {cheapestProduct?.supermarket_id || '?'}
              </div>
            )}
            <span className={`text-sm text-green-700 font-medium truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
              {cheapestProduct?.supermarket ? (
                language === 'en' ? cheapestProduct.supermarket.name_en : cheapestProduct.supermarket.name_zh
              ) : (
                `${language === 'en' ? 'Store' : '商店'} ${cheapestProduct?.supermarket_id || '?'}`
              )}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div>
              <div className={`text-sm font-semibold text-blue-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].averagePrice}
              </div>
              <div className="text-3xl font-bold text-blue-600">${avgPrice.toFixed(2)}</div>
            </div>
          </div>
          <div className={`text-sm text-blue-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {matchingProducts.length} {text[language].stores}
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className={`text-sm font-semibold text-red-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].mostExpensive}
              </div>
              <div className="text-3xl font-bold text-red-600">${maxPrice.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {expensiveProduct?.supermarket?.logo_url ? (
              <img
                src={expensiveProduct.supermarket.logo_url}
                alt={expensiveProduct.supermarket.name_en}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {expensiveProduct?.supermarket_id || '?'}
              </div>
            )}
            <span className={`text-sm text-red-700 font-medium truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
              {expensiveProduct?.supermarket ? (
                language === 'en' ? expensiveProduct.supermarket.name_en : expensiveProduct.supermarket.name_zh
              ) : (
                `${language === 'en' ? 'Store' : '商店'} ${expensiveProduct?.supermarket_id || '?'}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        <h2 className={`text-xl font-semibold mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].priceComparison}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {matchingProducts.map((product) => (
            <div key={product.id} className={`flex flex-col p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 transition-all ${
              product.price === minPrice 
                ? 'border-green-300 bg-green-50 hover:border-green-400' 
                : 'border-gray-200 bg-gray-50 hover:border-primary-200'
            }`}>
              {/* Store Header */}
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {product.supermarket?.logo_url ? (
                      <img
                        src={product.supermarket.logo_url}
                        alt={language === 'en' ? product.supermarket.name_en : product.supermarket.name_zh}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-lg">
                        {product.supermarket_id || '?'}
                      </div>
                    )}
                    {product.price === minPrice && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`font-semibold text-gray-900 text-sm lg:text-base ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {product.supermarket ? (
                          language === 'en' ? product.supermarket.name_en : product.supermarket.name_zh
                        ) : (
                          `${language === 'en' ? 'Store' : '商店'} ${product.supermarket_id}`
                        )}
                      </div>
                      {product.supermarket && (
                        <button
                          onClick={() => handleStoreDetailsClick(product)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex-shrink-0"
                        >
                          <Info className="w-3 h-3" />
                          <span className={`hidden sm:inline ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {text[language].storeDetails}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <span className={`text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {text[language].updated} {new Date(product.updated_at).toLocaleDateString()}
                      </span>
                      {product.isSpecial && (
                        <span className={`bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {text[language].special}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                {product.isSpecial ? (
                  <div className="text-right">
                    <div className="text-lg lg:text-xl font-bold text-red-600">${product.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 line-through">${(product.originalPrice || 0).toFixed(2)}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{product.unit}</div>
                  </div>
                )}
              </div>

              {/* Toggle Details Button */}
              <div className="mt-4">
                <button
                  onClick={() => toggleExpanded(product.id)}
                  className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-colors font-medium ${
                    expandedProducts.has(product.id)
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  } ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-2 text-sm sm:text-base">
                    {expandedProducts.has(product.id) ? text[language].hideDetails : text[language].showDetails}
                  </span>
                </button>
              </div>

              {/* Expanded Details */}
              {expandedProducts.has(product.id) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Product Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.origin && (
                      <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                        <Package className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className={`text-xs text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {text[language].origin}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 truncate">{product.origin}</div>
                        </div>
                      </div>
                    )}
                    
                    {product.freshness && (
                      <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                        <Award className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className={`text-xs text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {text[language].freshness}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 truncate">{product.freshness}</div>
                        </div>
                      </div>
                    )}
                    
                    {product.rating && (
                      <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                        <div className="min-w-0">
                          <div className={`text-xs text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {text[language].rating}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{product.rating}/5</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                      <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className={`text-xs text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {text[language].updated}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {new Date(product.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Favorite Button */}
                    {isAuthenticated ? (
                      <button
                        onClick={() => handleFavoriteToggle(product.id)}
                        disabled={updatingStates.get(product.id)?.favorite}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm ${
                          favoriteStates.get(product.id)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        {updatingStates.get(product.id)?.favorite ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Heart className={`w-4 h-4 ${favoriteStates.get(product.id) ? 'fill-current' : ''}`} />
                        )}
                        <span>
                          {favoriteStates.get(product.id) ? text[language].removeFromFavorites : text[language].addToFavorites}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('showLoginModal'));
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>{text[language].loginToFavorite}</span>
                      </button>
                    )}

                    {/* Shopping List Button */}
                    {isAuthenticated ? (
                      <button
                        onClick={() => handleShoppingListToggle(product.id)}
                        disabled={updatingStates.get(product.id)?.shopping}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm ${
                          shoppingListStates.get(product.id)
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        {updatingStates.get(product.id)?.shopping ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : shoppingListStates.get(product.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>
                          {shoppingListStates.get(product.id) ? text[language].alreadyInShoppingList : text[language].addToShoppingList}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('showLoginModal'));
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>{text[language].loginToShoppingList}</span>
                      </button>
                    )}
                  </div>

                  {/* Map Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleViewOnMap(product)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm ${language === 'zh' ? 'font-chinese' : ''}`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{text[language].viewOnMap}</span>
                    </button>
                    <button
                      onClick={() => handleGetDirections(product)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm ${language === 'zh' ? 'font-chinese' : ''}`}
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{text[language].getDirections}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Special Offer Info */}
              {product.isSpecial && (
                <div className="mt-4 bg-red-100 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="w-4 h-4 text-red-600" />
                    <span className={`text-red-700 font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {text[language].youSave} ${((product.originalPrice || 0) - product.price).toFixed(2)}
                    </span>
                    {product.specialEndDate && (
                      <span className={`text-red-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        • {text[language].endingSoon}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Historical Price Comparison */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className={`text-lg font-semibold mb-4 text-center ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].priceHistory}
        </h3>
        {/* Smooth curve chart */}
        <div className="mb-4 overflow-hidden rounded-lg bg-white/40">
          <PriceHistoryChart prices={headerSeries} height={120} endDate={stableEndDateRef.current} />
        </div>
        <div className="text-center">
          <div className={`text-sm text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].historicalLow}: ${historicalLow.toFixed(2)}
          </div>
          {isCurrentLowest ? (
            <div className={`text-green-600 font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
              🎉 {text[language].currentIsLowest}
            </div>
          ) : (
            <div className={`text-orange-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              📈 {text[language].currentHigher} ${historicalLow.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Store Detail Modal */}
      {isStoreModalOpen && selectedStore && (
        <StoreDetailModal
          isOpen={isStoreModalOpen}
          onClose={() => {
            setIsStoreModalOpen(false);
            setSelectedStore(null);
          }}
          store={selectedStore}
          storeProducts={products.filter(p => p.supermarket_id === selectedStore.id)}
          language={language}
        />
      )}
    </div>
  );
}