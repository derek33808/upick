import { useMemo, useState } from 'react';
import { Package, TrendingDown, Clock, Heart, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Product } from '../types';
import { generateProductPlaceholder } from '../lib/imageUtils';

export function ProductGrid(): JSX.Element {
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
    checkIsProductFavorite,
    addToProductFavorites,
    removeFromProductFavorites
  } = useUser();
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const text = {
    en: {
      noProducts: 'No products found',
      tryAdjusting: 'Try adjusting your search or filters',
      lowestPrice: 'Lowest Price',
      availableAt: 'Available at',
      viewAllPrices: 'View All Store Prices',
      stores: 'stores',
      priceUpdated: 'Price updated',
      historicalLow: '30-day low',
      currentHigher: 'Current price higher than 30-day low',
      currentIsLowest: 'Current price is 30-day lowest!',
      and: 'and',
      others: 'others'
    },
    zh: {
      noProducts: '未找到商品',
      tryAdjusting: '请尝试调整搜索条件或筛选器',
      lowestPrice: '最低价格',
      availableAt: '可购买于',
      viewAllPrices: '查看各超市价格',
      stores: '家超市',
      priceUpdated: '价格更新于',
      historicalLow: '30天最低价',
      currentHigher: '当前价格高于30天最低价',
      currentIsLowest: '当前价格是近30天最低价！',
      and: '和',
      others: '等'
    }
  };

  // Helper function to clean product names by removing store suffixes
  const cleanProductName = (name: string) => {
    return name.replace(/\s*\(Store\s+\d+\)\s*$/i, '').trim();
  };

  // Group products by name and find minimum price for each
  const getUniqueProducts = (filteredProducts: Product[]) => {
    const productMap = new Map();
    
    filteredProducts.forEach(product => {
      const cleanedName = cleanProductName(product.name_en);
      const key = cleanedName.toLowerCase();
      
      if (!productMap.has(key)) {
        productMap.set(key, {
          name_en: cleanedName,
          name_zh: product.name_zh,
          image: product.image,
          category: product.category,
          minPrice: product.price,
          products: [product],
          lowestPriceStores: [product]
        });
      } else {
        const existing = productMap.get(key);
        existing.products.push(product);
        
        if (product.price < existing.minPrice) {
          existing.minPrice = product.price;
          existing.lowestPriceStores = [product];
        } else if (product.price === existing.minPrice) {
          existing.lowestPriceStores.push(product);
        }
      }
    });
    
    return Array.from(productMap.values()).sort((a, b) => a.minPrice - b.minPrice);
  };

  // Calculate 30-day historical low (mock calculation for demo)
  const getHistoricalLow = (productName: string) => {
    const cleanedProductName = cleanProductName(productName);
    const currentProducts = products.filter(p => cleanProductName(p.name_en).toLowerCase() === cleanedProductName.toLowerCase());
    const currentMinPrice = Math.min(...currentProducts.map(p => p.price));
    
    // Simulate historical low (usually 10-20% lower than current)
    const historicalLow = currentMinPrice * (0.8 + Math.random() * 0.15);
    return historicalLow;
  };

  const formatStoreNames = (stores: Product[]) => {
    if (stores.length === 1) {
      return language === 'en' ? stores[0].supermarket?.name_en : stores[0].supermarket?.name_zh;
    } else if (stores.length === 2) {
      const name1 = language === 'en' ? stores[0].supermarket?.name_en : stores[0].supermarket?.name_zh;
      const name2 = language === 'en' ? stores[1].supermarket?.name_en : stores[1].supermarket?.name_zh;
      return `${name1} ${text[language].and} ${name2}`;
    } else {
      const firstName = language === 'en' ? stores[0].supermarket?.name_en : stores[0].supermarket?.name_zh;
      return `${firstName} ${text[language].and} ${stores.length - 1} ${text[language].others}`;
    }
  };

  const handleToggleProductFavorite = async (
    productNameEn: string,
    productNameZh: string,
    image: string,
    category: string
  ) => {
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }
    
    const cleanedName = cleanProductName(productNameEn);
    
    if (updating.has(cleanedName)) return;
    setUpdating(prev => new Set(prev.add(cleanedName)));
    try {
      const isFav = checkIsProductFavorite(cleanedName);
      if (isFav) {
        await removeFromProductFavorites(cleanedName);
      } else {
        await addToProductFavorites({
          name_en: cleanedName,
          name_zh: productNameZh,
          image,
          category
        });
      }
    } catch (error) {
      console.error('商品收藏操作失败:', error);
    } finally {
      setUpdating(prev => {
        const next = new Set(prev);
        next.delete(cleanedName);
        return next;
      });
    }
  };

  // Handle clicking "View All Store Prices" button
  const handleProductNameClick = (productName: string) => {
    // Navigate to comparison view by triggering the same navigation logic as App.tsx
    window.dispatchEvent(new CustomEvent('navigateToProductComparison', { 
      detail: { productName } 
    }));
  };

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

    // Sort products before grouping
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

    return getUniqueProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedSupermarkets, sortBy, language]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-100 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].noProducts}
        </h3>
        <p className={`text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].tryAdjusting}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredProducts.map((productGroup, index) => {
        const historicalLow = getHistoricalLow(productGroup.name_en);
        const isCurrentLowest = productGroup.minPrice <= historicalLow;
        const mostRecentUpdate = Math.max(...productGroup.lowestPriceStores.map((p: Product) => new Date(p.updated_at).getTime()));
        const hasSpecialOffers = productGroup.lowestPriceStores.some((p: Product) => p.isSpecial);
        
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
          >
            {/* Product Header */}
            <div className="p-4 lg:p-6">
              <div className="flex flex-col space-y-3 lg:space-y-4">
                {/* Product Image and Name */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={productGroup.image}
                      alt={language === 'en' ? productGroup.name_en : productGroup.name_zh}
                      className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-xl shadow-md"
                      loading="lazy"
                      onError={(e) => {
                        console.log(`[ProductGrid] Image failed to load for ${productGroup.name_en}, applying fallback`);
                        e.currentTarget.src = generateProductPlaceholder(productGroup.name_en, 80);
                      }}
                      onLoad={(e) => {
                        console.log(`[ProductGrid] Image loaded successfully for ${productGroup.name_en}`);
                      }}
                      onAbort={(e) => {
                        console.log(`[ProductGrid] Image load aborted for ${productGroup.name_en}, applying fallback`);
                        e.currentTarget.src = generateProductPlaceholder(productGroup.name_en, 80);
                      }}
                      style={{ 
                        backgroundImage: `url(${generateProductPlaceholder(productGroup.name_en, 80)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    {hasSpecialOffers && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <Zap className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg lg:text-xl font-bold text-gray-900 mb-1 line-clamp-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {language === 'en' ? productGroup.name_en : productGroup.name_zh}
                    </h3>
                    <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {productGroup.products.length} {text[language].stores}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleProductFavorite(productGroup.name_en, productGroup.name_zh, productGroup.image, productGroup.category); }}
                    disabled={updating.has(productGroup.name_en) || isLoading}
                    className={`p-2 rounded-full transition-colors ${
                      checkIsProductFavorite(productGroup.name_en) ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-white text-gray-400 hover:text-purple-600'
                    }`}
                    title={checkIsProductFavorite(productGroup.name_en) ? '取消单一产品收藏' : '单一产品收藏'}
                  >
                    {updating.has(productGroup.name_en) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Heart className={`w-4 h-4 ${checkIsProductFavorite(productGroup.name_en) ? 'fill-current' : ''}`} />
                    )}
                  </button>
                </div>

                {/* Lowest Price Section */}
                <div className="bg-green-50 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <span className={`text-sm font-semibold text-green-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {text[language].lowestPrice}
                    </span>
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-green-600 mb-2">
                    ${productGroup.minPrice.toFixed(2)}
                  </div>
                  <div className={`text-xs lg:text-sm text-green-700 mb-3 line-clamp-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].availableAt} {formatStoreNames(productGroup.lowestPriceStores)}
                  </div>
                  
                  {/* Historical Price Comparison */}
                  <div className="border-t border-green-200 pt-3">
                    <div className={`text-xs text-gray-600 mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {text[language].historicalLow}: ${historicalLow.toFixed(2)}
                    </div>
                    {isCurrentLowest ? (
                      <div className={`flex items-center space-x-1 text-xs text-green-600 font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                        <TrendingDown className="w-3 h-3" />
                        <span>🎉 {text[language].currentIsLowest}</span>
                      </div>
                    ) : (
                      <div className={`flex items-center space-x-1 text-xs text-orange-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>📈 {text[language].currentHigher} ${historicalLow.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Update Time */}
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className={language === 'zh' ? 'font-chinese' : ''}>
                    {text[language].priceUpdated} {new Date(mostRecentUpdate).toLocaleDateString(
                      language === 'zh' ? 'zh-CN' : 'en-NZ',
                      { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }
                    )}
                  </span>
                </div>

                {/* View All Prices Button */}
                <button
                  onClick={() => handleProductNameClick(productGroup.name_en)}
                  className={`w-full bg-primary-500 hover:bg-primary-600 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl font-medium transition-colors hover:shadow-md ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {text[language].viewAllPrices}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}