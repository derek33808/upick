import { Heart, LogIn, Package, Trash2, Star, MapPin, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Product } from '../types';

interface FavoritesViewProps {
  onProductClick: (product: Product) => void;
  onLoginClick: () => void;
}

export function FavoritesView({ onProductClick, onLoginClick }: FavoritesViewProps) {
  const { language } = useApp();
  const { isAuthenticated } = useAuth();
  const { favorites, removeFromFavorites, isLoading } = useUser();

  const text = {
    en: {
      title: 'My Favorites',
      subtitle: 'Your saved products for price monitoring',
      noFavorites: 'No favorite products yet',
      startBrowsing: 'Start browsing to add favorites',
      loginRequired: 'Login Required',
      loginToView: 'Please login to view your favorite products',
      loginButton: 'Login Now',
      loading: 'Loading favorites...',
      viewDetails: 'View Details',
      removeFromFavorites: 'Remove from Favorites',
      addedOn: 'Added on',
      currentPrice: 'Current Price',
      specialOffer: 'Special Offer',
      priceUpdated: 'Price updated'
    },
    zh: {
      title: '我的收藏',
      subtitle: '您保存的商品价格监控',
      noFavorites: '暂无收藏商品',
      startBrowsing: '开始浏览并添加收藏',
      loginRequired: '需要登录',
      loginToView: '请登录查看您的收藏商品',
      loginButton: '立即登录',
      loading: '加载收藏中...',
      viewDetails: '查看详情',
      removeFromFavorites: '取消收藏',
      addedOn: '添加于',
      currentPrice: '当前价格',
      specialOffer: '特价优惠',
      priceUpdated: '价格更新于'
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].loginRequired}
        </h3>
        <p className={`text-gray-600 mb-6 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].loginToView}
        </p>
        <button
          onClick={onLoginClick}
          className={`bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          {text[language].loginButton}
        </button>
      </div>
    );
  }

  // Loading state
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold text-gray-900 mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h1>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle} ({favorites.length} {language === 'en' ? 'items' : '个商品'})
        </p>
      </div>

      {/* No favorites state */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].noFavorites}
          </h3>
          <p className={`text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].startBrowsing}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => {
            const product = favorite.product;
            if (!product) return null;

            return (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
              >
                {/* Image Container */}
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={language === 'en' ? product.name_en : product.name_zh}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                    loading="lazy"
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                  />
                  
                  {/* Special Badge */}
                  {product.is_special && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{product.discount_percentage}% OFF
                    </div>
                  )}
                  
                  {/* Favorite Badge */}
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {language === 'en' ? product.name_en : product.name_zh}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl font-bold text-primary-600">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${parseFloat(product.original_price.toString()).toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {product.unit}
                    </span>
                  </div>

                  {/* Supermarket Info */}
                  <div className="flex items-center space-x-2 mb-3">
                    <img
                      src={product.supermarket?.logo_url}
                      alt={product.supermarket?.name_en}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {language === 'en' ? product.supermarket?.name_en : product.supermarket?.name_zh}
                    </span>
                  </div>

                  {/* Added date */}
                  <div className="text-xs text-gray-400 mb-3">
                    {text[language].addedOn} {new Date(favorite.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-NZ')}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Transform database product to app Product type
                        const transformedProduct: Product = {
                          id: product.id,
                          name_en: product.name_en,
                          name_zh: product.name_zh,
                          image: product.image_url || '',
                          price: parseFloat(product.price.toString()),
                          originalPrice: product.original_price ? parseFloat(product.original_price.toString()) : undefined,
                          unit: product.unit,
                          supermarket_id: product.supermarket_id,
                          supermarket: product.supermarket ? {
                            id: product.supermarket.id,
                            name_en: product.supermarket.name_en,
                            name_zh: product.supermarket.name_zh,
                            location: product.supermarket.location,
                            logo_url: product.supermarket.logo_url || '',
                            lat: parseFloat(product.supermarket.latitude.toString()),
                            lng: parseFloat(product.supermarket.longitude.toString())
                          } : undefined,
                          category: product.category as any,
                          updated_at: new Date().toISOString(),
                          isSpecial: product.is_special,
                          discount: product.discount_percentage
                        };
                        onProductClick(transformedProduct);
                      }}
                      className={`flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm ${language === 'zh' ? 'font-chinese' : ''}`}
                    >
                      {text[language].viewDetails}
                    </button>
                    <button
                      onClick={() => removeFromFavorites(favorite.product_id)}
                      className={`px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                      title={text[language].removeFromFavorites}
                    >
                      <Trash2 className="w-4 h-4" />
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