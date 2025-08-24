import { ArrowLeft, ShoppingCart, TrendingDown, MapPin, Clock, Star, Zap, TrendingUp, Heart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import { Product } from '../types';

interface SubCategoryViewProps {
  category: string;
  onBack: () => void;
  onProductNameClick: (productName: string) => void;
}

export function SubCategoryView({ category, onBack, onProductNameClick }: SubCategoryViewProps) {
  const { language, products } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { checkIsProductFavorite, addToProductFavorites, removeFromProductFavorites, isLoading } = useUser();
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const text = {
    en: {
      back: 'Back to Categories',
      vegetable: 'Vegetables',
      fruit: 'Fruits',
      meat: 'Meat',
      dairy: 'Dairy',
      seafood: 'Seafood',
      lowestPrice: 'Lowest Price',
      availableAt: 'Available at',
      viewAllPrices: 'View All Store Prices',
      stores: 'stores',
      noProducts: 'No products found in this category',
      priceUpdated: 'Price updated',
      historicalLow: '30-day low',
      currentHigher: 'Current price higher than 30-day low',
      currentIsLowest: 'Current price is 30-day lowest!',
      and: 'and',
      others: 'others',
      specialOffer: 'Special Offer',
      off: 'OFF'
    },
    zh: {
      back: '返回分类',
      vegetable: '蔬菜',
      fruit: '水果',
      meat: '肉类',
      dairy: '乳制品',
      seafood: '海鲜',
      lowestPrice: '最低价格',
      availableAt: '可购买于',
      viewAllPrices: '查看各超市价格',
      stores: '家超市',
      noProducts: '该分类下暂无商品',
      priceUpdated: '价格更新于',
      historicalLow: '30天最低价',
      currentHigher: '当前价格高于30天最低价',
      currentIsLowest: '当前价格是近30天最低价！',
      and: '和',
      others: '等',
      specialOffer: '特价优惠',
      off: '折扣'
    }
  };

  // Group products by name and find minimum price for each
  const getUniqueProducts = () => {
    const productMap = new Map();
    
    products
      .filter(product => product.category === category)
      .forEach(product => {
        const key = product.name_en.toLowerCase();
        if (!productMap.has(key)) {
          productMap.set(key, {
            name_en: product.name_en,
            name_zh: product.name_zh,
            image: product.image,
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
    // In a real app, this would query the price_history table
    // For demo, we'll simulate historical data
    const currentProducts = products.filter(p => p.name_en.toLowerCase() === productName.toLowerCase());
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

  const uniqueProducts = getUniqueProducts();

  const handleToggleProductFavorite = async (
    productNameEn: string,
    productNameZh: string,
    image: string
  ) => {
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }
    if (updating.has(productNameEn)) return;
    setUpdating(prev => new Set(prev.add(productNameEn)));
    try {
      const isFav = checkIsProductFavorite(productNameEn);
      if (isFav) {
        await removeFromProductFavorites(productNameEn);
      } else {
        await addToProductFavorites({
          name_en: productNameEn,
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
        next.delete(productNameEn);
        return next;
      });
    }
  };

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

      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language][category as keyof typeof text.en]}
        </h1>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {uniqueProducts.length} {language === 'en' ? 'products available' : '种商品可选'}
        </p>
      </div>

      {/* Products List - Mobile Optimized Vertical List */}
      {uniqueProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].noProducts}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {uniqueProducts.map((productGroup, index) => {
            const historicalLow = getHistoricalLow(productGroup.name_en);
            const isCurrentLowest = productGroup.minPrice <= historicalLow;
            const mostRecentUpdate = Math.max(...productGroup.lowestPriceStores.map(p => new Date(p.updated_at).getTime()));
            const hasSpecialOffers = productGroup.lowestPriceStores.some(p => p.isSpecial);
            
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
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5ZmEyYTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
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
                        onClick={(e) => { e.stopPropagation(); handleToggleProductFavorite(productGroup.name_en, productGroup.name_zh, productGroup.image); }}
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
                      onClick={() => onProductNameClick(productGroup.name_en)}
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
      )}
    </div>
  );
}