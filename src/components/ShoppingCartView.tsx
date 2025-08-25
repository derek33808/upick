import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Router as Route, MapPin, Navigation, Clock, DollarSign, Star, Package } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useApp } from '../contexts/AppContext';

export function ShoppingCartView() {
  const { language } = useApp();
  const { 
    cart, 
    cartStats,
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    shoppingRoute,
    calculateOptimalRoute,
    isLoading
  } = useUser();
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  const text = {
    en: {
      title: 'Shopping Cart',
      subtitle: 'Plan your optimal shopping route',
      emptyCart: 'Your cart is empty',
      startShopping: 'Add products to start planning your route',
      totalItems: 'Total Items',
      totalCost: 'Total Cost',
      uniqueStores: 'Stores to Visit',
      calculateRoute: 'Calculate Optimal Route',
      clearCart: 'Clear Cart',
      quantity: 'Qty',
      remove: 'Remove',
      routeDetails: 'Route Details',
      hideRoute: 'Hide Route',
      showRoute: 'Show Route',
      estimatedTime: 'Estimated Time',
      efficiencyScore: 'Efficiency Score',
      storeOrder: 'Recommended Store Order',
      getDirections: 'Get Directions',
      viewOnMap: 'View on Map',
      minutes: 'minutes',
      step: 'Step',
      buyAt: 'Buy at',
      products: 'products',
      subtotal: 'Subtotal',
      routeOptimized: 'Route optimized for best prices and minimal travel time',
      noRoute: 'Calculate route to see optimal shopping plan',
      loading: 'Loading...',
      updateQuantity: 'Update quantity',
      totalDistance: 'Total Distance',
      km: 'km'
    },
    zh: {
      title: '购物车',
      subtitle: '规划您的最佳购物路线',
      emptyCart: '购物车为空',
      startShopping: '添加商品开始规划路线',
      totalItems: '总商品数',
      totalCost: '总费用',
      uniqueStores: '需访问超市',
      calculateRoute: '计算最佳路线',
      clearCart: '清空购物车',
      quantity: '数量',
      remove: '移除',
      routeDetails: '路线详情',
      hideRoute: '隐藏路线',
      showRoute: '显示路线',
      estimatedTime: '预计时间',
      efficiencyScore: '效率评分',
      storeOrder: '推荐超市顺序',
      getDirections: '获取路线',
      viewOnMap: '查看地图',
      minutes: '分钟',
      step: '第',
      buyAt: '在',
      products: '种商品',
      subtotal: '小计',
      routeOptimized: '路线已优化，确保最佳价格和最短行程',
      noRoute: '计算路线以查看最佳购物计划',
      loading: '加载中...',
      updateQuantity: '更新数量',
      totalDistance: '总距离',
      km: '公里'
    }
  };

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    await updateCartQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: number) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm(language === 'en' ? 'Clear all items from cart?' : '清空购物车中的所有商品？')) {
      await clearCart();
    }
  };

  const handleCalculateRoute = async () => {
    setIsCalculatingRoute(true);
    try {
      await calculateOptimalRoute();
      setShowRouteDetails(true);
    } catch (error) {
      console.error('计算路线失败:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleGetDirections = (store: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  const handleViewOnMap = (store: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].loading}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h1>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle}
        </p>
      </div>

      {/* Cart Stats */}
      {cart.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{cartStats.total_items}</div>
            <div className={`text-sm text-blue-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].totalItems}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${cartStats.total_cost.toFixed(2)}</div>
            <div className={`text-sm text-green-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].totalCost}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{cartStats.unique_stores}</div>
            <div className={`text-sm text-purple-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].uniqueStores}
            </div>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="bg-white rounded-xl border border-gray-200">
        {cart.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].emptyCart}
            </h3>
            <p className={`text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].startShopping}
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 border-b border-gray-200">
              {/* Mobile: Vertical Layout */}
              <div className="md:hidden">
                <h2 className={`text-lg font-semibold text-gray-900 mb-4 text-center ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].title} ({cart.length})
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handleCalculateRoute}
                    disabled={isCalculatingRoute}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${language === 'zh' ? 'font-chinese' : ''}`}
                  >
                    {isCalculatingRoute ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Route className="w-4 h-4" />
                    )}
                    <span>{text[language].calculateRoute}</span>
                  </button>
                  <button
                    onClick={handleClearCart}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{text[language].clearCart}</span>
                  </button>
                </div>
              </div>
              
              {/* Desktop: Horizontal Layout */}
              <div className="hidden md:flex items-center justify-between">
                <h2 className={`text-lg font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].title} ({cart.length})
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCalculateRoute}
                    disabled={isCalculatingRoute}
                    className={`flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${language === 'zh' ? 'font-chinese' : ''}`}
                  >
                    {isCalculatingRoute ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Route className="w-4 h-4" />
                    )}
                    <span>{text[language].calculateRoute}</span>
                  </button>
                  <button
                    onClick={handleClearCart}
                    className={`flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{text[language].clearCart}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item.id} className="p-4 md:p-6">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-start space-x-3 mb-3">
                      <img
                        src={item.product?.image || item.product?.image_url}
                        alt={language === 'en' ? item.product?.name_en : item.product?.name_zh}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzlmYTJhNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-gray-900 mb-1 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {language === 'en' ? item.product?.name_en : item.product?.name_zh}
                        </h3>
                        <div className="text-xs text-gray-600 mb-2">
                          {language === 'en' ? item.product?.supermarket?.name_en : item.product?.supermarket?.name_zh}
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title={text[language].remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center space-x-4">
                    <img
                      src={item.product?.image || item.product?.image_url}
                      alt={language === 'en' ? item.product?.name_en : item.product?.name_zh}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzlmYTJhNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-gray-900 mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {language === 'en' ? item.product?.name_en : item.product?.name_zh}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {language === 'en' ? item.product?.supermarket?.name_en : item.product?.supermarket?.name_zh}
                      </div>
                      <div className="text-lg font-bold text-primary-600">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title={text[language].remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Optimal Route Display */}
      {shoppingRoute && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].routeDetails}
              </h2>
              <button
                onClick={() => setShowRouteDetails(!showRouteDetails)}
                className={`text-primary-600 hover:text-primary-700 font-medium ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                {showRouteDetails ? text[language].hideRoute : text[language].showRoute}
              </button>
            </div>
            
            {/* Route Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">${shoppingRoute.total_cost.toFixed(2)}</div>
                <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].totalCost}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{shoppingRoute.total_time_minutes}</div>
                <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].estimatedTime} ({text[language].minutes})
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{shoppingRoute.total_distance_km.toFixed(1)}</div>
                <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].totalDistance} ({text[language].km})
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{shoppingRoute.efficiency_score.toFixed(1)}%</div>
                <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].efficiencyScore}
                </div>
              </div>
            </div>
          </div>

          {showRouteDetails && (
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].storeOrder}
              </h3>
              
              <div className="space-y-4">
                {shoppingRoute.stores.map((store, index) => (
                  <div key={store.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className={`font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {store.name}
                          </h4>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{store.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">${store.store_total.toFixed(2)}</div>
                        <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {store.products.length} {text[language].products}
                        </div>
                      </div>
                    </div>

                    {/* Products to buy at this store */}
                    <div className="space-y-2 mb-3">
                      {store.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                          <span className={`font-medium ${language === 'zh' ? 'font-chinese' : ''}`}>
                            {product.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              {text[language].quantity}: {product.quantity}
                            </span>
                            <span className="font-semibold">${product.total_cost.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Store Actions */}
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                      <button
                        onClick={() => handleViewOnMap(store)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{text[language].viewOnMap}</span>
                      </button>
                      <button
                        onClick={() => handleGetDirections(store)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                      >
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm">{text[language].getDirections}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 text-green-800">
                  <Star className="w-5 h-5" />
                  <span className={`text-sm font-medium ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].routeOptimized}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculate Route Button for empty route */}
      {cart.length > 0 && !shoppingRoute && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-gray-600 mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].noRoute}
          </p>
          <button
            onClick={handleCalculateRoute}
            disabled={isCalculatingRoute}
            className={`flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mx-auto ${language === 'zh' ? 'font-chinese' : ''}`}
          >
            {isCalculatingRoute ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Route className="w-5 h-5" />
            )}
            <span>{text[language].calculateRoute}</span>
          </button>
        </div>
      )}
    </div>
  );
}