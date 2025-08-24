import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Star, MapPin, Clock, Zap, Tag, ShoppingCart, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Product } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function CompareView() {
  const { language, products, supermarkets } = useApp();
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const text = {
    en: {
      title: 'Price Comparison',
      subtitle: 'Compare prices across different supermarkets',
      selectProducts: 'Select products to compare',
      noComparison: 'No products selected for comparison',
      addProducts: 'Add products to start comparing prices',
      cheapest: 'Cheapest',
      mostExpensive: 'Most Expensive',
      averagePrice: 'Average Price',
      priceRange: 'Price Range',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      specialOffers: 'Special Offers',
      stores: 'stores',
      updated: 'Updated',
      rating: 'Rating',
      origin: 'Origin',
      freshness: 'Freshness',
      youSave: 'You Save',
      regularPrice: 'Regular Price',
      specialPrice: 'Special Price',
      endingSoon: 'Ending Soon',
      productsCompared: 'Products Compared',
      totalSupermarkets: 'Supermarkets',
      maxSavings: 'Max Savings',
      bestDeals: 'Best Deals Available',
      about: 'about',
      ago: 'ago',
      hours: 'hours'
    },
    zh: {
      title: '价格比较',
      subtitle: '比较不同超市的商品价格',
      selectProducts: '选择要比较的商品',
      noComparison: '没有选择比较商品',
      addProducts: '添加商品开始比价',
      cheapest: '最便宜',
      mostExpensive: '最贵',
      averagePrice: '平均价格',
      priceRange: '价格区间',
      viewDetails: '查看详情',
      hideDetails: '隐藏详情',
      specialOffers: '特价商品',
      stores: '超市',
      updated: '更新于',
      rating: '评分',
      origin: '产地',
      freshness: '新鲜度',
      youSave: '节省',
      regularPrice: '原价',
      specialPrice: '特价',
      endingSoon: '即将结束',
      productsCompared: '比较商品数',
      totalSupermarkets: '超市数量',
      maxSavings: '最大节省',
      bestDeals: '最佳优惠',
      about: '约',
      ago: '前',
      hours: '小时'
    }
  };

  // Group products by name for comparison
  const productGroups = products.reduce((groups, product) => {
    const key = product.name_en.toLowerCase().trim();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  // Get products that exist in multiple supermarkets
  const comparableProducts = Object.entries(productGroups)
    .filter(([_, products]) => products.length > 1)
    .sort(([_, a], [__, b]) => b.length - a.length) // Sort by number of stores
    .slice(0, 12); // Show top 12 for better display

  const toggleExpanded = (productKey: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productKey)) {
      newExpanded.delete(productKey);
    } else {
      newExpanded.add(productKey);
    }
    setExpandedProducts(newExpanded);
  };

  if (comparableProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].noComparison}
        </h3>
        <p className={`text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].addProducts}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h1>
        <p className={`text-base sm:text-lg text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle}
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {comparableProducts.map(([productName, productVariants]) => {
          const prices = productVariants.map(p => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const cheapestProduct = productVariants.find(p => p.price === minPrice);
          const expensiveProduct = productVariants.find(p => p.price === maxPrice);
          const specialProducts = productVariants.filter(p => p.isSpecial);
          const isExpanded = expandedProducts.has(productName);

          return (
            <div key={productName} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm sm:shadow-lg overflow-hidden">
              {/* Product Header - Mobile Optimized */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={productVariants[0].image}
                        alt={productVariants[0].name_en}
                        className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg sm:rounded-xl bg-gray-100 shadow-md"
                        loading="lazy"
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5ZmEyYTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                      />
                      {specialProducts.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold">
                          {specialProducts.length}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {language === 'en' ? productVariants[0].name_en : productVariants[0].name_zh}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{productVariants.length} {text[language].stores}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</span>
                    </div>
                    {specialProducts.length > 0 && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{specialProducts.length} {text[language].specialOffers}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Statistics - Mobile Optimized */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs sm:text-sm font-semibold text-green-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {text[language].cheapest}
                        </div>
                        <div className="text-xl sm:text-3xl font-bold text-green-600">${minPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img
                        src={cheapestProduct?.supermarket?.logo_url}
                        alt={cheapestProduct?.supermarket?.name_en}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm text-green-700 font-medium truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {language === 'en' ? cheapestProduct?.supermarket?.name_en : cheapestProduct?.supermarket?.name_zh}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs sm:text-sm font-semibold text-blue-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {text[language].averagePrice}
                        </div>
                        <div className="text-xl sm:text-3xl font-bold text-blue-600">${avgPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className={`text-xs sm:text-sm text-blue-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {productVariants.length} {text[language].stores}
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-200">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs sm:text-sm font-semibold text-red-800 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {text[language].mostExpensive}
                        </div>
                        <div className="text-xl sm:text-3xl font-bold text-red-600">${maxPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img
                        src={expensiveProduct?.supermarket?.logo_url}
                        alt={expensiveProduct?.supermarket?.name_en}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm text-red-700 font-medium truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {language === 'en' ? expensiveProduct?.supermarket?.name_en : expensiveProduct?.supermarket?.name_zh}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile View Details Button */}
              <div className="block sm:hidden p-4 border-b border-gray-100">
                <button
                  onClick={() => toggleExpanded(productName)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isExpanded 
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                  } ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Eye className="w-5 h-5" />
                  <span>{isExpanded ? text[language].hideDetails : text[language].viewDetails}</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Detailed Product Comparison - Always visible on desktop, toggleable on mobile */}
              <div className={`${isExpanded ? 'block' : 'hidden'} sm:block p-4 sm:p-6`}>
                <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 hidden sm:block ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].viewDetails}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {productVariants
                    .sort((a, b) => a.price - b.price)
                    .map((product) => (
                      <div key={product.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                        product.price === minPrice 
                          ? 'border-green-200 bg-green-50' 
                          : product.isSpecial 
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                      }`}>
                        {/* Mobile Layout */}
                        <div className="flex items-center justify-between sm:hidden mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={product.supermarket?.logo_url}
                                alt={product.supermarket?.name_en}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              {product.price === minPrice && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                                  ✓
                                </div>
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold text-gray-900 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                                {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span>{product.supermarket?.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile Price */}
                          <div className="text-right">
                            {product.isSpecial ? (
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xl font-bold text-red-600">${product.price}</span>
                                  <span className="text-xs text-gray-500 line-through">${product.originalPrice}</span>
                                </div>
                                <div className="flex items-center justify-end space-x-1">
                                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    -{product.discount}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-xl font-bold text-gray-900">${product.price}</div>
                                <div className="text-xs text-gray-500">{product.unit}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mobile Additional Info */}
                        <div className="sm:hidden">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{text[language].about} {Math.round((Date.now() - new Date(product.updated_at).getTime()) / (1000 * 60 * 60))} {text[language].hours} {text[language].ago}</span>
                            </div>
                            {product.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{product.rating}</span>
                              </div>
                            )}
                          </div>
                          {(product.origin || product.freshness) && (
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              {product.origin && (
                                <span>{text[language].origin}: {product.origin}</span>
                              )}
                              {product.freshness && (
                                <span>{text[language].freshness}: {product.freshness}</span>
                              )}
                            </div>
                          )}
                          {product.isSpecial && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-green-600 font-semibold">
                                {text[language].youSave} ${((product.originalPrice || 0) - product.price).toFixed(2)}
                              </span>
                              {product.specialEndDate && (
                                <span className="text-orange-600">
                                  {text[language].endingSoon}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4 sm:flex-1">
                          <div className="relative">
                            <img
                              src={product.supermarket?.logo_url}
                              alt={product.supermarket?.name_en}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            {product.price === minPrice && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                              {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{product.supermarket?.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDistanceToNow(new Date(product.updated_at), { addSuffix: true })}</span>
                              </div>
                              {product.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{product.rating}</span>
                                </div>
                              )}
                            </div>
                            {(product.origin || product.freshness) && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                {product.origin && (
                                  <span>{text[language].origin}: {product.origin}</span>
                                )}
                                {product.freshness && (
                                  <span>{text[language].freshness}: {product.freshness}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop Price */}
                        <div className="hidden sm:block text-right">
                          {product.isSpecial ? (
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-2xl font-bold text-red-600">${product.price}</span>
                                <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                                  -{product.discount}%
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {text[language].youSave} ${((product.originalPrice || 0) - product.price).toFixed(2)}
                                </span>
                              </div>
                              {product.specialEndDate && (
                                <div className="text-xs text-orange-600 mt-1">
                                  {text[language].endingSoon}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="text-2xl font-bold text-gray-900">${product.price}</div>
                              <div className="text-sm text-gray-500">{product.unit}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Summary Statistics - Mobile Optimized */}
      <div className="mt-8 sm:mt-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-primary-200">
        <h3 className={`text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].bestDeals}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <div className="text-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">{comparableProducts.length}</div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].productsCompared}
            </div>
          </div>
          <div className="text-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{supermarkets.length}</div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].totalSupermarkets}
            </div>
          </div>
          <div className="text-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              ${Math.max(...comparableProducts.flatMap(([_, products]) => 
                products.map(p => (p.originalPrice || p.price) - p.price)
              )).toFixed(2)}
            </div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].maxSavings}
            </div>
          </div>
          <div className="text-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
              {products.filter(p => p.isSpecial).length}
            </div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].specialOffers}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}