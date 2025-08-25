import { X, Heart, MapPin, Star, Clock, Package, Award, LogIn, Navigation, Plus, Check, Store } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import { generateSeededSeries } from '../lib/chartUtils';
import { PriceHistoryChart } from './PriceHistoryChart';
import { generateProductPlaceholder } from '../lib/imageUtils';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { language, products } = useApp();
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
    removeFromProductFavorites,
    checkIsStoreFavorite,
    addToStoreFavorites,
    removeFromStoreFavorites,
    isLoading
  } = useUser();
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  const isFavorite = checkIsFavorite(product.id);
  const cartStatus = checkIsInCart(product.id);
  const isProductFavorite = checkIsProductFavorite(product.name_en);
  const isStoreFavorite = checkIsStoreFavorite(product.supermarket_id);

  // Find similar products from other supermarkets
  const similarProducts = products.filter(p => 
    p.id !== product.id && 
    p.name_en.toLowerCase() === product.name_en.toLowerCase()
  ).sort((a, b) => a.price - b.price);

  // Stable, seeded historical series and low
  const stableEndDateRef = useRef<Date>(new Date());
  const priceSeries = useMemo(() => {
    const seedKey = `prod:${product.id}|${Math.round(product.price * 100)}`;
    return generateSeededSeries(seedKey, product.price, 90);
  }, [product.id, product.price]);

  const historicalLow = useMemo(() => {
    return Math.min(...priceSeries);
  }, [priceSeries]);
  const isCurrentLowest = product.price <= historicalLow;

  const text = {
    en: {
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      addToShoppingList: 'Add to Shopping List',
      removeFromShoppingList: 'Remove from Shopping List',
      alreadyInShoppingList: 'Already in Shopping List',
      loginToFavorite: 'Login to Add Favorites',
      loginToShoppingList: 'Login to Add to Shopping List',
      productDetails: 'Product Details',
      origin: 'Origin',
      freshness: 'Freshness',
      rating: 'Rating',
      updated: 'Last Updated',
      compareWith: 'Compare with other stores',
      specialOffer: 'Special Offer',
      regularPrice: 'Regular Price',
      youSave: 'You Save',
      specialEnds: 'Special ends',
      otherStores: 'Available at Other Stores',
      favoriteAdded: 'Added to favorites!',
      favoriteRemoved: 'Removed from favorites!',
      favoriteError: 'Failed to update favorites',
      shoppingListAdded: 'Added to shopping list!',
      shoppingListRemoved: 'Removed from shopping list!',
      shoppingListError: 'Failed to update shopping list',
      viewOnMap: 'View on Map',
      getDirections: 'Get Directions',
      historicalLow: '30-day low',
      currentHigher: 'Current price higher than 30-day low',
      currentIsLowest: 'Current price is 30-day lowest!',
      priceHistory: 'Price History Analysis'
    },
    zh: {
      addToFavorites: '添加收藏',
      removeFromFavorites: '取消收藏',
      addToShoppingList: '加入购物清单',
      removeFromShoppingList: '从清单中移除',
      alreadyInShoppingList: '已在清单中',
      loginToFavorite: '登录后收藏',
      loginToShoppingList: '登录后添加到清单',
      productDetails: '商品详情',
      origin: '产地',
      freshness: '新鲜度',
      rating: '评分',
      updated: '最后更新',
      compareWith: '与其他超市比较',
      specialOffer: '特价优惠',
      regularPrice: '原价',
      youSave: '节省',
      specialEnds: '特价结束',
      otherStores: '其他超市有售',
      favoriteAdded: '已添加到收藏！',
      favoriteRemoved: '已从收藏中移除！',
      favoriteError: '更新收藏失败',
      shoppingListAdded: '已加入购物清单！',
      shoppingListRemoved: '已从清单中移除！',
      shoppingListError: '更新购物清单失败',
      viewOnMap: '查看地图',
      getDirections: '获取路线',
      historicalLow: '30天最低价',
      currentHigher: '当前价格高于30天最低价',
      currentIsLowest: '当前价格是近30天最低价！',
      priceHistory: '价格历史分析'
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !user) return;

    setIsUpdating(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(product.id);
        console.log(text[language].favoriteRemoved);
      } else {
        await addToFavorites(product.id);
        console.log(text[language].favoriteAdded);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCartToggle = async () => {
    if (!isAuthenticated || !user) return;

    setIsUpdating(true);
    try {
      if (cartStatus.inCart) {
        await removeFromCart(product.id);
        console.log(text[language].shoppingListRemoved);
      } else {
        await addToCart(product.id, 1);
        console.log(text[language].shoppingListAdded);
      }
    } catch (error) {
      console.error('购物清单操作失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProductFavoriteToggle = async () => {
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    setIsUpdating(true);
    try {
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
      setIsUpdating(false);
    }
  };

  const handleStoreFavoriteToggle = async () => {
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }

    setIsUpdating(true);
    try {
      if (isStoreFavorite) {
        await removeFromStoreFavorites(product.supermarket_id);
        console.log('店铺收藏已移除');
      } else {
        await addToStoreFavorites(product.supermarket_id);
        console.log('店铺已添加到收藏');
      }
    } catch (error) {
      console.error('店铺收藏操作失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewOnMap = (product: Product) => {
    if (product.supermarket?.lat && product.supermarket?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${product.supermarket.lat},${product.supermarket.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleGetDirections = (product: Product) => {
    if (product.supermarket?.lat && product.supermarket?.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${product.supermarket.lat},${product.supermarket.lng}`;
      window.open(url, '_blank');
    }
  };

  const timeAgo = formatDistanceToNow(new Date(product.updated_at), { addSuffix: true });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].productDetails}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Image */}
          <div className="relative mb-6">
            <img
              src={product.image}
              alt={language === 'en' ? product.name_en : product.name_zh}
              className="w-full h-64 object-cover rounded-xl bg-gray-100"
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
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{product.discount}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold text-gray-900 mb-3 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? product.name_en : product.name_zh}
            </h1>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              {product.isSpecial ? (
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl font-bold text-red-600">
                      ${product.price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="text-sm text-gray-600">{product.unit}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-semibold">
                      {text[language].youSave} ${((product.originalPrice || 0) - product.price).toFixed(2)}
                    </span>
                    {product.specialEndDate && (
                      <span className="text-orange-600">
                        {text[language].specialEnds} {new Date(product.specialEndDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary-600">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-600">{product.unit}</span>
                </div>
              )}
            </div>

            {/* Historical Price Analysis */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
              <h4 className={`text-sm font-semibold text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].priceHistory}
              </h4>
              {/* Smooth curve chart */}
              <div className="mb-3 overflow-hidden rounded-lg bg-white/40">
                {(() => {
                  return <PriceHistoryChart prices={priceSeries} height={120} endDate={stableEndDateRef.current} />;
                })()}
              </div>
              <div className={`text-sm text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].historicalLow}: ${historicalLow.toFixed(2)}
              </div>
              {isCurrentLowest ? (
                <div className={`text-green-600 font-semibold text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                  🎉 {text[language].currentIsLowest}
                </div>
              ) : (
                <div className={`text-orange-600 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                  📈 {text[language].currentHigher} ${historicalLow.toFixed(2)}
                </div>
              )}
            </div>

            {/* Supermarket Info with Map Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={product.supermarket?.logo_url}
                    alt={product.supermarket?.name_en}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className={`font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{product.supermarket?.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleViewOnMap(product)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{text[language].viewOnMap}</span>
                </button>
                <button
                  onClick={() => handleGetDirections(product)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm font-medium">{text[language].getDirections}</span>
                </button>
              </div>

              {/* Price Update Time */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className={language === 'zh' ? 'font-chinese' : ''}>
                    {text[language].updated} {new Date(product.updated_at).toLocaleDateString(
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* 单一产品收藏按钮 */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleProductFavoriteToggle}
                  disabled={isUpdating || isLoading}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    isProductFavorite
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <Heart className={`w-5 h-5 ${isProductFavorite ? 'fill-current' : ''}`} />
                  )}
                  <span>{isProductFavorite ? '取消单一产品收藏' : '单一产品收藏'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('showLoginModal'));
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Heart className="w-5 h-5" />
                  <span>登录后收藏（单一产品）</span>
                </button>
              )}

              {/* 店铺产品收藏按钮 */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleStoreFavoriteToggle}
                  disabled={isUpdating || isLoading}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    isStoreFavorite
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <Store className={`w-5 h-5 ${isStoreFavorite ? 'fill-current' : ''}`} />
                  )}
                  <span>{isStoreFavorite ? '取消店铺产品收藏' : '店铺产品收藏'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('showLoginModal'));
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Store className="w-5 h-5" />
                  <span>登录后收藏（店铺产品）</span>
                </button>
              )}

              {/* Favorite Button (Product-specific) */}
              {isAuthenticated ? (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isUpdating || isLoading}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    isFavorite
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  )}
                  <span>
                    {isFavorite ? text[language].removeFromFavorites : text[language].addToFavorites}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('showLoginModal'));
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors bg-primary-100 text-primary-700 hover:bg-primary-200 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{text[language].loginToFavorite}</span>
                </button>
              )}

              {/* Shopping List Button */}
              {isAuthenticated ? (
                <button
                  onClick={handleCartToggle}
                  disabled={isUpdating || isLoading}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    cartStatus.inCart
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  } ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : cartStatus.inCart ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>
                    {cartStatus.inCart ? text[language].alreadyInShoppingList : text[language].addToShoppingList}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('showLoginModal'));
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors bg-primary-100 text-primary-700 hover:bg-primary-200 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{text[language].loginToShoppingList}</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {product.origin && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-5 h-5 text-gray-600" />
                <div>
                  <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].origin}
                  </div>
                  <div className="font-semibold">{product.origin}</div>
                </div>
              </div>
            )}
            
            {product.freshness && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-gray-600" />
                <div>
                  <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].freshness}
                  </div>
                  <div className="font-semibold">{product.freshness}</div>
                </div>
              </div>
            )}
            
            {product.rating && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <div>
                  <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].rating}
                  </div>
                  <div className="font-semibold">{product.rating}/5</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].updated}
                </div>
                <div className="font-semibold">{timeAgo}</div>
              </div>
            </div>
          </div>

          {/* Other Stores Comparison */}
          {similarProducts.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].otherStores} ({similarProducts.length})
              </h3>
              <div className="space-y-3">
                {similarProducts.map((similarProduct) => (
                  <div key={similarProduct.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={similarProduct.supermarket?.logo_url}
                          alt={similarProduct.supermarket?.name_en}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className={`font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {language === 'en' ? similarProduct.supermarket?.name_en : similarProduct.supermarket?.name_zh}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{similarProduct.supermarket?.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ${similarProduct.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {similarProduct.unit}
                        </div>
                      </div>
                    </div>

                    {/* Map Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewOnMap(similarProduct)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{text[language].viewOnMap}</span>
                      </button>
                      <button
                        onClick={() => handleGetDirections(similarProduct)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm">{text[language].getDirections}</span>
                      </button>
                    </div>

                    {/* Price Update Time */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className={language === 'zh' ? 'font-chinese' : ''}>
                          {text[language].updated} {new Date(similarProduct.updated_at).toLocaleDateString(
                            language === 'zh' ? 'zh-CN' : 'en-NZ',
                            { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}