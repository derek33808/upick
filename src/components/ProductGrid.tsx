import { useMemo, useState, useEffect } from 'react';
import { Package, MapPin, Star, Heart, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Product } from '../types';

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
  const { checkIsFavorite, addToFavorites, removeFromFavorites, isLoading: userLoading } = useUser();
  const [updatingFavorites, setUpdatingFavorites] = useState<Set<number>>(new Set());

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
    },
    zh: {
      noProducts: '未找到商品',
      tryAdjusting: '请尝试调整搜索条件或筛选器',
      specialOffers: '特价商品',
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
        const isUpdating = updatingFavorites.has(product.id);
        
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
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              />
              
              {/* Special Badge */}
              {product.isSpecial && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}% OFF
                </div>
              )}
              
              {/* Favorite Button */}
              <button
                onClick={(e) => handleToggleFavorite(product.id, e)}
                disabled={isUpdating}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                )}
              </button>
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