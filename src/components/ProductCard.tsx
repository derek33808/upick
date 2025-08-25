import { Heart, MapPin, Clock, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { generateProductPlaceholder } from '../lib/imageUtils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { language, favoriteProducts, toggleFavorite } = useApp();
  const isFavorite = favoriteProducts.includes(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const text = {
    en: {
      special: 'Special',
      updated: 'Updated',
      endingSoon: 'Ending Soon',
      off: 'OFF'
    },
    zh: {
      special: '特价',
      updated: '更新于',
      endingSoon: '即将结束',
      off: '折扣'
    }
  };

  const timeAgo = formatDistanceToNow(new Date(product.updated_at), { addSuffix: true });

  return (
    <div 
      onClick={onClick}
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
            e.currentTarget.src = generateProductPlaceholder(product.id, 300);
          }}
          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
        />
        
        {/* Special Badge */}
        {product.isSpecial && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}% {text[language].off}
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        
        {/* Ending Soon Badge */}
        {product.isSpecial && product.specialEndDate && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {text[language].endingSoon}
          </div>
        )}
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

        {/* Location & Rating */}
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

        {/* Update Time */}
        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span className={language === 'zh' ? 'font-chinese' : ''}>
            {text[language].updated} {timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}